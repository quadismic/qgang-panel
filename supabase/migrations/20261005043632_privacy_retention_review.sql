-- Monthly review does not delete data. Erasure is an explicit leader operation.
create table public.privacy_retention_holds(category text not null check(category in ('notifications','aster','requests')),record_id uuid not null,reason text not null,expires_at timestamptz not null,review_at timestamptz not null,actor_id uuid not null references public.profiles(id),primary key(category,record_id));
create table public.privacy_retention_reviews(id uuid primary key default gen_random_uuid(),counts jsonb not null,created_at timestamptz not null default now());
create table public.privacy_destruction_runs(id uuid primary key default gen_random_uuid(),actor_id uuid not null references public.profiles(id),counts jsonb not null,rules jsonb not null,created_at timestamptz not null default now());
alter table public.privacy_retention_holds enable row level security;alter table public.privacy_retention_reviews enable row level security;alter table public.privacy_destruction_runs enable row level security;
revoke all on public.privacy_retention_holds,public.privacy_retention_reviews,public.privacy_destruction_runs from public,anon,authenticated;
grant select on public.privacy_retention_holds,public.privacy_retention_reviews,public.privacy_destruction_runs to authenticated;
create policy privacy_holds_read on public.privacy_retention_holds for select to authenticated using(private.privacy_authorized('requests'));
create policy privacy_retention_review_read on public.privacy_retention_reviews for select to authenticated using(private.privacy_authorized('requests'));
create policy privacy_destruction_read on public.privacy_destruction_runs for select to authenticated using(private.privacy_authorized('requests'));
create or replace function private.privacy_retention_snapshot()
returns jsonb language sql stable security definer set search_path='' as $$
select jsonb_build_object(
 'notifications',(select count(*) from public.notifications n where n.read_at<now()-make_interval(days=>(s.retention_rules->>'notifications_days')::int) and not exists(select 1 from public.privacy_retention_holds h where h.category='notifications' and h.record_id=n.id and h.expires_at>now())),
 'aster',(select count(*) from public.ai_conversations c where c.updated_at<now()-make_interval(days=>(s.retention_rules->>'aster_days')::int) and not exists(select 1 from public.ai_messages m where m.conversation_id=c.id and m.created_at>=now()-make_interval(days=>(s.retention_rules->>'aster_days')::int)) and not exists(select 1 from public.privacy_retention_holds h where h.category='aster' and h.record_id=c.id and h.expires_at>now())),
 'requests',(select count(*) from public.privacy_requests r where r.status in ('resolved','rejected') and r.updated_at<now()-make_interval(years=>(s.retention_rules->>'requests_years')::int) and not exists(select 1 from public.privacy_retention_holds h where h.category='requests' and h.record_id=r.id and h.expires_at>now())),
 'holds_due_review',(select count(*) from public.privacy_retention_holds h where h.expires_at>now() and h.review_at<=now())
) from public.privacy_settings s where s.singleton;
$$;
revoke all on function private.privacy_retention_snapshot() from public,anon,authenticated;
create or replace function private.review_privacy_retention()
returns void language plpgsql security definer set search_path='' as $$
begin insert into public.privacy_retention_reviews(counts) values(private.privacy_retention_snapshot());end $$;
revoke all on function private.review_privacy_retention() from public,anon,authenticated;
create or replace function public.get_privacy_retention_review() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin if not private.privacy_authorized('requests') then raise exception 'not_authorized';end if;return private.privacy_retention_snapshot();end $$;
create or replace function public.set_privacy_retention_hold(hold_category text,hold_record uuid,hold_reason text,hold_until timestamptz)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended) then raise exception 'not_authorized';end if;
 if hold_category not in ('notifications','aster','requests') or hold_until is null or hold_until<=now() or hold_until>now()+interval '1 year' or char_length(trim(hold_reason)) not between 10 and 2000 then raise exception 'invalid_hold';end if;
 perform pg_advisory_xact_lock(hashtextextended('qgang_privacy_retention',0));
 if not ((hold_category='notifications' and exists(select 1 from public.notifications where id=hold_record)) or (hold_category='aster' and exists(select 1 from public.ai_conversations where id=hold_record)) or (hold_category='requests' and exists(select 1 from public.privacy_requests where id=hold_record))) then raise exception 'record_missing';end if;
 insert into public.privacy_retention_holds(category,record_id,reason,expires_at,review_at,actor_id) values(hold_category,hold_record,trim(hold_reason),hold_until,least(hold_until,now()+interval '30 days'),auth.uid())
 on conflict(category,record_id) do update set reason=excluded.reason,expires_at=excluded.expires_at,review_at=excluded.review_at,actor_id=excluded.actor_id;
 insert into public.privacy_governance_events(actor_id,kind,subject,detail) values(auth.uid(),'retention_hold',hold_record::text,jsonb_build_object('category',hold_category,'expires_at',hold_until,'reason',trim(hold_reason)));
end $$;
create or replace function public.execute_privacy_retention(confirmation text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare selected_rules jsonb;n_count integer;c_count integer;r_count integer;request_ids uuid[];
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended) then raise exception 'not_authorized';end if;
 if confirmation is distinct from 'SURESI DOLAN KAYITLARI IMHA ET' then raise exception 'confirmation_required';end if;
 if not exists(select 1 from public.privacy_documents where slug='saklama' and published_revision is not null) then raise exception 'published_retention_policy_required';end if;
 perform pg_advisory_xact_lock(hashtextextended('qgang_privacy_retention',0));
 select s.retention_rules into selected_rules from public.privacy_settings s where singleton for update;
 delete from public.notifications n where n.read_at<now()-make_interval(days=>(selected_rules->>'notifications_days')::int) and not exists(select 1 from public.privacy_retention_holds h where h.category='notifications' and h.record_id=n.id and h.expires_at>now());get diagnostics n_count=row_count;
 delete from public.ai_conversations c where c.updated_at<now()-make_interval(days=>(selected_rules->>'aster_days')::int) and not exists(select 1 from public.ai_messages m where m.conversation_id=c.id and m.created_at>=now()-make_interval(days=>(selected_rules->>'aster_days')::int)) and not exists(select 1 from public.privacy_retention_holds h where h.category='aster' and h.record_id=c.id and h.expires_at>now());get diagnostics c_count=row_count;
 select array_agg(x.id) into request_ids from (select r.id from public.privacy_requests r where r.status in ('resolved','rejected') and r.updated_at<now()-make_interval(years=>(selected_rules->>'requests_years')::int) and not exists(select 1 from public.privacy_retention_holds h where h.category='requests' and h.record_id=r.id and h.expires_at>now()) for update) x;
 delete from public.privacy_request_events where request_id=any(request_ids);
 delete from public.privacy_requests where id=any(request_ids);get diagnostics r_count=row_count;
 delete from public.privacy_destruction_runs where created_at<now()-make_interval(years=>(selected_rules->>'destruction_audit_years')::int);
 insert into public.privacy_destruction_runs(actor_id,counts,rules) values(auth.uid(),jsonb_build_object('notifications',n_count,'aster',c_count,'requests',r_count),selected_rules);
 return jsonb_build_object('notifications',n_count,'aster',c_count,'requests',r_count);
end $$;
revoke all on function public.get_privacy_retention_review(),public.set_privacy_retention_hold(text,uuid,text,timestamptz),public.execute_privacy_retention(text) from public,anon;
grant execute on function public.get_privacy_retention_review(),public.set_privacy_retention_hold(text,uuid,text,timestamptz),public.execute_privacy_retention(text) to authenticated;
-- Every day checks whether the configured (default 30-day) review interval elapsed.
select cron.schedule('qgang-privacy-retention-review','0 3 * * *',$cron$
select private.review_privacy_retention() where not exists(
 select 1 from public.privacy_retention_reviews r,public.privacy_settings s where s.singleton and r.created_at>now()-make_interval(days=>(s.retention_rules->>'review_interval_days')::int)
);$cron$);
create or replace function public.list_privacy_retention_candidates()
returns table(category text,record_id uuid,label text,record_date timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='founder' and not is_suspended) then raise exception 'not_authorized';end if;
 return query select x.category,x.record_id,x.label,x.record_date from (
 select 'notifications'::text category,n.id record_id,'Okunmuş bildirim'::text label,n.read_at record_date from public.notifications n,public.privacy_settings s where s.singleton and n.read_at<now()-make_interval(days=>(s.retention_rules->>'notifications_days')::int)
 union all select 'aster'::text,c.id,'Aster sohbeti'::text,c.updated_at from public.ai_conversations c,public.privacy_settings s where s.singleton and c.updated_at<now()-make_interval(days=>(s.retention_rules->>'aster_days')::int) and not exists(select 1 from public.ai_messages m where m.conversation_id=c.id and m.created_at>=now()-make_interval(days=>(s.retention_rules->>'aster_days')::int))
 union all select 'requests'::text,r.id,'Sonuçlanmış kişisel veri başvurusu'::text,r.updated_at from public.privacy_requests r,public.privacy_settings s where s.singleton and r.status in ('resolved','rejected') and r.updated_at<now()-make_interval(years=>(s.retention_rules->>'requests_years')::int)
 ) x order by x.record_date,x.record_id limit 100;
end $$;
revoke all on function public.list_privacy_retention_candidates() from public,anon;
grant execute on function public.list_privacy_retention_candidates() to authenticated;
