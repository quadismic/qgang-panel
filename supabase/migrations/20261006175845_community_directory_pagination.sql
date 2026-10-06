-- Paginated replacement for the 100-account management registry.
-- Same members.view gate; explicit projection excludes private profile fields.
create or replace function public.list_community_directory(
 search_term text default '', role_filter text default 'all',
 membership_filter text default 'all', suspended_filter text default 'all',
 page_number integer default 1, target_id uuid default null
)
returns table(id uuid,display_name text,handle text,role public.qgang_role,
 avatar_url text,is_suspended boolean,membership_status text,member_no bigint,joined_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
 if auth.uid() is null or not private.has_permission('members.view') then
  raise exception 'not authorized';
 end if;
 if search_term is null or length(search_term)>80 or page_number is null or page_number<1 or page_number>10000
 or role_filter is null or role_filter not in ('all','founder','admin','moderator','creator','member','guest')
 or membership_filter is null or membership_filter not in ('all','active','inactive','none')
 or suspended_filter is null or suspended_filter not in ('all','yes','no') then
  raise exception 'invalid directory filters';
 end if;
 return query
 select p.id,p.display_name,p.handle,p.role,p.avatar_url,p.is_suspended,cm.status::text,cm.member_no,cm.joined_at
 from public.profiles p left join public.community_memberships cm on cm.user_id=p.id
 where (target_id is null or p.id=target_id)
 and (role_filter='all' or p.role::text=role_filter)
 and (membership_filter='all' or (membership_filter='none' and cm.user_id is null)
 or (membership_filter='active' and cm.status='active')
 or (membership_filter='inactive' and cm.user_id is not null and cm.status<>'active'))
 and (suspended_filter='all' or p.is_suspended=(suspended_filter='yes'))
 and (search_term='' or strpos(lower(p.display_name),lower(search_term))>0
 or strpos(lower(p.handle),lower(search_term))>0 or cm.member_no::text=ltrim(search_term,'#'))
 order by p.display_name,p.id
 limit 21 offset ((page_number-1)*20);
end;
$$;
revoke all on function public.list_community_directory(text,text,text,text,integer,uuid) from public,anon;
grant execute on function public.list_community_directory(text,text,text,text,integer,uuid) to authenticated;
