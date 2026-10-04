begin;
-- Preserve imported labels as provenance; the public type has only two values.
alter table public.announcements add column if not exists legacy_category text;
update public.announcements
set legacy_category=coalesce(legacy_category,category),
    category=case when split_part(upper(category),' · ',1) in ('KARAR','RÜTBE EMRİ','ATAMA','TAKDİR') then 'KARAR' else 'DUYURU' end
where category not in ('DUYURU','KARAR');
alter table public.announcements add constraint announcements_type_check check(category in ('DUYURU','KARAR'));

alter table public.regulations
  add column basis_rule_id uuid references public.regulations(id) on delete restrict,
  add column basis_revision integer,
  add column application_scope text;
alter table public.regulation_revisions
  add column basis_rule_id uuid,
  add column basis_revision integer,
  add column application_scope text;
alter table public.moderation_actions
  add column regulation_id uuid references public.regulations(id) on delete restrict,
  add column regulation_revision integer,
  add column rule_snapshot jsonb;
grant select on public.regulation_revisions to authenticated;
create index regulations_basis_idx on public.regulations(basis_rule_id);
create index moderation_actions_regulation_idx on public.moderation_actions(regulation_id);
-- Only exact number matches may be linked automatically; ambiguous historical text stays intact.
update public.regulations d set basis_rule_id=r.id,basis_revision=r.revision
from public.regulations r where d.kind in ('YÖNERGE','KARAR') and r.kind='KURAL'
 and r.number=split_part(d.number,'/',1) and d.id<>r.id;

create or replace function public.qg_validate_codex_basis()
returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare basis public.regulations; actor text;
begin
 select role::text into actor from public.profiles where id=auth.uid();
 if tg_op='UPDATE' then
   if new.kind is distinct from old.kind or
     (new.created_by is distinct from old.created_by and
      (new.created_by is not null or exists(select 1 from public.profiles where id=old.created_by))) then
     raise exception 'immutable_regulation_identity';
   end if;
 end if;
 if actor='moderator' and new.kind='YÖNERGE' and nullif(trim(new.application_scope),'') is null then
   raise exception 'directive_scope_required';
 end if;
 if new.kind in ('YÖNERGE','KARAR') then
   select * into basis from public.regulations where id=new.basis_rule_id;
   if basis.id is null or basis.id=new.id or basis.kind<>'KURAL' or (new.status<>'yururlukten_kaldirildi' and (basis.status<>'yururlukte' or basis.effective_at>now())) then raise exception 'active_rule_basis_required'; end if;
   if new.basis_revision is not null and new.basis_revision<>basis.revision then
     raise exception 'basis_revision_conflict';
   end if;
   new.basis_revision:=basis.revision;
 else
   if new.basis_rule_id is not null then raise exception 'primary_norm_has_no_basis'; end if;
   new.basis_revision:=null;
 end if;
 return new;
end $$;
revoke all on function public.qg_validate_codex_basis() from public,anon,authenticated;
create trigger a_validate_codex_basis before insert or update on public.regulations
for each row execute function public.qg_validate_codex_basis();

create or replace function public.archive_regulation_revision()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if row(new.title,new.body,new.number,new.status,new.effective_at,new.section_number,new.change_reason,new.basis_rule_id,new.basis_revision,new.application_scope)
 is distinct from row(old.title,old.body,old.number,old.status,old.effective_at,old.section_number,old.change_reason,old.basis_rule_id,old.basis_revision,old.application_scope) then
   insert into public.regulation_revisions(regulation_id,revision,section_number,number,kind,title,body,status,effective_at,change_reason,changed_by,changed_at,basis_rule_id,basis_revision,application_scope)
   values(old.id,old.revision,old.section_number,old.number,old.kind,old.title,coalesce(old.body,''),old.status,old.effective_at,old.change_reason,auth.uid(),now(),old.basis_rule_id,old.basis_revision,old.application_scope)
   on conflict(regulation_id,revision) do nothing;
   new.revision:=old.revision+1; new.updated_at:=now();
 else
   new.revision:=old.revision; new.updated_at:=old.updated_at;
 end if;
 return new;
end $$;
revoke all on function public.archive_regulation_revision() from public,anon,authenticated;

-- Existing admin ALL policy would allow editing primary law through the Data API.
drop policy if exists "leaders manage regulations" on public.regulations;
create policy "founder inserts codex" on public.regulations for insert to authenticated
with check(created_by=auth.uid() and exists(select 1 from public.profiles where id=auth.uid() and role::text='founder'));
create policy "founder updates codex" on public.regulations for update to authenticated
using(exists(select 1 from public.profiles where id=auth.uid() and role::text='founder'))
with check(exists(select 1 from public.profiles where id=auth.uid() and role::text='founder'));
create policy "officers insert directives" on public.regulations for insert to authenticated
with check(kind='YÖNERGE' and created_by=auth.uid() and exists(select 1 from public.profiles where id=auth.uid() and role::text in ('admin','moderator')));
create policy "officers update directives" on public.regulations for update to authenticated
using(kind='YÖNERGE' and exists(select 1 from public.profiles actor where actor.id=auth.uid() and
 ((actor.role::text='moderator' and created_by=actor.id) or
 (actor.role::text='admin' and (created_by=actor.id or exists(select 1 from public.profiles issuer where issuer.id=created_by and issuer.role::text='moderator'))))))
with check(kind='YÖNERGE' and exists(select 1 from public.profiles actor where actor.id=auth.uid() and
 ((actor.role::text='moderator' and created_by=actor.id) or
 (actor.role::text='admin' and (created_by=actor.id or exists(select 1 from public.profiles issuer where issuer.id=created_by and issuer.role::text='moderator'))))));

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
     or parent.revision is distinct from basis.basis_revision then raise exception 'directive_basis_needs_review'; end if;
 end if;
 new.regulation_revision:=basis.revision;
 new.rule_ref:=basis.kind||' § '||basis.number||' — '||basis.title;
 new.rule_snapshot:=jsonb_build_object('number',basis.number,'kind',basis.kind,'title',basis.title,'body',basis.body,'revision',basis.revision,'effective_at',basis.effective_at,'basis_rule_id',basis.basis_rule_id,'basis_revision',basis.basis_revision);
 return new;
end $$;
revoke all on function public.qg_capture_discipline_basis() from public,anon,authenticated;
create trigger qg_capture_discipline_basis before insert or update on public.moderation_actions
for each row execute function public.qg_capture_discipline_basis();
commit;
