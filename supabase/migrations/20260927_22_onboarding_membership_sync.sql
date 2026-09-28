create or replace function public.complete_qgang_onboarding(p_display_name text,p_handle text,p_birth_date date,p_avatar_url text default null)
returns table(display_name text,handle text,qgang_era integer,qgang_seal text)
language plpgsql security definer set search_path=''
as $$
declare uid uuid:=auth.uid(); clean_name text:=trim(p_display_name); clean_handle text:=lower(trim(leading '@' from trim(p_handle))); era_no integer; seal_code text; is_member boolean;
begin
 if uid is null then raise exception 'not_authenticated'; end if;
 if char_length(clean_name)<2 or char_length(clean_name)>60 then raise exception 'invalid_name'; end if;
 if clean_handle !~ '^[a-z0-9_]{3,24}$' then raise exception 'invalid_handle'; end if;
 if p_birth_date is null or p_birth_date>current_date or p_birth_date<date '1900-01-01' then raise exception 'invalid_birth_date'; end if;
 if exists(select 1 from public.profiles p where lower(p.handle)=clean_handle and p.id<>uid) then raise exception 'handle_taken'; end if;
 select exists(select 1 from public.community_memberships m where m.user_id=uid and m.status='active') into is_member;
 select current_era into era_no from public.qgang_identity_settings where singleton=true;
 select p.qgang_seal into seal_code from public.profiles p where p.id=uid;
 if is_member and seal_code is null then seal_code:=public.qgang_random_seal(); end if;
 update public.profiles p set display_name=clean_name,handle=clean_handle,avatar_url=coalesce(nullif(p_avatar_url,''),p.avatar_url),qgang_era=case when is_member then coalesce(p.qgang_era,era_no) else null end,qgang_seal=case when is_member and p.role='founder' then 'PRIME' when is_member then seal_code else null end,onboarding_completed_at=now(),updated_at=now() where p.id=uid;
 insert into public.profile_private(user_id,birth_date,updated_at) values(uid,p_birth_date,now()) on conflict(user_id) do update set birth_date=excluded.birth_date,updated_at=now();
 return query select p.display_name,p.handle,p.qgang_era,p.qgang_seal from public.profiles p where p.id=uid;
end$$;
