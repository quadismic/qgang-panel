-- Q-GANG Alpha 0.1 foundation
-- Run on the dedicated Q-GANG Supabase project only.
create extension if not exists pgcrypto;

create type public.qgang_role as enum ('founder','admin','moderator','creator','member');
create type public.provider_kind as enum ('google','discord','steam');
create type public.report_status as enum ('open','reviewing','resolved','dismissed');
create type public.play_request_status as enum ('pending','accepted','declined','cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 50),
  bio text not null default '' check (char_length(bio) <= 280),
  avatar_url text,
  role public.qgang_role not null default 'member',
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider public.provider_kind not null,
  provider_user_id text not null,
  provider_handle text,
  profile_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id,provider),
  unique(provider,provider_user_id)
);

create table public.campfires (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,64}$'),
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '' check (char_length(description) <= 500),
  cover_url text,
  steam_app_id bigint,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.campfire_members (
  campfire_id uuid not null references public.campfires(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(campfire_id,user_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  campfire_id uuid references public.campfires(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  media_url text,
  is_removed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_feed_idx on public.posts(created_at desc) where is_removed=false;
create index posts_campfire_idx on public.posts(campfire_id,created_at desc) where is_removed=false;

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1500),
  is_removed boolean not null default false,
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments(post_id,created_at);

create table public.reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'fire' check (kind in ('fire','like')),
  created_at timestamptz not null default now(),
  primary key(post_id,user_id)
);

create table public.play_requests (
  id uuid primary key default gen_random_uuid(),
  campfire_id uuid not null references public.campfires(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default '' check (char_length(message)<=280),
  status public.play_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check(sender_id<>receiver_id)
);
create index play_receiver_idx on public.play_requests(receiver_id,status,created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null,
  entity_id uuid,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id,created_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  status public.report_status not null default 'open',
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check(num_nonnulls(post_id,comment_id,reported_user_id)=1)
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references public.profiles(id) on delete restrict,
  target_user_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.posts(id) on delete set null,
  action text not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role public.qgang_role not null,
  permission text not null,
  primary key(role,permission)
);

insert into public.role_permissions(role,permission) values
('founder','*'),('admin','content.moderate'),('admin','member.suspend'),('admin','report.review'),('admin','campfire.manage'),
('moderator','content.moderate'),('moderator','report.review'),('creator','post.create'),('member','post.create');

-- New projects do not necessarily expose public tables to Data API. Grant only the app-facing tables.
grant usage on schema public to authenticated;
grant select on public.profiles,public.connected_accounts,public.campfires,public.campfire_members,public.posts,public.comments,public.reactions to authenticated;
grant insert,update,delete on public.connected_accounts,public.campfire_members,public.posts,public.comments,public.reactions,public.play_requests,public.reports to authenticated;
grant select on public.play_requests,public.notifications,public.reports to authenticated;

alter table public.profiles enable row level security;
alter table public.connected_accounts enable row level security;
alter table public.campfires enable row level security;
alter table public.campfire_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.play_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.role_permissions enable row level security;

create policy "profiles readable by members" on public.profiles for select to authenticated using (not is_suspended or id=(select auth.uid()));
create policy "profile owner updates" on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy "own accounts read" on public.connected_accounts for select to authenticated using (user_id=(select auth.uid()));
create policy "own accounts manage" on public.connected_accounts for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "campfires readable" on public.campfires for select to authenticated using (is_active);
create policy "memberships readable" on public.campfire_members for select to authenticated using (true);
create policy "own membership insert" on public.campfire_members for insert to authenticated with check (user_id=(select auth.uid()));
create policy "own membership delete" on public.campfire_members for delete to authenticated using (user_id=(select auth.uid()));
create policy "posts readable" on public.posts for select to authenticated using (not is_removed);
create policy "own post insert" on public.posts for insert to authenticated with check (author_id=(select auth.uid()));
create policy "own post update" on public.posts for update to authenticated using (author_id=(select auth.uid())) with check (author_id=(select auth.uid()));
create policy "own post delete" on public.posts for delete to authenticated using (author_id=(select auth.uid()));
create policy "comments readable" on public.comments for select to authenticated using (not is_removed);
create policy "own comment insert" on public.comments for insert to authenticated with check (author_id=(select auth.uid()));
create policy "own comment update" on public.comments for update to authenticated using (author_id=(select auth.uid())) with check (author_id=(select auth.uid()));
create policy "own comment delete" on public.comments for delete to authenticated using (author_id=(select auth.uid()));
create policy "reactions readable" on public.reactions for select to authenticated using (true);
create policy "own reaction insert" on public.reactions for insert to authenticated with check (user_id=(select auth.uid()));
create policy "own reaction delete" on public.reactions for delete to authenticated using (user_id=(select auth.uid()));
create policy "play participants read" on public.play_requests for select to authenticated using (sender_id=(select auth.uid()) or receiver_id=(select auth.uid()));
create policy "play sender creates" on public.play_requests for insert to authenticated with check (sender_id=(select auth.uid()));
create policy "play receiver responds" on public.play_requests for update to authenticated using (receiver_id=(select auth.uid())) with check (receiver_id=(select auth.uid()));
create policy "own notifications" on public.notifications for select to authenticated using (user_id=(select auth.uid()));
create policy "reporter creates" on public.reports for insert to authenticated with check (reporter_id=(select auth.uid()));
create policy "reporter reads own" on public.reports for select to authenticated using (reporter_id=(select auth.uid()));

-- Profile is created server-side by an auth trigger; role is never trusted from user_metadata.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
declare base_handle text;
begin
  base_handle := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'user_name',new.raw_user_meta_data->>'name','qganger'),'[^a-zA-Z0-9_]','','g'));
  if char_length(base_handle)<3 then base_handle := 'qganger'; end if;
  insert into public.profiles(id,handle,display_name)
  values(new.id,left(base_handle,18)||'_'||substr(replace(new.id::text,'-',''),1,5),coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name','Q-GANG Member'));
  return new;
end $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.campfires(slug,name,description,steam_app_id) values
('valheim','Valheim','Keşfet, inşa et, savaş. Ateşin başında diğer Vikingleri bul.',892970),
('counter-strike-2','Counter-Strike 2','Takımını bul, maçını konuş, birlikte gir.',730),
('crimson-desert','Crimson Desert','Pywel kıtasındaki yolculuğu birlikte keşfet.',null);
