-- Narrow public reading; management and private columns stay protected.
grant select(id,title,body,category,priority,is_pinned,published_at,expires_at)
 on public.announcements to anon;
grant select(id,title,body,kind,decision_priority,decision_pinned,published_at,
 effective_at,status,revision,legacy_announcement_id)
 on public.regulations to anon;
create policy "guests read published notices" on public.announcements
 for select to anon using (
 category='DUYURU' and published_at<=now()
 and (expires_at is null or expires_at>now())
 );
create policy "guests read published executive decisions" on public.regulations
 for select to anon using (
 kind='KARAR' and status<>'taslak' and published_at<=now()
 );
