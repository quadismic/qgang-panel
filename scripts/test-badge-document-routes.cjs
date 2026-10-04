const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const actor='11111111-1111-4111-8111-111111111111',target='22222222-2222-4222-8222-222222222222';let state;
function load(file,mocks){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;vm.runInThisContext(`(function(require,module,exports){${code}\n})`,{filename:file})(name=>Object.hasOwn(mocks,name)?mocks[name]:require(name),m,m.exports);return m.exports;}
const client={async rpc(name,args){state.calls.push({name,args});if(name==='manage_badge')return{error:state.rpcError};if(name==='current_codex_document')return{data:state.current,error:null};if(name==='begin_codex_compilation')return{data:state.beginError?null:{id:target,created_at:'2026-10-04T10:00:00Z',snapshot:[{id:'rule',kind:'KURAL'}],include_decisions:false},error:state.beginError};return{error:null};},storage:{from(){return{async upload(path,pdf,options){state.upload={path,pdf,options};return{error:null};},async createSignedUrl(){return state.signError?{error:{message:'sign failure'}}:{data:{signedUrl:'https://test.invalid/document.pdf'}};}};}}};
const common={'@/lib/supabase/server':{createClient:async()=>client,getCurrentUser:async()=>state.signedIn?{id:actor}:null},'@/lib/access':{hasPermission:async()=>state.permission}};
const badges=load('src/app/api/badges/route.ts',common),documents=load('src/app/api/codex/compilations/route.ts',{...common,'@/lib/documents/codex-pdf':{renderCodex:async()=>{state.renders++;if(state.renderError)throw new Error('render failure');return Buffer.from('%PDF-example');}}});
function reset(extra={}){state={signedIn:true,permission:true,calls:[],renders:0,...extra};}
function request(fields={},path='badges'){const form=new FormData();for(const[k,v]of Object.entries(fields))form.set(k,v);return new Request('https://test.invalid/api/'+path,{method:'POST',body:form});}
const badgeFields={action:'award',target_id:target,badge_id:actor,reason:'Somut katkı gerekçesi'},documentFields={confirmation:'KODEKSİ DERLE',decisions:'false'};
(async()=>{
 reset({signedIn:false});assert.equal((await badges.POST(request(badgeFields))).status,403);assert.equal(state.calls.length,0);
 reset({permission:false});assert.equal((await documents.POST(request(documentFields))).status,403);
 reset();assert.equal((await badges.POST(request({...badgeFields,target_id:'invalid'}))).status,400);assert.equal(state.calls.length,0);
 reset();assert.equal((await badges.POST(request({...badgeFields,reason:'x'}))).status,400);
 reset({rpcError:{message:'internal SQL information'}});const denied=await badges.POST(request(badgeFields));assert.equal(denied.status,400);assert.doesNotMatch(await denied.text(),/internal SQL/);
 reset();assert.equal((await badges.POST(request(badgeFields))).status,303);assert.equal(state.calls[0].name,'manage_badge');assert.equal(state.calls[0].args.p_reason,badgeFields.reason);
 reset({signedIn:false});assert.equal((await documents.GET(new Request('https://test.invalid/api/codex/compilations'))).status,401);
 reset();assert.equal((await documents.POST(request({confirmation:'wrong'}))).status,400);assert.equal(state.calls.length,0);
 reset({current:{current:true,storage_path:'existing.pdf'}});assert.equal((await (await documents.POST(request(documentFields))).json()).cached,true);assert.equal(state.renders,0);assert.ok(!state.calls.some(c=>c.name==='begin_codex_compilation'));
 reset();assert.equal((await documents.POST(request(documentFields))).status,200);assert.equal(state.upload.options.upsert,false);const finish=state.calls.find(c=>c.name==='finish_codex_compilation');assert.match(finish.args.p_source_hash,/^[a-f0-9]{64}$/);assert.match(finish.args.p_artifact_hash,/^[a-f0-9]{64}$/);assert.equal(finish.args.p_failed,false);
 reset({renderError:true});assert.equal((await documents.POST(request(documentFields))).status,500);assert.equal(state.calls.at(-1).args.p_failed,true);
 reset({signError:true});assert.equal((await documents.POST(request(documentFields))).status,500);assert.equal(state.calls.filter(c=>c.name==='finish_codex_compilation').length,1);assert.equal(state.calls.at(-1).args.p_failed,false);
 console.log('PASS: badge and PDF API authentication, validation, private errors, cached artifact reuse, immutable upload, hashes, render failure and saved-artifact preservation.');
})().catch(e=>{console.error(e);process.exit(1)});
