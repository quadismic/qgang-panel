const {PGlite}=require('@electric-sql/pglite');const fs=require('fs');const assert=require('node:assert/strict');
(async()=>{
 const db=new PGlite();
 await db.exec(`create schema auth;create schema private;create schema extensions;create role anon;create role authenticated;
 create type qgang_role as enum('founder','admin','moderator','creator','member','guest');
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table profiles(id uuid primary key,display_name text,handle text,role qgang_role,is_suspended boolean default false,qgang_era int,qgang_seal text,updated_at timestamptz,birthday_day smallint,birthday_month smallint,birthday_year smallint,avatar_url text,onboarding_completed_at timestamptz);
 create table qgang_identity_settings(singleton boolean primary key,current_era int);insert into qgang_identity_settings values(true,1);
 create table community_memberships(user_id uuid primary key references profiles(id),status text,member_no bigint generated always as identity unique,joined_at timestamptz default now(),ended_at timestamptz,granted_by uuid,era int,seal text,updated_at timestamptz);
 create table profile_private(user_id uuid primary key,birth_date date,updated_at timestamptz);
 create table legacy_members(id bigint primary key,legacy_nickname text,joined_at date,birth_date date,claimed_by uuid,claimed_at timestamptz,verified_by uuid);
 create function private.has_permission(text) returns boolean language sql as $$select exists(select 1 from public.profiles where id=auth.uid() and role in ('founder','admin'))$$;
 create function qgang_sync_automatic_badges(uuid) returns void language sql as $$select$$;
 -- PGlite has no pgcrypto: test-only bytes implementation in the production extension schema.
 create function extensions.gen_random_bytes(int) returns bytea language sql volatile as $$select decode(substr(md5(random()::text),1,$1*2),'hex')$$;
 insert into profiles(id,display_name,handle,role,qgang_era,qgang_seal) values
 ('00000000-0000-4000-8000-000000000001','Lider','lider','founder',1,'PRIME'),
 ('00000000-0000-4000-8000-000000000002','Renovich','renovich_suffix','member',null,null),
 ('00000000-0000-4000-8000-000000000003','Melisa Yıldız','melisa_suffix','member',null,null),
 ('00000000-0000-4000-8000-000000000004','Yeni','yeni','guest',null,null);
 insert into community_memberships(user_id,status,era,seal) select id,'active',qgang_era,qgang_seal from profiles where role<>'guest';
 insert into legacy_members values(6,'Renovich','2018-08-23',null,null,null,null),(22,'Lillycha','2025-11-12',null,null,null,null);`);
 await db.exec(fs.readFileSync('supabase/migrations/20260923_qgang_guard_profile_privileges.sql','utf8'));
 const old=fs.readFileSync('supabase/migrations/20260930_qgang_legacy_members_and_birthdays.sql','utf8');const start=old.indexOf('create or replace function public.link_legacy_member');const end=old.indexOf('revoke all on function public.link_legacy_member',start);await db.exec(old.slice(start,end));
 await db.exec("select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false)");
 await assert.rejects(()=>db.exec("select link_legacy_member(6,'00000000-0000-4000-8000-000000000002')"),/non-DEFAULT/);
 await db.exec("select set_config('request.jwt.claim.sub','',false)");
 await db.exec(fs.readFileSync('supabase/migrations/20261004174421_community_identity_repairs.sql','utf8'));
 const members=(await db.query('select m.*,p.qgang_seal,p.qgang_era from community_memberships m join profiles p on p.id=m.user_id order by member_no')).rows;
 assert.equal(members[0].seal,'PRIME');assert.equal(new Set(members.map(m=>m.seal)).size,3);for(const m of members){assert.equal(m.seal,m.qgang_seal);assert.equal(m.era,m.qgang_era);}
 await db.exec("select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false)");
 await db.exec("select link_legacy_member(6,'00000000-0000-4000-8000-000000000002')");
 const reno=(await db.query("select * from community_memberships where user_id='00000000-0000-4000-8000-000000000002'")).rows[0];assert.equal(reno.member_no,members[1].member_no);assert.equal(reno.seal,members[1].seal);assert.equal(new Date(reno.joined_at).toISOString(),'2018-08-22T21:00:00.000Z');
 await assert.rejects(()=>db.exec("select link_legacy_member(22,'00000000-0000-4000-8000-000000000003')"),/confirmation_required/);
 await db.exec("select link_legacy_member(22,'00000000-0000-4000-8000-000000000003','Lider: Melisa hesabının Lillycha kaydı olduğunu doğruladım.')");
 assert.equal((await db.query('select claimed_by from legacy_members where id=22')).rows[0].claimed_by,'00000000-0000-4000-8000-000000000003');
 await db.exec("insert into community_memberships(user_id,status) values('00000000-0000-4000-8000-000000000004','active')");
 assert((await db.query("select qgang_seal from profiles where handle='yeni'")).rows[0].qgang_seal);
 await db.exec("select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000003',false)");
 await assert.rejects(()=>db.exec("update profiles set qgang_seal='EVIL' where handle='melisa_suffix'"),/insufficient permission/);
 await assert.rejects(()=>db.exec("update profiles set role='founder' where handle='melisa_suffix'"),/insufficient permission/);
 await assert.rejects(()=>db.exec('select * from list_unclaimed_legacy_members()'),/not authorized/);
 await db.exec(fs.readFileSync('supabase/migrations/20260927_22_onboarding_membership_sync.sql','utf8'));
 await db.exec("select complete_qgang_onboarding('Melisa Yıldız','lillycha','1995-01-01')");
 assert((await db.query("select onboarding_completed_at from profiles where handle='lillycha'")).rows[0].onboarding_completed_at);
 console.log('PASS: actual legacy failure reproduction, automatic seals/backfill, stable member numbers, manual identity evidence, privilege denial and member onboarding.');await db.close();
})().catch(e=>{console.error(e);process.exit(1)});
