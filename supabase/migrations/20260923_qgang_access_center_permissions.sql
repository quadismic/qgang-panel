-- Q-GANG Access Center: canonical role/permission matrix.
alter table public.role_permissions add column if not exists enabled boolean not null default true;
alter table public.role_permissions add column if not exists updated_at timestamptz not null default now();
alter table public.role_permissions add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.role_permissions enable row level security;
drop policy if exists "authenticated read role permissions" on public.role_permissions;
create policy "authenticated read role permissions" on public.role_permissions for select to authenticated using (true);
drop policy if exists "founder manages role permissions" on public.role_permissions;
create policy "founder manages role permissions" on public.role_permissions for all to authenticated using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='founder')) with check (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='founder'));
insert into public.role_permissions(role,permission,enabled)
select r::public.qgang_role,p.permission,case when r='founder' then true when r='admin' and p.permission in ('members.view','members.manage','discipline.view','discipline.issue','discipline.review','announcements.publish','budget.view','budget.manage','design.manage') then true when r='moderator' and p.permission in ('discipline.view','discipline.issue','budget.view') then true when r in ('creator','member') and p.permission='budget.view' then true else false end
from unnest(array['founder','admin','moderator','creator','member']) r cross join (values ('members.view'),('members.manage'),('members.delete'),('discipline.view'),('discipline.issue'),('discipline.review'),('announcements.publish'),('budget.view'),('budget.manage'),('design.manage'),('access.manage')) p(permission)
on conflict(role,permission) do update set enabled=excluded.enabled;