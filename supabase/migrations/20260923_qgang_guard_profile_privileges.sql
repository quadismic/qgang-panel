create or replace function private.role_weight(r public.qgang_role) returns int language sql immutable as $f$ select case r when 'founder' then 50 when 'admin' then 40 when 'moderator' then 30 when 'creator' then 20 when 'member' then 10 else 0 end $f$;
create or replace function private.guard_profile_privileged_fields() returns trigger language plpgsql security definer set search_path=public,private as $f$
declare actor_role public.qgang_role;
begin
 if new.role is distinct from old.role or new.is_suspended is distinct from old.is_suspended or new.qgang_era is distinct from old.qgang_era or new.qgang_seal is distinct from old.qgang_seal then
  select role into actor_role from public.profiles where id=auth.uid();
  if actor_role is null or not private.has_permission('members.manage') then raise exception 'insufficient permission'; end if;
  if actor_role <> 'founder'::public.qgang_role and (private.role_weight(actor_role)<=private.role_weight(old.role) or private.role_weight(actor_role)<=private.role_weight(new.role)) then raise exception 'hierarchy violation'; end if;
  if auth.uid()=old.id and actor_role<>'founder'::public.qgang_role then raise exception 'self privilege change denied'; end if;
 end if;
 return new;
end $f$;
drop trigger if exists guard_profile_privileged_fields on public.profiles;
create trigger guard_profile_privileged_fields before update on public.profiles for each row execute function private.guard_profile_privileged_fields();
