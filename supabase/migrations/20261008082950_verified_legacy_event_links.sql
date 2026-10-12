-- Only verified legacy identity links may reconcile historical attendance.
-- Called inside the existing authorized identity RPC; not a public API.
create function private.reconcile_legacy_event_attendance(p_legacy_id bigint)
returns integer language plpgsql security invoker set search_path='' as $$
declare identity public.legacy_members%rowtype; candidate record; changed integer:=0; n integer;
begin
 select * into identity from public.legacy_members where id=p_legacy_id;
 if not found or identity.claimed_by is null or identity.claimed_at is null or identity.verified_by is null then return 0; end if;
 if (select count(*) from public.legacy_members where lower(trim(legacy_nickname))=lower(trim(identity.legacy_nickname)))<>1 then return 0; end if;
 -- Conflicting ownership makes the entire historical name ambiguous.
 if exists(select 1 from public.event_attendance where lower(trim(historical_name))=lower(trim(identity.legacy_nickname)) and user_id is not null and user_id<>identity.claimed_by) then return 0; end if;
 for candidate in
  select a.id from public.event_attendance a
  where a.user_id is null and lower(trim(a.historical_name))=lower(trim(identity.legacy_nickname))
   and not exists(select 1 from public.event_attendance b where b.event_id=a.event_id and b.user_id=identity.claimed_by)
   and (select count(*) from public.event_attendance b where b.event_id=a.event_id and b.user_id is null and lower(trim(b.historical_name))=lower(trim(identity.legacy_nickname)))=1
  order by a.id for update of a
 loop
  begin
   update public.event_attendance set user_id=identity.claimed_by where id=candidate.id and user_id is null;
   get diagnostics n=row_count;changed:=changed+n;
  exception when unique_violation then
   -- A concurrent attendance insertion must not invalidate identity verification.
   null;
  end;
 end loop;
 return changed;
end;
$$;
revoke all on function private.reconcile_legacy_event_attendance(bigint) from public,anon,authenticated;

create function private.link_events_after_legacy_verification()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 perform private.reconcile_legacy_event_attendance(new.id);
 return new;
end;
$$;
revoke all on function private.link_events_after_legacy_verification() from public,anon,authenticated;
create trigger link_events_after_legacy_verification
 after insert or update of claimed_by,claimed_at,verified_by on public.legacy_members
 for each row execute function private.link_events_after_legacy_verification();

-- Repair already verified identities; all attendance facts remain byte-for-byte equal.
do $$
declare before_facts jsonb;after_facts jsonb;legacy_id bigint;
begin
 lock table public.event_attendance in share row exclusive mode;
 select jsonb_agg(to_jsonb(a)-'user_id' order by a.id) into before_facts from public.event_attendance a;
 for legacy_id in select id from public.legacy_members where claimed_by is not null and claimed_at is not null and verified_by is not null order by id loop
  perform private.reconcile_legacy_event_attendance(legacy_id);
 end loop;
 select jsonb_agg(to_jsonb(a)-'user_id' order by a.id) into after_facts from public.event_attendance a;
 if before_facts is distinct from after_facts then raise exception 'unexpected_attendance_change'; end if;
end;
$$;
