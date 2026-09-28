-- 2.2 RLS cleanup: remove legacy policies now fully covered by the canonical permission/hierarchy policies.
drop policy if exists "founder manages permissions" on public.role_permissions;
drop policy if exists "permissions readable" on public.role_permissions;
drop policy if exists "members read own membership" on public.community_memberships;
-- Generic permission-only policies weakened the stricter hierarchy policies because PostgreSQL
-- combines permissive policies with OR. Keep only the hierarchy-aware variants.
drop policy if exists "permission updates moderation appeals" on public.moderation_appeals;
drop policy if exists "permission writes moderation reviews" on public.moderation_reviews;
