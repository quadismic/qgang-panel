-- Q-GANG moderation hierarchy, appeals and review flow
create table if not exists public.moderation_reviews(id uuid primary key default gen_random_uuid(),action_id uuid not null references public.moderation_actions(id) on delete cascade,reviewer_id uuid not null references public.profiles(id) on delete restrict,reviewer_role public.qgang_role not null,decision text not null check(decision in ('approve','revoke')),note text,created_at timestamptz not null default now(),unique(action_id,reviewer_role));
create table if not exists public.moderation_appeals(id uuid primary key default gen_random_uuid(),action_id uuid not null references public.moderation_actions(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,body text not null check(char_length(body) between 10 and 1500),status text not null default 'open' check(status in ('open','accepted','rejected')),reviewed_by uuid references public.profiles(id) on delete set null,review_note text,created_at timestamptz not null default now(),reviewed_at timestamptz,unique(action_id,user_id));
alter table public.moderation_actions add column if not exists finality_status text not null default 'final' check(finality_status in ('pending_review','final','revoked')),add column if not exists finalized_at timestamptz,add column if not exists issuer_role public.qgang_role;
alter table public.moderation_reviews enable row level security;alter table public.moderation_appeals enable row level security;
create index if not exists moderation_reviews_action_idx on public.moderation_reviews(action_id,created_at desc);create index if not exists moderation_reviews_reviewer_idx on public.moderation_reviews(reviewer_id);create index if not exists moderation_appeals_user_idx on public.moderation_appeals(user_id);create index if not exists moderation_appeals_reviewed_by_idx on public.moderation_appeals(reviewed_by);

-- Canonical RLS policies mirrored from production.
drop policy if exists "users create own appeals" on public.moderation_appeals;
create policy "users create own appeals" on public.moderation_appeals for insert to authenticated with check (
 user_id=(select auth.uid()) and exists(select 1 from public.moderation_actions a where a.id=action_id and a.target_user_id=(select auth.uid()) and a.issuer_role<>'founder'::public.qgang_role and a.finality_status='final' and a.status<>'revoked')
);
drop policy if exists "users read own appeals" on public.moderation_appeals;
create policy "users read own appeals" on public.moderation_appeals for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists "moderation staff read appeals" on public.moderation_appeals;
create policy "moderation staff read appeals" on public.moderation_appeals for select to authenticated using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('moderator','admin','founder')));
drop policy if exists "hierarchy resolves appeals" on public.moderation_appeals;
create policy "hierarchy resolves appeals" on public.moderation_appeals for update to authenticated using (
 status='open' and exists(select 1 from public.moderation_actions a join public.profiles p on p.id=(select auth.uid()) where a.id=action_id and ((a.issuer_role='moderator' and p.role in ('admin','founder')) or (a.issuer_role='admin' and p.role='founder')))
) with check (reviewed_by=(select auth.uid()) and status in ('accepted','rejected'));
drop policy if exists "moderation reviewers read" on public.moderation_reviews;
create policy "moderation reviewers read" on public.moderation_reviews for select to authenticated using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('moderator','admin','founder')));
drop policy if exists "moderation reviewers create" on public.moderation_reviews;
create policy "moderation reviewers create" on public.moderation_reviews for insert to authenticated with check (
 reviewer_id=(select auth.uid()) and reviewer_role=(select p.role from public.profiles p where p.id=(select auth.uid())) and exists(select 1 from public.moderation_actions a where a.id=action_id and ((a.issuer_role='moderator' and reviewer_role='admin') or (a.issuer_role='moderator' and reviewer_role='founder' and exists(select 1 from public.moderation_reviews ar where ar.action_id=a.id and ar.reviewer_role='admin' and ar.decision='approve')) or (a.issuer_role='admin' and reviewer_role='founder')))
);
