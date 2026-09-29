-- Q-GANG 2.2 · Codex hierarchy, effective dates and immutable revision history
alter table if exists public.regulations
  add column if not exists section_number text,
  add column if not exists revision integer not null default 1,
  add column if not exists change_reason text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.regulation_revisions (
  id uuid primary key default gen_random_uuid(),
  regulation_id uuid not null references public.regulations(id) on delete cascade,
  revision integer not null,
  section_number text,
  number text,
  kind text not null,
  title text not null,
  body text not null default '',
  status text not null,
  effective_at timestamptz,
  change_reason text,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_at timestamptz not null default now(),
  unique(regulation_id,revision)
);

alter table public.regulation_revisions enable row level security;

drop policy if exists "regulation revisions readable" on public.regulation_revisions;
create policy "regulation revisions readable"
on public.regulation_revisions for select
using (true);

create unique index if not exists regulations_number_unique_idx on public.regulations(number) where number is not null;
create index if not exists regulations_section_number_idx on public.regulations(section_number,number);
create index if not exists regulation_revisions_regulation_idx on public.regulation_revisions(regulation_id,revision desc);

create or replace function public.archive_regulation_revision()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if row(new.title,new.body,new.kind,new.number,new.status,new.effective_at,new.section_number,new.change_reason)
     is distinct from
     row(old.title,old.body,old.kind,old.number,old.status,old.effective_at,old.section_number,old.change_reason) then
    insert into public.regulation_revisions(
      regulation_id,revision,section_number,number,kind,title,body,status,effective_at,change_reason,changed_by,changed_at
    ) values (
      old.id,old.revision,old.section_number,old.number,old.kind,old.title,coalesce(old.body,''),old.status,
      old.effective_at,old.change_reason,auth.uid(),now()
    ) on conflict (regulation_id,revision) do nothing;
    new.revision := old.revision + 1;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists archive_regulation_revision on public.regulations;
create trigger archive_regulation_revision
before update on public.regulations
for each row execute function public.archive_regulation_revision();
