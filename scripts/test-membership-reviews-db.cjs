const assert=require('node:assert/strict');const {reviewDb}=require('../tests/helpers/membership-review-db.cjs');
const ids={leader:'10000000-0000-4000-8000-000000000001',admin:'10000000-0000-4000-8000-000000000002',one:'10000000-0000-4000-8000-000000000003',two:'10000000-0000-4000-8000-000000000004',member:'10000000-0000-4000-8000-000000000005',guest:'10000000-0000-4000-8000-000000000006',other:'10000000-0000-4000-8000-000000000007'};
(async()=>{const db=await reviewDb();
 async function systemQuery(sql,args=[]){await db.exec('reset role');try{return await db.query(sql,args);}finally{await db.exec('set role authenticated');}}
 async function actor(name){await db.exec(`reset role;select set_config('request.jwt.claim.sub','${ids[name]}',false);set role authenticated;`)}
 async function command(action,period,data={}){return (await db.query('select public.membership_review_command($1,$2,$3) as result',[action,period,JSON.stringify(data)])).rows[0].result}
 async function snapshot(period=null){return (await db.query('select public.membership_review_snapshot($1) as result',[period])).rows[0].result}
 await actor('member');await assert.rejects(()=>snapshot(),/review_forbidden/);
 await actor('leader');const p=(await command('create',null)).id;await command('scope',p,{ids:[ids.member]});assert.equal((await snapshot(p)).subjects.length,1);assert.equal((await snapshot(p)).subjects[0].role_snapshot,'member');
 await assert.rejects(()=>command('scope',p,{ids:[ids.one]}),/review_manager_subject/);
 await command('scope',p,{ids:[ids.member,ids.guest]});await command('manual',p,{name:'WhatsApp Kişisi'});await assert.rejects(()=>command('manual',p,{name:'WhatsApp Kişisi'}),/review_duplicate/);
 await command('reviewers',p,{ids:[ids.one,ids.two]});await assert.rejects(()=>command('start',p,{}),/review_start_invalid/);await command('start',p,{confirm:true});await assert.rejects(()=>command('manual',p,{name:'Late'}),/review_scope_locked/);
 const subject=(await snapshot(p)).subjects[0].id;
 await actor('one');await assert.rejects(()=>db.query('select * from private.membership_review_evaluations'),/permission denied/);const answers={subject_id:subject,communication:'regular',bond:'strong',belonging:'yes',participation:'limited',intent:'continue',category:'C',rationale:'',revision:0,submitted:true};await assert.rejects(()=>command('evaluation',p,answers),/check constraint/);
 await command('evaluation',p,{...answers,category:'A',rationale:'REVIEWER_ONE_SECRET'});await assert.rejects(()=>command('evaluation',p,{...answers,category:'A',rationale:'FORGED'}),/review_conflict/);
 await actor('two');assert.equal((await snapshot(p)).evaluations.length,0);assert(!JSON.stringify(await snapshot(p)).includes('REVIEWER_ONE_SECRET'));
 await actor('admin');assert.equal((await snapshot(p)).evaluations.length,0);await assert.rejects(()=>command('review',p,{confirm:true,reason:'Use admin escalation'}),/review_founder_only/);
 await actor('leader');assert(JSON.stringify(await snapshot(p)).includes('REVIEWER_ONE_SECRET'));await assert.rejects(()=>command('review',p,{}),/review_incomplete/);await command('review',p,{confirm:true,reason:'Incomplete answers explicitly accepted'});await command('assign_interview',p,{subject_id:subject,assigned_to:ids.one});const interview=(await snapshot(p)).interviews[0];
 await actor('one');await command('interview',p,{id:interview.id,revision:1,state:'done',contact_log:'Attempted contact on two days',explanation_offered:true,member_response:'MEMBER_RESPONSE_SECRET',summary:'INTERVIEW_SECRET'});
 await actor('admin');const admin=await snapshot(p);assert.equal(admin.interviews.length,1);assert.equal(admin.interviews[0].summary,undefined);assert(!JSON.stringify(admin).includes('INTERVIEW_SECRET'));await assert.rejects(()=>command('interview',p,{id:interview.id,revision:2,state:'done',summary:'overwrite'}),/review_forbidden/);
 await actor('leader');await command('decision',p,{subject_id:subject,outcome:'continue',reason:'DECISION_PRIVATE_REASON',shared_text:'RELEASED_MINIMAL_TEXT',revision:0});await assert.rejects(()=>command('release',p,{subject_id:subject,confirm:true}),/review_confirm_required/);await command('finalize',p,{subject_id:subject,confirm:true});
 await actor('two');assert.equal((await snapshot(p)).released.length,0);assert.equal((await snapshot(p)).decisions.length,0);
 await actor('leader');await command('release',p,{subject_id:subject,confirm:true});
 await actor('two');const released=await snapshot(p);assert.equal(released.released[0].body,'RELEASED_MINIMAL_TEXT');assert(!JSON.stringify(released).includes('DECISION_PRIVATE_REASON'));assert(!JSON.stringify(released).includes('MEMBER_RESPONSE_SECRET'));
 await actor('leader');await db.query("select public.set_role_permission('admin','reviews.confidential',true)");await actor('admin');assert(JSON.stringify(await snapshot(p)).includes('INTERVIEW_SECRET'));await actor('leader');await db.query("select public.set_role_permission('admin','reviews.confidential',false)");await actor('admin');assert(!JSON.stringify(await snapshot(p)).includes('INTERVIEW_SECRET'));
 await actor('leader');await assert.rejects(()=>db.query("select public.set_role_permission('member','reviews.confidential',true)"),/invalid_review_permission/);
 await db.exec(`reset role;update profiles set role='member' where id='${ids.one}';`);await actor('one');await assert.rejects(()=>snapshot(p),/review_forbidden/);

 await actor('leader');await assert.rejects(()=>command('archive',p,{confirm:true}),/review_unfinished/);
 const beforeRoles=(await systemQuery('select id,role from public.profiles order by id')).rows;
 const all=(await snapshot(p)).subjects;
 for(const person of all.filter(s=>s.id!==subject)){await command('decision',p,{subject_id:person.id,outcome:'end',reason:'End requires a formal linked ruling',shared_text:'Minimal final decision text',revision:0});await assert.rejects(()=>command('finalize',p,{subject_id:person.id,confirm:true}),/review_explanation_required/);await command('decision',p,{subject_id:person.id,outcome:'continue',reason:'Membership continues after review',shared_text:'Minimal final decision text',revision:1});await command('finalize',p,{subject_id:person.id,confirm:true});}
 await command('archive',p,{confirm:true});
 const notReleased=all.find(s=>s.id!==subject);await command('release',p,{subject_id:notReleased.id,confirm:true});
 await assert.rejects(()=>command('evaluation',p,answers),/review_closed/);
 assert.deepEqual((await systemQuery('select id,role from public.profiles order by id')).rows,beforeRoles,'No membership role writes');
 await actor('member');const ownExport=(await db.query('select public.membership_review_privacy_export() as data')).rows[0].data;assert(!JSON.stringify(ownExport).includes('REVIEWER_ONE_SECRET'));
 await assert.rejects(()=>db.query('select public.membership_review_retention()'),/not_authorized/);
 await actor('leader');await assert.rejects(()=>db.query("select public.membership_review_retention('redact',$1,null,'Explicit retention review',true)",[p]),/review_retention_not_due/);
 await db.exec('reset role');await db.query("update private.membership_review_periods set closed_at=now()-interval '3 years' where id=$1",[p]);await db.exec('set role authenticated');
 await db.query("select public.membership_review_retention('hold',$1,now()+interval '1 month','Necessary litigation hold',true)",[p]);
 await assert.rejects(()=>db.query("select public.membership_review_retention('redact',$1,null,'Explicit retention review',true)",[p]),/review_retention_not_due/);
 await db.exec('reset role');await db.query("update private.membership_review_periods set hold_until=now()-interval '1 day' where id=$1",[p]);await db.exec('set role authenticated');
 await db.query("select public.membership_review_retention('redact',$1,null,'Explicit retention review',true)",[p]);const redacted=await snapshot(p);assert(redacted.subjects.every(s=>!s.user_id&&!s.handle));assert(!JSON.stringify(redacted).includes('INTERVIEW_SECRET'));assert(!JSON.stringify(redacted).includes('DECISION_PRIVATE_REASON'));assert.equal(redacted.periods.find(r=>r.id===p).label,'2026/I');
 const pub=(await systemQuery("select body from public.privacy_document_versions where slug='aydinlatma' and revision=1")).rows[0].body;assert.equal(pub,'Üyelik değerlendirmeleri — published baseline');
 console.log('PASS retention and archive: withheld decisions can be released after archive, private decisions stay private, active holds block redaction, identifiers/subjective text are removed only with explicit review; existing privacy publications untouched.');
 await actor('leader');const p2=(await command('create',null)).id;assert.equal((await snapshot(p2)).periods[0].label,'2026/II');
 await command('scope',p2,{ids:[ids.member]});await command('manual',p2,{name:'Later linked person'});const linked=(await snapshot(p2)).subjects.find(s=>s.manual);await command('link_manual',p2,{subject_id:linked.id,target_id:ids.other,confirm:true,reason:'Verified identity by leadership'});await command('scope',p2,{ids:[ids.member,ids.other]});assert.equal((await snapshot(p2)).subjects.filter(s=>s.user_id===ids.other).length,1);assert.equal((await snapshot(p2)).subjects.find(s=>s.id===linked.id).display_name,'Later linked person');
 await systemQuery("update public.privacy_document_versions set body='Old publication' where slug='aydinlatma'");await assert.rejects(()=>command('start',p2,{confirm:true}),/review_privacy_review_required/);await systemQuery("update public.privacy_document_versions set body='Üyelik değerlendirmeleri — published baseline' where slug='aydinlatma'");
 await systemQuery('update public.regulations set revision=2');await assert.rejects(()=>command('start',p2,{confirm:true}),/review_norm_changed/);await systemQuery('update public.regulations set revision=1');await command('start',p2,{confirm:true});
 await db.exec('reset role;set role anon');await assert.rejects(()=>snapshot(p2),/permission denied/);await actor('leader');
 console.log('PASS privacy/norm start gates, verified manual-account linkage without duplicate subjects, and anonymous RPC denial.');
 console.log('PASS membership reviews: explicit scope, no auto-platform, manual duplicate, immutable open scope, own-only answers, confidential interviews, private decisions, separate release, permission revocation and sequential periods.');await db.close();})().catch(e=>{console.error(e);process.exit(1)});
