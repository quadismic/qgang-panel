begin;
-- Drafts have no publication timestamp until they are actually published.
alter table public.regulations alter column published_at drop not null;
alter table public.regulations
 add column decision_priority text not null default 'normal' check(decision_priority in ('normal','important','critical')),
 add column decision_pinned boolean not null default false,
 add column legacy_announcement_id uuid unique references public.announcements(id) on delete restrict;
alter table public.regulation_revisions
 add column decision_priority text,
 add column decision_pinned boolean;
-- Content-reviewed historical decisions. Keep source documents as provenance and never
-- invent a retroactive basis in the September Codex for decisions made in June.
alter table public.regulations disable trigger a_validate_codex_basis;
insert into public.regulations(title,body,kind,number,section_number,status,effective_at,published_at,created_by,change_reason,legacy_announcement_id,decision_priority,decision_pinned)
select a.title,a.body,'KARAR',x.number,'03','yururlukte',a.published_at,a.published_at,a.created_by,
 'Tarihsel icra kararı; dönemin dayanak hükmü kaynak kayıtta belirtilmemiş.',a.id,a.priority,a.is_pinned
from public.announcements a join (values
 ('Vekilharçlık Emri · Renovich','İK-2026-001'),
 ('Rütbe Kararları · Haziran 2026','İK-2026-002'),
 ('Rütbe Emri · Schizo','İK-2026-003')
) x(title,number) on x.title=a.title and a.category='KARAR';
alter table public.regulations enable trigger a_validate_codex_basis;
-- Reviewed non-decisions: general eligibility information and a contribution listing.
update public.announcements set category='DUYURU' where title in
 ('Teğmenlik Yolu Açıldı','Katkı Sicili · Öne Çıkanlar');

create or replace function public.qg_validate_codex_basis()
returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
declare basis public.regulations; parent public.regulations; actor text;
begin
 select role::text into actor from public.profiles where id=auth.uid();
 if tg_op='UPDATE' then
   if new.kind is distinct from old.kind or new.legacy_announcement_id is distinct from old.legacy_announcement_id or
     (new.created_by is distinct from old.created_by and (new.created_by is not null or exists(select 1 from public.profiles where id=old.created_by))) then
     raise exception 'immutable_regulation_identity';
   end if;
 elsif new.legacy_announcement_id is not null then raise exception 'historical_import_only';
 end if;
 if actor='moderator' and new.kind in ('YÖNERGE','KARAR') and nullif(trim(new.application_scope),'') is null then raise exception 'directive_scope_required'; end if;
 if new.status='taslak' then new.published_at:=null;
 elsif new.published_at is null then new.published_at:=now(); end if;
 if tg_op='UPDATE' and old.published_at is not null then
   if new.published_at is distinct from old.published_at then raise exception 'published_record_cannot_be_hidden'; end if;
 end if;
 if new.kind in ('YÖNERGE','KARAR') then
   if tg_op='UPDATE' and new.legacy_announcement_id is not null and new.basis_rule_id is null then
     -- An untouched historical record retains its unknown original basis.
     return new;
   end if;
   select * into basis from public.regulations where id=new.basis_rule_id;
   if basis.id is null or basis.id=new.id or
      (new.kind='YÖNERGE' and basis.kind<>'KURAL') or
      (new.kind='KARAR' and basis.kind not in ('KURAL','YÖNERGE')) or
      (new.status not in ('taslak','yururlukten_kaldirildi') and
       (basis.status<>'yururlukte' or basis.effective_at>now() or basis.published_at>now())) then raise exception 'active_rule_basis_required'; end if;
   if new.kind='KARAR' and basis.kind='YÖNERGE' then
     select * into parent from public.regulations where id=basis.basis_rule_id;
     if parent.id is null or parent.status<>'yururlukte' or parent.effective_at>now()
       or parent.revision is distinct from basis.basis_revision then raise exception 'directive_basis_needs_review'; end if;
   end if;
   if new.basis_revision is not null and new.basis_revision<>basis.revision then raise exception 'basis_revision_conflict'; end if;
   new.basis_revision:=basis.revision;
 else
   if new.basis_rule_id is not null then raise exception 'primary_norm_has_no_basis'; end if;
   new.basis_revision:=null;
 end if;
 return new;
end $$;
revoke all on function public.qg_validate_codex_basis() from public,anon,authenticated;

create or replace function public.archive_regulation_revision()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if row(new.title,new.body,new.number,new.status,new.effective_at,new.section_number,new.change_reason,new.basis_rule_id,new.basis_revision,new.application_scope,new.decision_priority,new.decision_pinned)
 is distinct from row(old.title,old.body,old.number,old.status,old.effective_at,old.section_number,old.change_reason,old.basis_rule_id,old.basis_revision,old.application_scope,old.decision_priority,old.decision_pinned) then
   insert into public.regulation_revisions(regulation_id,revision,section_number,number,kind,title,body,status,effective_at,change_reason,changed_by,changed_at,basis_rule_id,basis_revision,application_scope,decision_priority,decision_pinned)
   values(old.id,old.revision,old.section_number,old.number,old.kind,old.title,coalesce(old.body,''),old.status,old.effective_at,old.change_reason,auth.uid(),now(),old.basis_rule_id,old.basis_revision,old.application_scope,old.decision_priority,old.decision_pinned)
   on conflict(regulation_id,revision) do nothing;
   new.revision:=old.revision+1;new.updated_at:=now();
 else new.revision:=old.revision;new.updated_at:=old.updated_at;
 end if;
 return new;
end $$;
revoke all on function public.archive_regulation_revision() from public,anon,authenticated;

create policy "officers insert executive decisions" on public.regulations for insert to authenticated
with check(kind='KARAR' and created_by=auth.uid() and (select private.has_permission('announcements.publish'))
 and exists(select 1 from public.profiles where id=auth.uid() and role::text in ('admin','moderator')));
create policy "officers update executive decisions" on public.regulations for update to authenticated
using(kind='KARAR' and (select private.has_permission('announcements.publish')) and exists(select 1 from public.profiles actor where actor.id=auth.uid() and
 ((actor.role::text='moderator' and created_by=actor.id) or (actor.role::text='admin' and
 (created_by=actor.id or exists(select 1 from public.profiles issuer where issuer.id=created_by and issuer.role::text='moderator'))))))
with check(kind='KARAR' and (select private.has_permission('announcements.publish')) and exists(select 1 from public.profiles actor where actor.id=auth.uid() and
 ((actor.role::text='moderator' and created_by=actor.id) or (actor.role::text='admin' and
 (created_by=actor.id or exists(select 1 from public.profiles issuer where issuer.id=created_by and issuer.role::text='moderator'))))));
drop policy if exists "authenticated read regulations" on public.regulations;
create policy "authenticated read regulations" on public.regulations for select to authenticated
using((status<>'taslak' and published_at<=now()) or created_by=auth.uid()
 or exists(select 1 from public.profiles where id=auth.uid() and role::text='founder'));

drop policy if exists "regulation revisions readable" on public.regulation_revisions;
create policy "regulation revisions readable" on public.regulation_revisions for select to authenticated
using(exists(select 1 from public.regulations r where r.id=regulation_id and
 (regulation_revisions.status<>'taslak' or r.created_by=auth.uid()
  or exists(select 1 from public.profiles where id=auth.uid() and role::text='founder'))));
update public.announcements a set category='DUYURU' where category='KARAR'
 and not exists(select 1 from public.regulations r where r.legacy_announcement_id=a.id);
-- Decisions are read from the authoritative Codex row, never copied into announcements.
create view public.announcement_feed with(security_invoker=true) as
select a.id,a.title,a.body,'DUYURU'::text as category,a.priority,a.is_pinned,a.published_at,
 null::timestamptz as effective_at,null::text as status,null::uuid as regulation_id,null::integer as revision,false as historical
from public.announcements a where a.category='DUYURU' and a.published_at<=now()
 and not exists(select 1 from public.regulations r where r.legacy_announcement_id=a.id)
union all
select r.id,r.title,r.body,'KARAR'::text,r.decision_priority,r.decision_pinned,r.published_at,
 r.effective_at,r.status,r.id,r.revision,r.legacy_announcement_id is not null
from public.regulations r where r.kind='KARAR' and r.status<>'taslak' and r.published_at<=now();
grant select on public.announcement_feed to anon,authenticated;
-- Announcement publication now creates only information notices; decisions use Codex.
create or replace function public.qg_announcement_notice_only()
returns trigger language plpgsql security invoker set search_path=public,pg_temp as $$
begin
 if tg_op='UPDATE' and old.category='KARAR' then raise exception 'historical_decision_source_immutable'; end if;
 if new.category<>'DUYURU' then raise exception 'executive_decisions_use_codex'; end if;
 return new;
end $$;
revoke all on function public.qg_announcement_notice_only() from public,anon,authenticated;
create trigger qg_announcement_notice_only before insert or update on public.announcements
for each row execute function public.qg_announcement_notice_only();
commit;
