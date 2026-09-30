-- Controlled ASTER workflows.
-- Founder is the initial human reviewer. This can later move to an explicit QAE permission.

create or replace function public.qae_is_manager()
returns boolean language sql stable security definer set search_path=public
as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='founder');
$$;

create or replace function public.qae_create_memory_proposal(
  p_entity_code text, p_title text, p_body text, p_source_type text, p_source_ref text default null
) returns uuid language plpgsql security definer set search_path=public
as $$
declare v_entity uuid; v_id uuid;
begin
  if not public.qae_is_manager() then raise exception 'not authorized'; end if;
  if length(trim(p_title))<2 or length(trim(p_body))<2 then raise exception 'invalid proposal'; end if;
  select id into v_entity from public.ai_entities where code=p_entity_code and status='active';
  if v_entity is null then raise exception 'entity unavailable'; end if;
  insert into public.ai_memory_proposals(entity_id,proposed_by,title,body,source_type,source_ref)
  values(v_entity,auth.uid(),trim(p_title),trim(p_body),trim(p_source_type),nullif(trim(p_source_ref),''))
  returning id into v_id;
  insert into public.ai_entity_activity(entity_id,actor_id,event_type,object_type,object_id)
  values(v_entity,auth.uid(),'memory.proposed','memory_proposal',v_id::text);
  return v_id;
end $$;

create or replace function public.qae_review_memory_proposal(p_proposal_id uuid,p_decision text)
returns void language plpgsql security definer set search_path=public
as $$
declare v public.ai_memory_proposals%rowtype;
begin
  if not public.qae_is_manager() then raise exception 'not authorized'; end if;
  if p_decision not in ('approved','rejected') then raise exception 'invalid decision'; end if;
  select * into v from public.ai_memory_proposals where id=p_proposal_id for update;
  if v.id is null or v.status<>'pending' then raise exception 'proposal unavailable'; end if;
  update public.ai_memory_proposals set status=p_decision,reviewed_by=auth.uid(),reviewed_at=now() where id=v.id;
  if p_decision='approved' then
    insert into public.ai_institutional_memory(entity_id,proposal_id,title,body,source_type,source_ref,approved_by)
    values(v.entity_id,v.id,v.title,v.body,v.source_type,v.source_ref,auth.uid());
  end if;
  insert into public.ai_entity_activity(entity_id,actor_id,event_type,object_type,object_id,metadata)
  values(v.entity_id,auth.uid(),'memory.'||p_decision,'memory_proposal',v.id::text,jsonb_build_object('decision',p_decision));
end $$;

revoke all on function public.qae_is_manager() from public;
revoke all on function public.qae_create_memory_proposal(text,text,text,text,text) from public;
revoke all on function public.qae_review_memory_proposal(uuid,text) from public;
grant execute on function public.qae_is_manager() to authenticated;
grant execute on function public.qae_create_memory_proposal(text,text,text,text,text) to authenticated;
grant execute on function public.qae_review_memory_proposal(uuid,text) to authenticated;
