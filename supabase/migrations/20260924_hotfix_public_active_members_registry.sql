create or replace function public.list_active_community_members()
returns table(id uuid, display_name text, handle text, role public.qgang_role, avatar_url text, member_no bigint, era integer, seal text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.id,p.display_name,p.handle,p.role,p.avatar_url,cm.member_no,cm.era,cm.seal
  from public.community_memberships cm
  join public.profiles p on p.id=cm.user_id
  where cm.status='active' and coalesce(p.is_suspended,false)=false
  order by cm.member_no asc;
$$;
revoke all on function public.list_active_community_members() from public;
grant execute on function public.list_active_community_members() to anon, authenticated;
