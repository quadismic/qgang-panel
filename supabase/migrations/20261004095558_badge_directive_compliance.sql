-- Badge directive: clients read public summaries; controlled RPCs own all mutations.
create schema if not exists private;
alter table public.badges add column if not exists norm_type text not null default 'discretionary';
update public.badges set norm_type=case when slug='ilk-halka' then 'historical' when slug in ('kidem-nisani','muellif') then 'achievement' when slug='liyakat-nisani' then 'high_honor' else 'discretionary' end;
update public.badges set rule='{"kind":"membership-tenure","days":730}' where slug='kidem-nisani';
update public.badges set rule='{"kind":"admission-window","from":"2026-01-01","until":"2027-01-01","timezone":"Europe/Istanbul"}', description='2026 yılında Q-GANG üyeliğine kabulün tarihsel nişanı.' where slug='ilk-halka';
alter table public.profile_badges drop constraint if exists profile_badges_user_id_badge_id_key;
alter table public.profile_badges add column if not exists granted_role text, add column if not exists correction_evidence text, add column if not exists disposition text, add column if not exists acquisition_evidence jsonb;
create table public.badge_events(id uuid primary key default gen_random_uuid(),award_id uuid not null,user_id uuid not null,badge_id uuid not null,actor_id uuid,actor_role text,event text not null,reason text,evidence text,source_record jsonb,created_at timestamptz not null default now());
alter table public.badge_events enable row level security;
revoke all on public.badge_events from public,anon,authenticated;
grant select on public.badge_events to authenticated;
create policy "badge managers read history" on public.badge_events for select to authenticated using(private.has_permission('members.manage') and exists(select 1 from public.profiles where id=auth.uid() and role in ('founder','admin')));
create table public.membership_periods(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),started_at timestamptz not null,ended_at timestamptz,source text not null,check(ended_at is null or ended_at>=started_at));
create unique index membership_one_open_period on public.membership_periods(user_id) where ended_at is null;
alter table public.membership_periods enable row level security;
revoke all on public.membership_periods from public,anon,authenticated;
grant select on public.membership_periods to authenticated;
create policy "membership period read" on public.membership_periods for select to authenticated using(user_id=auth.uid() or private.has_permission('members.manage'));
-- Earlier uninterrupted time is not assumed. Future intervals start at migration time.
insert into public.membership_periods(user_id,started_at,source) select user_id,now(),'tracking_start' from public.community_memberships where status='active';
do $$declare p record;begin for p in select policyname,tablename from pg_policies where schemaname='public' and tablename in ('badges','profile_badges') loop execute format('drop policy %I on public.%I',p.policyname,p.tablename);end loop;end$$;
revoke all on public.badges,public.profile_badges from public,anon,authenticated;
grant select on public.badges to anon,authenticated;
-- Retired catalog entries remain readable for previously earned awards.
create policy "badge catalog read" on public.badges for select to anon,authenticated using(true);
grant select(id,user_id,badge_id,granted_at,revoked_at,source) on public.profile_badges to anon,authenticated;
create policy "active awards read" on public.profile_badges for select to anon,authenticated using(revoked_at is null);

create or replace function private.badge_event_record() returns trigger language plpgsql security definer set search_path='' as $$begin
 insert into public.badge_events(award_id,user_id,badge_id,actor_id,actor_role,event,reason,evidence,source_record) values(new.id,new.user_id,new.badge_id,case when tg_op='INSERT' then new.granted_by else new.revoked_by end,case when tg_op='INSERT' then new.granted_role else (select role::text from public.profiles where id=new.revoked_by) end,case when tg_op='INSERT' then case when new.source='automatic' then 'earned' else 'awarded' end else coalesce(new.disposition,'revoked') end,case when tg_op='INSERT' then new.reason else new.revoke_reason end,new.correction_evidence,new.acquisition_evidence);
 insert into public.notifications(user_id,actor_id,kind,entity_id,body,dedupe_key) values(new.user_id,case when tg_op='INSERT' then new.granted_by else new.revoked_by end,'badge',new.id,(select name from public.badges where id=new.badge_id)||case when tg_op='INSERT' then ' rozetini kazandın.' else ' rozet kaydın güncellendi.' end,'badge:'||new.id||':'||tg_op);
 return new;
end$$;
revoke all on function private.badge_event_record() from public,anon,authenticated;
create trigger badge_event_record after insert or update on public.profile_badges for each row execute function private.badge_event_record();
create or replace function private.badge_history_guard() returns trigger language plpgsql set search_path='' as $$begin raise exception 'immutable_badge_history';end$$;
revoke all on function private.badge_history_guard() from public,anon,authenticated;
create trigger badge_history_immutable before update or delete on public.badge_events for each row execute function private.badge_history_guard();
create trigger badge_award_no_delete before delete on public.profile_badges for each row execute function private.badge_history_guard();

create or replace function public.manage_badge(p_action text,p_user uuid,p_badge uuid default null,p_award uuid default null,p_reason text default null,p_evidence text default null,p_proposer uuid default null) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();role_name text;b public.badges%rowtype;a public.profile_badges%rowtype;result uuid;
begin
 select role::text into role_name from public.profiles where id=actor;
 if actor is null or coalesce(role_name,'') not in ('founder','admin') or not private.has_permission('members.manage') then raise exception 'badge_forbidden';end if;
 if length(coalesce(p_evidence,''))>2000 then raise exception 'invalid_badge_evidence';end if;
 if p_reason is null or length(trim(p_reason))<3 or length(p_reason)>2000 then raise exception 'badge_reason_required';end if;
 if p_action in ('award','recognize') then
 select * into b from public.badges where id=p_badge for share;
 if not found or not b.active then raise exception 'badge_unavailable';end if;
 if not exists(select 1 from public.community_memberships where user_id=p_user and status='active') and p_action='award' then raise exception 'active_member_required';end if;
 if p_action='recognize' then
 if role_name<>'founder' or b.norm_type not in ('historical','achievement') or length(trim(coalesce(p_evidence,'')))<3 then raise exception 'badge_recognition_forbidden';end if;
 elsif b.norm_type not in ('discretionary','high_honor') or (b.norm_type='high_honor' and role_name<>'founder') then raise exception 'badge_award_forbidden';end if;
 if p_proposer is not null and not exists(select 1 from public.profiles where id=p_proposer and role='moderator') then raise exception 'invalid_badge_proposer';end if;
 insert into public.profile_badges(user_id,badge_id,granted_by,granted_role,reason,source,correction_evidence) values(p_user,b.id,actor,role_name,trim(p_reason),case when p_action='recognize' then 'recognition' else 'manual' end,p_evidence) returning id into result;
 if p_proposer is not null then insert into public.badge_events(award_id,user_id,badge_id,actor_id,actor_role,event,reason) values(result,p_user,b.id,p_proposer,'moderator','proposed',trim(p_reason));end if;
 return result;
 elsif p_action in ('revoke','correct') then
 select * into a from public.profile_badges where id=p_award and user_id=p_user for update;
 if not found or a.revoked_at is not null then raise exception 'badge_award_not_active';end if;
 select * into b from public.badges where id=a.badge_id;
 if p_action='correct' then
 if role_name<>'founder' or b.norm_type not in ('historical','achievement') or length(trim(coalesce(p_evidence,'')))<3 then raise exception 'badge_correction_forbidden';end if;
 elsif b.norm_type not in ('discretionary','high_honor') or (role_name<>'founder' and (b.norm_type='high_honor' or a.granted_role='founder' or a.granted_role is null)) then raise exception 'badge_revoke_forbidden';end if;
 update public.profile_badges set revoked_at=now(),revoked_by=actor,revoke_reason=trim(p_reason),disposition=case when p_action='correct' then 'corrected' else 'revoked' end,correction_evidence=p_evidence where id=a.id;
 return a.id;
 else raise exception 'invalid_badge_action';end if;
end$$;
revoke all on function public.manage_badge(text,uuid,uuid,uuid,text,text,uuid) from public,anon;
grant execute on function public.manage_badge(text,uuid,uuid,uuid,text,text,uuid) to authenticated;

create or replace function public.qgang_sync_automatic_badges(target_user uuid) returns void language plpgsql security definer set search_path='' as $$
declare b public.badges%rowtype;qualified boolean;active_member boolean;admitted timestamptz;seconds_active numeric;
begin
 select status='active',joined_at into active_member,admitted from public.community_memberships where user_id=target_user;
 if admitted is null then return;end if;
 select coalesce(sum(extract(epoch from (coalesce(ended_at,now())-started_at))),0) into seconds_active from public.membership_periods where user_id=target_user;
 for b in select * from public.badges where active and norm_type in ('historical','achievement') loop
 qualified:=false;
 if b.rule->>'kind'='admission-window' then qualified:=admitted<=now() and admitted>=((b.rule->>'from')::date::timestamp at time zone (b.rule->>'timezone')) and admitted<((b.rule->>'until')::date::timestamp at time zone (b.rule->>'timezone'));
 elsif b.rule->>'kind'='membership-tenure' then qualified:=active_member and seconds_active>=((b.rule->>'days')::numeric*86400);
 elsif b.rule->>'kind'='published-work' then qualified:=active_member and (select count(*) from public.publications where author_id=target_user and status='published')>=((b.rule->>'count')::integer);
 end if;
 -- A correction blocks automatic regrant; founder recognition must explicitly restore it.
 if qualified and not exists(select 1 from public.profile_badges where user_id=target_user and badge_id=b.id and (revoked_at is null or disposition='corrected')) then
 insert into public.profile_badges(user_id,badge_id,reason,source,acquisition_evidence) values(target_user,b.id,'Kayıtlı kazanım koşulları sağlandı','automatic',jsonb_build_object('condition',b.rule,'membership_admitted_at',admitted,'active_seconds',seconds_active,'evaluated_at',now(),'publications',case when b.rule->>'kind'='published-work' then (select jsonb_agg(jsonb_build_object('id',to_jsonb(p)->'id','published_at',to_jsonb(p)->'published_at')) from public.publications p where author_id=target_user and status='published') else null end)) on conflict(user_id,badge_id) where revoked_at is null do nothing;
 end if;
 end loop;
end$$;
revoke all on function public.qgang_sync_automatic_badges(uuid) from public,anon,authenticated;
create or replace function private.membership_badge_period() returns trigger language plpgsql security definer set search_path='' as $$begin
 if tg_op='INSERT' then
 if new.status='active' then insert into public.membership_periods(user_id,started_at,source) values(new.user_id,now(),'activation');end if;
 elsif old.status is distinct from new.status then
 if new.status='active' then insert into public.membership_periods(user_id,started_at,source) values(new.user_id,now(),'reactivation');else update public.membership_periods set ended_at=now() where user_id=new.user_id and ended_at is null;end if;
 end if;
 perform public.qgang_sync_automatic_badges(new.user_id);return new;
end$$;
revoke all on function private.membership_badge_period() from public,anon,authenticated;
create trigger membership_badge_period after insert or update of status,joined_at on public.community_memberships for each row execute function private.membership_badge_period();
create or replace function public.sync_my_badges() returns void language plpgsql security definer set search_path='' as $$begin if auth.uid() is null then raise exception 'unauthorized';end if;perform public.qgang_sync_automatic_badges(auth.uid());end$$;
revoke all on function public.sync_my_badges() from public,anon;
grant execute on function public.sync_my_badges() to authenticated;
-- Scheduled entry point is private to service/admin jobs; client cannot impersonate another user.
create or replace function public.sync_all_badges() returns void language plpgsql security definer set search_path='' as $$declare u uuid;begin for u in select user_id from public.community_memberships loop perform public.qgang_sync_automatic_badges(u);end loop;end$$;
revoke all on function public.sync_all_badges() from public,anon,authenticated;
grant execute on function public.sync_all_badges() to service_role;
create or replace function public.badge_manager_data() returns jsonb language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or not private.has_permission('members.manage') or not exists(select 1 from public.profiles where id=auth.uid() and role in ('founder','admin')) then raise exception 'badge_forbidden';end if;
 return jsonb_build_object('awards',coalesce((select jsonb_agg(to_jsonb(a)||jsonb_build_object('badges',to_jsonb(b))) from public.profile_badges a join public.badges b on b.id=a.badge_id),'[]'::jsonb),'history',coalesce((select jsonb_agg(to_jsonb(e) order by created_at desc) from public.badge_events e),'[]'::jsonb));
end$$;
revoke all on function public.badge_manager_data() from public,anon;
grant execute on function public.badge_manager_data() to authenticated;
create or replace function public.retire_badge(p_badge uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='founder') then raise exception 'founder_required';end if;
 if length(trim(coalesce(p_reason,'')))<3 then raise exception 'badge_reason_required';end if;
 update public.badges set active=false,updated_at=now() where id=p_badge and active;
 if not found then raise exception 'badge_unavailable';end if;
end$$;
revoke all on function public.retire_badge(uuid,text) from public,anon;
grant execute on function public.retire_badge(uuid,text) to authenticated;
-- Supabase supports pg_cron; local test engines may omit the extension.
do $$begin
 if exists(select 1 from pg_available_extensions where name='pg_cron') then
 create extension if not exists pg_cron;
 perform cron.schedule('qgang-badge-daily','5 0 * * *','select public.sync_all_badges()');
 end if;
end$$;
create table public.badge_catalog_events(id uuid primary key default gen_random_uuid(),badge_id uuid not null,actor_id uuid not null,event text not null,reason text not null,before_record jsonb,after_record jsonb,created_at timestamptz not null default now());
alter table public.badge_catalog_events enable row level security;
revoke all on public.badge_catalog_events from public,anon,authenticated;
grant select on public.badge_catalog_events to authenticated;
create policy "leader catalog history" on public.badge_catalog_events for select to authenticated using(exists(select 1 from public.profiles where id=auth.uid() and role='founder'));
create trigger badge_catalog_history_immutable before update or delete on public.badge_catalog_events for each row execute function private.badge_history_guard();
create or replace function public.save_badge_definition(p_id uuid,p_slug text,p_name text,p_description text,p_type text,p_active boolean,p_reason text) returns uuid language plpgsql security definer set search_path='' as $$declare previous public.badges%rowtype;result public.badges%rowtype;begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='founder') then raise exception 'founder_required';end if;
 if p_name is null or p_description is null or p_type is null or p_active is null or length(trim(coalesce(p_reason,'')))<3 or length(p_reason)>2000 or length(trim(p_name))<2 or length(p_name)>100 or length(p_description)>2000 or p_type not in ('historical','achievement','discretionary','high_honor') then raise exception 'invalid_badge_definition';end if;
 if p_id is null then
 if p_slug is null or p_slug!~'^[a-z0-9][a-z0-9-]{2,60}$' or p_type in ('historical','achievement') then raise exception 'new_automatic_condition_requires_review';end if;
 insert into public.badges(slug,name,description,icon,norm_type,category,award_mode,active) values(p_slug,trim(p_name),trim(p_description),'◆',p_type,'honorary','discretionary',p_active) returning * into result;
 else
 select * into previous from public.badges where id=p_id for update;if not found then raise exception 'badge_unavailable';end if;
 if p_type<>previous.norm_type then raise exception 'earned_badge_type_immutable';end if;
 update public.badges set name=trim(p_name),description=trim(p_description),active=p_active,updated_at=now() where id=p_id returning * into result;
 end if;
 insert into public.badge_catalog_events(badge_id,actor_id,event,reason,before_record,after_record) values(result.id,auth.uid(),case when p_id is null then 'created' when previous.active and not p_active then 'retired' else 'updated' end,trim(p_reason),case when p_id is null then null else to_jsonb(previous) end,to_jsonb(result));return result.id;
end$$;
revoke all on function public.save_badge_definition(uuid,text,text,text,text,boolean,text) from public,anon;
grant execute on function public.save_badge_definition(uuid,text,text,text,text,boolean,text) to authenticated;
-- Retirement uses the same audited catalog path.
create or replace function public.retire_badge(p_badge uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$declare b public.badges%rowtype;begin select * into b from public.badges where id=p_badge;if not found then raise exception 'badge_unavailable';end if;perform public.save_badge_definition(b.id,b.slug,b.name,b.description,b.norm_type,false,p_reason);end$$;
create or replace function public.set_badge_condition(p_id uuid,p_rule jsonb,p_reason text) returns void language plpgsql security definer set search_path='' as $$declare b public.badges%rowtype;begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='founder') then raise exception 'founder_required';end if;
 if length(trim(coalesce(p_reason,'')))<3 or length(p_reason)>2000 then raise exception 'badge_reason_required';end if;
 select * into b from public.badges where id=p_id for update;if not found then raise exception 'badge_unavailable';end if;
 if b.slug='ilk-halka' then
 if p_rule->>'kind'<>'admission-window' or p_rule->>'timezone'<>'Europe/Istanbul' or (p_rule->>'from')::date>=(p_rule->>'until')::date then raise exception 'invalid_badge_condition';end if;
 elsif b.slug='kidem-nisani' then
 if p_rule->>'kind'<>'membership-tenure' or (p_rule->>'days')::integer not between 1 and 36500 then raise exception 'invalid_badge_condition';end if;
 elsif b.slug='muellif' then
 if p_rule->>'kind'<>'published-work' or (p_rule->>'count')::integer not between 1 and 10000 then raise exception 'invalid_badge_condition';end if;
 else raise exception 'unsupported_badge_condition';end if;
 if jsonb_typeof(p_rule)<>'object' or p_rule->>'kind' is null or (b.slug='ilk-halka' and (p_rule->>'from' is null or p_rule->>'until' is null or p_rule->>'timezone' is null)) or (b.slug='kidem-nisani' and p_rule->>'days' is null) or (b.slug='muellif' and p_rule->>'count' is null) then raise exception 'invalid_badge_condition';end if;
 update public.badges set rule=p_rule,updated_at=now() where id=b.id;
 insert into public.badge_catalog_events(badge_id,actor_id,event,reason,before_record,after_record) values(b.id,auth.uid(),'condition_updated',p_reason,to_jsonb(b),(select to_jsonb(x) from public.badges x where x.id=b.id));
end$$;
revoke all on function public.set_badge_condition(uuid,jsonb,text) from public,anon;
grant execute on function public.set_badge_condition(uuid,jsonb,text) to authenticated;

-- Preserve pre-migration facts without fabricating the issuer's historical role.
insert into public.badge_events(award_id,user_id,badge_id,actor_id,event,reason,created_at)
select id,user_id,badge_id,granted_by,'imported_award',reason,granted_at from public.profile_badges;
insert into public.badge_events(award_id,user_id,badge_id,actor_id,event,reason,created_at)
select id,user_id,badge_id,revoked_by,'imported_revocation',revoke_reason,revoked_at from public.profile_badges where revoked_at is not null;

create index badge_events_created on public.badge_events(created_at desc);
create index badge_events_member on public.badge_events(user_id,created_at desc);
create index membership_periods_member on public.membership_periods(user_id,started_at);
create or replace function public.qgang_badge_publication_trigger() returns trigger language plpgsql security definer set search_path='' as $$begin if new.status='published' then perform public.qgang_sync_automatic_badges(new.author_id);end if;return new;end$$;
revoke all on function public.qgang_badge_publication_trigger() from public,anon,authenticated;
