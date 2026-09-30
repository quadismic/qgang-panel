-- ASTER task engine: human-triggered, provider-executed, audited.
alter table public.ai_entity_tasks add column if not exists source_type text;
alter table public.ai_entity_tasks add column if not exists source_ref text;
alter table public.ai_entity_tasks add column if not exists provider text;
alter table public.ai_entity_tasks add column if not exists model text;
alter table public.ai_entity_tasks add column if not exists error_message text;

create or replace function public.qae_create_task(p_entity_code text,p_title text,p_instruction text,p_source_type text default 'manual',p_source_ref text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_entity uuid;v_id uuid;
begin
 if not public.qae_is_manager() then raise exception 'not authorized';end if;
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

create or replace function public.qae_claim_task(p_task_id uuid)
returns public.ai_entity_tasks language plpgsql security definer set search_path=public as $$
declare v public.ai_entity_tasks%rowtype;
begin
 if not public.qae_is_manager() then raise exception 'not authorized';end if;
 update public.ai_entity_tasks set status='processing',error_message=null
 where id=p_task_id and status='queued' returning * into v;
 if v.id is null then raise exception 'task unavailable';end if;
 insert into public.ai_entity_activity(entity_id,actor_id,event_type,object_type,object_id)
 values(v.entity_id,auth.uid(),'task.processing','task',v.id::text);
 return v;
end $$;

create or replace function public.qae_complete_task(p_task_id uuid,p_title text,p_body text,p_provider text,p_model text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v public.ai_entity_tasks%rowtype;v_proposal uuid;
begin
 if not public.qae_is_manager() then raise exception 'not authorized';end if;
 select * into v from public.ai_entity_tasks where id=p_task_id and status='processing' for update;
 if v.id is null then raise exception 'task unavailable';end if;
 insert into public.ai_memory_proposals(entity_id,task_id,proposed_by,title,body,source_type,source_ref)
 values(v.entity_id,v.id,auth.uid(),trim(p_title),trim(p_body),coalesce(v.source_type,'manual'),v.source_ref)
 returning id into v_proposal;
 update public.ai_entity_tasks set status='completed',completed_at=now(),provider=p_provider,model=p_model where id=v.id;
 insert into public.ai_entity_activity(entity_id,actor_id,event_type,object_type,object_id,metadata)
 values(v.entity_id,auth.uid(),'task.completed','task',v.id::text,jsonb_build_object('proposal_id',v_proposal,'provider',p_provider,'model',p_model));
 return v_proposal;
end $$;

create or replace function public.qae_fail_task(p_task_id uuid,p_error text)
returns void language plpgsql security definer set search_path=public as $$
declare v public.ai_entity_tasks%rowtype;
begin
 if not public.qae_is_manager() then raise exception 'not authorized';end if;
 update public.ai_entity_tasks set status='failed',completed_at=now(),error_message=left(p_error,500)
 where id=p_task_id and status='processing' returning * into v;
 if v.id is not null then insert into public.ai_entity_activity(entity_id,actor_id,event_type,object_type,object_id)
 values(v.entity_id,auth.uid(),'task.failed','task',v.id::text);end if;
end $$;

revoke all on function public.qae_create_task(text,text,text,text,text) from public;
revoke all on function public.qae_claim_task(uuid) from public;
revoke all on function public.qae_complete_task(uuid,text,text,text,text) from public;
revoke all on function public.qae_fail_task(uuid,text) from public;
grant execute on function public.qae_create_task(text,text,text,text,text) to authenticated;
grant execute on function public.qae_claim_task(uuid) to authenticated;
grant execute on function public.qae_complete_task(uuid,text,text,text,text) to authenticated;
grant execute on function public.qae_fail_task(uuid,text) to authenticated;
