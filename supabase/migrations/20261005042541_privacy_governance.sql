create table public.privacy_delegates(
 user_id uuid primary key references public.profiles(id),requests boolean not null default true,documents boolean not null default true,
 active boolean not null default true,granted_by uuid not null references public.profiles(id),updated_at timestamptz not null default now()
);
alter table public.privacy_delegates enable row level security;
revoke all on public.privacy_delegates from public,anon,authenticated;grant select on public.privacy_delegates to authenticated;
create or replace function private.privacy_authorized(capability text)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles p where p.id=auth.uid() and not p.is_suspended and
 (p.role='founder' or exists(select 1 from public.privacy_delegates d where d.user_id=p.id and d.active and p.role<>'guest' and exists(select 1 from public.community_memberships m where m.user_id=p.id and m.status='active') and
 case capability when 'requests' then d.requests when 'documents' then d.documents else false end)));
$$;
revoke all on function private.privacy_authorized(text) from public,anon;grant execute on function private.privacy_authorized(text) to authenticated;
create policy privacy_delegate_read on public.privacy_delegates for select to authenticated
using(user_id=auth.uid() or exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended));
create or replace function public.privacy_capabilities() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('requests',private.privacy_authorized('requests'),'documents',private.privacy_authorized('documents'),'founder',exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended));
$$;
create table public.privacy_governance_events(id uuid primary key default gen_random_uuid(),actor_id uuid not null references public.profiles(id),kind text not null,subject text not null,detail jsonb not null,created_at timestamptz not null default now());
alter table public.privacy_governance_events enable row level security;
revoke all on public.privacy_governance_events from public,anon,authenticated;grant select on public.privacy_governance_events to authenticated;
create policy privacy_governance_read on public.privacy_governance_events for select to authenticated using(private.privacy_authorized('documents'));
create or replace function public.set_privacy_delegate(target_user uuid,can_requests boolean,can_documents boolean,is_active boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended) then raise exception 'not_authorized';end if;
 if not exists(select 1 from public.profiles p where p.id=target_user and p.role<>'founder' and (not is_active or (p.role<>'guest' and not p.is_suspended and exists(select 1 from public.community_memberships m where m.user_id=p.id and m.status='active')))) then raise exception 'invalid_delegate';end if;
 insert into public.privacy_delegates(user_id,requests,documents,active,granted_by) values(target_user,can_requests,can_documents,is_active,auth.uid())
 on conflict(user_id) do update set requests=excluded.requests,documents=excluded.documents,active=excluded.active,granted_by=excluded.granted_by,updated_at=now();
 insert into public.privacy_governance_events(actor_id,kind,subject,detail) values(auth.uid(),'delegate_updated',target_user::text,jsonb_build_object('requests',can_requests,'documents',can_documents,'active',is_active));
end $$;
drop policy privacy_request_read on public.privacy_requests;
create policy privacy_request_read on public.privacy_requests for select to authenticated using(user_id=auth.uid() or private.privacy_authorized('requests'));
create or replace function public.review_privacy_request(request_id uuid,next_status text,decision text)
returns void language plpgsql security definer set search_path='' as $$
declare request_kind text;is_leader boolean;
begin
 if not private.privacy_authorized('requests') then raise exception 'not_authorized';end if;
 select exists(select 1 from public.profiles where id=auth.uid() and role='founder') into is_leader;
 if next_status not in ('reviewing','resolved','rejected') or char_length(trim(decision)) not between 10 and 3000 then raise exception 'invalid_decision';end if;
 select r.kind into request_kind from public.privacy_requests r where r.id=request_id and r.status in ('pending','reviewing') for update;
 if not found then raise exception 'request_not_open';end if;
 if not is_leader and request_kind in ('closure','erasure') and next_status<>'reviewing' then raise exception 'leader_review_required';end if;
 update public.privacy_requests r set status=next_status,response=trim(decision),updated_at=now() where r.id=request_id;
 insert into public.privacy_request_events(request_id,actor_id,status,response) values(request_id,auth.uid(),next_status,trim(decision));
end $$;
create table public.privacy_documents(slug text primary key check(slug in ('aydinlatma','cerezler','saklama')),title text not null,draft_body text not null default '',draft_revision integer not null default 0,published_revision integer,updated_at timestamptz not null default now());
create table public.privacy_document_versions(slug text not null references public.privacy_documents(slug),revision integer not null,title text not null,body text not null,review jsonb not null,reason text not null,actor_id uuid not null references public.profiles(id),published_at timestamptz not null default now(),primary key(slug,revision));
alter table public.privacy_documents enable row level security;alter table public.privacy_document_versions enable row level security;
revoke all on public.privacy_documents,public.privacy_document_versions from public,anon,authenticated;
grant select on public.privacy_documents,public.privacy_document_versions to authenticated;
create policy privacy_document_read on public.privacy_documents for select to authenticated using(private.privacy_authorized('documents'));
create policy privacy_version_read on public.privacy_document_versions for select to authenticated using(private.privacy_authorized('documents'));
insert into public.privacy_documents(slug,title) values('aydinlatma','Kişisel Verilerin Korunması'),('cerezler','Çerez ve Dış İçerik Bilgisi'),('saklama','Saklama ve İmha Düzeni');
create or replace function public.save_privacy_document(document_slug text,document_title text,document_body text,expected_revision integer,publish boolean,change_reason text,review_checks jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare d public.privacy_documents%rowtype;version_no integer;
begin
 if not private.privacy_authorized('documents') then raise exception 'not_authorized';end if;
 if char_length(trim(document_title)) not between 3 and 150 or char_length(document_body) not between 20 and 50000 or char_length(trim(change_reason)) not between 10 and 2000 then raise exception 'invalid_document';end if;
 select * into d from public.privacy_documents where slug=document_slug for update;
 if expected_revision is null or not found or d.draft_revision<>expected_revision then raise exception 'document_conflict';end if;
 if publish then
 if not exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended) then raise exception 'leader_publish_required';end if;
 if not coalesce(review_checks @> '{"categories":true,"purposes":true,"legal_basis":true,"recipients":true,"transfers":true,"retention":true}'::jsonb,false) then raise exception 'review_required';end if;
 select coalesce(max(v.revision),0)+1 into version_no from public.privacy_document_versions v where v.slug=document_slug;
 insert into public.privacy_document_versions(slug,revision,title,body,review,reason,actor_id) values(document_slug,version_no,trim(document_title),document_body,review_checks,trim(change_reason),auth.uid());
 end if;
 update public.privacy_documents set title=trim(document_title),draft_body=document_body,draft_revision=draft_revision+1,published_revision=case when publish then version_no else published_revision end,updated_at=now() where slug=document_slug;
 insert into public.privacy_governance_events(actor_id,kind,subject,detail) values(auth.uid(),case when publish then 'document_published' else 'document_drafted' end,document_slug,jsonb_build_object('reason',trim(change_reason),'revision',version_no));
end $$;
create or replace function public.get_published_privacy_document(document_slug text)
returns table(title text,body text,revision integer,published_at timestamptz) language sql stable security definer set search_path='' as $$
 select v.title,v.body,v.revision,v.published_at from public.privacy_documents d join public.privacy_document_versions v on v.slug=d.slug and v.revision=d.published_revision where d.slug=document_slug;
$$;
create table public.privacy_settings(singleton boolean primary key default true check(singleton),contact_emails text[] not null,retention_rules jsonb not null,updated_at timestamptz not null default now());
alter table public.privacy_settings enable row level security;
revoke all on public.privacy_settings from public,anon,authenticated;grant select on public.privacy_settings to authenticated;
create policy privacy_settings_read on public.privacy_settings for select to authenticated using(private.privacy_authorized('documents'));
insert into public.privacy_settings(singleton,contact_emails,retention_rules) values(true,array['ofkarabul@gmail.com','quadismic@gmail.com'],'{"security_logs_days":90,"notifications_days":90,"aster_days":90,"unused_media_days":30,"requests_years":3,"destruction_audit_years":3,"review_interval_days":30}'::jsonb);
create or replace function public.get_privacy_contacts() returns text[] language sql stable security definer set search_path='' as $$select contact_emails from public.privacy_settings where singleton$$;
create or replace function public.save_privacy_settings(emails text[],rules jsonb,reason text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended) then raise exception 'not_authorized';end if;
 if cardinality(emails) not between 1 and 10 or exists(select 1 from unnest(emails) e where e is null or e!~ '^[^[:space:]@<>]+@[^[:space:]@<>]+\.[^[:space:]@<>]+$') or char_length(trim(reason)) not between 10 and 2000 then raise exception 'invalid_settings';end if;
 if rules is null or jsonb_typeof(rules)<>'object' or not (rules ?& array['security_logs_days','notifications_days','aster_days','unused_media_days','requests_years','destruction_audit_years','review_interval_days']) then raise exception 'invalid_retention';end if;
 if exists(select 1 from jsonb_each(rules) e where jsonb_typeof(e.value)<>'number' or e.value::text !~ '^[0-9]+$') then raise exception 'invalid_retention';end if;
 if (rules->>'security_logs_days')::int not between 1 and 365 or (rules->>'notifications_days')::int not between 1 and 365 or (rules->>'aster_days')::int not between 1 and 365 or (rules->>'unused_media_days')::int not between 1 and 90 or (rules->>'requests_years')::int not between 1 and 10 or (rules->>'destruction_audit_years')::int not between 3 and 10 or (rules->>'review_interval_days')::int not between 1 and 180 then raise exception 'invalid_retention';end if;
 update public.privacy_settings set contact_emails=emails,retention_rules=rules,updated_at=now() where singleton;
 insert into public.privacy_governance_events(actor_id,kind,subject,detail) values(auth.uid(),'settings_updated','privacy',jsonb_build_object('reason',trim(reason),'rules',rules,'emails',emails));
end $$;
revoke all on function public.privacy_capabilities(),public.set_privacy_delegate(uuid,boolean,boolean,boolean),public.save_privacy_document(text,text,text,integer,boolean,text,jsonb),public.save_privacy_settings(text[],jsonb,text) from public,anon;
grant execute on function public.privacy_capabilities(),public.set_privacy_delegate(uuid,boolean,boolean,boolean),public.save_privacy_document(text,text,text,integer,boolean,text,jsonb),public.save_privacy_settings(text[],jsonb,text) to authenticated;
revoke all on function public.get_published_privacy_document(text),public.get_privacy_contacts() from public;
grant execute on function public.get_published_privacy_document(text),public.get_privacy_contacts() to anon,authenticated;
