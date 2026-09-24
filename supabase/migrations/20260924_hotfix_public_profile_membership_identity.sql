create or replace function public.get_active_community_membership_public(target_user uuid)
returns table(status text, member_no bigint, joined_at timestamptz, era integer, seal text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select cm.status,cm.member_no,cm.joined_at,cm.era,cm.seal
  from public.community_memberships cm
  join public.profiles p on p.id=cm.user_id
  where cm.user_id=target_user and cm.status='active' and coalesce(p.is_suspended,false)=false
  limit 1;
$$;
revoke all on function public.get_active_community_membership_public(uuid) from public;
grant execute on function public.get_active_community_membership_public(uuid) to anon, authenticated;
