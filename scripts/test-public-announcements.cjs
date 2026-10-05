const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const db=new PGlite();await db.exec(`
create role anon;
create table announcements(id int,title text,body text,category text,priority text,is_pinned boolean,published_at timestamptz,expires_at timestamptz,created_by uuid);
create table regulations(id int,title text,body text,kind text,decision_priority text,decision_pinned boolean,published_at timestamptz,effective_at timestamptz,status text,revision int,legacy_announcement_id int,created_by uuid);
alter table announcements enable row level security;alter table regulations enable row level security;
insert into announcements(id,title,category,published_at,expires_at) values(1,'public','DUYURU',now()-interval '1 day',null),(2,'future','DUYURU',now()+interval '1 day',null),(3,'expired','DUYURU',now()-interval '1 day',now()-interval '1 hour');
insert into regulations(id,title,kind,status,published_at) values(4,'decision','KARAR','yururlukte',now()),(5,'draft','KARAR','taslak',now()),(6,'rule','KURAL','yururlukte',now()),(7,'future','KARAR','yururlukte',now()+interval '1 day');
create view announcement_feed with(security_invoker=true) as select a.id,a.title from announcements a where a.category='DUYURU' and a.published_at<=now() and not exists(select 1 from regulations r where r.legacy_announcement_id=a.id) union all select r.id,r.title from regulations r where r.kind='KARAR' and r.status<>'taslak' and r.published_at<=now();
grant select on announcement_feed to anon;
`);await db.exec(fs.readFileSync('supabase/migrations/20261005174749_public_announcement_read.sql','utf8'));await db.exec('set role anon');assert.deepEqual((await db.query('select id from announcement_feed order by id')).rows.map(r=>r.id),[1,4]);for(const q of ['select created_by from announcements','select created_by from regulations',"update announcements set title='changed'",'delete from regulations'])await assert.rejects(()=>db.query(q),/permission denied/);console.log('PASS: public notices/decisions; hidden drafts, future, expired, rules; denied private columns and writes');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
