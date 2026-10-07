-- Pending release: correct only authoritative historical decision titles.
-- No new decision, revision, publication or historical snapshot is created.
begin;
lock table public.regulations in share row exclusive mode;
create temporary table qg_title_targets(number text primary key,old_title text,new_title text) on commit drop;
insert into qg_title_targets values
 ('İK-2026-001','Vekilharçlık Emri · Renovich','Renovich · Vekilharçlığa Atama'),
 ('İK-2026-002','Rütbe Kararları · Haziran 2026','JUSTilknur & Gaspare · Statü Düzenlemesi'),
 ('İK-2026-003','Rütbe Emri · Schizo','Schizo · Teğmenliğe Atama');
create temporary table qg_title_before on commit drop as
 select r.id,to_jsonb(r) as record from public.regulations r join qg_title_targets t using(number);
create temporary table qg_title_history_before on commit drop as
 select to_jsonb(v) as record from public.regulation_revisions v where regulation_id in(select id from qg_title_before);
create temporary table qg_title_sources_before on commit drop as
 select to_jsonb(a) as record from public.announcements a where id in
 (select (record->>'legacy_announcement_id')::uuid from qg_title_before);
do $$begin
 if (select count(*) from qg_title_before)<>3 or exists(
   select 1 from qg_title_targets t left join public.regulations r using(number)
   group by t.number having count(r.id)<>1
 ) or exists(
   select 1 from public.regulations r join qg_title_targets t using(number)
   where r.kind<>'KARAR' or r.legacy_announcement_id is null or r.published_at is null
      or r.title is null or r.title not in(t.old_title,t.new_title)
 ) then raise exception 'historical_decision_title_precondition_failed'; end if;
 if not exists(select 1 from pg_trigger where tgrelid='public.regulations'::regclass
   and tgname='archive_regulation_revision' and tgenabled='O' and not tgisinternal)
 then raise exception 'historical_decision_revision_trigger_precondition_failed'; end if;
end $$;
-- Only suppress revision creation under the transaction lock. Identity/number
-- validation remains active. Any assertion failure rolls back this DDL too.
alter table public.regulations disable trigger archive_regulation_revision;
update public.regulations r set title=t.new_title from qg_title_targets t
 where r.number=t.number and r.title=t.old_title;
alter table public.regulations enable trigger archive_regulation_revision;
do $$begin
 if exists(select 1 from qg_title_before b left join public.regulations r on r.id=b.id
   where r.id is null or (to_jsonb(r)-'title') is distinct from (b.record-'title'))
 or exists(select 1 from public.regulations r join qg_title_targets t using(number)
   where r.title is distinct from t.new_title)
 then raise exception 'historical_decision_non_title_change'; end if;
 if exists((select to_jsonb(v) from public.regulation_revisions v where regulation_id in(select id from qg_title_before)
   except select record from qg_title_history_before)
   union all (select record from qg_title_history_before except
   select to_jsonb(v) from public.regulation_revisions v where regulation_id in(select id from qg_title_before)))
 then raise exception 'historical_decision_revision_changed'; end if;
 if exists((select to_jsonb(a) from public.announcements a where id in
   (select (record->>'legacy_announcement_id')::uuid from qg_title_before) except select record from qg_title_sources_before)
   union all (select record from qg_title_sources_before except select to_jsonb(a) from public.announcements a where id in
   (select (record->>'legacy_announcement_id')::uuid from qg_title_before)))
 then raise exception 'historical_decision_source_changed'; end if;
end $$;
commit;
