-- Q-GANG 2.2: canonical editorial publications and explicitly permissioned deletes.
-- This migration is forward-only. It does not alter membership or role lifecycle rules.

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text,
  body text not null default '',
  cover_url text,
  content_type text not null default 'thought' check (content_type in ('research','review','thought','game','technology','video')),
  status text not null default 'draft' check (status in ('idea','research','draft','video_preparation','published')),
  author_id uuid not null references public.profiles(id) on delete restrict,
  youtube_url text,
  seo_title text,
  seo_description text,
  reading_minutes integer not null default 1 check (reading_minutes between 1 and 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists publications_status_published_at_idx on public.publications(status,published_at desc);
create index if not exists publications_author_id_idx on public.publications(author_id);
alter table public.publications enable row level security;
grant select on public.publications to anon, authenticated;
grant insert, update, delete on public.publications to authenticated;

create policy "published publications are public" on public.publications
for select to anon, authenticated using (status = 'published');
create policy "editorial staff reads publications" on public.publications
for select to authenticated using ((select private.has_permission('publications.view')) or (select private.has_permission('publications.write')));
create policy "editorial staff writes publications" on public.publications
for insert to authenticated with check ((select private.has_permission('publications.write')) and author_id = (select auth.uid()));
create policy "editorial staff updates publications" on public.publications
for update to authenticated using ((select private.has_permission('publications.write')))
with check ((select private.has_permission('publications.write')));
create policy "editorial staff deletes publications" on public.publications
for delete to authenticated using ((select private.has_permission('publications.delete')));

insert into public.role_permissions(role,permission,enabled)
select r::public.qgang_role,p.permission,
  case
    when r = 'founder' then true
    when r = 'admin' and p.permission in ('announcements.delete','budget.delete','publications.view','publications.write','publications.publish','publications.delete') then true
    when r = 'moderator' and p.permission in ('publications.view','publications.write','publications.publish') then true
    when r = 'creator' and p.permission in ('publications.view','publications.write') then true
    else false
  end
from unnest(array['founder','admin','moderator','creator','member','guest']) r
cross join (values ('announcements.delete'),('budget.delete'),('publications.view'),('publications.write'),('publications.publish'),('publications.delete')) p(permission)
on conflict(role,permission) do nothing;

-- The earlier all-operations announcement policy would implicitly permit delete.
drop policy if exists "permission manages announcements" on public.announcements;
create policy "permission creates announcements" on public.announcements
for insert to authenticated with check ((select private.has_permission('announcements.publish')));
create policy "permission updates announcements" on public.announcements
for update to authenticated using ((select private.has_permission('announcements.publish')))
with check ((select private.has_permission('announcements.publish')));
create policy "permission deletes announcements" on public.announcements
for delete to authenticated using ((select private.has_permission('announcements.delete')));
create policy "permission deletes unreversed fund movements" on public.fund_transactions
for delete to authenticated using ((select private.has_permission('budget.delete')) and reversed_at is null);

create or replace function public.set_role_permission(p_role text,p_permission text,p_enabled boolean)
returns void language plpgsql security definer set search_path='public','private' as $$
declare v_uid uuid:=auth.uid(); v_actor public.qgang_role;
begin
 select role into v_actor from public.profiles where id=v_uid;
 if v_actor is distinct from 'founder'::public.qgang_role then raise exception 'founder_only'; end if;
 if p_role='founder' then raise exception 'founder_locked'; end if;
 if p_role not in ('admin','moderator','creator','member','guest') then raise exception 'invalid_role'; end if;
 if p_permission not in ('members.view','members.manage','members.delete','discipline.view','discipline.issue','discipline.review','announcements.publish','announcements.delete','budget.view','budget.manage','budget.delete','design.manage','access.manage','publications.view','publications.write','publications.publish','publications.delete') then raise exception 'invalid_permission'; end if;
 if p_permission='access.manage' and p_enabled then raise exception 'access_manage_founder_only'; end if;
 insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role,p_permission,p_enabled,v_uid,now()) on conflict(role,permission) do update set enabled=excluded.enabled,updated_by=v_uid,updated_at=now();
 if p_enabled and p_permission='members.manage' then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role,'members.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission in ('discipline.issue','discipline.review') then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role,'discipline.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission in ('budget.manage','budget.delete') then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role,'budget.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission in ('publications.write','publications.publish','publications.delete') then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role,'publications.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission='publications.publish' then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role,'publications.write',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if not p_enabled and p_permission='members.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission='members.manage'; end if;
 if not p_enabled and p_permission='discipline.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission in ('discipline.issue','discipline.review'); end if;
 if not p_enabled and p_permission='budget.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission in ('budget.manage','budget.delete'); end if;
 if not p_enabled and p_permission='publications.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission in ('publications.write','publications.publish','publications.delete'); end if;
 if not p_enabled and p_permission='publications.write' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission='publications.publish'; end if;
end$$;
