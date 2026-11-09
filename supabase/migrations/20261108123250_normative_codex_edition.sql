-- Existing records and revision references remain in the legacy edition.
alter table public.regulations add column normative_edition boolean not null default false;
alter table public.regulations add constraint regulations_normative_edition_kind
 check (not normative_edition or kind in ('YÖNERGE','KARAR'));
grant select(normative_edition) on public.regulations to anon, authenticated;

create function private.keep_normative_codex_edition() returns trigger
language plpgsql set search_path = '' as $$
begin
 if new.normative_edition is distinct from old.normative_edition then
  raise exception 'immutable_codex_edition';
 end if;
 return new;
end;
$$;
create trigger keep_normative_codex_edition before update on public.regulations
 for each row execute function private.keep_normative_codex_edition();

create index regulations_normative_reader_idx on public.regulations(kind,published_at desc,id)
 where normative_edition and status <> 'taslak' and published_at is not null;
