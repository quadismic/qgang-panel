create table public.codex_compilations(id uuid primary key default gen_random_uuid(),created_at timestamptz not null default now(),created_by uuid references public.profiles(id),include_decisions boolean not null,status text not null default 'pending' check(status in ('pending','generating','ready','failed')),snapshot jsonb not null,source_hash text,artifact_hash text,storage_path text,error_code text,completed_at timestamptz);
alter table public.codex_compilations enable row level security;
revoke all on public.codex_compilations from public,anon,authenticated;
grant select(id,created_at,include_decisions,status,source_hash,artifact_hash,storage_path,completed_at) on public.codex_compilations to authenticated;
create policy "ready compilations read" on public.codex_compilations for select to authenticated using(status='ready');
create index codex_compilation_ready on public.codex_compilations(include_decisions,created_at desc) where status='ready';
create or replace function public.begin_codex_compilation(p_decisions boolean) returns jsonb language plpgsql security definer set search_path='' as $$declare snap jsonb;rec public.codex_compilations%rowtype;begin
 if auth.uid() is null or not private.has_permission('members.manage') or not exists(select 1 from public.profiles where id=auth.uid() and role in ('founder','admin')) then raise exception 'compile_forbidden';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,55));
 if exists(select 1 from public.codex_compilations where created_by=auth.uid() and created_at>now()-interval '1 minute') then raise exception 'compile_rate_limit';end if;
 select coalesce(jsonb_agg(to_jsonb(r) order by number),'[]'::jsonb) into snap from public.regulations r where (kind in ('KURAL','İLKE','YÖNERGE') and status='yururlukte' and (effective_at is null or effective_at<=now())) or (p_decisions and kind='KARAR' and published_at is not null and status<>'taslak');
 if jsonb_array_length(snap)>1000 then raise exception 'compile_size_limit';end if;
 insert into public.codex_compilations(created_by,include_decisions,snapshot,status) values(auth.uid(),p_decisions,snap,'generating') returning * into rec;
 return to_jsonb(rec);
end$$;
revoke all on function public.begin_codex_compilation(boolean) from public,anon;
grant execute on function public.begin_codex_compilation(boolean) to authenticated;
create or replace function public.finish_codex_compilation(p_id uuid,p_source_hash text,p_artifact_hash text,p_path text,p_failed boolean default false) returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or not private.has_permission('members.manage') or not exists(select 1 from public.profiles where id=auth.uid() and role in ('founder','admin')) then raise exception 'compile_forbidden';end if;
 if p_failed is null then raise exception 'invalid_compilation_artifact';end if;
 if not p_failed and (p_path is null or p_source_hash is null or p_artifact_hash is null or p_path<>auth.uid()::text||'/'||p_id::text||'.pdf' or p_source_hash!~'^[0-9a-f]{64}$' or p_artifact_hash!~'^[0-9a-f]{64}$' or not exists(select 1 from storage.objects where bucket_id='qgang-documents' and name=p_path)) then raise exception 'invalid_compilation_artifact';end if;
 update public.codex_compilations set status=case when p_failed then 'failed' else 'ready' end,source_hash=p_source_hash,artifact_hash=p_artifact_hash,storage_path=case when p_failed then null else p_path end,completed_at=now(),error_code=case when p_failed then 'render_failed' else null end where id=p_id and created_by=auth.uid() and status='generating';
 if not found then raise exception 'compilation_not_pending';end if;
end$$;
revoke all on function public.finish_codex_compilation(uuid,text,text,text,boolean) from public,anon;
grant execute on function public.finish_codex_compilation(uuid,text,text,text,boolean) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('qgang-documents','qgang-documents',false,20971520,array['application/pdf']) on conflict(id) do nothing;
create policy "compile upload" on storage.objects for insert to authenticated with check(bucket_id='qgang-documents' and exists(select 1 from public.codex_compilations c where c.created_by=auth.uid() and c.status='generating' and name=auth.uid()::text||'/'||c.id::text||'.pdf') and private.has_permission('members.manage'));
create policy "compile download" on storage.objects for select to authenticated using(bucket_id='qgang-documents' and exists(select 1 from public.codex_compilations c where c.status='ready' and c.storage_path=name));
-- No update/delete policy: published artifacts cannot be replaced through client credentials.
create or replace function private.can_upload_compilation(object_name text) returns boolean language sql stable security definer set search_path='' as $$select auth.uid() is not null and private.has_permission('members.manage') and exists(select 1 from public.profiles where id=auth.uid() and role in ('founder','admin')) and exists(select 1 from public.codex_compilations where created_by=auth.uid() and status='generating' and object_name=auth.uid()::text||'/'||id::text||'.pdf')$$;
revoke all on function private.can_upload_compilation(text) from public,anon;
grant execute on function private.can_upload_compilation(text) to authenticated;
drop policy "compile upload" on storage.objects;
create policy "compile upload" on storage.objects for insert to authenticated with check(bucket_id='qgang-documents' and private.can_upload_compilation(name));
create or replace function public.current_codex_document(p_decisions boolean) returns jsonb language plpgsql security definer set search_path='' as $$declare snap jsonb;rec public.codex_compilations%rowtype;begin
 if auth.uid() is null then raise exception 'unauthorized';end if;
 select coalesce(jsonb_agg(to_jsonb(r) order by number),'[]'::jsonb) into snap from public.regulations r where (kind in ('KURAL','İLKE','YÖNERGE') and status='yururlukte' and (effective_at is null or effective_at<=now())) or (p_decisions and kind='KARAR' and published_at is not null and status<>'taslak');
 select * into rec from public.codex_compilations where include_decisions=p_decisions and status='ready' order by created_at desc limit 1;
 if not found then return null;end if;
 return jsonb_build_object('id',rec.id,'created_at',rec.created_at,'storage_path',rec.storage_path,'current',rec.snapshot=snap);
end$$;
revoke all on function public.current_codex_document(boolean) from public,anon;
grant execute on function public.current_codex_document(boolean) to authenticated;

create or replace function private.codex_compilation_immutable() returns trigger language plpgsql set search_path='' as $$begin
 if tg_op='DELETE' or old.status='ready' or new.snapshot is distinct from old.snapshot or new.id<>old.id or new.created_by is distinct from old.created_by or new.include_decisions<>old.include_decisions or new.created_at<>old.created_at then raise exception 'immutable_codex_compilation';end if;return new;
end$$;
revoke all on function private.codex_compilation_immutable() from public,anon,authenticated;
create trigger codex_compilation_immutable before update or delete on public.codex_compilations for each row execute function private.codex_compilation_immutable();
