const {PGlite}=require('@electric-sql/pglite');const fs=require('fs'),assert=require('node:assert/strict');
(async()=>{const db=new PGlite();await db.exec(`create role anon;create role authenticated;create schema private;create table regulations(id int,title text,body text,kind text,number text,parent_rule_id int,section_number text,status text,published_at timestamptz,effective_at timestamptz,revision int,updated_at timestamptz,created_by text,basis_rule_id int,basis_revision int,change_reason text,application_scope text,decision_priority text,decision_pinned boolean,legacy_announcement_id int);alter table regulations enable row level security;
insert into regulations(id,kind,status,published_at) values(1,'KURAL','yururlukte',now()),(2,'İLKE','yururlukte',now()),(3,'YÖNERGE','yururlukte',now()),(4,'KARAR','yururlukte',now()),(5,'KURAL','taslak',now()),(6,'YÖNERGE','yururlukte',now()+interval '1 day'),(7,'KURAL','yururlukte',null),(8,'KURAL','yururlukten_kaldirildi',now());`);
await db.exec(`grant select(id,title,body,kind,decision_priority,decision_pinned,published_at,effective_at,status,revision,legacy_announcement_id) on regulations to anon;create policy "guests read published executive decisions" on regulations for select to anon using(kind='KARAR' and status<>'taslak' and published_at<=now());`);
await db.exec(fs.readFileSync('supabase/migrations/20261006181931_public_codex_read.sql','utf8'));await db.exec(fs.readFileSync('supabase/migrations/20261108123250_normative_codex_edition.sql','utf8'));
await db.exec(`insert into regulations(id,kind,status,published_at,effective_at,normative_edition) values
 (10,'YÖNERGE','yururlukte',now(),now(),true),
 (11,'KARAR','yururlukten_kaldirildi',now(),now(),true),
 (12,'YÖNERGE','taslak',now(),null,true),
 (13,'KARAR','yururlukte',now()+interval '1 day',null,true),
 (14,'YÖNERGE','yururlukte',null,null,true);`);
await assert.rejects(db.exec('update regulations set normative_edition=true where id=3'),/immutable_codex_edition/);
await db.exec('set role anon');
const page=fs.readFileSync('src/app/rules/page.tsx','utf8');
assert.deepEqual((await db.query('select id from regulations order by id')).rows.map(r=>r.id),[1,2,3,4,8,10,11]);
await db.exec("reset role; alter table regulations add column decision_category text; grant select(decision_category) on regulations to anon; set role anon");
const readerColumns=page.match(/const published=\(\)=>s\.from\("regulations"\)\.select\("([^"]+)"\)/)[1];
const readerWhere="normative_edition and kind in ('YÖNERGE','KARAR') and status <> 'taslak' and published_at <= now()";
assert.deepEqual((await db.query(`select ${readerColumns} from regulations where ${readerWhere} order by id`)).rows.map(r=>r.id),[10,11]);
assert.deepEqual((await db.query(`select id from regulations where ${readerWhere} and id in (3,4,12,13,14)`)).rows,[]);
for(const col of ['created_by','change_reason','application_scope'])await assert.rejects(db.query(`select ${col} from regulations`),/permission denied/);
await assert.rejects(db.exec("insert into regulations(id) values(99)"),/permission denied/);await assert.rejects(db.exec("update regulations set title='bad'"),/permission denied/);await assert.rejects(db.exec('delete from regulations'),/permission denied/);
await db.close();console.log('Public Codex: page columns, published kinds, archived records, hidden drafts/future/unpublished, private columns and denied writes passed.');})().catch(e=>{console.error(e);process.exit(1)});
