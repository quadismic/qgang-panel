-- Enforce authorization at the Data API boundary, preserving trusted server workers.
begin;
create or replace function private.has_permission(required_permission text)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and not coalesce(p.is_suspended,false)
 and (p.role='founder' or exists(select 1 from public.role_permissions rp where rp.role=p.role and rp.permission=required_permission and rp.enabled)));
$$;
create or replace function private.guard_publication_publish() returns trigger
language plpgsql security invoker set search_path='' as $$begin
 if current_user in ('anon','authenticated') then
  if tg_op='INSERT' then
   if new.status='published' and not private.has_permission('publications.publish') then raise exception 'publish_permission_required' using errcode='42501';end if;
  elsif (old.status='published' or new.status='published') and not private.has_permission('publications.publish') then
   raise exception 'publish_permission_required' using errcode='42501';
  end if;
 end if;return new;
end$$;
revoke all on function private.guard_publication_publish() from public,anon,authenticated;
create trigger security_publication_publish before insert or update on public.publications for each row execute function private.guard_publication_publish();

create or replace function private.guard_membership_authority() returns trigger
language plpgsql security invoker set search_path='' as $$
declare actor public.qgang_role;target public.qgang_role;target_id uuid;
begin
 -- Internal identity claims and ERA workers are SECURITY DEFINER. The direct Data API is not.
 if current_user not in ('anon','authenticated') then if tg_op='DELETE' then return old;else return new;end if;end if;
 target_id:=case when tg_op='DELETE' then old.user_id else new.user_id end;
 select role into actor from public.profiles where id=auth.uid() and not coalesce(is_suspended,false);
 select role into target from public.profiles where id=target_id;
 if not private.has_permission('members.manage') or auth.uid()=target_id or target='founder' or target is null
 or not (actor='founder' or actor='admin' and target in ('moderator','creator','member','guest')) then
 raise exception 'membership_hierarchy_denied' using errcode='42501';end if;
 if tg_op='UPDATE' and (new.user_id is distinct from old.user_id or new.member_no is distinct from old.member_no or new.era is distinct from old.era or new.seal is distinct from old.seal or new.joined_at is distinct from old.joined_at or new.created_at is distinct from old.created_at) then
 raise exception 'membership_identity_immutable' using errcode='42501';end if;
 if tg_op='INSERT' and (new.era is not null and new.era is distinct from (select current_era from public.qgang_identity_settings where singleton) or new.seal is not null) then
 raise exception 'membership_identity_managed' using errcode='42501';end if;
 if tg_op='DELETE' then return old;end if;
 if tg_op='INSERT' then new.joined_at:=now();new.created_at:=now();new.granted_by:=auth.uid();end if;return new;
end$$;
revoke all on function private.guard_membership_authority() from public,anon,authenticated;
-- Run before the existing identity assignment trigger.
create trigger aaa_security_membership before insert or update or delete on public.community_memberships for each row execute function private.guard_membership_authority();

-- Notifications are generated from persisted operations, never arbitrary client text.
drop policy if exists "authorized actors create notifications" on public.notifications;
revoke insert on public.notifications from public,authenticated,anon;
-- Only a read marker can be changed by its recipient.
revoke update on public.notifications from public,authenticated,anon;
grant update(read_at) on public.notifications to authenticated;
update storage.buckets set file_size_limit=6291456,allowed_mime_types=array['image/png','image/jpeg','image/webp'] where id='qgang-banners';
CREATE OR REPLACE FUNCTION public.set_badge_condition(p_id uuid, p_rule jsonb, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare b public.badges%rowtype;begin
 if exists(select 1 from public.profiles where id=auth.uid() and is_suspended) then raise exception 'account_suspended' using errcode='42501';end if;

 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='founder') then raise exception 'founder_required';end if;
 if length(trim(coalesce(p_reason,'')))<3 or length(p_reason)>2000 then raise exception 'badge_reason_required';end if;
 select * into b from public.badges where id=p_id for update;if not found then raise exception 'badge_unavailable';end if;
 if b.slug='ilk-halka' then
 if p_rule->>'kind'<>'member-login-cutoff' or p_rule->>'timezone'<>'Europe/Istanbul' or p_rule->>'until' is null then raise exception 'invalid_badge_condition';end if;
 elsif b.slug='kidem-nisani' then
 if p_rule->>'kind'<>'manual-tenure' or (p_rule->>'days')::integer not between 1 and 36500 then raise exception 'invalid_badge_condition';end if;
 elsif b.slug='muellif' then
 if p_rule->>'kind'<>'published-work' or (p_rule->>'count')::integer not between 1 and 10000 then raise exception 'invalid_badge_condition';end if;
 else raise exception 'unsupported_badge_condition';end if;
 if jsonb_typeof(p_rule)<>'object' or p_rule->>'kind' is null or (b.slug='ilk-halka' and (p_rule->>'until' is null or p_rule->>'timezone' is null)) or (b.slug='kidem-nisani' and p_rule->>'days' is null) or (b.slug='muellif' and p_rule->>'count' is null) then raise exception 'invalid_badge_condition';end if;
 update public.badges set rule=p_rule,updated_at=now() where id=b.id;
 insert into public.badge_catalog_events(badge_id,actor_id,event,reason,before_record,after_record) values(b.id,auth.uid(),'condition_updated',p_reason,to_jsonb(b),(select to_jsonb(x) from public.badges x where x.id=b.id));
end$function$;

CREATE OR REPLACE FUNCTION public.advance_qgang_era()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid(); new_era integer;
begin
 if exists(select 1 from public.profiles where id=auth.uid() and is_suspended) then raise exception 'account_suspended' using errcode='42501';end if;

  if uid is null or not exists(select 1 from public.profiles where id=uid and role='founder') then raise exception 'forbidden'; end if;
  update public.qgang_identity_settings set current_era=current_era+1,updated_at=now(),updated_by=uid where singleton=true returning current_era into new_era;
  return new_era;
end $function$;

CREATE OR REPLACE FUNCTION public.set_role_permission(p_role text, p_permission text, p_enabled boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
declare v_uid uuid:=auth.uid(); v_actor public.qgang_role;
begin
 if exists(select 1 from public.profiles where id=auth.uid() and is_suspended) then raise exception 'account_suspended' using errcode='42501';end if;

 select role into v_actor from public.profiles where id=v_uid;
 if v_actor is distinct from 'founder'::public.qgang_role then raise exception 'founder_only'; end if;
 if p_role='founder' then raise exception 'founder_locked'; end if;
 if p_role not in ('admin','moderator','creator','member','guest') then raise exception 'invalid_role'; end if;
 if p_permission not in ('members.view','members.manage','members.delete','discipline.view','discipline.issue','discipline.review','announcements.publish','announcements.delete','budget.view','budget.manage','budget.delete','design.manage','access.manage','publications.view','publications.write','publications.publish','publications.delete','events.view','events.propose','events.manage','events.publish','events.attendance','events.archive','events.settings') then raise exception 'invalid_permission'; end if;
 if p_permission='access.manage' and p_enabled then raise exception 'access_manage_founder_only'; end if;
 insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,p_permission,p_enabled,v_uid,now()) on conflict(role,permission) do update set enabled=excluded.enabled,updated_by=v_uid,updated_at=now();
 if p_enabled and p_permission='members.manage' then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'members.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission in ('discipline.issue','discipline.review') then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'discipline.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission in ('budget.manage','budget.delete') then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'budget.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission in ('publications.write','publications.publish','publications.delete') then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'publications.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if p_enabled and p_permission='publications.publish' then insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'publications.write',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if not p_enabled and p_permission='members.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission='members.manage'; end if;
 if not p_enabled and p_permission='discipline.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission in ('discipline.issue','discipline.review'); end if;
 if not p_enabled and p_permission='budget.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission in ('budget.manage','budget.delete'); end if;
 if not p_enabled and p_permission='publications.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission in ('publications.write','publications.publish','publications.delete'); end if;
 if not p_enabled and p_permission='publications.write' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission='publications.publish'; end if;
 if p_enabled and p_permission in ('events.propose','events.manage','events.publish','events.attendance','events.archive','events.settings') then
 insert into public.role_permissions(role,permission,enabled,updated_by,updated_at) values(p_role::public.qgang_role,'events.view',true,v_uid,now()) on conflict(role,permission) do update set enabled=true,updated_by=v_uid,updated_at=now(); end if;
 if not p_enabled and p_permission='events.view' then update public.role_permissions set enabled=false,updated_by=v_uid,updated_at=now() where role=p_role and permission like 'events.%'; end if;
end$function$;

CREATE OR REPLACE FUNCTION public.save_badge_definition(p_id uuid, p_slug text, p_name text, p_description text, p_type text, p_active boolean, p_reason text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$declare previous public.badges%rowtype;result public.badges%rowtype;begin
 if exists(select 1 from public.profiles where id=auth.uid() and is_suspended) then raise exception 'account_suspended' using errcode='42501';end if;

 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='founder') then raise exception 'founder_required';end if;
 if p_name is null or p_description is null or p_type is null or p_active is null or length(trim(coalesce(p_reason,'')))<3 or length(p_reason)>2000 or length(trim(p_name))<2 or length(p_name)>100 or length(p_description)>2000 or p_type not in ('historical','achievement','discretionary','high_honor') then raise exception 'invalid_badge_definition';end if;
 if p_id is null then
 if p_slug is null or p_slug!~'^[a-z0-9][a-z0-9-]{2,60}$' or p_type in ('historical','achievement') then raise exception 'new_automatic_condition_requires_review';end if;
 insert into public.badges(slug,name,description,icon,norm_type,category,award_mode,active) values(p_slug,trim(p_name),trim(p_description),'◆',p_type,'honorary','discretionary',p_active) returning * into result;
 else
 select * into previous from public.badges where id=p_id for update;if not found then raise exception 'badge_unavailable';end if;
 if p_type<>previous.norm_type then raise exception 'earned_badge_type_immutable';end if;
 update public.badges set name=trim(p_name),description=trim(p_description),active=p_active,updated_at=now() where id=p_id returning * into result;
 end if;
 insert into public.badge_catalog_events(badge_id,actor_id,event,reason,before_record,after_record) values(result.id,auth.uid(),case when p_id is null then 'created' when previous.active and not p_active then 'retired' else 'updated' end,trim(p_reason),case when p_id is null then null else to_jsonb(previous) end,to_jsonb(result));return result.id;
end$function$;

create or replace function private.account_not_suspended() returns boolean language sql stable security definer set search_path='' as $$
 select not exists(select 1 from public.profiles where id=auth.uid() and is_suspended);
$$;
revoke all on function private.account_not_suspended() from public,anon;
grant execute on function private.account_not_suspended() to authenticated;
-- Restrictive policies also cover role-only legacy read policies; privacy rights remain available.
do $$declare t record;begin
 for t in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity and c.relname not like 'privacy_%' loop
 execute format('create policy security_active_account on public.%I as restrictive for all to authenticated using ((select private.account_not_suspended())) with check ((select private.account_not_suspended()))',t.relname);
 end loop;
end$$;
create policy security_active_account on storage.objects as restrictive for all to authenticated using ((select private.account_not_suspended())) with check ((select private.account_not_suspended()));

-- All public business writes (including SECURITY DEFINER paths) reject suspended actors.
-- Privacy requests remain available to exercise data subject rights.
create or replace function private.guard_suspended_write() returns trigger language plpgsql security definer set search_path='' as $$begin
 if exists(select 1 from public.profiles where id=auth.uid() and is_suspended) then raise exception 'account_suspended' using errcode='42501';end if;
 return null;
end$$;
revoke all on function private.guard_suspended_write() from public,anon,authenticated;
do $$declare t record;begin
 for t in select tablename from pg_tables where schemaname='public' and tablename not like 'privacy_%' loop
 execute format('create trigger aaa_security_active_actor before insert or update or delete on public.%I for each statement execute function private.guard_suspended_write()',t.tablename);
 end loop;
end$$;
-- Deployment review: prepare the existing privacy draft, without publishing or replacing it.
do $privacy_draft$
declare changed integer;
begin
 if not exists(select 1 from public.privacy_documents where slug='cerezler' and position('__Host-qg-steam-link' in draft_body)>0) then
  update public.privacy_documents set draft_body=concat_ws(E'\n\n',nullif(draft_body,''),
   'Steam hesabı bağlama güvenliği' || E'\n' || 'Steam hesabınızı bağlamak istediğinizde, işlemin sizin oturumunuzda başlatıldığını doğrulamak ve başka bir hesabın izinsiz bağlanmasını önlemek için __Host-qg-steam-link adlı birinci taraf güvenlik çerezi kullanılır. Bu çerez en fazla 10 dakika saklanır ve bağlantı dönüşü işlendiğinde silinir. Reklam veya kullanım analizi amacı taşımaz.',
   'Kamusal görsel önbelleği' || E'\n' || 'Kamusal görsellerin cihazınıza uygun boyutta ve daha hızlı gösterilmesi için mevcut barındırma altyapımız üzerinde sıkıştırılmış veya küçük sürümler ve teknik önbellekler kullanılabilir. Bu işlem özel kayıtları kamusal hale getirmez. İçerik güncelleme ve silme taleplerinde ilgili türevler ve önbellekler de değerlendirilir.'),
   draft_revision=draft_revision+1,updated_at=now() where slug='cerezler' and draft_revision=2;
  get diagnostics changed=row_count;
  if changed<>1 then raise exception 'privacy_draft_changed_review_required';end if;
 end if;
end $privacy_draft$;
commit;
