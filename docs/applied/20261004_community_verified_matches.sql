-- One-time repairs authorized by the Leader in this conversation.
-- Run after community_identity_repairs.sql, with combined release approval.
-- Do not mark onboarding complete: each account must confirm its own identity.
begin;
select set_config('request.jwt.claim.sub','8fc9034b-855b-4008-a8be-f7681e70ef9b',true);
do $$begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='founder') then raise exception 'leader_identity_changed'; end if;
 if not exists(select 1 from public.profiles where id='c0f95561-a4e1-4056-962a-5f940d47efe8' and display_name='Melisa Yıldız') then raise exception 'melisa_identity_changed'; end if;
 if not exists(select 1 from public.profiles where id='d945bd1f-57fb-4301-9c6f-0b4f344ba3b8' and display_name='Renovich') then raise exception 'renovich_identity_changed'; end if;
 if not exists(select 1 from public.legacy_members where id=22 and legacy_nickname='Lillycha') or not exists(select 1 from public.legacy_members where id=6 and legacy_nickname='Renovich') then raise exception 'legacy_identity_changed'; end if;
 perform public.link_legacy_member(22,'c0f95561-a4e1-4056-962a-5f940d47efe8','LİDER 04.10.2026 tarihinde Melisa Yıldız hesabının eski Lillycha kaydına ait olduğunu doğruladı.');
 perform public.link_legacy_member(6,'d945bd1f-57fb-4301-9c6f-0b4f344ba3b8');
end$$;
commit;
