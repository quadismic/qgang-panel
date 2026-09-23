delete from public.community_memberships where user_id in ('9aac3d1d-1e57-4a1f-a62b-dd00aba0e6d9','8fc9034b-855b-4008-a8be-f7681e70ef9b');
insert into public.community_memberships(member_no,user_id,status,joined_at,granted_by,era,seal) overriding system value values(1,'8fc9034b-855b-4008-a8be-f7681e70ef9b','active','2026-09-15 00:00:00+00','8fc9034b-855b-4008-a8be-f7681e70ef9b',1,'PRIME');
select setval(pg_get_serial_sequence('public.community_memberships','member_no'),1,true);
update public.profiles set qgang_era=null,qgang_seal=null where id='9aac3d1d-1e57-4a1f-a62b-dd00aba0e6d9';
update public.profiles set qgang_era=1,qgang_seal='PRIME' where id='8fc9034b-855b-4008-a8be-f7681e70ef9b';
