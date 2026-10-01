-- ASTER consultation: private, sourced conversations between a human and QAE-001.
create table if not exists public.ai_conversations(
 id uuid primary key default gen_random_uuid(),
 entity_id uuid not null references public.ai_entities(id) on delete restrict,
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null default 'Aster ile görüşme',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.ai_messages(
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
 role text not null check(role in ('user','assistant')),
 body text not null,
 sources jsonb not null default '[]'::jsonb,
 provider text,
 model text,
 created_at timestamptz not null default now()
);
create index if not exists ai_conversations_user_updated_idx on public.ai_conversations(user_id,updated_at desc);
create index if not exists ai_messages_conversation_created_idx on public.ai_messages(conversation_id,created_at);
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
create policy "qae conversation owner read" on public.ai_conversations for select to authenticated using(user_id=auth.uid());
create policy "qae message owner read" on public.ai_messages for select to authenticated using(exists(select 1 from public.ai_conversations c where c.id=conversation_id and c.user_id=auth.uid()));

create or replace function public.qae_chat_append(p_conversation_id uuid,p_role text,p_body text,p_sources jsonb default '[]'::jsonb,p_provider text default null,p_model text default null)
returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_entity uuid;v_conversation uuid;v_message uuid;
begin
 if not public.qae_can_invoke() then raise exception 'not authorized'; end if;
 if p_role not in ('user','assistant') or length(trim(p_body))<1 then raise exception 'invalid message'; end if;
 select id into v_entity from public.ai_entities where code='QAE-001' and status='active';
 if p_conversation_id is null then
   if p_role<>'user' then raise exception 'conversation must begin with user'; end if;
   insert into public.ai_conversations(entity_id,user_id,title) values(v_entity,auth.uid(),left(trim(p_body),80)) returning id into v_conversation;
 else
   select id into v_conversation from public.ai_conversations where id=p_conversation_id and user_id=auth.uid();
   if v_conversation is null then raise exception 'conversation unavailable'; end if;
 end if;
 insert into public.ai_messages(conversation_id,role,body,sources,provider,model)
 values(v_conversation,p_role,trim(p_body),coalesce(p_sources,'[]'::jsonb),p_provider,p_model) returning id into v_message;
 update public.ai_conversations set updated_at=now() where id=v_conversation;
 return v_conversation;
end $$;
revoke all on function public.qae_chat_append(uuid,text,text,jsonb,text,text) from public,anon;
grant execute on function public.qae_chat_append(uuid,text,text,jsonb,text,text) to authenticated;
