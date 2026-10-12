alter table public.regulations add column complementary_bases jsonb not null default '[]'::jsonb;
alter table public.regulation_revisions add column complementary_bases jsonb not null default '[]'::jsonb;
grant select(complementary_bases) on public.regulations to anon,authenticated;
create or replace function public.qg_validate_complementary_bases() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
declare ref jsonb; extra public.regulations; seen uuid[]='{}'; basis public.regulations;
begin
 if jsonb_typeof(new.complementary_bases)<>'array' or jsonb_array_length(new.complementary_bases)>50 then raise exception 'invalid_complementary_bases'; end if;
 if new.kind<>'YÖNERGE' and new.complementary_bases<>'[]'::jsonb then raise exception 'directive_complementary_only'; end if;
 if tg_op='UPDATE' and old.kind='YÖNERGE' and old.published_at is not null and new.basis_rule_id is distinct from old.basis_rule_id then raise exception 'immutable_directive_primary_basis'; end if;
 if new.kind in ('YÖNERGE','KARAR') and new.basis_rule_id is not null then
 select * into basis from public.regulations where id=new.basis_rule_id;
 new.section_number:=basis.section_number;
 end if;
 for ref in select value from jsonb_array_elements(new.complementary_bases) loop
 if jsonb_typeof(ref)<>'object' or jsonb_typeof(ref->'id')<>'string' or jsonb_typeof(ref->'revision')<>'number' then raise exception 'invalid_complementary_basis'; end if;
 select * into extra from public.regulations where id=(ref->>'id')::uuid for share;
 if extra.id is null or extra.id=new.id or extra.id=new.basis_rule_id or extra.id=any(seen) or extra.kind<>'KURAL' then raise exception 'invalid_complementary_basis'; end if;
 if (ref->>'revision')::integer is distinct from extra.revision then raise exception 'complementary_revision_conflict'; end if;
 if new.status<>'yururlukten_kaldirildi' and (extra.status<>'yururlukte' or extra.effective_at>now() or extra.published_at>now()) then raise exception 'active_complementary_basis_required'; end if;
 seen:=array_append(seen,extra.id);
 end loop;
 return new;
end $$;
revoke all on function public.qg_validate_complementary_bases() from public,anon,authenticated;
create trigger a_complementary_basis before insert or update on public.regulations for each row execute function public.qg_validate_complementary_bases();
create or replace function public.archive_regulation_revision()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if row(new.title,new.body,new.number,new.status,new.effective_at,new.section_number,new.change_reason,new.basis_rule_id,new.basis_revision,new.application_scope,new.decision_priority,new.decision_pinned,new.complementary_bases)
 is distinct from row(old.title,old.body,old.number,old.status,old.effective_at,old.section_number,old.change_reason,old.basis_rule_id,old.basis_revision,old.application_scope,old.decision_priority,old.decision_pinned,old.complementary_bases) then
   insert into public.regulation_revisions(regulation_id,revision,section_number,number,kind,title,body,status,effective_at,change_reason,changed_by,changed_at,basis_rule_id,basis_revision,application_scope,decision_priority,decision_pinned,complementary_bases)
   values(old.id,old.revision,old.section_number,old.number,old.kind,old.title,coalesce(old.body,''),old.status,old.effective_at,old.change_reason,auth.uid(),now(),old.basis_rule_id,old.basis_revision,old.application_scope,old.decision_priority,old.decision_pinned,old.complementary_bases)
   on conflict(regulation_id,revision) do nothing;
   new.revision:=old.revision+1;new.updated_at:=now();
 else new.revision:=old.revision;new.updated_at:=old.updated_at;
 end if;
 return new;
end $$;
revoke all on function public.archive_regulation_revision() from public,anon,authenticated;

create or replace function public.qg_complementary_current(refs jsonb) returns boolean language sql stable security invoker set search_path=public,pg_temp as $$
 select not exists(select 1 from jsonb_array_elements(refs) ref left join public.regulations r on r.id=(ref->>'id')::uuid where r.id is null or r.status<>'yururlukte' or r.effective_at>now() or r.revision is distinct from (ref->>'revision')::integer);
$$;
revoke all on function public.qg_complementary_current(jsonb) from public;
grant execute on function public.qg_complementary_current(jsonb) to authenticated;
create or replace function public.qg_validate_codex_basis()
returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare basis public.regulations; parent public.regulations; actor text;
begin
 select role::text into actor from public.profiles where id=auth.uid();
 if tg_op='UPDATE' then
   if new.kind is distinct from old.kind or new.legacy_announcement_id is distinct from old.legacy_announcement_id or
     (new.created_by is distinct from old.created_by and (new.created_by is not null or exists(select 1 from public.profiles where id=old.created_by))) then
     raise exception 'immutable_regulation_identity';
   end if;
 elsif new.legacy_announcement_id is not null then raise exception 'historical_import_only';
 end if;
 if actor='moderator' and new.kind in ('YÖNERGE','KARAR') and nullif(trim(new.application_scope),'') is null then raise exception 'directive_scope_required'; end if;
 if new.status='taslak' then new.published_at:=null;
 elsif new.published_at is null then new.published_at:=now(); end if;
 if tg_op='UPDATE' and old.published_at is not null then
   if new.published_at is distinct from old.published_at then raise exception 'published_record_cannot_be_hidden'; end if;
 end if;
 if new.kind in ('YÖNERGE','KARAR') then
   if tg_op='UPDATE' and new.legacy_announcement_id is not null and new.basis_rule_id is null then
     -- An untouched historical record retains its unknown original basis.
     return new;
   end if;
   select * into basis from public.regulations where id=new.basis_rule_id;
   if basis.id is null or basis.id=new.id or
      (new.kind='YÖNERGE' and basis.kind<>'KURAL') or
      (new.kind='KARAR' and basis.kind not in ('KURAL','YÖNERGE')) or
      (new.status not in ('taslak','yururlukten_kaldirildi') and
       (basis.status<>'yururlukte' or basis.effective_at>now() or basis.published_at>now())) then raise exception 'active_rule_basis_required'; end if;
   if new.kind='KARAR' and basis.kind='YÖNERGE' then
     select * into parent from public.regulations where id=basis.basis_rule_id;
     if parent.id is null or parent.status<>'yururlukte' or parent.effective_at>now()
       or parent.revision is distinct from basis.basis_revision or not public.qg_complementary_current(basis.complementary_bases) then raise exception 'directive_basis_needs_review'; end if;
   end if;
   if new.basis_revision is not null and new.basis_revision<>basis.revision then raise exception 'basis_revision_conflict'; end if;
   new.basis_revision:=basis.revision;
 else
   if new.basis_rule_id is not null then raise exception 'primary_norm_has_no_basis'; end if;
   new.basis_revision:=null;
 end if;
 return new;
end $$;
revoke all on function public.qg_validate_codex_basis() from public,anon,authenticated;

create or replace function public.qg_capture_discipline_basis()
returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare basis public.regulations; parent public.regulations;
begin
 if tg_op='UPDATE' then
   if row(new.regulation_id,new.regulation_revision,new.rule_snapshot,new.rule_ref) is distinct from
      row(old.regulation_id,old.regulation_revision,old.rule_snapshot,old.rule_ref) then
      raise exception 'immutable_discipline_basis';
   end if;
   return new;
 end if;
 select * into basis from public.regulations where id=new.regulation_id;
 if basis.id is null or basis.kind not in ('KURAL','YÖNERGE') or basis.status<>'yururlukte'
   or basis.effective_at>now() then raise exception 'active_discipline_basis_required'; end if;
 if basis.kind='YÖNERGE' then
   select * into parent from public.regulations where id=basis.basis_rule_id;
   if parent.id is null or parent.status<>'yururlukte' or parent.effective_at>now()
     or parent.revision is distinct from basis.basis_revision or not public.qg_complementary_current(basis.complementary_bases) then raise exception 'directive_basis_needs_review'; end if;
 end if;
 new.regulation_revision:=basis.revision;
 new.rule_ref:=basis.kind||' § '||basis.number||' — '||basis.title;
 new.rule_snapshot:=jsonb_build_object('number',basis.number,'kind',basis.kind,'title',basis.title,'body',basis.body,'revision',basis.revision,'effective_at',basis.effective_at,'basis_rule_id',basis.basis_rule_id,'basis_revision',basis.basis_revision,'complementary_bases',basis.complementary_bases);
 return new;
end $$;
revoke all on function public.qg_capture_discipline_basis() from public,anon,authenticated;

-- Complementary references have the same delete protection as the primary FK.
create or replace function public.qg_protect_complementary_basis() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if exists(select 1 from public.regulations r where r.id<>old.id and r.complementary_bases @> jsonb_build_array(jsonb_build_object('id',old.id::text))) then raise exception 'referenced_complementary_basis'; end if;
 return old;
end $$;
revoke all on function public.qg_protect_complementary_basis() from public,anon,authenticated;
create trigger protect_complementary_basis before delete on public.regulations for each row execute function public.qg_protect_complementary_basis();

-- An unpublished draft can change primary basis; reallocate its number accordingly.
create or replace function private.codex_number_allocate() returns trigger language plpgsql set search_path='' as $$declare prefix text;next_no integer;begin
 if tg_op='UPDATE' then
 if new.parent_rule_id is distinct from old.parent_rule_id then raise exception 'immutable_rule_number';end if;
 if old.kind='YÖNERGE' and old.published_at is null and new.basis_rule_id is distinct from old.basis_rule_id then new.number:=null;
 else if new.number is distinct from old.number then raise exception 'immutable_rule_number';end if;return new;end if;
 end if;
 perform pg_advisory_xact_lock(hashtextextended('qgang-codex-number',42));
 if new.parent_rule_id is not null then
 select number into prefix from public.regulations where id=new.parent_rule_id and kind in ('KURAL','İLKE') and section_number=new.section_number;
 if prefix is null then raise exception 'invalid_parent_rule';end if;prefix:=prefix||'.';
 elsif new.kind='KARAR' then prefix:='İK-'||extract(year from now() at time zone 'Europe/Istanbul')::text||'-';
 elsif new.kind='YÖNERGE' then select number||'/' into prefix from public.regulations where id=new.basis_rule_id;if prefix is null then raise exception 'invalid_parent_rule';end if;
 else prefix:=new.section_number||'.';end if;
 if new.number is null or new.number='' then
 select coalesce(max(substring(number from length(prefix)+1)::integer),0)+1 into next_no from public.regulations where left(number,length(prefix))=prefix and substring(number from length(prefix)+1)~'^[0-9]+$';
 new.number:=prefix||lpad(next_no::text,greatest(length(next_no::text),case when new.kind='KARAR' then 3 else 2 end),'0');
 end if;return new;
end$$;
revoke all on function private.codex_number_allocate() from public,anon,authenticated;
