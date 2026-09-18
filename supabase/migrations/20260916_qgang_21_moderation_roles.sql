-- Q-GANG 2.1 moderation + five-role foundation.
-- Apply through the Q-GANG Supabase project after review.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('founder','admin','moderator','community','member'));

create table if not exists public.moderation_actions (
 id uuid primary key default gen_random_uuid(),
 target_user_id uuid not null references public.profiles(id) on delete cascade,
 actor_id uuid not null references public.profiles(id),
 kind text not null check(kind in ('warning','restriction','mute','suspension','ban')),
 reason text not null,
 rule_ref text,
 evidence text,
 status text not null default 'active' check(status in ('active','expired','revoked')),
 expires_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists moderation_actions_target_idx on public.moderation_actions(target_user_id,created_at desc);

create table if not exists public.moderation_appeals (
 id uuid primary key default gen_random_uuid(),
 action_id uuid not null references public.moderation_actions(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 body text not null,
 status text not null default 'open' check(status in ('open','accepted','rejected')),
 reviewed_by uuid references public.profiles(id),
 review_note text,
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 unique(action_id,user_id)
);

alter table public.reports add column if not exists target_user_id uuid references public.profiles(id) on delete set null;
alter table public.reports add column if not exists entity_id uuid;
alter table public.reports add column if not exists kind text default 'other';
alter table public.reports add column if not exists reason text;
alter table public.reports add column if not exists status text default 'open';

alter table public.moderation_actions enable row level security;
alter table public.moderation_appeals enable row level security;
create policy "users_read_own_actions" on public.moderation_actions for select to authenticated using (target_user_id=auth.uid());
create policy "users_read_own_appeals" on public.moderation_appeals for select to authenticated using (user_id=auth.uid());
create policy "users_create_own_appeals" on public.moderation_appeals for insert to authenticated with check (user_id=auth.uid());
