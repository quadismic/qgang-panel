-- Phase 1: compatible with the currently deployed application.
alter table public.profile_private alter column birth_date drop not null;
create or replace function public.get_profile_birthday(target_user uuid)
returns table(birthday_day smallint,birthday_month smallint,birthday_year smallint,birthday_visibility text)
language sql stable security definer set search_path='' as $$
 select case when p.id=auth.uid() or p.birthday_visibility in ('day_month','full') then coalesce(p.birthday_day,extract(day from pp.birth_date)::smallint) end,
 case when p.id=auth.uid() or p.birthday_visibility in ('day_month','full') then coalesce(p.birthday_month,extract(month from pp.birth_date)::smallint) end,
 case when p.id=auth.uid() or p.birthday_visibility='full' then coalesce(p.birthday_year,extract(year from pp.birth_date)::smallint) end,
 p.birthday_visibility
 from public.profiles p left join public.profile_private pp on pp.user_id=p.id
 where auth.uid() is not null and exists(select 1 from public.profiles caller where caller.id=auth.uid() and not caller.is_suspended) and p.id=target_user and (not p.is_suspended or p.id=auth.uid());
$$;
revoke all on function public.get_profile_birthday(uuid) from public,anon;
grant execute on function public.get_profile_birthday(uuid) to authenticated;

create or replace function private.sync_profile_birth_date()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.birthday_day is not null and new.birthday_month is not null and new.birthday_year is not null then
  insert into public.profile_private(user_id,birth_date,updated_at)
  values(new.id,make_date(new.birthday_year,new.birthday_month,new.birthday_day),now())
  on conflict(user_id) do update set birth_date=excluded.birth_date,updated_at=excluded.updated_at;
 else
  update public.profile_private set birth_date=null,updated_at=now() where user_id=new.id;
 end if;
 return new;
end $$;
revoke all on function private.sync_profile_birth_date() from public,anon,authenticated;
create trigger sync_profile_birth_date after update of birthday_day,birthday_month,birthday_year on public.profiles
for each row execute function private.sync_profile_birth_date();

create table public.privacy_requests(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id),
 kind text not null check(kind in ('access','correction','closure','erasure')),
 detail text not null check(char_length(detail) between 10 and 3000),
 status text not null default 'pending' check(status in ('pending','reviewing','resolved','rejected')),
 response text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 due_at timestamptz not null default now()+interval '30 days'
);
create index privacy_requests_owner_date on public.privacy_requests(user_id,created_at desc);
alter table public.privacy_requests enable row level security;
revoke all on public.privacy_requests from public,anon,authenticated;
grant select on public.privacy_requests to authenticated;
create policy privacy_request_read on public.privacy_requests for select to authenticated
using(user_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='founder' and not is_suspended));
create table public.privacy_request_events(
 id uuid primary key default gen_random_uuid(),request_id uuid not null references public.privacy_requests(id),
 actor_id uuid not null references public.profiles(id),status text not null,response text,created_at timestamptz not null default now()
);
alter table public.privacy_request_events enable row level security;
revoke all on public.privacy_request_events from public,anon,authenticated;
grant select on public.privacy_request_events to authenticated;
create policy privacy_event_read on public.privacy_request_events for select to authenticated
using(exists(select 1 from public.privacy_requests r where r.id=request_id));
create or replace function public.submit_privacy_request(request_kind text,request_detail text)
returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result uuid;
begin
 if uid is null or not exists(select 1 from public.profiles where id=uid and not is_suspended) then raise exception 'not_authorized'; end if;
 if request_kind not in ('access','correction','closure','erasure') or char_length(trim(request_detail)) not between 10 and 3000 then raise exception 'invalid_request'; end if;
 -- Serialize submissions by the same owner, preventing concurrent quota bypass.
 perform 1 from public.profiles where id=uid for update;
 if exists(select 1 from public.privacy_requests where user_id=uid and kind=request_kind and status in ('pending','reviewing')) then raise exception 'request_already_open'; end if;
 if (select count(*) from public.privacy_requests where user_id=uid and created_at>now()-interval '1 day')>=5 then raise exception 'request_limit'; end if;
 insert into public.privacy_requests(user_id,kind,detail) values(uid,request_kind,trim(request_detail)) returning id into result;
 insert into public.privacy_request_events(request_id,actor_id,status) values(result,uid,'pending');
 return result;
end $$;
create or replace function public.review_privacy_request(request_id uuid,next_status text,decision text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended) then raise exception 'not_authorized'; end if;
 if next_status not in ('reviewing','resolved','rejected') or char_length(trim(decision)) not between 10 and 3000 then raise exception 'invalid_decision'; end if;
 perform 1 from public.privacy_requests r where r.id=request_id and r.status in ('pending','reviewing') for update;
 if not found then raise exception 'request_not_open'; end if;
 update public.privacy_requests r set status=next_status,response=trim(decision),updated_at=now() where r.id=request_id;
 insert into public.privacy_request_events(request_id,actor_id,status,response) values(request_id,auth.uid(),next_status,trim(decision));
end $$;
revoke all on function public.submit_privacy_request(text,text), public.review_privacy_request(uuid,text,text) from public,anon;
grant execute on function public.submit_privacy_request(text,text), public.review_privacy_request(uuid,text,text) to authenticated;
CREATE OR REPLACE FUNCTION public.list_today_community_birthdays()
 RETURNS TABLE(id uuid, display_name text, handle text, avatar_url text, birthday_day smallint, birthday_month smallint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare today date := (now() at time zone 'Europe/Istanbul')::date;
begin
 if auth.uid() is null or not exists(select 1 from public.community_memberships x where x.user_id=auth.uid() and x.status='active') then return; end if;
 return query select p.id,p.display_name,p.handle,p.avatar_url,extract(day from pp.birth_date)::smallint,extract(month from pp.birth_date)::smallint
 from public.profiles p join public.community_memberships cm on cm.user_id=p.id and cm.status='active' join public.profile_private pp on pp.user_id=p.id
 where not p.is_suspended and p.birthday_visibility in ('day_month','full') and p.role<>'guest' and extract(month from pp.birth_date)=extract(month from today) and extract(day from pp.birth_date)=extract(day from today)
 order by p.display_name;
end$function$
;
revoke all on function public.list_today_community_birthdays() from public,anon;
grant execute on function public.list_today_community_birthdays() to authenticated;

CREATE OR REPLACE FUNCTION public.list_upcoming_member_birthdays()
 RETURNS TABLE(id uuid, display_name text, handle text, avatar_url text, birthday_day smallint, birthday_month smallint, days_until integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'private', 'pg_temp'
AS $function$
declare today date := (now() at time zone 'Europe/Istanbul')::date;
begin
 if auth.uid() is null or not private.has_permission('members.view') then raise exception 'not authorized'; end if;
 return query
 with b as (
  select p.id,p.display_name,p.handle,p.avatar_url,extract(day from pp.birth_date)::int bd,extract(month from pp.birth_date)::int bm
  from public.profiles p join public.community_memberships cm on cm.user_id=p.id and cm.status='active' join public.profile_private pp on pp.user_id=p.id
  where not p.is_suspended and p.birthday_visibility in ('day_month','full') and p.role<>'guest'
 ), n as (
  select b.*,case when (make_date(extract(year from today)::int,bm,1)+(least(bd,extract(day from (make_date(extract(year from today)::int,bm,1)+interval '1 month - 1 day'))::int)-1))>=today then (make_date(extract(year from today)::int,bm,1)+(least(bd,extract(day from (make_date(extract(year from today)::int,bm,1)+interval '1 month - 1 day'))::int)-1)) else (make_date(extract(year from today)::int+1,bm,1)+(least(bd,extract(day from (make_date(extract(year from today)::int+1,bm,1)+interval '1 month - 1 day'))::int)-1)) end next_date from b
 )
 select n.id,n.display_name,n.handle,n.avatar_url,n.bd::smallint,n.bm::smallint,(n.next_date-today)::int
 from n where n.next_date between today and today+7 order by n.next_date,n.display_name;
end$function$
;
revoke all on function public.list_upcoming_member_birthdays() from public,anon;
grant execute on function public.list_upcoming_member_birthdays() to authenticated;
