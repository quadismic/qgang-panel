create or replace function public.purge_member(target_user uuid)
returns void language plpgsql security definer set search_path='public','auth','private' as $$
declare actor uuid:=auth.uid(); actor_role public.qgang_role; target_role public.qgang_role;
begin
 if actor is null or actor=target_user then raise exception 'not allowed'; end if;
 select role into actor_role from public.profiles where id=actor;
 select role into target_role from public.profiles where id=target_user;
 if actor_role is null or target_role is null or target_role='founder'::public.qgang_role then raise exception 'not allowed'; end if;
 if not private.has_permission('members.delete') then raise exception 'not allowed'; end if;
 if private.role_weight(actor_role)<=private.role_weight(target_role) then raise exception 'hierarchy'; end if;
 if exists(select 1 from public.moderation_actions where moderator_id=target_user or target_user_id=target_user) then raise exception 'historical record exists'; end if;
 if exists(select 1 from public.fund_transactions where supporter_id=target_user or created_by=target_user or reversed_by=target_user) then raise exception 'financial record exists'; end if;
 if exists(select 1 from public.community_memberships where granted_by=target_user and user_id<>target_user) then raise exception 'membership grant history exists'; end if;
 if exists(select 1 from public.qgang_identity_settings where updated_by=target_user) or exists(select 1 from public.site_settings where updated_by=target_user) then raise exception 'settings history exists'; end if;
 delete from auth.users where id=target_user;
end$$;
