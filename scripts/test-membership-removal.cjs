const assert=require('node:assert/strict');const fs=require('node:fs');const {reviewDb,ids}=require('../tests/helpers/membership-review-db.cjs');
(async()=>{const db=await reviewDb();
 await db.query("insert into private.membership_review_periods(year,sequence) values(2026,1)");const p=(await db.query('select id from private.membership_review_periods')).rows[0].id;
 await db.query("insert into private.membership_review_subjects(period_id,user_id,display_name,role_snapshot) values($1,$2,'Test','member')",[p,ids.member]);const subject=(await db.query('select id from private.membership_review_subjects')).rows[0].id;
 await db.query("insert into private.membership_review_evaluations(period_id,subject_id,author_id,communication,bond,belonging,participation,intent,category,rationale) values($1,$2,$3,'unknown','unknown','unknown','unknown','unknown','unknown','CONFIDENTIAL_TEST')",[p,subject,ids.one]);
 // Mimic the live rich-text publication. Existing history must never be edited/deleted.
 for(const slug of ['aydinlatma','saklama']){const d=(await db.query('select draft_body from privacy_documents where slug=$1',[slug])).rows[0];const part=d.draft_body.split('\n\nÜyelik değerlendirmeleri\n')[1];const body='<!--qgang-rich:v1--><p>Üyelik değerlendirmeleri</p><p>'+part+'</p>';await db.query('update privacy_documents set draft_body=$2,published_revision=2 where slug=$1',[slug,body]);await db.query('insert into privacy_document_versions values($1,2,$2)',[slug,body]);}
 const history=(await db.query('select * from privacy_document_versions order by slug,revision')).rows;const roles=(await db.query('select id,role from profiles order by id')).rows;
 await db.exec(fs.readFileSync('supabase/migrations/'+fs.readdirSync('supabase/migrations').find(n=>n.endsWith('_remove_membership_reviews.sql')),'utf8'));
 assert.equal((await db.query("select count(*)::int n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='private' and c.relname like 'membership_review_%' and relkind='r'")).rows[0].n,0);
 assert.equal((await db.query("select count(*)::int n from pg_proc where proname like 'membership_review_%' or proname like '%before_reviews'")).rows[0].n,0);
 assert.equal((await db.query("select count(*)::int n from role_permissions where permission like 'reviews.%'")).rows[0].n,0);
 assert.deepEqual((await db.query('select id,role from profiles order by id')).rows,roles);assert.deepEqual((await db.query('select * from privacy_document_versions order by slug,revision')).rows,history);
 for(const d of (await db.query('select draft_body,published_revision from privacy_documents')).rows){assert.equal(d.draft_body,'');assert.equal(d.published_revision,null);}
 assert.equal((await db.query("select retention_rules ? 'reviews_months' as present from privacy_settings")).rows[0].present,false);
 assert.equal((await db.query("select has_function_privilege('anon','public.set_role_permission(text,text,boolean)','execute') as access")).rows[0].access,false);
 await db.query("select public.set_role_permission('admin','events.view',true)");assert.deepEqual((await db.query('select private.privacy_retention_snapshot() result')).rows[0].result,{});
 await db.exec(`select set_config('request.jwt.claim.sub','${ids.member}',false);set role authenticated`);await assert.rejects(()=>db.query("select public.save_privacy_settings(array['x@y.com'],'{}','not allowed reason')"),/not_authorized/);
 await assert.rejects(()=>db.query('select public.membership_review_snapshot()'),/does not exist/);await db.close();console.log('PASS retirement: populated module removed, permissions/functions restored, original profiles and immutable privacy history preserved, module-only publications withdrawn, anonymous grants closed.');
})().catch(e=>{console.error(e);process.exit(1)});
