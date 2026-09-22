-- Historical Q-GANG 2.1 moderation foundation.
-- Corrected to match the five roles used by the current application.
-- Later 20260922 migrations own the review/finality/appeal hardening.
-- This file intentionally avoids recreating the legacy moderation_actions shape.
do $$
begin
 if exists(select 1 from pg_type where typname='qgang_role') then
  -- qgang_role is an enum in the live project; role membership is defined by the enum itself.
  null;
 else
  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles add constraint profiles_role_check
   check (role in ('founder','admin','moderator','creator','member'));
 end if;
end $$;

-- Legacy report/action/appeal DDL was superseded by the current schema.
-- See 20260922_qgang_moderation_review_appeals.sql and
-- 20260922_qgang_moderation_hardening.sql for the authoritative definitions.
