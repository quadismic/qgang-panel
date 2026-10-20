-- Confidential review dossiers are deliberately outside the exposed Data API schema.
create table private.membership_review_periods(
 id uuid primary key default gen_random_uuid(),year int not null,sequence int not null check(sequence between 1 and 3999),
 state text not null default 'draft' check(state in ('draft','collecting','review','archived','cancelled')),
 scope_confirmed_at timestamptz,norm_snapshot jsonb not null default '[]',created_by uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(),closed_at timestamptz,unique(year,sequence));
create table private.membership_review_reviewers(
 period_id uuid references private.membership_review_periods(id) on delete cascade,user_id uuid references public.profiles(id) on delete cascade,
 primary key(period_id,user_id));
create table private.membership_review_subjects(
 id uuid primary key default gen_random_uuid(),period_id uuid not null references private.membership_review_periods(id) on delete cascade,
 user_id uuid references public.profiles(id) on delete set null,display_name text not null check(char_length(trim(display_name)) between 1 and 120),
 handle text,role_snapshot text not null check(role_snapshot in ('member','guest','manual')),manual boolean not null default false,
 created_at timestamptz not null default now(),unique(period_id,user_id),unique(id,period_id));
create table private.membership_review_evaluations(
 id uuid primary key default gen_random_uuid(),period_id uuid not null,subject_id uuid not null,author_id uuid references public.profiles(id) on delete set null,
 communication text not null,bond text not null,belonging text not null,participation text not null,intent text not null,
 category text not null check(category in ('A','B','C','D','unknown')),interview_needed boolean not null default false,
 rationale text not null default '' check(char_length(rationale)<=5000),submitted boolean not null default false,revision int not null default 1,
 updated_at timestamptz not null default now(),foreign key(subject_id,period_id) references private.membership_review_subjects(id,period_id),
 unique(subject_id,author_id),check(not submitted or category not in ('C','D') or char_length(trim(rationale))>=10));
create table private.membership_review_interviews(
 id uuid primary key default gen_random_uuid(),period_id uuid not null,subject_id uuid not null,assigned_to uuid references public.profiles(id) on delete set null,
 state text not null default 'assigned' check(state in ('assigned','in_progress','done')),contact_log text not null default '' check(char_length(contact_log)<=5000),
 explanation_offered boolean not null default false,member_response text not null default '' check(char_length(member_response)<=5000),
 summary text not null default '' check(char_length(summary)<=5000),revision int not null default 1,updated_at timestamptz not null default now(),
 foreign key(subject_id,period_id) references private.membership_review_subjects(id,period_id));
create table private.membership_review_decisions(
 subject_id uuid primary key,period_id uuid not null,outcome text not null check(outcome in ('continue','investigate','end')),
 reason text not null check(char_length(trim(reason)) between 10 and 6000),shared_text text not null check(char_length(trim(shared_text)) between 10 and 4000),
 regulation_id uuid references public.regulations(id) on delete restrict,revision int not null default 1,finalized_at timestamptz,updated_at timestamptz not null default now(),
 foreign key(subject_id,period_id) references private.membership_review_subjects(id,period_id));
-- Publication is a separate, minimal projection: no private reasoning/answers/notes.
create table private.membership_review_releases(
 subject_id uuid primary key,period_id uuid not null,display_name text not null,outcome text not null,body text not null,
 decision_revision int not null,finalized_at timestamptz not null,released_at timestamptz not null default now(),
 foreign key(subject_id,period_id) references private.membership_review_subjects(id,period_id));
create table private.membership_review_audit(
 id bigint generated always as identity primary key,period_id uuid not null references private.membership_review_periods(id),
 subject_id uuid references private.membership_review_subjects(id),actor_id uuid references public.profiles(id) on delete set null,
 action text not null,reason text,created_at timestamptz not null default now());
create index membership_review_evaluation_period on private.membership_review_evaluations(period_id,author_id);
create index membership_review_interview_period on private.membership_review_interviews(period_id,assigned_to);
create index membership_review_subject_period on private.membership_review_subjects(period_id);
create index membership_review_decision_period on private.membership_review_decisions(period_id);
create index membership_review_release_period on private.membership_review_releases(period_id);
create index membership_review_audit_period on private.membership_review_audit(period_id);
do $$ declare t text;begin
 foreach t in array array['periods','reviewers','subjects','evaluations','interviews','decisions','releases','audit'] loop
 execute format('alter table private.%I enable row level security','membership_review_'||t);
 execute format('revoke all on private.%I from public,anon,authenticated','membership_review_'||t);
 end loop;
end $$;

create function private.membership_review_allowed(p_permission text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and not coalesce(p.is_suspended,false) and (p.role='founder' or
 (p.role in ('admin','moderator','creator') and exists(select 1 from public.role_permissions rp where rp.role=p.role and rp.permission='reviews.view' and rp.enabled)
 and exists(select 1 from public.role_permissions rp where rp.role=p.role and rp.permission=p_permission and rp.enabled))));
$$;
revoke all on function private.membership_review_allowed(text) from public,anon,authenticated;

-- Preserve existing permission semantics; only add this module's combinations.
alter function public.set_role_permission(text,text,boolean) rename to set_role_permission_before_reviews;
alter function public.set_role_permission_before_reviews(text,text,boolean) set schema private;
revoke all on function private.set_role_permission_before_reviews(text,text,boolean) from public,anon,authenticated;
create function private.membership_review_set_permission(p_role text,p_permission text,p_enabled boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended) then raise exception 'not_authorized';end if;
 if p_permission not like 'reviews.%' then perform private.set_role_permission_before_reviews(p_role,p_permission,p_enabled);return;end if;
 if p_role not in ('admin','moderator','creator') or p_permission not in ('reviews.view','reviews.prepare','reviews.evaluate','reviews.coordinate','reviews.interview','reviews.confidential') then raise exception 'invalid_review_permission';end if;
 insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,p_permission,p_enabled,auth.uid(),now())
 on conflict(role,permission) do update set enabled=excluded.enabled,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
 if p_enabled and p_permission<>'reviews.view' then
 insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'reviews.view',true,auth.uid(),now())
 on conflict(role,permission) do update set enabled=true,updated_by=excluded.updated_by,updated_at=excluded.updated_at;
 elsif not p_enabled and p_permission='reviews.view' then update public.role_permissions set enabled=false where role=p_role::public.qgang_role and permission like 'reviews.%';end if;
end $$;
revoke all on function private.membership_review_set_permission(text,text,boolean) from public,anon;
grant execute on function private.membership_review_set_permission(text,text,boolean) to authenticated;
create function public.set_role_permission(p_role text,p_permission text,p_enabled boolean) returns void language sql security invoker set search_path='' as $$select private.membership_review_set_permission(p_role,p_permission,p_enabled)$$;
revoke all on function public.set_role_permission(text,text,boolean) from public,anon;
grant execute on function public.set_role_permission(text,text,boolean) to authenticated;
insert into public.role_permissions(role,permission,enabled)
 select r::public.qgang_role,p,true from unnest(array['admin','moderator','creator'])r cross join unnest(array['reviews.view','reviews.evaluate','reviews.interview'])p
 on conflict(role,permission) do nothing;
insert into public.role_permissions(role,permission,enabled) values('admin','reviews.prepare',true),('admin','reviews.coordinate',true)
 on conflict(role,permission) do nothing;

create function private.membership_review_command(p_action text,p_period uuid,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid=auth.uid();leader boolean;period private.membership_review_periods;subject private.membership_review_subjects;
 decision private.membership_review_decisions;entry private.membership_review_evaluations;interview private.membership_review_interviews;
 target uuid;chosen_subject uuid;new_id uuid;yr int;seq int;expected int;reason text=trim(coalesce(p_data->>'reason',''));ref record;
 vals text[];cohort int;missing int;revision int;result jsonb='{}';
begin
 if actor is null or not private.membership_review_allowed('reviews.view') then raise exception 'review_forbidden';end if;
 leader=exists(select 1 from public.profiles where id=actor and role='founder');
 if p_action='create' then
  if not private.membership_review_allowed('reviews.prepare') then raise exception 'review_forbidden';end if;
  yr=extract(year from now() at time zone 'Europe/Istanbul');perform pg_advisory_xact_lock(hashtextextended('membership-review-'||yr,0));
  select coalesce(max(sequence),0)+1 into seq from private.membership_review_periods where year=yr;
  insert into private.membership_review_periods(year,sequence,created_by,norm_snapshot)
  values(yr,seq,actor,(select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'number',r.number,'title',r.title,'revision',r.revision,'body',r.body)),'[]') from public.regulations r where r.number in ('03.09','03.09.01','03.09.01/01') and r.status='yururlukte')) returning id into new_id;
  insert into private.membership_review_reviewers(period_id,user_id) select new_id,id from public.profiles where not is_suspended and role in ('founder','admin','moderator','creator');
  insert into private.membership_review_audit(period_id,actor_id,action) values(new_id,actor,'create');return jsonb_build_object('id',new_id);
 end if;
 select * into period from private.membership_review_periods where id=p_period for update;
 if period.id is null then raise exception 'review_missing';end if;
 if period.state='cancelled' or (period.state='archived' and p_action not in ('release','link_manual')) then raise exception 'review_closed';end if;
 if p_action in ('scope','manual','remove_subject','reviewers') then
  if period.state<>'draft' or not private.membership_review_allowed('reviews.prepare') then raise exception 'review_scope_locked';end if;
  if p_action='scope' then
   if jsonb_typeof(p_data->'ids')<>'array' then raise exception 'review_invalid';end if;
   for ref in select value from jsonb_array_elements_text(p_data->'ids') loop
    if not exists(select 1 from public.profiles where id=ref.value::uuid and role in ('member','guest')) or exists(select 1 from private.membership_review_reviewers where period_id=p_period and user_id=ref.value::uuid) then raise exception 'review_manager_subject';end if;
   end loop;
   delete from private.membership_review_subjects where period_id=p_period and not manual;
   insert into private.membership_review_subjects(period_id,user_id,display_name,handle,role_snapshot)
   select p_period,id,coalesce(nullif(display_name,''),handle,'Mensup'),handle,role::text from public.profiles where id in(select value::uuid from jsonb_array_elements_text(p_data->'ids')) and role in ('member','guest') on conflict(period_id,user_id) do nothing;
   update private.membership_review_periods set scope_confirmed_at=now() where id=p_period;
  elsif p_action='manual' then
   if period.scope_confirmed_at is null then raise exception 'review_confirm_scope';end if;
   if char_length(trim(coalesce(p_data->>'name',''))) not between 1 and 120 then raise exception 'review_invalid';end if;
   if exists(select 1 from private.membership_review_subjects where period_id=p_period and lower(trim(display_name))=lower(trim(p_data->>'name'))) and coalesce(p_data->>'duplicate_confirm','')<>'true' then raise exception 'review_duplicate';end if;
   if exists(select 1 from public.profiles where lower(trim(display_name))=lower(trim(p_data->>'name')) or lower(handle)=lower(trim(p_data->>'name'))) and coalesce(p_data->>'duplicate_confirm','')<>'true' then raise exception 'review_duplicate';end if;
   insert into private.membership_review_subjects(period_id,display_name,role_snapshot,manual) values(p_period,trim(p_data->>'name'),'manual',true) returning id into chosen_subject;
  elsif p_action='remove_subject' then delete from private.membership_review_subjects where id=(p_data->>'subject_id')::uuid and period_id=p_period;
  else
   if not leader then raise exception 'review_founder_only';end if;
   for ref in select value from jsonb_array_elements_text(p_data->'ids') loop
    if not exists(select 1 from public.profiles where id=ref.value::uuid and not is_suspended and role in ('founder','admin','moderator','creator')) then raise exception 'review_invalid_reviewer';end if;
   end loop;
   delete from private.membership_review_reviewers where period_id=p_period;
   insert into private.membership_review_reviewers(period_id,user_id) select p_period,value::uuid from jsonb_array_elements_text(p_data->'ids') group by value;
  end if;
 elsif p_action='start' then
  if not leader then raise exception 'review_founder_only';end if;
  if not exists(select 1 from jsonb_array_elements(period.norm_snapshot) n join public.regulations r on r.id=(n->>'id')::uuid where r.kind='YÖNERGE' and r.revision=(n->>'revision')::int and r.status='yururlukte' and (r.effective_at is null or r.effective_at<=now())) then raise exception 'review_norm_changed';end if;
  if not private.membership_review_privacy_ready() then raise exception 'review_privacy_review_required';end if;
  if period.state<>'draft' or period.scope_confirmed_at is null or (p_data->>'confirm') is distinct from 'true' or not exists(select 1 from private.membership_review_subjects where period_id=p_period) or not exists(select 1 from private.membership_review_reviewers where period_id=p_period) then raise exception 'review_start_invalid';end if;
  if exists(select 1 from private.membership_review_subjects s join public.profiles p on p.id=s.user_id where s.period_id=p_period and p.role not in ('member','guest')) or exists(select 1 from private.membership_review_subjects s join private.membership_review_reviewers rr on rr.period_id=s.period_id and rr.user_id=s.user_id where s.period_id=p_period) then raise exception 'review_manager_subject';end if;
  update private.membership_review_periods set state='collecting' where id=p_period;
 elsif p_action='evaluation' then
  if period.state<>'collecting' or not private.membership_review_allowed('reviews.evaluate') or not exists(select 1 from private.membership_review_reviewers where period_id=p_period and user_id=actor) then raise exception 'review_forbidden';end if;
  chosen_subject=(p_data->>'subject_id')::uuid;select * into subject from private.membership_review_subjects where id=chosen_subject and period_id=p_period;
  if subject.id is null or subject.user_id=actor or exists(select 1 from public.profiles where id=subject.user_id and role in ('founder','admin','moderator','creator')) then raise exception 'review_forbidden';end if;
  if p_data->>'communication' not in ('regular','limited','none','unknown') or p_data->>'bond' not in ('strong','present','weak','unknown') or p_data->>'belonging' not in ('yes','unclear','no','unknown') or p_data->>'participation' not in ('frequent','limited','none','unknown') or p_data->>'intent' not in ('continue','unclear','end','unknown') then raise exception 'review_invalid';end if;
  select * into entry from private.membership_review_evaluations where subject_id=subject.id and author_id=actor;
  if coalesce((p_data->>'revision')::int,0)<>coalesce(entry.revision,0) then raise exception 'review_conflict';end if;
  insert into private.membership_review_evaluations(period_id,subject_id,author_id,communication,bond,belonging,participation,intent,category,interview_needed,rationale,submitted)
  values(p_period,subject.id,actor,p_data->>'communication',p_data->>'bond',p_data->>'belonging',p_data->>'participation',p_data->>'intent',p_data->>'category',coalesce((p_data->>'interview_needed')::boolean,false),coalesce(p_data->>'rationale',''),coalesce((p_data->>'submitted')::boolean,false))
  on conflict(subject_id,author_id) do update set communication=excluded.communication,bond=excluded.bond,belonging=excluded.belonging,participation=excluded.participation,intent=excluded.intent,category=excluded.category,interview_needed=excluded.interview_needed,rationale=excluded.rationale,submitted=excluded.submitted,revision=private.membership_review_evaluations.revision+1,updated_at=now() returning membership_review_evaluations.revision into revision;
  result=jsonb_build_object('revision',revision);
 elsif p_action='review' then
  if not leader or period.state<>'collecting' then raise exception 'review_founder_only';end if;
  select count(*) into cohort from private.membership_review_reviewers rr join public.profiles p on p.id=rr.user_id where rr.period_id=p_period and p.role in ('founder','admin','moderator','creator');
  select cohort*count(*) into expected from private.membership_review_subjects where period_id=p_period;
  select expected-count(*) into missing from private.membership_review_evaluations e join private.membership_review_reviewers rr on rr.period_id=e.period_id and rr.user_id=e.author_id join public.profiles p on p.id=e.author_id where e.period_id=p_period and e.submitted and p.role in ('founder','admin','moderator','creator');
  if missing>0 and ((p_data->>'confirm') is distinct from 'true' or char_length(reason)<10) then raise exception 'review_incomplete';end if;
  update private.membership_review_periods set state='review' where id=p_period;
 elsif p_action in ('assign_interview','interview') then
  if period.state<>'review' then raise exception 'review_not_open';end if;
  if p_action='assign_interview' then
   if not private.membership_review_allowed('reviews.coordinate') then raise exception 'review_forbidden';end if;
   chosen_subject=(p_data->>'subject_id')::uuid;target=(p_data->>'assigned_to')::uuid;
   if not exists(select 1 from private.membership_review_subjects where id=chosen_subject and period_id=p_period) or not exists(select 1 from public.profiles p where p.id=target and not p.is_suspended and p.role in ('founder','admin','moderator','creator') and (p.role='founder' or exists(select 1 from public.role_permissions rp where rp.role=p.role and rp.permission='reviews.interview' and rp.enabled))) then raise exception 'review_invalid';end if;
   insert into private.membership_review_interviews(period_id,subject_id,assigned_to) values(p_period,chosen_subject,target);
  else
   select * into interview from private.membership_review_interviews where id=(p_data->>'id')::uuid and period_id=p_period for update;
   if interview.id is null or not (leader or (interview.assigned_to=actor and private.membership_review_allowed('reviews.interview'))) then raise exception 'review_forbidden';end if;
   if interview.revision is distinct from (p_data->>'revision')::int then raise exception 'review_conflict';end if;
   update private.membership_review_interviews set state=p_data->>'state',contact_log=coalesce(p_data->>'contact_log',''),explanation_offered=coalesce((p_data->>'explanation_offered')::boolean,false),member_response=coalesce(p_data->>'member_response',''),summary=coalesce(p_data->>'summary',''),revision=private.membership_review_interviews.revision+1,updated_at=now() where id=interview.id;
  end if;
 elsif p_action in ('decision','finalize','release') then
  if not leader or (period.state<>'review' and not (p_action='release' and period.state='archived')) then raise exception 'review_founder_only';end if;
  chosen_subject=(p_data->>'subject_id')::uuid;select * into subject from private.membership_review_subjects where id=chosen_subject and period_id=p_period;
  if subject.id is null then raise exception 'review_missing';end if;
  select * into decision from private.membership_review_decisions where subject_id=subject.id;
  if p_action='decision' then
   if decision.finalized_at is not null then raise exception 'review_decision_sealed';end if;
   if coalesce((p_data->>'revision')::int,0)<>coalesce(decision.revision,0) then raise exception 'review_conflict';end if;
   insert into private.membership_review_decisions(subject_id,period_id,outcome,reason,shared_text,regulation_id)
   values(subject.id,p_period,p_data->>'outcome',reason,trim(p_data->>'shared_text'),nullif(p_data->>'regulation_id','')::uuid)
   on conflict(subject_id) do update set outcome=excluded.outcome,reason=excluded.reason,shared_text=excluded.shared_text,regulation_id=excluded.regulation_id,revision=private.membership_review_decisions.revision+1,updated_at=now();
  elsif p_action='finalize' then
   if decision.subject_id is null or decision.finalized_at is not null or (p_data->>'confirm') is distinct from 'true' then raise exception 'review_confirm_required';end if;
   if exists(select 1 from private.membership_review_interviews where subject_id=subject.id and state<>'done') then raise exception 'review_interview_pending';end if;
   if decision.outcome='end' and (not exists(select 1 from public.regulations where id=decision.regulation_id and kind='KARAR' and status='yururlukte' and published_at<=now() and (effective_at is null or effective_at<=now())) or not exists(select 1 from private.membership_review_interviews where subject_id=subject.id and state='done' and (explanation_offered or char_length(trim(contact_log))>=10))) then raise exception 'review_explanation_required';end if;
   update private.membership_review_decisions set finalized_at=now() where subject_id=subject.id;
  else
   if decision.finalized_at is null or (p_data->>'confirm') is distinct from 'true' then raise exception 'review_confirm_required';end if;
   insert into private.membership_review_releases(subject_id,period_id,display_name,outcome,body,decision_revision,finalized_at)
   values(subject.id,p_period,subject.display_name,decision.outcome,decision.shared_text,decision.revision,decision.finalized_at) on conflict(subject_id) do nothing;
  end if;
 elsif p_action='link_manual' then
  if not leader or (p_data->>'confirm') is distinct from 'true' or char_length(reason)<10 then raise exception 'review_founder_only';end if;
  chosen_subject=(p_data->>'subject_id')::uuid;target=(p_data->>'target_id')::uuid;
  if not exists(select 1 from private.membership_review_subjects where id=chosen_subject and period_id=p_period and manual and user_id is null) or not exists(select 1 from public.profiles where id=target and role in ('member','guest')) or exists(select 1 from private.membership_review_subjects where period_id=p_period and user_id=target) then raise exception 'review_duplicate';end if;
  update private.membership_review_subjects set user_id=target where id=chosen_subject;
 elsif p_action in ('archive','cancel') then
  if not leader or (p_data->>'confirm') is distinct from 'true' then raise exception 'review_founder_only';end if;
  if p_action='archive' and (period.state<>'review' or exists(select 1 from private.membership_review_subjects s left join private.membership_review_decisions d on d.subject_id=s.id where s.period_id=p_period and d.finalized_at is null)) then raise exception 'review_unfinished';end if;
  if p_action='cancel' and exists(select 1 from private.membership_review_releases where period_id=p_period) then raise exception 'review_already_released';end if;
  if p_action='cancel' and char_length(reason)<10 then raise exception 'review_reason_required';end if;
  update private.membership_review_periods set state=case when p_action='archive' then 'archived' else 'cancelled' end,closed_at=now() where id=p_period;
 else raise exception 'review_invalid_action';end if;
 -- Audit contains operations, never copied confidential answer text.
 if p_action<>'evaluation' or coalesce((p_data->>'submitted')::boolean,false) then
 insert into private.membership_review_audit(period_id,subject_id,actor_id,action,reason) values(p_period,chosen_subject,actor,p_action,case when p_action in ('cancel','review','link_manual') then reason end);
 end if;
 return result||jsonb_build_object('id',p_period);
end $$;
revoke all on function private.membership_review_command(text,uuid,jsonb) from public,anon;
grant execute on function private.membership_review_command(text,uuid,jsonb) to authenticated;
create function public.membership_review_command(p_action text,p_period uuid default null,p_data jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select private.membership_review_command(p_action,p_period,p_data)$$;
revoke all on function public.membership_review_command(text,uuid,jsonb) from public,anon;
grant execute on function public.membership_review_command(text,uuid,jsonb) to authenticated;

create function private.membership_review_snapshot(p_period uuid,p_search text,p_role text,p_page int) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare actor uuid=auth.uid();caps jsonb;period private.membership_review_periods;answer jsonb;subjects jsonb;staff jsonb;
 prepare boolean;confidential boolean;coordinate boolean;evaluator boolean;lead boolean;subject_scope uuid[];
begin
 if not private.membership_review_allowed('reviews.view') then raise exception 'review_forbidden';end if;
 lead=exists(select 1 from public.profiles where id=actor and role='founder');
 prepare=private.membership_review_allowed('reviews.prepare');confidential=private.membership_review_allowed('reviews.confidential');coordinate=private.membership_review_allowed('reviews.coordinate');
 caps=jsonb_build_object('founder',lead,'prepare',prepare,'confidential',confidential,'coordinate',coordinate,'evaluate',private.membership_review_allowed('reviews.evaluate'),'interview',private.membership_review_allowed('reviews.interview'),'privacy_ready',private.membership_review_privacy_ready());
 select jsonb_build_object('caps',caps,'actor_id',actor,'periods',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'label',r.year||'/'||trim(to_char(r.sequence,'RN')),'state',r.state,'created_at',r.created_at) order by r.year desc,r.sequence desc) from private.membership_review_periods r where r.state<>'draft' or prepare),'[]')) into answer;
 if p_period is null then return answer;end if;
 select * into period from private.membership_review_periods where id=p_period;
 if period.id is null or (period.state='draft' and not prepare) then raise exception 'review_forbidden';end if;
 evaluator=private.membership_review_allowed('reviews.evaluate') and exists(select 1 from private.membership_review_reviewers where period_id=p_period and user_id=actor);
 select array_agg(s.id) into subject_scope from private.membership_review_subjects s where s.period_id=p_period and (confidential or coordinate or prepare and period.state='draft' or evaluator or exists(select 1 from private.membership_review_interviews i where i.subject_id=s.id and i.assigned_to=actor and private.membership_review_allowed('reviews.interview')));
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'user_id',s.user_id,'display_name',s.display_name,'handle',s.handle,'role_snapshot',s.role_snapshot,'manual',s.manual,
 'own_submitted',exists(select 1 from private.membership_review_evaluations e where e.subject_id=s.id and e.author_id=actor and submitted),
 'submitted_count',case when confidential then (select count(*) from private.membership_review_evaluations e where e.subject_id=s.id and submitted) end,
 'categories',case when confidential then (select coalesce(jsonb_agg(distinct category) filter(where submitted and category<>'unknown'),'[]') from private.membership_review_evaluations e where e.subject_id=s.id) end,
 'interview_needed',case when confidential then exists(select 1 from private.membership_review_evaluations e where e.subject_id=s.id and submitted and interview_needed) end)
 order by s.display_name,s.id),'[]') into subjects from private.membership_review_subjects s where s.id=any(coalesce(subject_scope,'{}'));
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'display_name',coalesce(p.display_name,p.handle),'role',p.role,'assigned',exists(select 1 from private.membership_review_reviewers rr where rr.period_id=p_period and rr.user_id=p.id)) order by p.display_name),'[]') into staff from public.profiles p where not p.is_suspended and p.role in ('founder','admin','moderator','creator') and (prepare or confidential or coordinate or p.id=actor);
 answer=answer||jsonb_build_object('period',to_jsonb(period),'assigned',evaluator,'subjects',subjects,'staff',staff,
 'evaluations',coalesce((select jsonb_agg(to_jsonb(e)) from private.membership_review_evaluations e where e.period_id=p_period and (confidential or e.author_id=actor)),'[]'),
 'interviews',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'subject_id',i.subject_id,'assigned_to',i.assigned_to,'state',i.state,'revision',i.revision)||case when confidential or i.assigned_to=actor and private.membership_review_allowed('reviews.interview') then jsonb_build_object('contact_log',i.contact_log,'explanation_offered',i.explanation_offered,'member_response',i.member_response,'summary',i.summary) else '{}'::jsonb end)
 from private.membership_review_interviews i where i.period_id=p_period and (coordinate or confidential or i.assigned_to=actor and private.membership_review_allowed('reviews.interview'))),'[]'),
 'decisions',case when confidential then coalesce((select jsonb_agg(to_jsonb(d)) from private.membership_review_decisions d where d.period_id=p_period),'[]') else '[]'::jsonb end,
 'released',coalesce((select jsonb_agg(to_jsonb(r) order by display_name) from private.membership_review_releases r where r.period_id=p_period),'[]'),
 'audit',case when lead then coalesce((select jsonb_agg(to_jsonb(a) order by a.id desc) from private.membership_review_audit a where a.period_id=p_period),'[]') else '[]'::jsonb end,
 'regulations',case when lead then coalesce((select jsonb_agg(jsonb_build_object('id',id,'number',number,'title',title)) from public.regulations where kind='KARAR' and status='yururlukte' and published_at<=now()),'[]') else '[]'::jsonb end);
 if prepare and period.state='draft' then
 answer=answer||jsonb_build_object('candidates',coalesce((select jsonb_agg(to_jsonb(p)) from(select id,display_name,handle,role from public.profiles where role::text=case when p_role='guest' then 'guest' else 'member' end and (coalesce(display_name,'') ilike '%'||left(coalesce(p_search,''),100)||'%' or coalesce(handle,'') ilike '%'||left(coalesce(p_search,''),100)||'%') order by display_name,id limit 50 offset greatest(0,least(coalesce(p_page,0),100000))*50)p),'[]'),
 'duplicate_matches',coalesce((select jsonb_agg(to_jsonb(m)) from (select display_name,handle,role from public.profiles where trim(coalesce(p_search,''))<>'' and (display_name ilike '%'||trim(leading '@' from trim(left(p_search,100)))||'%' or handle ilike '%'||trim(leading '@' from trim(left(p_search,100)))||'%') order by display_name limit 20)m),'[]'),'candidate_total',(select count(*) from public.profiles where role::text=case when p_role='guest' then 'guest' else 'member' end and (coalesce(display_name,'') ilike '%'||left(coalesce(p_search,''),100)||'%' or coalesce(handle,'') ilike '%'||left(coalesce(p_search,''),100)||'%')));
 end if;
 return answer;
end $$;
revoke all on function private.membership_review_snapshot(uuid,text,text,int) from public,anon;
grant execute on function private.membership_review_snapshot(uuid,text,text,int) to authenticated;
create function public.membership_review_snapshot(p_period uuid default null,p_search text default '',p_role text default 'member',p_page int default 0) returns jsonb language sql security invoker set search_path='' as $$select private.membership_review_snapshot(p_period,p_search,p_role,p_page)$$;
revoke all on function public.membership_review_snapshot(uuid,text,text,int) from public,anon;
grant execute on function public.membership_review_snapshot(uuid,text,text,int) to authenticated;

-- Draft-only privacy additions. Published documents and their versions stay intact.
update public.privacy_documents set draft_body=draft_body||E'\n\nÜyelik değerlendirmeleri\nDönem kapsamındaki hesap/rumuz, iletişim ve kardeşlik bağına ilişkin somut gözlemler, aidiyet ve üyelik iradesi, değerlendirme gerekçeleri, sınırlı görüşme kayıtları ve kararlar üyelik ilişkisinin incelenmesi için işlenir. Web hesabı olmayan mensuplar ad/rumuz ile dosyaya eklenebilir; gereksiz özel hayat bilgileri kaydedilmez. Değerlendiriciler kendi kayıtlarını; görüşme görevlileri kendi görevlerini; gizli okuma yetkisi ayrıca verilen kadro yalnız bu yetki kapsamında kayıtları görür. Yönetim erişimine yalnız Liderin ayrıca açtığı sınırlı karar metni çıkar. Otomatik puanlama, üyelik/rütbe değişikliği veya disiplin yaptırımı üretilmez. Bu kayıtlar için hukuki sebep ve mevcut sağlayıcıların aktarım şartları yayım öncesi ayrıca değerlendirilir. Başvuru ve düzeltme/silme talepleri mevcut Gizlilik başvuru kanalından iletilir.',draft_revision=draft_revision+1,updated_at=now()
where slug='aydinlatma';
update public.privacy_documents set draft_body=draft_body||E'\n\nÜyelik değerlendirmeleri\nTamamlanan ve iptal edilen dönemlerde kişiyi belirleyen alanlar ve öznel değerlendirme/görüşme metinleri, kurum tarihçesi gerekçesiyle sınırsız saklanmaz. Varsayılan saklama inceleme eşiği kapanıştan itibaren 24 aydır; Lider bunu saklama ayarlarında değiştirir. Bu süre kendiliğinden silme veya uygunluk kararı değildir. Süre dolunca mevcut amaç, yükümlülükler, başvurular ve uyuşmazlık gereksinimi insan tarafından incelenir. Gerekçeli ve süreli bekletme konulabilir. Açık onayla kimlik bağlantıları ve öznel metinler kaldırılır; dönem numarası, süreç adımları ve asgari kurumsal sonuç kayıtları korunur. Yeni dış sağlayıcı veya takip aracı eklenmez.',draft_revision=draft_revision+1,updated_at=now()
where slug='saklama';
update public.privacy_settings set retention_rules=jsonb_build_object('reviews_months',24)||retention_rules where singleton;
alter table private.membership_review_periods add column hold_until timestamptz,add column redacted_at timestamptz;
create function private.membership_review_privacy_ready() returns boolean language sql stable security definer set search_path='' as $$
 select count(*)=2 from public.privacy_documents d join public.privacy_document_versions v on v.slug=d.slug and v.revision=d.published_revision where d.slug in ('aydinlatma','saklama') and v.body ilike '%Üyelik değerlendirmeleri%';
$$;
revoke all on function private.membership_review_privacy_ready() from public,anon,authenticated;
create function private.membership_review_privacy_export() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'not_authorized';end if;
 return jsonb_build_object('scope','Kendi dosya kimliğiniz ve kendi yazdığınız değerlendirmeler. Başkalarının görüşleri ve gizli görüşme içerikleri için Gizlilik başvurusu kullanın.',
 'subjects',coalesce((select jsonb_agg(jsonb_build_object('period_id',period_id,'display_name',display_name,'role_snapshot',role_snapshot)) from private.membership_review_subjects where user_id=auth.uid()),'[]'),
 'authored',coalesce((select jsonb_agg(to_jsonb(e)) from private.membership_review_evaluations e where author_id=auth.uid()),'[]'));
end $$;
revoke all on function private.membership_review_privacy_export() from public,anon;
grant execute on function private.membership_review_privacy_export() to authenticated;
create function public.membership_review_privacy_export() returns jsonb language sql security invoker set search_path='' as $$select private.membership_review_privacy_export()$$;
revoke all on function public.membership_review_privacy_export() from public,anon;
grant execute on function public.membership_review_privacy_export() to authenticated;
create function private.membership_review_retention(p_action text,p_period uuid,p_until timestamptz,p_reason text,p_confirm boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare r private.membership_review_periods;months int;lead boolean;
begin
 if not private.privacy_authorized('requests') then raise exception 'not_authorized';end if;
 lead=exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended);
 select coalesce((retention_rules->>'reviews_months')::int,24) into months from public.privacy_settings where singleton;
 if p_action='list' then return jsonb_build_object('months',months,'periods',coalesce((select jsonb_agg(jsonb_build_object('id',id,'label',year||'/'||trim(to_char(sequence,'RN')),'closed_at',closed_at,'hold_until',hold_until,'due',closed_at+make_interval(months=>months)<=now(),'redacted',redacted_at is not null)) from private.membership_review_periods where closed_at is not null),'[]'));end if;
 if not lead or not coalesce(p_confirm,false) or char_length(trim(coalesce(p_reason,'')))<10 then raise exception 'not_authorized';end if;
 select * into r from private.membership_review_periods where id=p_period for update;
 if r.closed_at is null then raise exception 'review_not_closed';end if;
 if p_action='hold' then
  if p_until is null or p_until<=now() or p_until>now()+interval '1 year' then raise exception 'invalid_hold';end if;
  update private.membership_review_periods set hold_until=p_until where id=p_period;
 elsif p_action='redact' then
  if not private.membership_review_privacy_ready() or r.closed_at+make_interval(months=>months)>now() or r.hold_until>now() or r.redacted_at is not null then raise exception 'review_retention_not_due';end if;
  update private.membership_review_evaluations set author_id=null,communication='unknown',bond='unknown',belonging='unknown',participation='unknown',intent='unknown',category='unknown',interview_needed=false,rationale='',submitted=false where period_id=p_period;
  update private.membership_review_interviews set assigned_to=null,contact_log='',explanation_offered=false,member_response='',summary='' where period_id=p_period;
  update private.membership_review_decisions set reason='Saklama incelemesiyle metin kaldırıldı.',shared_text='Saklama incelemesiyle metin kaldırıldı.' where period_id=p_period;
  update private.membership_review_releases set display_name='Kimliği kaldırılan kişi',body='Saklama incelemesiyle metin kaldırıldı.' where period_id=p_period;
  update private.membership_review_subjects set user_id=null,display_name='Kimliği kaldırılan kişi',handle=null where period_id=p_period;
  update private.membership_review_audit set reason=null where period_id=p_period;
  update private.membership_review_periods set redacted_at=now() where id=p_period;
 else raise exception 'invalid_action';end if;
 insert into private.membership_review_audit(period_id,actor_id,action,reason) values(p_period,auth.uid(),'privacy_'||p_action,trim(p_reason));
 return jsonb_build_object('ok',true);
end $$;
revoke all on function private.membership_review_retention(text,uuid,timestamptz,text,boolean) from public,anon;
grant execute on function private.membership_review_retention(text,uuid,timestamptz,text,boolean) to authenticated;
create function public.membership_review_retention(p_action text default 'list',p_period uuid default null,p_until timestamptz default null,p_reason text default '',p_confirm boolean default false) returns jsonb language sql security invoker set search_path='' as $$select private.membership_review_retention(p_action,p_period,p_until,p_reason,p_confirm)$$;
revoke all on function public.membership_review_retention(text,uuid,timestamptz,text,boolean) from public,anon;
grant execute on function public.membership_review_retention(text,uuid,timestamptz,text,boolean) to authenticated;

create or replace function public.save_privacy_settings(emails text[],rules jsonb,reason text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended) then raise exception 'not_authorized';end if;
 if cardinality(emails) not between 1 and 10 or exists(select 1 from unnest(emails) e where e is null or e!~ '^[^[:space:]@<>]+@[^[:space:]@<>]+\.[^[:space:]@<>]+$') or char_length(trim(reason)) not between 10 and 2000 then raise exception 'invalid_settings';end if;
 if rules is null or jsonb_typeof(rules)<>'object' or not (rules ?& array['security_logs_days','notifications_days','aster_days','unused_media_days','requests_years','destruction_audit_years','review_interval_days']) then raise exception 'invalid_retention';end if;
 if exists(select 1 from jsonb_each(rules) e where jsonb_typeof(e.value)<>'number' or e.value::text !~ '^[0-9]+$') then raise exception 'invalid_retention';end if;
 if (rules->>'security_logs_days')::int not between 1 and 365 or (rules->>'notifications_days')::int not between 1 and 365 or (rules->>'aster_days')::int not between 1 and 365 or (rules->>'unused_media_days')::int not between 1 and 90 or (rules->>'requests_years')::int not between 1 and 10 or (rules->>'destruction_audit_years')::int not between 3 and 10 or (rules->>'review_interval_days')::int not between 1 and 180 then raise exception 'invalid_retention';end if;
 if coalesce((rules->>'reviews_months')::int,24) not between 1 and 120 then raise exception 'invalid_retention';end if;
 rules:=jsonb_build_object('reviews_months',coalesce((select retention_rules->'reviews_months' from public.privacy_settings where singleton),'24'::jsonb))||rules;
 update public.privacy_settings set contact_emails=emails,retention_rules=rules,updated_at=now() where singleton;
 insert into public.privacy_governance_events(actor_id,kind,subject,detail) values(auth.uid(),'settings_updated','privacy',jsonb_build_object('reason',trim(reason),'rules',rules,'emails',emails));
end $$;

alter function private.privacy_retention_snapshot() rename to privacy_retention_snapshot_before_reviews;
revoke all on function private.privacy_retention_snapshot_before_reviews() from public,anon,authenticated;
create function private.privacy_retention_snapshot() returns jsonb language sql stable security definer set search_path='' as $$
 select private.privacy_retention_snapshot_before_reviews()||jsonb_build_object('membership_reviews',(select count(*) from private.membership_review_periods r where closed_at is not null and redacted_at is null and (hold_until is null or hold_until<=now()) and closed_at+make_interval(months=>coalesce((select (retention_rules->>'reviews_months')::int from public.privacy_settings where singleton),24))<=now()));
$$;
revoke all on function private.privacy_retention_snapshot() from public,anon,authenticated;
