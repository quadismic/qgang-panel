begin;
create table public.publication_comments (
 id uuid primary key default gen_random_uuid(),
 publication_id uuid not null references public.publications(id) on delete cascade,
 author_id uuid not null references public.profiles(id) on delete restrict,
 body text not null check (char_length(body)<=5000 and public.qg_content_length(body) between 2 and 500),
 created_at timestamptz not null default now()
);
create index publication_comments_publication_time on public.publication_comments(publication_id,created_at desc,id desc);
create index publication_comments_author on public.publication_comments(author_id);
alter table public.publication_comments enable row level security;
revoke all on public.publication_comments from anon,authenticated;
grant select on public.publication_comments to anon,authenticated;
grant insert,delete on public.publication_comments to authenticated;
create policy "published publication comments readable" on public.publication_comments for select to anon,authenticated using (exists(select 1 from public.publications p where p.id=publication_id and p.status='published'));
create policy "active members comment on published works" on public.publication_comments for insert to authenticated with check (
 author_id=(select auth.uid()) and exists(select 1 from public.community_memberships m where m.user_id=(select auth.uid()) and m.status='active')
 and exists(select 1 from public.publications p where p.id=publication_id and p.status='published')
);
create policy "author publication owner or management deletes" on public.publication_comments for delete to authenticated using (
 author_id=(select auth.uid()) or exists(select 1 from public.publications p where p.id=publication_id and p.author_id=(select auth.uid()))
 or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('founder','admin'))
);
create function private.publication_comment_guard() returns trigger language plpgsql set search_path='' as $$begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.author_id::text,43));
 if exists(select 1 from public.publication_comments where author_id=new.author_id and created_at>now()-interval '30 seconds') then raise exception 'comment_rate_limit'; end if;
 new.created_at:=now();return new;
end$$;
revoke all on function private.publication_comment_guard() from public,anon,authenticated;
create trigger publication_comment_guard before insert on public.publication_comments for each row execute function private.publication_comment_guard();
commit;
