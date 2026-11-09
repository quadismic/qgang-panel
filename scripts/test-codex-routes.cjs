const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
function load(file){
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{
  exports,URL,require(name){assert.equal(name,"next/server");return{NextResponse:{redirect:(url,status)=>({url,status}),json:(body,options)=>({body,...options})}}}
 });
 return exports;
}
const sanction=load("src/app/api/moderation/sanction/route.ts");
const redirect=sanction.POST({url:"https://q-gang.com/api/moderation/sanction"});
assert.equal(redirect.url.pathname,"/yonetim/moderasyon");assert.equal(redirect.status,303);
const pdf=load("src/app/api/codex/compilations/route.ts");
assert.equal(pdf.GET().status,410);assert.equal(pdf.POST().status,410);
console.log("PASS: retired sanction and PDF endpoints cannot create legacy records or serve obsolete files.");
