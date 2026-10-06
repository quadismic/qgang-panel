-- Keep guest platform accounts out of member complaint and appeal flows, including direct API calls.
create policy "members create reports" on public.reports as restrictive for insert to authenticated
 with check(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role::text<>'guest'));
create policy "members create appeals" on public.moderation_appeals as restrictive for insert to authenticated
 with check(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role::text<>'guest'));
-- Legacy archive previously allowed every authenticated account; reserve it for discipline staff.
create policy "staff reads legacy discipline" on public.moderation_legacy_archive
 as restrictive for select to authenticated using (
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role::text in ('founder','admin','moderator'))
 and (select private.has_permission('discipline.view'))
 );
