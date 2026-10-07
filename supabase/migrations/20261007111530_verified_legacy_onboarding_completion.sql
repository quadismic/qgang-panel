-- Reconcile an already-verified legacy platform identity; membership alone is insufficient.
-- This marker is identity setup state, not a consent or a role/permission grant.
create or replace function private.complete_verified_legacy_identity(p_user_id uuid)
returns void language sql security invoker set search_path='' as $$
 update public.profiles p
 set onboarding_completed_at=l.claimed_at
 from public.legacy_members l,public.profile_private pp
 where p.id=p_user_id and l.claimed_by=p.id and pp.user_id=p.id
   and p.onboarding_completed_at is null
   and l.claimed_at is not null and l.verified_by is not null
   and char_length(trim(p.display_name)) between 2 and 60
   and trim(p.display_name)<>'Q-GANG Kullanıcısı'
   and p.handle ~ '^[a-z0-9_]{3,24}$' and p.handle !~ '^u[0-9a-f]{23}$'
   and pp.birth_date between date '1900-01-01' and current_date
   and exists(select 1 from public.community_memberships m where m.user_id=p.id and m.status='active')
   and exists(select 1 from auth.users u where u.id=p.id);
$$;
revoke all on function private.complete_verified_legacy_identity(uuid) from public,anon,authenticated;

create or replace function private.complete_identity_after_legacy_verification()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.claimed_by is not null and new.claimed_at is not null and new.verified_by is not null then
  perform private.complete_verified_legacy_identity(new.claimed_by);
 end if;
 return new;
end;
$$;
revoke all on function private.complete_identity_after_legacy_verification() from public,anon,authenticated;
drop trigger if exists complete_verified_legacy_identity on public.legacy_members;
create trigger complete_verified_legacy_identity
 after insert or update of claimed_by,claimed_at,verified_by on public.legacy_members
 for each row execute function private.complete_identity_after_legacy_verification();

-- Idempotent repair. Abort if any other profile field is changed by a side effect.
do $$
declare before_profiles jsonb;after_profiles jsonb;
begin
 lock table public.profiles in share row exclusive mode;
 select jsonb_agg(to_jsonb(p)-'onboarding_completed_at' order by p.id) into before_profiles from public.profiles p;
 perform private.complete_verified_legacy_identity(l.claimed_by)
 from public.legacy_members l where l.claimed_by is not null and l.claimed_at is not null and l.verified_by is not null;
 select jsonb_agg(to_jsonb(p)-'onboarding_completed_at' order by p.id) into after_profiles from public.profiles p;
 if before_profiles is distinct from after_profiles then raise exception 'unexpected_profile_change';end if;
end;
$$;
