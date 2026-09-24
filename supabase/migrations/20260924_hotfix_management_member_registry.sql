create or replace function public.list_manageable_community_accounts()
returns table(id uuid, display_name text, handle text, role public.qgang_role, membership_status text, member_no bigint, joined_at timestamptz)
language plpgsql
stable
security definer
set search_path = public, private, pg_temp
as $$
begin
  if auth.uid() is null or not private.has_permission('members.view') then
    raise exception 'not authorized';
  end if;
  return query
  select p.id,p.display_name,p.handle,p.role,cm.status,cm.member_no,cm.joined_at
  from public.profiles p
  left join public.community_memberships cm on cm.user_id=p.id
  order by p.created_at desc
  limit 100;
end;
$$;
revoke all on function public.list_manageable_community_accounts() from public;
grant execute on function public.list_manageable_community_accounts() to authenticated;
