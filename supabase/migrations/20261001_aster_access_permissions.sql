-- QAE permissions integrate ASTER with the canonical Access Center.
insert into public.role_permissions(role,permission,enabled)
select r::public.qgang_role,p.permission,
 case
  when r='founder' then true
  when r='admin' and p.permission in ('ai.view','ai.invoke') then true
  else false
 end
from unnest(array['founder','admin','moderator','creator','member']) r
cross join (values ('ai.view'),('ai.invoke'),('ai.memory.review'),('ai.manage')) p(permission)
on conflict(role,permission) do update set enabled=excluded.enabled;

create or replace function public.qae_is_manager()
returns boolean language sql stable security definer set search_path=public,private
as $$ select private.has_permission('ai.manage') or private.has_permission('ai.memory.review'); $$;

create or replace function public.qae_can_invoke()
returns boolean language sql stable security definer set search_path=public,private
as $$ select private.has_permission('ai.invoke') or private.has_permission('ai.manage'); $$;

revoke all on function public.qae_is_manager() from public;
revoke all on function public.qae_can_invoke() from public;
grant execute on function public.qae_is_manager() to authenticated;
grant execute on function public.qae_can_invoke() to authenticated;

drop policy if exists "qae tasks authenticated read" on public.ai_entity_tasks;
create policy "qae tasks permission read" on public.ai_entity_tasks for select to authenticated
using ((select private.has_permission('ai.view')) or (select private.has_permission('ai.manage')));

drop policy if exists "qae proposals authenticated read" on public.ai_memory_proposals;
create policy "qae proposals permission read" on public.ai_memory_proposals for select to authenticated
using ((select private.has_permission('ai.memory.review')) or (select private.has_permission('ai.manage')));

drop policy if exists "qae activity authenticated read" on public.ai_entity_activity;
create policy "qae activity permission read" on public.ai_entity_activity for select to authenticated
using ((select private.has_permission('ai.view')) or (select private.has_permission('ai.manage')));

create or replace function public.qae_create_task(p_entity_code text,p_title text,p_instruction text,p_source_type text default 'manual',p_source_ref text default null)
returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_entity uuid;v_id uuid;
begin
 if not public.qae_can_invoke() then raise exception 'not authorized';end if;
 if length(trim(p_title))<2 or length(trim(p_instruction))<2 then raise exception 'invalid task';end if;
 select id into v_entity from public.ai_entities where code=p_entity_code and status='active';
 if v_entity is null then raise exception 'entity unavailable';end if;
 insert into public.ai_entity_tasks(entity_id,created_by,title,instruction,source_type,source_ref)
 values(v_entity,auth.uid(),trim(p_title),trim(p_instruction),trim(p_source_type),nullif(trim(p_source_ref),''))
 returning id into v_id;
 insert into public.ai_entity_activity(entity_id,actor_id,event_type,object_type,object_id)
 values(v_entity,auth.uid(),'task.queued','task',v_id::text);
 return v_id;
end $$;
revoke all on function public.qae_create_task(text,text,text,text,text) from public;
grant execute on function public.qae_create_task(text,text,text,text,text) to authenticated;
