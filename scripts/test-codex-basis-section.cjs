const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const source=fs.readFileSync('src/app/rules/page.tsx','utf8');
const action=source.slice(source.indexOf('const uuid='),source.indexOf('function DocumentForm'));
let saved,role='founder',permission=true;
const client={from(){return{select(){return this},single:async()=>({data:{id:'new'}}),insert(record){saved=record;return this}}}};
const context={createClient:async()=>client,getCurrentUser:async()=>({id:'actor'}),getViewerProfile:async()=>({role}),normalizeRich:x=>x,validRich:()=>true,hasPermission:async()=>permission,revalidatePath:()=>{},redirect:path=>{throw new Error(path)},Date,Number,String};
vm.createContext(context);vm.runInContext(ts.transpileModule(action,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,context);
async function submit(kind,fields={}){saved=undefined;const form=new FormData();for(const [key,value]of Object.entries({kind,title:'Başlık',body:'İçerik',status:'taslak',...fields}))form.set(key,value);try{await context.saveDocument(form)}catch(error){return error.message}}
(async()=>{
 for(const kind of ['YÖNERGE','KARAR']){
  assert.match(await submit(kind,{section_number:'04',basis_rule_id:'legacy'}),/rule=new/);
  assert.equal(saved.section_number,'01');assert.equal(saved.basis_rule_id,undefined);assert.equal(saved.normative_edition,true);assert.equal(saved.published_at,null);
 }
 assert.match(await submit('KURAL'),/error=validation/);assert.equal(saved,undefined);
 permission=false;assert.match(await submit('KARAR'),/error=permission/);assert.equal(saved,undefined);
 role='moderator';assert.match(await submit('YÖNERGE'),/error=validation/);assert.equal(saved,undefined);
 console.log('PASS: new document authoring does not rely on old Codex records, protects drafts and retains grants.');
})().catch(error=>{console.error(error);process.exit(1)});
