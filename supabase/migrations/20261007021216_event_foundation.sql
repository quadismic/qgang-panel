-- Community-only events. No points, sanctions or public participant disclosure.
create table public.event_types (
 id text primary key, name text not null check(length(name) between 1 and 80),
 description text not null default '', sort_order integer not null, active boolean not null default true
);
insert into public.event_types values
 ('gang-up','GANG-UP','Fiziksel buluşma ve bir araya gelme etkinliği.',1,true),
 ('op-night','OP-NIGHT','Oyun veya aktivite gecesi.',2,true),
 ('bbq-gang','BBQ-GANG','Özel mangal etkinliği.',3,true),
 ('q-nity','Q-NITY','Özel tatil etkinliği.',4,true);
create table public.community_events (
 id uuid primary key default gen_random_uuid(), type_id text references public.event_types(id), legacy_type text check(length(legacy_type)<=80),
 title text not null check(length(title) between 1 and 180), description text not null default '' check(length(description)<=10000),
 starts_at timestamptz not null, ends_at timestamptz not null, time_zone text not null default 'Europe/Istanbul' check(time_zone='Europe/Istanbul'),
 date_only boolean not null default false, location text not null default '' check(length(location)<=500),
 cover_url text, capacity integer check(capacity>0 and capacity<=10000),
 organizer_id uuid references public.profiles(id) on delete set null,
 created_by uuid references public.profiles(id) on delete set null,
 status text not null default 'draft' check(status in ('draft','published','completed','cancelled')),
 source_id text unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(ends_at>=starts_at), check(type_id is not null or (source_id is not null and legacy_type is not null))
);
create index community_events_schedule on public.community_events(status,starts_at,id);
create table public.event_proposals (
 id uuid primary key default gen_random_uuid(), author_id uuid references public.profiles(id) on delete set null,
 type_id text not null references public.event_types(id), title text not null check(length(title) between 1 and 180),
 description text not null check(length(description) between 1 and 10000),
 status text not null default 'pending' check(status in ('pending','accepted','declined')),
 event_id uuid references public.community_events(id), created_at timestamptz not null default now()
);
create table public.event_responses (
 event_id uuid not null references public.community_events(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 response text not null check(response in ('going','maybe','not_going')),
 queue_at timestamptz not null default now(), primary key(event_id,user_id)
);
create index event_responses_queue on public.event_responses(event_id,response,queue_at,user_id);
create table public.event_attendance (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.community_events(id) on delete cascade,
 user_id uuid references public.profiles(id) on delete set null,
 historical_name text check(length(historical_name) between 1 and 180),
 attended boolean, evidence text not null default 'manual' check(evidence in ('manual','legacy_rollcall','legacy_roster_pending')), verified_by uuid references public.profiles(id) on delete set null,
 verified_at timestamptz not null default now(), source_key text unique,
 check(user_id is not null or historical_name is not null), unique(event_id,user_id)
);
create index event_attendance_member on public.event_attendance(user_id,event_id) where attended;
create function private.event_access(p_permission text) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and private.has_permission(p_permission) and (
 exists(select 1 from public.community_memberships where user_id=auth.uid() and status='active') or
 exists(select 1 from public.profiles where id=auth.uid() and role in ('founder','admin')))
$$;
revoke all on function private.event_access(text) from public;
grant execute on function private.event_access(text) to authenticated;
alter table public.event_types enable row level security;
revoke all on public.event_types from anon,authenticated;
grant select,insert,update on public.event_types to authenticated;
alter table public.community_events enable row level security;
revoke all on public.community_events from anon,authenticated;
grant select,insert,update on public.community_events to authenticated;
alter table public.event_proposals enable row level security;
revoke all on public.event_proposals from anon,authenticated;
grant select,insert,update on public.event_proposals to authenticated;
alter table public.event_responses enable row level security;
revoke all on public.event_responses from anon,authenticated;
grant select,insert,update on public.event_responses to authenticated;
alter table public.event_attendance enable row level security;
revoke all on public.event_attendance from anon,authenticated;
grant select,insert,update on public.event_attendance to authenticated;

create policy event_types_read on public.event_types for select to authenticated using ((select private.event_access('events.view')));
create policy event_types_insert on public.event_types for insert to authenticated with check ((select private.event_access('events.settings')));
create policy event_types_update on public.event_types for update to authenticated using ((select private.event_access('events.settings'))) with check ((select private.event_access('events.settings')));
create policy events_read on public.community_events for select to authenticated using (
 (select private.event_access('events.view')) and (status<>'draft' or (select private.event_access('events.manage'))));
create policy events_insert on public.community_events for insert to authenticated with check (
 (select private.event_access('events.manage')) and created_by=(select auth.uid()) and status='draft' and source_id is null and type_id is not null and legacy_type is null);
create policy events_update on public.community_events for update to authenticated using ((select private.event_access('events.manage'))) with check ((select private.event_access('events.manage')));
create function private.guard_event_update() returns trigger language plpgsql set search_path='' as $$
begin
 if new.legacy_type is distinct from old.legacy_type then raise exception 'event_identity_locked'; end if;
 if new.source_id is distinct from old.source_id or new.created_by is distinct from old.created_by then raise exception 'event_identity_locked'; end if;
 if new.status is distinct from old.status and not private.event_access('events.publish') then raise exception 'event_publish_forbidden'; end if;
 if new.status='completed' and new.ends_at>now() then raise exception 'event_not_finished'; end if;
 new.updated_at:=now(); return new;
end$$;
create trigger guard_event_update before update on public.community_events for each row execute function private.guard_event_update();
create policy proposals_read on public.event_proposals for select to authenticated using ((select private.event_access('events.view')) and (author_id=(select auth.uid()) or (select private.event_access('events.manage'))));
create policy proposals_insert on public.event_proposals for insert to authenticated with check ((select private.event_access('events.propose')) and author_id=(select auth.uid()) and status='pending' and event_id is null);
create policy proposals_update on public.event_proposals for update to authenticated using ((select private.event_access('events.manage'))) with check ((select private.event_access('events.manage')));
create policy responses_read on public.event_responses for select to authenticated using ((select private.event_access('events.view')) and (user_id=(select auth.uid()) or (select private.event_access('events.manage'))) and exists(select 1 from public.community_events e where e.id=event_id));
create policy responses_insert on public.event_responses for insert to authenticated with check ((select private.event_access('events.view')) and user_id=(select auth.uid()) and exists(select 1 from public.community_events e where e.id=event_id and e.status='published' and e.starts_at>now()));
create policy responses_update on public.event_responses for update to authenticated using ((select private.event_access('events.view')) and user_id=(select auth.uid())) with check ((select private.event_access('events.view')) and user_id=(select auth.uid()) and exists(select 1 from public.community_events e where e.id=event_id and e.status='published' and e.starts_at>now()));
create policy attendance_read on public.event_attendance for select to authenticated using ((select private.event_access('events.view')) and exists(select 1 from public.community_events e where e.id=event_id and ((e.status='completed' and attended is true) or (select private.event_access('events.attendance')) or (select private.event_access('events.archive')))));
create policy attendance_insert on public.event_attendance for insert to authenticated with check ((select private.event_access('events.attendance')) and verified_by=(select auth.uid()) and exists(select 1 from public.community_events e where e.id=event_id and e.starts_at<=now() and e.status in ('published','completed')));
create policy attendance_update on public.event_attendance for update to authenticated using ((select private.event_access('events.attendance'))) with check ((select private.event_access('events.attendance')) and verified_by=(select auth.uid()) and exists(select 1 from public.community_events e where e.id=event_id and e.starts_at<=now() and e.status in ('published','completed')));
insert into public.role_permissions(role,permission,enabled)
select r::public.qgang_role,p,case when r in ('founder','admin') then true when r='moderator' then p not in ('events.archive','events.settings') when r in ('creator','member') then p in ('events.view','events.propose') else false end
from unnest(array['founder','admin','moderator','creator','member','guest']) r
cross join unnest(array['events.view','events.propose','events.manage','events.publish','events.attendance','events.archive','events.settings']) p
on conflict(role,permission) do nothing;
create or replace function public.set_role_permission(p_role text,p_permission text,p_enabled boolean)
returns void language plpgsql security definer set search_path='public','private' as $$
declare v_uid uuid:=auth.uid(); v_actor public.qgang_role;
begin
 select role into v_actor from public.profiles where id=v_uid;
 if v_actor is distinct from 'founder'::public.qgang_role then raise exception 'founder_only'; end if;
 if p_role='founder' then raise exception 'founder_locked'; end if;
 if p_role not in ('admin','moderator','creator','member','guest') then raise exception 'invalid_role'; end if;
 if p_permission not in ('members.view','members.manage','members.delete','discipline.view','discipline.issue','discipline.review','announcements.publish','announcements.delete','budget.view','budget.manage','budget.delete','design.manage','access.manage','publications.view','publications.write','publications.publish','publications.delete','events.view','events.propose','events.manage','events.publish','events.attendance','events.archive','events.settings') then raise exception 'invalid_permission'; end if;
 if p_permission='access.manage' and p_enabled then raise exception 'access_manage_founder_only'; end if;
 insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,p_permission,p_enabled,v_uid,now()) on conflict(role,permission) do update set enabled=excluded.enabled,updated_by=v_uid,updated_at=now();
 if p_enabled and p_permission='members.manage' then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'members.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission in ('discipline.issue','discipline.review') then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'discipline.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission in ('budget.manage','budget.delete') then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'budget.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission in ('publications.write','publications.publish','publications.delete') then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'publications.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission='publications.publish' then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'publications.write',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if not p_enabled and p_permission='members.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission='members.manage'; end if;
 if not p_enabled and p_permission='discipline.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission in ('discipline.issue','discipline.review'); end if;
 if not p_enabled and p_permission='budget.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission in ('budget.manage','budget.delete'); end if;
 if not p_enabled and p_permission='publications.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission in ('publications.write','publications.publish','publications.delete'); end if;
 if not p_enabled and p_permission='publications.write' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission='publications.publish'; end if;
 if p_enabled and p_permission in ('events.propose','events.manage','events.publish','events.attendance','events.archive','events.settings') then
 insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'events.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if not p_enabled and p_permission='events.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission like 'events.%'; end if;
end$$;

-- RSVP order is owned by the database. Clients cannot forge queue timestamps.
revoke insert,update on public.event_responses from authenticated;
create function public.respond_to_event(p_event uuid,p_response text) returns void language plpgsql security definer set search_path='' as $$
declare e public.community_events%rowtype;
begin
 if not private.event_access('events.view') then raise exception 'event_forbidden'; end if;
 if p_response not in ('going','maybe','not_going') or p_response is null then raise exception 'invalid_response'; end if;
 select * into e from public.community_events where id=p_event for update;
 if not found or e.status<>'published' or e.starts_at<=now() then raise exception 'event_response_closed'; end if;
 insert into public.event_responses(event_id,user_id,response) values(p_event,auth.uid(),p_response)
 on conflict(event_id,user_id) do update set response=excluded.response,queue_at=case when public.event_responses.response='going' and excluded.response='going' then public.event_responses.queue_at else now() end;
end$$;
revoke all on function public.respond_to_event(uuid,text) from public,anon;
grant execute on function public.respond_to_event(uuid,text) to authenticated;
-- Aggregates and own waitlist position, without exposing other RSVP identities.
create function public.event_response_summary(p_event uuid) returns table(going bigint,waiting bigint,my_waiting boolean) language plpgsql stable security definer set search_path='' as $$
declare cap integer; own_position bigint;
begin
 if not private.event_access('events.view') or not exists(select 1 from public.community_events where id=p_event and status<>'draft') then raise exception 'event_forbidden'; end if;
 select capacity into cap from public.community_events where id=p_event;
 select position into own_position from (select user_id,row_number() over(order by queue_at,user_id) position from public.event_responses where event_id=p_event and response='going') q where q.user_id=auth.uid();
 return query select case when cap is null then count(*) else least(count(*),cap::bigint) end,case when cap is null then 0::bigint else greatest(count(*)-cap,0::bigint) end,coalesce(cap is not null and own_position>cap,false) from public.event_responses where event_id=p_event and response='going';
end$$;
revoke all on function public.event_response_summary(uuid) from public,anon;
grant execute on function public.event_response_summary(uuid) to authenticated;
create function public.list_profile_event_activity(p_user uuid) returns table(id uuid,title text,starts_at timestamptz) language sql stable security definer set search_path='' as $$
 select e.id,e.title,e.starts_at from public.community_events e join public.event_attendance a on a.event_id=e.id
 where private.event_access('events.view') and a.user_id=p_user and a.attended and e.status='completed'
 order by e.starts_at desc,e.id desc limit 20
$$;
revoke all on function public.list_profile_event_activity(uuid) from public,anon;
grant execute on function public.list_profile_event_activity(uuid) to authenticated;
create function public.event_import_candidates() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not private.event_access('events.archive') then raise exception 'event_archive_forbidden'; end if;
 return jsonb_build_object('profiles',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'handle',handle,'display_name',display_name)),'[]'::jsonb) from public.profiles),
 'links',(select coalesce(jsonb_agg(jsonb_build_object('name',legacy_nickname,'user_id',claimed_by)),'[]'::jsonb) from public.legacy_members where claimed_by is not null));
end$$;
revoke all on function public.event_import_candidates() from public,anon;
grant execute on function public.event_import_candidates() to authenticated;
create function public.import_event_archive(p_rows jsonb,p_confirm boolean) returns integer language plpgsql security definer set search_path='' as $$
declare row jsonb; person jsonb; event_id uuid; target uuid; inserted integer:=0; event_date date; source text;
begin
 if not private.event_access('events.archive') or p_confirm is distinct from true then raise exception 'event_archive_forbidden'; end if;
 if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)>100 then raise exception 'invalid_import'; end if;
 for row in select value from jsonb_array_elements(p_rows) loop
  if length(row->>'source_id') not between 1 and 100 or (row->>'source_id') !~ '^[a-zA-Z0-9_-]+$' then raise exception 'invalid_source'; end if;
  event_date:=(row->>'date')::date;if event_date is null or event_date>(now() at time zone 'Europe/Istanbul')::date then raise exception 'invalid_event_date'; end if;
  if row->>'type_id' is not null and not exists(select 1 from public.event_types where id=row->>'type_id') then raise exception 'invalid_type'; end if;
  source:='wix:f089fb58-cd44-4034-a494-904fd9df2a18:QEvents:'||(row->>'source_id');
  insert into public.community_events(type_id,legacy_type,title,starts_at,ends_at,date_only,status,source_id,created_by)
  values(row->>'type_id',row->>'legacy_type',coalesce(row->>'legacy_type',(select name from public.event_types where id=row->>'type_id'))||' · '||event_date::text,
  event_date::timestamp at time zone 'Europe/Istanbul',event_date::timestamp at time zone 'Europe/Istanbul',true,'completed',source,auth.uid())
  on conflict(source_id) do nothing returning id into event_id;
  if event_id is null then continue; end if;
  inserted:=inserted+1;
  if jsonb_typeof(row->'participants')<>'array' or jsonb_array_length(row->'participants')>500 then raise exception 'invalid_participants'; end if;
  for person in select value from jsonb_array_elements(row->'participants') loop
   target:=nullif(person->>'user_id','')::uuid;
   -- Only an existing, previously verified legacy identity link can be preassigned.
   if target is not null and not exists(select 1 from public.legacy_members where claimed_by=target and lower(trim(legacy_nickname))=lower(trim(person->>'name'))) then raise exception 'unverified_identity'; end if;
   insert into public.event_attendance(event_id,user_id,historical_name,attended,evidence,verified_by,source_key)
   values(event_id,target,person->>'name',(person->>'attended')::boolean,case when person->>'attended' is null then 'legacy_roster_pending' else 'legacy_rollcall' end,auth.uid(),source||':'||lower(trim(person->>'name')));
  end loop;
 end loop;
 return inserted;
end$$;
revoke all on function public.import_event_archive(jsonb,boolean) from public,anon;
grant execute on function public.import_event_archive(jsonb,boolean) to authenticated;
create function public.link_event_historical_member(p_attendance uuid,p_user uuid,p_confirm boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.event_access('events.archive') or p_confirm is distinct from true then raise exception 'event_archive_forbidden'; end if;
 if not exists(select 1 from public.profiles where id=p_user) then raise exception 'event_member_missing'; end if;
 update public.event_attendance set user_id=p_user where id=p_attendance and historical_name is not null;
 if not found then raise exception 'historical_participant_missing'; end if;
end$$;
revoke all on function public.link_event_historical_member(uuid,uuid,boolean) from public,anon;
grant execute on function public.link_event_historical_member(uuid,uuid,boolean) to authenticated;
-- Subject access remains available even after event visibility or membership is withdrawn.
create function public.export_own_event_data() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'authentication_required'; end if;
 return jsonb_build_object(
 'responses',(select coalesce(jsonb_agg(jsonb_build_object('event_id',r.event_id,'title',e.title,'response',r.response,'queue_at',r.queue_at)),'[]'::jsonb) from public.event_responses r join public.community_events e on e.id=r.event_id where r.user_id=uid),
 'attendance',(select coalesce(jsonb_agg(jsonb_build_object('event_id',a.event_id,'title',e.title,'event_date',e.starts_at,'historical_name',a.historical_name,'attended',a.attended,'evidence',a.evidence,'verified_at',a.verified_at)),'[]'::jsonb) from public.event_attendance a join public.community_events e on e.id=a.event_id where a.user_id=uid),
 'proposals',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'description',description,'status',status,'created_at',created_at)),'[]'::jsonb) from public.event_proposals where author_id=uid),
 'organized_events',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'description',description,'starts_at',starts_at,'ends_at',ends_at,'location',location,'status',status)),'[]'::jsonb) from public.community_events where organizer_id=uid or created_by=uid));
end$$;
revoke all on function public.export_own_event_data() from public,anon;
grant execute on function public.export_own_event_data() to authenticated;
create table private.event_audit(id bigint generated always as identity primary key,actor_id uuid,table_name text not null,record_id text not null,operation text not null,changed_fields text[],created_at timestamptz not null default now());
revoke all on private.event_audit from public,anon,authenticated;
create function private.audit_event_change() returns trigger language plpgsql security definer set search_path='' as $$
declare fields text[];old_row jsonb;new_row jsonb;
begin
 old_row:=case when tg_op='INSERT' then '{}'::jsonb else to_jsonb(old) end;new_row:=to_jsonb(new);
 select array_agg(key order by key) into fields from jsonb_each(new_row) where value is distinct from old_row->key;
 insert into private.event_audit(actor_id,table_name,record_id,operation,changed_fields) values(case when exists(select 1 from public.profiles where id=auth.uid()) then auth.uid() else null end,tg_table_name,coalesce(new_row->>'id',(new_row->>'event_id')||':'||(new_row->>'user_id')),tg_op,fields);
 return new;
end$$;
create trigger event_audit after insert or update on public.community_events for each row execute function private.audit_event_change();
create trigger attendance_audit after insert or update on public.event_attendance for each row execute function private.audit_event_change();
create trigger proposal_audit after insert or update on public.event_proposals for each row execute function private.audit_event_change();
create function private.anonymize_event_member() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.event_attendance set historical_name='Anonim katılımcı',source_key=case when source_key is null then null else 'anonymized:'||id::text end,user_id=null where user_id=old.id;
 update private.event_audit set actor_id=null where actor_id=old.id;
 return old;
end$$;
create trigger anonymize_event_member before delete on public.profiles for each row execute function private.anonymize_event_member();
-- Yoklama yetkisi tarihsel kimlikleri veya kaynak kanıtını değiştirmez.
revoke insert,update on public.event_attendance from authenticated;
grant insert(event_id,user_id,attended,verified_by,verified_at),update(attended,verified_by,verified_at) on public.event_attendance to authenticated;
create function public.verify_event_attendance(p_event uuid,p_user uuid,p_attended boolean,p_confirm boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.event_access('events.attendance') or p_confirm is distinct from true then raise exception 'event_attendance_forbidden'; end if;
 if p_attended is null or not exists(select 1 from public.community_events where id=p_event and starts_at<=now() and status in ('published','completed')) then raise exception 'event_attendance_closed'; end if;
 if not exists(select 1 from public.profiles where id=p_user) then raise exception 'event_member_missing'; end if;
 insert into public.event_attendance(event_id,user_id,attended,verified_by,verified_at,evidence)
 values(p_event,p_user,p_attended,auth.uid(),now(),'manual') on conflict(event_id,user_id) do update set attended=excluded.attended,verified_by=excluded.verified_by,verified_at=excluded.verified_at,evidence='manual';
end$$;
revoke all on function public.verify_event_attendance(uuid,uuid,boolean,boolean) from public,anon;
grant execute on function public.verify_event_attendance(uuid,uuid,boolean,boolean) to authenticated;
create function public.create_event_from_proposal(p_proposal uuid,p_details jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare proposal public.event_proposals%rowtype;v_event_id uuid;
begin
 if not private.event_access('events.manage') then raise exception 'event_manage_forbidden'; end if;
 select * into proposal from public.event_proposals where id=p_proposal for update;
 if not found or proposal.status='declined' or proposal.event_id is not null then raise exception 'proposal_unavailable'; end if;
 if not exists(select 1 from public.event_types where id=p_details->>'type_id' and active) then raise exception 'invalid_type'; end if;
 insert into public.community_events(type_id,title,description,starts_at,ends_at,location,capacity,organizer_id,created_by)
 values(p_details->>'type_id',p_details->>'title',p_details->>'description',(p_details->>'starts_at')::timestamptz,(p_details->>'ends_at')::timestamptz,p_details->>'location',(p_details->>'capacity')::integer,(p_details->>'organizer_id')::uuid,auth.uid()) returning id into v_event_id;
 update public.event_proposals set status='accepted',event_id=v_event_id where id=p_proposal;
 return v_event_id;
end$$;
revoke all on function public.create_event_from_proposal(uuid,jsonb) from public,anon;
grant execute on function public.create_event_from_proposal(uuid,jsonb) to authenticated;
revoke all on function public.set_role_permission(text,text,boolean) from public,anon;
grant execute on function public.set_role_permission(text,text,boolean) to authenticated;
