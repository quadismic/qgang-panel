-- Access Center -> database enforcement
create or replace function private.has_permission(required_permission text)
returns boolean language sql stable security definer set search_path=public,private as $fn$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and (p.role='founder'::public.qgang_role or exists(select 1 from public.role_permissions rp where rp.role=p.role and rp.permission=required_permission and rp.enabled=true)))
$fn$;
revoke all on function private.has_permission(text) from public;
grant execute on function private.has_permission(text) to authenticated;

drop policy if exists "founder admin manage memberships" on public.community_memberships;
create policy "permission manages memberships" on public.community_memberships for all to authenticated using ((select private.has_permission('members.manage'))) with check ((select private.has_permission('members.manage')));
drop policy if exists "management updates profiles" on public.profiles;
create policy "permission manages profiles" on public.profiles for update to authenticated using ((select private.has_permission('members.manage'))) with check ((select private.has_permission('members.manage')));
drop policy if exists "leaders manage announcements" on public.announcements;
create policy "permission manages announcements" on public.announcements for all to authenticated using ((select private.has_permission('announcements.publish'))) with check ((select private.has_permission('announcements.publish')));
drop policy if exists "founder admin add fund movements" on public.fund_transactions;
create policy "permission adds fund movements" on public.fund_transactions for insert to authenticated with check ((select private.has_permission('budget.manage')) and created_by=(select auth.uid()));
drop policy if exists "founder admin reverse fund movements" on public.fund_transactions;
create policy "permission reverses fund movements" on public.fund_transactions for update to authenticated using ((select private.has_permission('budget.manage'))) with check ((select private.has_permission('budget.manage')));
drop policy if exists "members and management read fund" on public.fund_transactions;
create policy "permission reads fund" on public.fund_transactions for select to authenticated using ((select private.has_permission('budget.view')) or (select private.has_permission('budget.manage')));
drop policy if exists "design settings admin delete" on public.design_settings;drop policy if exists "design settings admin insert" on public.design_settings;drop policy if exists "design settings admin update" on public.design_settings;
create policy "permission manages design settings" on public.design_settings for all to authenticated using ((select private.has_permission('design.manage'))) with check ((select private.has_permission('design.manage')));
drop policy if exists "design history admin insert" on public.design_history;drop policy if exists "design history admin read" on public.design_history;
create policy "permission reads design history" on public.design_history for select to authenticated using ((select private.has_permission('design.manage')));
create policy "permission writes design history" on public.design_history for insert to authenticated with check ((select private.has_permission('design.manage')) and created_by=(select auth.uid()));
drop policy if exists "moderation staff create" on public.moderation_actions;
create policy "permission creates moderation actions" on public.moderation_actions for insert to authenticated with check (moderator_id=(select auth.uid()) and (select private.has_permission('discipline.issue')));
drop policy if exists "moderation staff read" on public.moderation_actions;
create policy "permission reads moderation actions" on public.moderation_actions for select to authenticated using ((select private.has_permission('discipline.view')) or target_user_id=(select auth.uid()));
drop policy if exists "moderation staff read appeals" on public.moderation_appeals;
create policy "permission reads moderation appeals" on public.moderation_appeals for select to authenticated using ((select private.has_permission('discipline.view')) or user_id=(select auth.uid()));
drop policy if exists "moderation reviewers read" on public.moderation_reviews;
create policy "permission reads moderation reviews" on public.moderation_reviews for select to authenticated using ((select private.has_permission('discipline.view')));
drop policy if exists "moderation staff read reports" on public.reports;
create policy "permission reads reports" on public.reports for select to authenticated using ((select private.has_permission('discipline.view')) or reporter_id=(select auth.uid()));
drop policy if exists "moderation staff update reports" on public.reports;
create policy "permission updates reports" on public.reports for update to authenticated using ((select private.has_permission('discipline.review'))) with check ((select private.has_permission('discipline.review')));