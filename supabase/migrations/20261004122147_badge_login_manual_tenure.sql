-- Preserve observed authentication timestamps; no account creation dates are substituted.
create table private.badge_site_logins(user_id uuid primary key references auth.users(id) on delete cascade,first_login_at timestamptz not null);
alter table private.badge_site_logins enable row level security;
revoke all on private.badge_site_logins from public,anon,authenticated;
insert into private.badge_site_logins(user_id,first_login_at) select id,last_sign_in_at from auth.users where last_sign_in_at is not null;
update public.badges set rule='{"kind":"member-login-cutoff","until":"2027-01-01","timezone":"Europe/Istanbul"}',description='Topluluk üyesi olup Türkiye saatiyle 31 Aralık 2026 sonuna kadar hesabıyla platforma giriş yapanların tarihsel nişanı.',updated_at=now() where slug='ilk-halka';
update public.badges set award_mode='historical',rule='{"kind":"manual-tenure","days":730}',description='Uzun süreli üyelik ve aktiflik geçmişi yönetim tarafından değerlendirilerek gerekçeli tanınan kıdem nişanı.',updated_at=now() where slug='kidem-nisani';
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
 if (role_name<>'founder' and not (role_name='admin' and b.slug='kidem-nisani')) or b.norm_type not in ('historical','achievement') or length(trim(coalesce(p_evidence,'')))<3 then raise exception 'badge_recognition_forbidden';end if;
 if b.slug='kidem-nisani' and not exists(select 1 from public.community_memberships where user_id=p_user and status='active') then raise exception 'active_member_required';end if;
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
create or replace function public.qgang_sync_automatic_badges(target_user uuid) returns void language plpgsql security definer set search_path='' as $$
declare b public.badges%rowtype;qualified boolean;active_member boolean;admitted timestamptz;seconds_active numeric;first_login timestamptz;
begin
 select status='active',joined_at into active_member,admitted from public.community_memberships where user_id=target_user;
 if admitted is null then return;end if;
 select coalesce(sum(extract(epoch from (coalesce(ended_at,now())-started_at))),0) into seconds_active from public.membership_periods where user_id=target_user;
 select first_login_at into first_login from private.badge_site_logins where user_id=target_user;
 for b in select * from public.badges where active and norm_type in ('historical','achievement') loop
 qualified:=false;
 if b.rule->>'kind'='member-login-cutoff' then qualified:=active_member and admitted<=now() and admitted<((b.rule->>'until')::date::timestamp at time zone (b.rule->>'timezone')) and first_login<=now() and first_login<((b.rule->>'until')::date::timestamp at time zone (b.rule->>'timezone'));
 -- Kidem is assessed by management; never awarded by this automatic worker.
 elsif b.rule->>'kind'='published-work' then qualified:=active_member and (select count(*) from public.publications where author_id=target_user and status='published')>=((b.rule->>'count')::integer);
 end if;
 -- A correction blocks automatic regrant; founder recognition must explicitly restore it.
 if qualified and not exists(select 1 from public.profile_badges where user_id=target_user and badge_id=b.id and (revoked_at is null or disposition='corrected')) then
 insert into public.profile_badges(user_id,badge_id,reason,source,acquisition_evidence) values(target_user,b.id,'Kayıtlı kazanım koşulları sağlandı','automatic',jsonb_build_object('condition',b.rule,'membership_admitted_at',admitted,'first_recorded_login_at',first_login,'active_seconds',seconds_active,'evaluated_at',now(),'publications',case when b.rule->>'kind'='published-work' then (select jsonb_agg(jsonb_build_object('id',to_jsonb(p)->'id','published_at',to_jsonb(p)->'published_at')) from public.publications p where author_id=target_user and status='published') else null end)) on conflict(user_id,badge_id) where revoked_at is null do nothing;
 end if;
 end loop;
end$$;
create or replace function public.set_badge_condition(p_id uuid,p_rule jsonb,p_reason text) returns void language plpgsql security definer set search_path='' as $$declare b public.badges%rowtype;begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='founder') then raise exception 'founder_required';end if;
 if length(trim(coalesce(p_reason,'')))<3 or length(p_reason)>2000 then raise exception 'badge_reason_required';end if;
 select * into b from public.badges where id=p_id for update;if not found then raise exception 'badge_unavailable';end if;
 if b.slug='ilk-halka' then
 if p_rule->>'kind'<>'member-login-cutoff' or p_rule->>'timezone'<>'Europe/Istanbul' or p_rule->>'until' is null then raise exception 'invalid_badge_condition';end if;
 elsif b.slug='kidem-nisani' then
 if p_rule->>'kind'<>'manual-tenure' or (p_rule->>'days')::integer not between 1 and 36500 then raise exception 'invalid_badge_condition';end if;
 elsif b.slug='muellif' then
 if p_rule->>'kind'<>'published-work' or (p_rule->>'count')::integer not between 1 and 10000 then raise exception 'invalid_badge_condition';end if;
 else raise exception 'unsupported_badge_condition';end if;
 if jsonb_typeof(p_rule)<>'object' or p_rule->>'kind' is null or (b.slug='ilk-halka' and (p_rule->>'until' is null or p_rule->>'timezone' is null)) or (b.slug='kidem-nisani' and p_rule->>'days' is null) or (b.slug='muellif' and p_rule->>'count' is null) then raise exception 'invalid_badge_condition';end if;
 update public.badges set rule=p_rule,updated_at=now() where id=b.id;
 insert into public.badge_catalog_events(badge_id,actor_id,event,reason,before_record,after_record) values(b.id,auth.uid(),'condition_updated',p_reason,to_jsonb(b),(select to_jsonb(x) from public.badges x where x.id=b.id));
end$$;
create or replace function private.badge_login_record() returns trigger language plpgsql security definer set search_path='' as $$begin
 if new.last_sign_in_at is not null then
 insert into private.badge_site_logins(user_id,first_login_at) values(new.id,new.last_sign_in_at) on conflict(user_id) do update set first_login_at=least(private.badge_site_logins.first_login_at,excluded.first_login_at);
 perform public.qgang_sync_automatic_badges(new.id);
 end if;return new;end$$;
revoke all on function private.badge_login_record() from public,anon,authenticated;
create trigger qgang_badge_login_record after insert or update of last_sign_in_at on auth.users for each row execute function private.badge_login_record();
-- Apply to existing eligible members without deleting any award or history.
select public.sync_all_badges();
