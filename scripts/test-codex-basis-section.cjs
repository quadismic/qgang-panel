const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const source=fs.readFileSync('src/app/rules/page.tsx','utf8');
const action=source.slice(source.indexOf('const SECTIONS='),source.indexOf('export default async function Rules'));
let saved,basis={id:'basis',kind:'KURAL',status:'yururlukte',revision:1,section_number:'04'};
const client={from(table){return{select(){return this},eq(){return this},single:async()=>({data:table==='profiles'?{role:'founder'}:{id:'new'}}),maybeSingle:async()=>({data:basis}),insert(record){saved=record;return this}}}};
const context={createClient:async()=>client,getCurrentUser:async()=>({id:'actor'}),normalizeRich:x=>x,validRich:()=>true,hasPermission:async()=>true,isEffective:b=>b.status==='yururlukte',revalidatePath:()=>{},redirect:path=>{throw new Error(path)},Date,Number,String};
vm.createContext(context);vm.runInContext(ts.transpileModule(action,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,context);
async function submit(kind,section){saved=undefined;const form=new FormData();for(const [key,value]of Object.entries({kind,section_number:section,title:'Başlık',body:'İçerik',reason:'Gerekçe',basis_rule_id:'basis',basis_revision:'1'}))form.set(key,value);try{await context.saveRule(form)}catch(error){return error.message}}
(async()=>{
 for(const kind of ['YÖNERGE','KARAR'])for(const section of ['','01','invalid']){assert.match(await submit(kind,section),/rule=new&section=04/);assert.equal(saved.section_number,'04')}
 assert.match(await submit('KURAL','02'),/section=02/);assert.equal(saved.section_number,'02');
 assert.match(await submit('İLKE','invalid'),/validation/);assert.equal(saved,undefined);
 basis={...basis,section_number:null};assert.match(await submit('YÖNERGE','04'),/error=basis/);assert.equal(saved,undefined);
 console.log('PASS codex section: directives/decisions derive from basis despite missing or forged form values; primary selection and invalid basis rejection preserved.');
})().catch(error=>{console.error(error);process.exit(1)});
