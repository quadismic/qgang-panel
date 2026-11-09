begin;

-- Remove old Codex content and the retired discipline decisions.
create temp table qg_old_codex on commit drop as
 select id,legacy_announcement_id from public.regulations where not normative_edition;
-- Clear old decisions and their dependent review/appeal records.
drop trigger qg_capture_discipline_basis on public.moderation_actions;
delete from public.notifications where kind='discipline'
 and entity_id in (select id from public.moderation_actions union select id from public.moderation_legacy_archive);
delete from public.moderation_actions;
delete from public.moderation_legacy_archive;
alter table public.regulations disable trigger user;
update public.regulations set basis_rule_id=null,basis_revision=null,parent_rule_id=null,complementary_bases='[]'
 where not normative_edition or basis_rule_id in (select id from qg_old_codex)
 or parent_rule_id in (select id from qg_old_codex)
 or exists(select 1 from jsonb_array_elements(complementary_bases) b join qg_old_codex o on o.id::text=b->>'id');
update public.regulation_revisions set basis_rule_id=null,basis_revision=null,complementary_bases='[]'
 where basis_rule_id in (select id from qg_old_codex)
 or exists(select 1 from jsonb_array_elements(complementary_bases) b join qg_old_codex o on o.id::text=b->>'id');
delete from public.regulations where id in (select id from qg_old_codex);
alter table public.regulations enable trigger user;
delete from public.announcements where id in (select legacy_announcement_id from qg_old_codex);

-- The dedicated bucket is cleared separately through the Storage API.
drop policy if exists "compile upload" on storage.objects;
drop policy if exists "compile download" on storage.objects;
revoke execute on function public.begin_codex_compilation(boolean),public.current_codex_document(boolean),
 public.finish_codex_compilation(uuid,text,text,text,boolean) from public,anon,authenticated;
alter table public.codex_compilations disable trigger codex_compilation_immutable;
delete from public.codex_compilations;
alter table public.codex_compilations enable trigger codex_compilation_immutable;

alter table public.regulations add column decision_category text;
update public.regulations set decision_category='administrative' where kind='KARAR';
alter table public.regulations add constraint regulation_decision_category check (
 (kind='KARAR' and decision_category is not null and decision_category in ('administrative','disciplinary'))
 or (kind is distinct from 'KARAR' and decision_category is null)
);
grant select(decision_category) on public.regulations to anon,authenticated;

create table public.discipline_cases(
 id uuid primary key default gen_random_uuid(),
 case_number bigint generated always as identity unique,
 report_id uuid unique references public.reports(id) on delete set null,
 subject_id uuid references public.profiles(id) on delete set null,
 reporter_id uuid references public.profiles(id) on delete set null,
 incident text not null,
 evidence text,
 member_notice text,
 member_statement text,
 stage text not null default 'reported' check(stage in ('reported','review','closed')),
 created_at timestamptz not null default now()
);
create table public.discipline_orders(
 id uuid primary key default gen_random_uuid(),
 regulation_id uuid not null unique references public.regulations(id),
 case_id uuid not null unique references public.discipline_cases(id),
 subject_id uuid references public.profiles(id) on delete set null,
 decided_by uuid references public.profiles(id) on delete set null,
 sanction_id uuid references public.moderation_actions(id) on delete set null,
 outcome text not null check(outcome in ('none','warning','suspension','ban')),
 ends_at timestamptz,
 decided_at timestamptz not null default now(),
 reconsideration text,
 reconsideration_result text,
 revoked_at timestamptz,
 prior_role public.qgang_role,
 membership_ended_at timestamptz
);
alter table public.discipline_cases enable row level security;
alter table public.discipline_orders enable row level security;
revoke all on public.discipline_cases,public.discipline_orders from public,anon,authenticated;
grant select on public.discipline_cases to authenticated;
grant select(id,regulation_id,case_id,subject_id,sanction_id,outcome,ends_at,decided_at,reconsideration,reconsideration_result,revoked_at) on public.discipline_orders to authenticated;
create index discipline_case_subject on public.discipline_cases(subject_id);
create index discipline_case_reporter on public.discipline_cases(reporter_id);
create index discipline_order_subject on public.discipline_orders(subject_id);

create function private.discipline_staff() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role::text in ('founder','admin','moderator') and not is_suspended)
 and private.has_permission('discipline.view')
$$;
revoke all on function private.discipline_staff() from public,anon;
grant execute on function private.discipline_staff() to authenticated;
create policy discipline_staff_cases on public.discipline_cases for select to authenticated using ((select private.discipline_staff()));
create policy discipline_private_orders on public.discipline_orders for select to authenticated using ((select private.discipline_staff()) or subject_id=(select auth.uid()));

create function private.discipline_decision_visible(p_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select private.discipline_staff() or exists(
  select 1 from public.discipline_orders where regulation_id=p_id and subject_id=auth.uid()
 )
$$;
revoke all on function private.discipline_decision_visible(uuid) from public,anon;
grant execute on function private.discipline_decision_visible(uuid) to authenticated;
create policy no_anonymous_discipline_decisions on public.regulations as restrictive for select to anon
 using (decision_category is distinct from 'disciplinary');
create policy private_discipline_decisions on public.regulations as restrictive for select to authenticated
 using (decision_category is distinct from 'disciplinary' or (select private.discipline_decision_visible(id)));
create policy discipline_participant_decision on public.regulations for select to authenticated
 using (decision_category='disciplinary' and published_at<=now() and (select private.discipline_decision_visible(id)));
create policy only_case_creates_discipline_decisions on public.regulations as restrictive for insert to authenticated
 with check (decision_category is distinct from 'disciplinary');
create policy only_case_updates_discipline_decisions on public.regulations as restrictive for update to authenticated
 using (decision_category is distinct from 'disciplinary') with check (decision_category is distinct from 'disciplinary');
create policy only_case_deletes_discipline_decisions on public.regulations as restrictive for delete to authenticated
 using (decision_category is distinct from 'disciplinary');
create or replace view public.announcement_feed with(security_invoker=true) as
select a.id,a.title,a.body,'DUYURU'::text as category,a.priority,a.is_pinned,a.published_at,
 null::timestamptz as effective_at,null::text as status,null::uuid as regulation_id,null::integer as revision,false as historical
from public.announcements a where a.category='DUYURU' and a.published_at<=now()
 and not exists(select 1 from public.regulations r where r.legacy_announcement_id=a.id)
union all
select r.id,r.title,r.body,'KARAR'::text,r.decision_priority,r.decision_pinned,r.published_at,
 r.effective_at,r.status,r.id,r.revision,r.legacy_announcement_id is not null
from public.regulations r where r.kind='KARAR' and r.decision_category='administrative' and r.status<>'taslak' and r.published_at<=now();

create function private.discipline_capture_report() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.reported_user_id is not null then
  insert into public.discipline_cases(report_id,subject_id,reporter_id,incident,stage,created_at)
   values(new.id,new.reported_user_id,new.reporter_id,new.reason,'reported',new.created_at) on conflict(report_id) do nothing;
 end if;
 return new;
end $$;
revoke all on function private.discipline_capture_report() from public,anon,authenticated;
create trigger discipline_capture_report after insert on public.reports for each row execute function private.discipline_capture_report();
insert into public.discipline_cases(report_id,subject_id,reporter_id,incident,stage,created_at)
 select id,reported_user_id,reporter_id,reason,case status::text when 'open' then 'reported' when 'reviewing' then 'review' else 'closed' end,created_at
 from public.reports where reported_user_id is not null order by created_at,id;

create function public.my_discipline_cases() returns table(id uuid,case_number bigint,stage text,member_notice text,member_statement text,created_at timestamptz,is_subject boolean)
language sql stable security definer set search_path='' as $$
 select c.id,c.case_number,c.stage,case when c.subject_id=auth.uid() then c.member_notice end,
  case when c.subject_id=auth.uid() then c.member_statement end,c.created_at,c.subject_id=auth.uid()
 from public.discipline_cases c
 where (c.subject_id=auth.uid() and (c.member_notice is not null or exists(select 1 from public.discipline_orders o where o.case_id=c.id)))
 or c.reporter_id=auth.uid()
 order by c.created_at desc,c.id
$$;
revoke all on function public.my_discipline_cases() from public,anon;
grant execute on function public.my_discipline_cases() to authenticated;

create function public.discipline_case_action(p_action text,p_case uuid default null,p_subject uuid default null,
 p_text text default null,p_evidence text default null,p_outcome text default null,p_ends timestamptz default null,p_heard boolean default false)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); actor_role text; target_role text; c public.discipline_cases%rowtype;
 o public.discipline_orders%rowtype; sanction uuid; decision_id uuid; result uuid; membership_end timestamptz; message text:=nullif(btrim(p_text),'');
begin
 select role::text into actor_role from public.profiles where id=actor and not is_suspended;
 if actor_role is null or (actor_role='guest' and p_action<>'reconsider') then raise exception 'discipline_forbidden'; end if;
 if p_action is null or p_action not in ('create','review','statement','decide','reconsider','uphold','revoke') then raise exception 'discipline_invalid'; end if;
 if message is null or length(message)>(case when p_action in ('create','statement','reconsider','review') then 4000 else 500 end)
    or length(coalesce(p_evidence,''))>4000 then raise exception 'discipline_invalid'; end if;
 if p_action='create' then
  if not private.discipline_staff() or not private.has_permission('discipline.issue') or p_subject=actor
     or not exists(select 1 from public.profiles where id=p_subject and role::text<>'guest') then raise exception 'discipline_forbidden'; end if;
  insert into public.discipline_cases(subject_id,reporter_id,incident,evidence) values(p_subject,actor,message,nullif(btrim(p_evidence),'')) returning id into result;
  return result;
 end if;
 select * into c from public.discipline_cases where id=p_case for update;
 if not found then raise exception 'discipline_forbidden'; end if;
 if p_action='statement' then
  if c.subject_id is distinct from actor or c.stage<>'review' or c.member_notice is null then raise exception 'discipline_forbidden'; end if;
  update public.discipline_cases set member_statement=message where id=p_case;
  return p_case;
 elsif p_action='reconsider' then
  if c.subject_id is distinct from actor then raise exception 'discipline_forbidden'; end if;
  update public.discipline_orders set reconsideration=message where case_id=p_case and reconsideration is null;
  if not found then raise exception 'discipline_invalid'; end if;
  return p_case;
 end if;
 if not private.discipline_staff() then raise exception 'discipline_forbidden'; end if;
 select role::text into target_role from public.profiles where id=c.subject_id;
 if p_action in ('uphold','revoke') then
  if actor_role<>'founder' then raise exception 'discipline_forbidden'; end if;
  update public.discipline_orders set reconsideration_result=message,revoked_at=case when p_action='revoke' then now() end where case_id=p_case
   and reconsideration is not null and reconsideration_result is null returning * into o;
  if not found then raise exception 'discipline_invalid'; end if;
  if p_action='revoke' then
   update public.regulations set status='yururlukten_kaldirildi',change_reason=message where id=o.regulation_id;
  end if;
  if p_action='revoke' and o.sanction_id is not null then
   update public.moderation_actions set status='revoked',finality_status='revoked' where id=o.sanction_id;
   if o.outcome='ban' and o.membership_ended_at is not null and
      exists(select 1 from public.profiles where id=c.subject_id and role='guest') then
    update public.community_memberships set status='active',ended_at=null,updated_at=now()
      where user_id=c.subject_id and status='inactive' and ended_at=o.membership_ended_at;
    if found then update public.profiles set role=o.prior_role where id=c.subject_id and role='guest'; end if;
   end if;
  end if;
  if c.subject_id is not null then insert into public.notifications(user_id,kind,entity_id,body)
   values(c.subject_id,'discipline',p_case,'Yeniden değerlendirme talebin sonuçlandı.'); end if;
  return p_case;
 end if;
 if not (private.has_permission('discipline.issue') or (p_action='review' and private.has_permission('discipline.review')))
  or c.subject_id=actor or target_role is null or target_role='founder'
  or (actor_role='moderator' and target_role in ('moderator','admin'))
  or (actor_role='admin' and target_role='admin') then raise exception 'discipline_forbidden'; end if;
 if p_action='review' then
  if c.stage='closed' or c.member_notice is not null then raise exception 'discipline_invalid'; end if;
  update public.discipline_cases set stage='review',member_notice=message,evidence=coalesce(nullif(btrim(p_evidence),''),evidence) where id=p_case;
  update public.reports set status='reviewing',reviewed_by=actor where id=c.report_id;
  insert into public.notifications(user_id,kind,entity_id,body) values(c.subject_id,'discipline',p_case,'Disiplin dosyası açıldı. Açıklamanı paylaşabilirsin.');
  return p_case;
 end if;
 if c.stage<>'review' or c.member_notice is null or not coalesce(p_heard,false) or length(message)<3
  or p_outcome is null or p_outcome not in ('none','warning','suspension','ban') then raise exception 'discipline_invalid'; end if;
 if (p_outcome='ban' and actor_role<>'founder') or (p_outcome='suspension' and actor_role='moderator') then raise exception 'discipline_forbidden'; end if;
 if (p_outcome='suspension' and (p_ends is null or p_ends<=now())) or (p_outcome<>'suspension' and p_ends is not null) then raise exception 'discipline_invalid'; end if;
 if p_outcome<>'none' then
  insert into public.moderation_actions(moderator_id,target_user_id,issuer_role,action,reason,expires_at,status,finality_status,finalized_at)
   values(actor,c.subject_id,actor_role::public.qgang_role,p_outcome,message,p_ends,'active','final',now()) returning id into sanction;
  update public.moderation_actions set finality_status='final',finalized_at=now() where id=sanction;
 end if;
 if p_outcome='ban' then
  update public.community_memberships set status='inactive',ended_at=now(),updated_at=now()
    where user_id=c.subject_id and status='active' returning ended_at into membership_end;
  if membership_end is null then raise exception 'discipline_active_membership_required'; end if;
  update public.profiles set role='guest' where id=c.subject_id;
 end if;
 insert into public.regulations(title,body,kind,decision_category,normative_edition,number,section_number,status,effective_at,published_at,created_by,application_scope,change_reason)
 values('Disiplin dosyası D-'||c.case_number,message,'KARAR','disciplinary',true,'','01','yururlukte',now(),now(),actor,'Disiplin dosyası','İlk karar')
 returning id into decision_id;
 insert into public.discipline_orders(regulation_id,case_id,subject_id,decided_by,sanction_id,outcome,ends_at,prior_role,membership_ended_at)
  values(decision_id,p_case,c.subject_id,actor,sanction,p_outcome,p_ends,case when p_outcome='ban' then target_role::public.qgang_role end,membership_end);
 if p_outcome in ('suspension','ban') then
  update public.event_responses r set response='not_going'
  from public.community_events e where e.id=r.event_id and r.user_id=c.subject_id
    and r.response in ('going','maybe') and e.status='published' and e.starts_at>now()
    and (p_outcome='ban' or e.starts_at<=p_ends);
 end if;
 update public.discipline_cases set stage='closed' where id=p_case;
 update public.reports set status='resolved',reviewed_by=actor where id=c.report_id;
 insert into public.notifications(user_id,kind,entity_id,body) values(c.subject_id,'discipline',p_case,'Disiplin kararın hazır.');
 return p_case;
end $$;
revoke all on function public.discipline_case_action(text,uuid,uuid,text,text,text,timestamptz,boolean) from public,anon;
grant execute on function public.discipline_case_action(text,uuid,uuid,text,text,text,timestamptz,boolean) to authenticated;
-- New sanctions only via the atomic decision RPC. Legacy actions remain readable.
create policy discipline_no_direct_sanctions on public.moderation_actions as restrictive for insert to authenticated with check(false);
create policy discipline_no_legacy_review_for_new_orders on public.moderation_reviews as restrictive for insert to authenticated
 with check (not exists(select 1 from public.discipline_orders o where o.sanction_id=action_id));
create or replace function public.qg_validate_codex_basis()
returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare basis public.regulations; parent public.regulations; actor text;
begin
 select role::text into actor from public.profiles where id=auth.uid();
 if tg_op='UPDATE' then
   if new.kind is distinct from old.kind or new.decision_category is distinct from old.decision_category or new.legacy_announcement_id is distinct from old.legacy_announcement_id or
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
 if not new.normative_edition or new.kind not in ('YÖNERGE','KARAR') then raise exception 'legacy_codex_closed'; end if;
 if new.basis_rule_id is not null or new.basis_revision is not null or new.parent_rule_id is not null or new.complementary_bases<>'[]'
 then raise exception 'legacy_codex_basis_not_supported'; end if;
 return new;
end $$;
-- The allocator must see private decisions too, regardless of the issuer's read scope.
create or replace function private.codex_number_allocate() returns trigger
language plpgsql security definer set search_path='' as $$
declare prefix text; next_no integer;
begin
 if tg_op='UPDATE' then
  if new.parent_rule_id is distinct from old.parent_rule_id or new.number is distinct from old.number then
   raise exception 'immutable_rule_number';
  end if;
  return new;
 end if;
 if new.kind='YÖNERGE' then new.number:=null; return new; end if;
 if new.kind<>'KARAR' then raise exception 'legacy_codex_closed'; end if;
 perform pg_advisory_xact_lock(hashtextextended('qgang-codex-number',42));
 prefix:='İK-'||extract(year from now() at time zone 'Europe/Istanbul')::text||'-';
 select coalesce(max(substring(number from length(prefix)+1)::integer),0)+1 into next_no
 from public.regulations where left(number,length(prefix))=prefix and substring(number from length(prefix)+1)~'^[0-9]+$';
 new.number:=prefix||lpad(next_no::text,greatest(length(next_no::text),3),'0');
 return new;
end $$;
-- Legacy paths must not let clients bypass the single file or the Leader review.
create policy discipline_no_legacy_report_update on public.reports as restrictive for update to authenticated
 using (reported_user_id is null) with check (reported_user_id is null);
create policy discipline_no_new_legacy_appeal on public.moderation_appeals as restrictive for insert to authenticated
 with check (not exists(select 1 from public.discipline_orders o where o.sanction_id=action_id));
create policy discipline_leader_legacy_appeal on public.moderation_appeals as restrictive for update to authenticated
 using (exists(select 1 from public.profiles where id=auth.uid() and role='founder'))
 with check (exists(select 1 from public.profiles where id=auth.uid() and role='founder'));
create function private.discipline_event_response_guard() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.user_id=auth.uid() and new.response in ('going','maybe') and exists(
  select 1 from public.discipline_orders o where o.subject_id=new.user_id and o.outcome='suspension'
   and o.revoked_at is null and o.ends_at>now()
   and exists(select 1 from public.community_events e where e.id=new.event_id and e.starts_at<=o.ends_at)
 ) then raise exception 'discipline_event_suspension'; end if;
 return new;
end $$;
revoke all on function private.discipline_event_response_guard() from public,anon,authenticated;
create trigger discipline_event_response_guard before insert or update of response on public.event_responses
 for each row execute function private.discipline_event_response_guard();
commit;
