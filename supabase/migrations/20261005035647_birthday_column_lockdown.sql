-- Phase 2: apply ONLY after profile pages use get_profile_birthday.
revoke select on public.profiles from public,anon,authenticated;
revoke select(birthday_day,birthday_month,birthday_year) on public.profiles from public,anon,authenticated;
grant select(id,handle,display_name,bio,avatar_url,role,is_suspended,created_at,updated_at,birthday_visibility,qgang_era,qgang_seal,onboarding_completed_at,banner_url,banner_motion,banner_position,comments_enabled)
on public.profiles to authenticated;
