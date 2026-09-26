-- One-time FIX 2.1 -> 2.2 cleanup. Platform accounts without an active Q-GANG membership
-- must not retain the legacy member role. Migration context is privileged; temporarily bypass
-- the interactive profile guard only for this deterministic repair.
alter table public.profiles disable trigger guard_profile_privileged_fields;
update public.profiles p
set role='guest'::public.qgang_role,qgang_era=null,qgang_seal=null,updated_at=now()
where p.role='member'::public.qgang_role
and not exists(select 1 from public.community_memberships cm where cm.user_id=p.id and cm.status='active');
alter table public.profiles enable trigger guard_profile_privileged_fields;
