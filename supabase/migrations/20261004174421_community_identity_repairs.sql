-- Pending release SQL; run only with the combined package approval.
-- The CLI is unavailable/offline; generate the final migration entry on application.
begin;
create or replace function public.qgang_random_seal() returns text language plpgsql security definer set search_path='' as $$
declare code text; era_no integer;
begin
 select current_era into era_no from public.qgang_identity_settings where singleton=true for update;
 loop
  code:=upper(substr(encode(extensions.gen_random_bytes(4),'hex'),1,4));
  exit when not exists(select 1 from public.profiles where qgang_era=era_no and qgang_seal=code)
   and not exists(select 1 from public.community_memberships where era=era_no and seal=code);
 end loop;
 return code;
end$$;

-- Only identity values derived from the protected membership record may be synced.
-- All rank/suspension changes still use the original permission/hierarchy checks.
create or replace function private.guard_profile_privileged_fields() returns trigger language plpgsql security definer set search_path='' as $$
declare actor_role public.qgang_role;
begin
 if new.role is not distinct from old.role and new.is_suspended is not distinct from old.is_suspended
  and exists(select 1 from public.community_memberships m where m.user_id=new.id and m.status='active' and m.era=new.qgang_era and m.seal=new.qgang_seal and m.seal is not null) then return new; end if;
 if new.role is distinct from old.role or new.is_suspended is distinct from old.is_suspended or new.qgang_era is distinct from old.qgang_era or new.qgang_seal is distinct from old.qgang_seal then
  select role into actor_role from public.profiles where id=auth.uid();
  if actor_role is null or not private.has_permission('members.manage') then raise exception 'insufficient permission'; end if;
  if actor_role<>'founder'::public.qgang_role and (private.role_weight(actor_role)<=private.role_weight(old.role) or private.role_weight(actor_role)<=private.role_weight(new.role)) then raise exception 'hierarchy violation'; end if;
  if auth.uid()=old.id and actor_role<>'founder'::public.qgang_role then raise exception 'self privilege change denied'; end if;
 end if;
 return new;
end$$;

create or replace function private.membership_assign_identity() returns trigger language plpgsql security definer set search_path='' as $$
declare p public.profiles%rowtype; era_no integer;
begin
 if new.status<>'active' then return new; end if;
 select * into p from public.profiles where id=new.user_id;
 select current_era into era_no from public.qgang_identity_settings where singleton=true for update;
 new.era:=coalesce(new.era,p.qgang_era,era_no,1);
 new.seal:=coalesce(nullif(new.seal,''),nullif(p.qgang_seal,''),case when p.role='founder' then 'PRIME' else public.qgang_random_seal() end);
 return new;
end$$;
create or replace function private.membership_sync_identity() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='active' then update public.profiles set qgang_era=new.era,qgang_seal=new.seal,updated_at=now() where id=new.user_id and (qgang_era is distinct from new.era or qgang_seal is distinct from new.seal); end if;
 return new;
end$$;
revoke all on function private.membership_assign_identity(),private.membership_sync_identity() from public,anon,authenticated;
drop trigger if exists membership_assign_identity on public.community_memberships;
create trigger membership_assign_identity before insert or update of status,era,seal on public.community_memberships for each row execute function private.membership_assign_identity();
drop trigger if exists membership_sync_identity on public.community_memberships;
create trigger membership_sync_identity after insert or update of status,era,seal on public.community_memberships for each row execute function private.membership_sync_identity();
-- Existing member numbers, ranks, and assigned seals remain unchanged.
update public.community_memberships set seal=seal where status='active';

alter table public.legacy_members add column if not exists verification_reason text;
drop function public.link_legacy_member(bigint,uuid);
create function public.link_legacy_member(p_legacy_id bigint,p_target_user uuid,p_confirmation text default null) returns void language plpgsql security definer set search_path='' as $$
declare l public.legacy_members%rowtype; p public.profiles%rowtype; actor_role public.qgang_role; matches boolean;
begin
 if auth.uid() is null or not private.has_permission('members.manage') then raise exception 'not authorized'; end if;
 select role into actor_role from public.profiles where id=auth.uid();
 select * into p from public.profiles where id=p_target_user for update;
 if not found then raise exception 'target_missing'; end if;
 if actor_role<>'founder' and (p_target_user=auth.uid() or private.role_weight(actor_role)<=private.role_weight(p.role)) then raise exception 'hierarchy violation'; end if;
 select * into l from public.legacy_members where id=p_legacy_id for update;
 if not found then raise exception 'legacy_unavailable'; end if;
 if l.claimed_by=p_target_user then return; end if;
 if l.claimed_by is not null then raise exception 'legacy_unavailable'; end if;
 matches:=lower(p.handle)=lower(l.legacy_nickname) or lower(p.display_name)=lower(l.legacy_nickname);
 if not matches and (length(trim(coalesce(p_confirmation,'')))<10 or length(p_confirmation)>2000) then raise exception 'confirmation_required'; end if;
 insert into public.community_memberships(user_id,status,joined_at,ended_at,granted_by)
 values(p_target_user,'active',l.joined_at::timestamp at time zone 'Europe/Istanbul',null,auth.uid())
 on conflict(user_id) do update set status='active',joined_at=least(public.community_memberships.joined_at,excluded.joined_at),ended_at=null,granted_by=auth.uid(),updated_at=now();
 update public.profiles set role=case when role='guest' then 'member'::public.qgang_role else role end,updated_at=now() where id=p_target_user;
 if l.birth_date is not null then
  insert into public.profile_private(user_id,birth_date,updated_at) values(p_target_user,l.birth_date,now()) on conflict(user_id) do update set birth_date=excluded.birth_date,updated_at=now();
  update public.profiles set birthday_day=extract(day from l.birth_date)::smallint,birthday_month=extract(month from l.birth_date)::smallint,birthday_year=extract(year from l.birth_date)::smallint where id=p_target_user;
 end if;
 update public.legacy_members set claimed_by=p_target_user,claimed_at=now(),verified_by=auth.uid(),verification_reason=case when matches then 'Rumuz/ad eşleşmesi yönetim tarafından doğrulandı.' else trim(p_confirmation) end where id=p_legacy_id;
 perform public.qgang_sync_automatic_badges(p_target_user);
end$$;
revoke all on function public.link_legacy_member(bigint,uuid,text) from public,anon;
grant execute on function public.link_legacy_member(bigint,uuid,text) to authenticated;
create or replace function public.list_unclaimed_legacy_members() returns table(id bigint,nickname text,joined_at date) language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.has_permission('members.manage') then raise exception 'not authorized'; end if;
 return query select l.id,l.legacy_nickname,l.joined_at from public.legacy_members l where l.claimed_by is null order by l.legacy_nickname;
end$$;
revoke all on function public.list_unclaimed_legacy_members() from public,anon;
grant execute on function public.list_unclaimed_legacy_members() to authenticated;
commit;
