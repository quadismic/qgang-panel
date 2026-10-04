const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,mocks={}){const loadedModule={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name=>Object.hasOwn(mocks,name)?mocks[name]:require(name),loadedModule,loadedModule.exports);return loadedModule.exports;}
let state;
const client={auth:{getUser:async()=>({data:{user:state.signedIn?{id:'actor'}:null}})},from(table){return {select(){return this},eq(){return this},maybeSingle:async()=>({data:table==='profiles'?{role:state.role}:state.basis}),insert:async(data)=>{state.inserts.push(data);return{error:null}}}}};
const codex=load('src/lib/codex.ts'),announcements=load('src/lib/announcements.ts');
const api=load('src/app/api/moderation/sanction/route.ts',{'@/lib/supabase/server':{createClient:async()=>client},'@/lib/access':{hasPermission:async()=>state.permission},'@/lib/roles':load('src/lib/roles.ts'),'@/lib/rich-text':load('src/lib/rich-text.ts'),'@/lib/codex':codex});
function reset(extra={}){state={signedIn:true,permission:true,role:'founder',basis:{id:'basis',kind:'KURAL',status:'yururlukte',effective_at:'2020-01-01'},inserts:[],...extra}}
async function submit(extra={}){const form=new FormData();for(const[k,v]of Object.entries({target_id:'target',action:'warning',reason:'Geçerli gerekçe',regulation_id:'basis',...extra}))form.set(k,v);return api.POST(new Request('https://test.invalid/api/moderation/sanction',{method:'POST',body:form}));}
(async()=>{
 reset({signedIn:false});assert.match((await submit()).headers.get('location'),/login/);
 reset({permission:false});assert.match((await submit()).headers.get('location'),/permission/);assert.equal(state.inserts.length,0);
 reset({role:'moderator'});assert.match((await submit({action:'ban'})).headers.get('location'),/permission/);
 reset();assert.match((await submit({regulation_id:'',rule_ref:'Serbest metin'})).headers.get('location'),/validation/);
 for(const basis of [null,{kind:'İLKE',status:'yururlukte'},{kind:'KURAL',status:'yururlukten_kaldirildi'},{kind:'KURAL',status:'yururlukte',effective_at:'2999-01-01'}]){reset({basis});assert.match((await submit()).headers.get('location'),/basis/);assert.equal(state.inserts.length,0);}
 reset();assert.match((await submit()).headers.get('location'),/sanctioned=1/);assert.equal(state.inserts[0].regulation_id,'basis');assert.equal(state.inserts[0].rule_ref,undefined);
 reset();assert.match((await submit({hours:'Infinity'})).headers.get('location'),/validation/);
 assert.equal(announcements.announcementType('RÜTBE EMRİ · ARŞİV'),'KARAR');assert.equal(announcements.announcementType('ETKİNLİK'),'DUYURU');
 assert.equal(codex.codexTab({kind:'KARAR'}),'decisions');assert.equal(codex.codexTab({kind:'YÖNERGE'}),'directives');assert.equal(codex.codexKindLabel('KARAR'),'İCRA KARARI');
 assert.equal(codex.canEditRule('moderator','actor',{kind:'KARAR',created_by:'actor'}),true);assert.equal(codex.canEditRule('admin','actor',{kind:'KARAR',created_by:'founder'},'founder'),false);
 assert.equal(announcements.announcementLink({id:'one',regulation_id:'decision'}),'/kodeks?rule=decision');
 console.log('PASS: sanction authentication/permission, captain escalation, required selected basis, invalid/inactive/future basis, linked inserts, duration validation, legacy types.');
})().catch(e=>{console.error(e);process.exit(1)});
