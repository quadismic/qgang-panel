-- No review records were found during the live preflight on 2026-10-11.
-- Refuse to silently reclassify records created after that check.
do $$ begin
 if exists(select 1 from public.publications where content_type='review') then
  raise exception 'Review publications require individual editorial classification';
 end if;
end $$;
alter table public.publications drop constraint publications_content_type_check;
alter table public.publications add constraint publications_content_type_check
 check(content_type in ('thought','game','technology','video','research','cinema'));
