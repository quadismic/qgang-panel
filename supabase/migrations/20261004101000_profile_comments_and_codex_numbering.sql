alter table public.profiles add column if not exists comments_enabled boolean not null default true;
drop policy if exists "members create comments" on public.profile_comments;
create policy "members create comments" on public.profile_comments for insert to authenticated with check(author_id=auth.uid() and profile_id<>auth.uid() and exists(select 1 from public.community_memberships where user_id=auth.uid() and status='active') and exists(select 1 from public.profiles where id=profile_id and comments_enabled));
drop policy if exists "authors or management delete comments" on public.profile_comments;
create policy "authors owners or management delete comments" on public.profile_comments for delete to authenticated using(author_id=auth.uid() or profile_id=auth.uid() or exists(select 1 from public.profiles where id=auth.uid() and role in ('founder','admin')));
create index if not exists profile_comments_profile_time on public.profile_comments(profile_id,created_at desc);
create or replace function private.profile_comment_guard() returns trigger language plpgsql set search_path='' as $$begin
 perform pg_advisory_xact_lock(hashtextextended(new.author_id::text,41));
 if exists(select 1 from public.profile_comments where author_id=new.author_id and created_at>now()-interval '30 seconds') then raise exception 'comment_rate_limit';end if;
 if length(new.body)>5000 then raise exception 'comment_too_long';end if;
 new.created_at:=now();return new;
end$$;
revoke all on function private.profile_comment_guard() from public,anon,authenticated;
create trigger profile_comment_guard before insert on public.profile_comments for each row execute function private.profile_comment_guard();
alter table public.regulations add column if not exists parent_rule_id uuid references public.regulations(id);
create or replace function private.codex_number_allocate() returns trigger language plpgsql set search_path='' as $$declare prefix text;next_no integer;begin
 if tg_op='UPDATE' then
 if new.number is distinct from old.number or new.parent_rule_id is distinct from old.parent_rule_id then raise exception 'immutable_rule_number';end if;return new;
 end if;
 perform pg_advisory_xact_lock(hashtextextended('qgang-codex-number',42));
 if new.parent_rule_id is not null then
 select number into prefix from public.regulations where id=new.parent_rule_id and kind in ('KURAL','İLKE') and section_number=new.section_number;
 if prefix is null then raise exception 'invalid_parent_rule';end if;prefix:=prefix||'.';
 elsif new.kind='KARAR' then prefix:='İK-'||extract(year from now() at time zone 'Europe/Istanbul')::text||'-';
 elsif new.kind='YÖNERGE' then select number||'/' into prefix from public.regulations where id=new.basis_rule_id;if prefix is null then raise exception 'invalid_parent_rule';end if;
 else prefix:=new.section_number||'.';end if;
 if new.number is null or new.number='' then
 select coalesce(max(substring(number from length(prefix)+1)::integer),0)+1 into next_no from public.regulations where left(number,length(prefix))=prefix and substring(number from length(prefix)+1)~'^[0-9]+$';
 new.number:=prefix||lpad(next_no::text,greatest(length(next_no::text),case when new.kind='KARAR' then 3 else 2 end),'0');
 end if;return new;
end$$;
revoke all on function private.codex_number_allocate() from public,anon,authenticated;
create trigger codex_00_number before insert or update on public.regulations for each row execute function private.codex_number_allocate();
