-- ASTER / QAE Core Foundation
-- QAE entities are intentionally separate from human community memberships.

create table if not exists public.ai_entities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  function_title text not null,
  purpose text not null,
  status text not null default 'active' check (status in ('active','paused','retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_entity_tasks (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.ai_entities(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  instruction text not null,
  status text not null default 'queued' check (status in ('queued','processing','completed','failed','cancelled')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.ai_memory_proposals (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.ai_entities(id) on delete restrict,
  task_id uuid references public.ai_entity_tasks(id) on delete set null,
  proposed_by uuid references auth.users(id) on delete set null,
  title text not null,
  body text not null,
  source_type text not null,
  source_ref text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_institutional_memory (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.ai_entities(id) on delete restrict,
  proposal_id uuid unique references public.ai_memory_proposals(id) on delete restrict,
  title text not null,
  body text not null,
  source_type text not null,
  source_ref text,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_entity_activity (
  id bigint generated always as identity primary key,
  entity_id uuid not null references public.ai_entities(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  object_type text,
  object_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_entity_tasks_entity_status_idx
  on public.ai_entity_tasks(entity_id, status, created_at desc);
create index if not exists ai_memory_proposals_entity_status_idx
  on public.ai_memory_proposals(entity_id, status, created_at desc);
create index if not exists ai_institutional_memory_entity_created_idx
  on public.ai_institutional_memory(entity_id, created_at desc);
create index if not exists ai_entity_activity_entity_created_idx
  on public.ai_entity_activity(entity_id, created_at desc);

alter table public.ai_entities enable row level security;
alter table public.ai_entity_tasks enable row level security;
alter table public.ai_memory_proposals enable row level security;
alter table public.ai_institutional_memory enable row level security;
alter table public.ai_entity_activity enable row level security;

-- Read access follows authenticated platform access.
drop policy if exists "qae authenticated read" on public.ai_entities;
create policy "qae authenticated read" on public.ai_entities
for select to authenticated using (true);

drop policy if exists "qae tasks authenticated read" on public.ai_entity_tasks;
create policy "qae tasks authenticated read" on public.ai_entity_tasks
for select to authenticated using (true);

drop policy if exists "qae proposals authenticated read" on public.ai_memory_proposals;
create policy "qae proposals authenticated read" on public.ai_memory_proposals
for select to authenticated using (true);

drop policy if exists "qae memory authenticated read" on public.ai_institutional_memory;
create policy "qae memory authenticated read" on public.ai_institutional_memory
for select to authenticated using (true);

drop policy if exists "qae activity authenticated read" on public.ai_entity_activity;
create policy "qae activity authenticated read" on public.ai_entity_activity
for select to authenticated using (true);

-- Mutations are deliberately not exposed by permissive RLS.
-- Server-side privileged workflows / explicit RPCs will be introduced in the next wave.

insert into public.ai_entities (code, name, function_title, purpose)
values (
  'QAE-001',
  'ASTER',
  'Institutional Memory / Keeper of Records',
  'Preserve Q-GANG institutional memory, connect decisions, events, people, publications and records across time, and protect historical continuity.'
)
on conflict (code) do update set
  name = excluded.name,
  function_title = excluded.function_title,
  purpose = excluded.purpose,
  updated_at = now();

comment on table public.ai_entities is 'Persistent artificial entities of Q-GANG; separate from human memberships.';
comment on table public.ai_memory_proposals is 'Candidate institutional memories. AI output cannot become canonical memory without review.';
comment on table public.ai_institutional_memory is 'Human-approved canonical institutional memory.';
