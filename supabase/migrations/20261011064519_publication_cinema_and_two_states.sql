-- Expand the type allowlist; existing content and access policies are unchanged.
alter table public.publications drop constraint publications_content_type_check;
alter table public.publications add constraint publications_content_type_check
 check(content_type in ('research','review','thought','game','technology','video','cinema'));
-- Preserve the old status constraint for compatibility with the currently deployed studio.
-- New studio writes only draft/published. All old workflow records become drafts.
do $$
declare before_records jsonb;after_records jsonb;
begin
 lock table public.publications in share row exclusive mode;
 select jsonb_agg(to_jsonb(p)-'status' order by p.id) into before_records from public.publications p;
 update public.publications set status='draft' where status in ('idea','research','video_preparation');
 select jsonb_agg(to_jsonb(p)-'status' order by p.id) into after_records from public.publications p;
 if before_records is distinct from after_records then raise exception 'unexpected_publication_change'; end if;
end;
$$;
