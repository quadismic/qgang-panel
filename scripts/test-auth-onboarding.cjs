const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');const {NextRequest}=require('next/server');
let complete=false,maintenance=false;const user={id:'00000000-0000-4000-8000-000000000001'};
function load(file,mocks={}){const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name=>Object.hasOwn(mocks,name)?mocks[name]:require(name),m,m.exports);return m.exports;}
const authNext=load('src/lib/auth-next.ts').authNext;
for(const raw of ['/onboarding?next=/onboarding','/login','https://evil.test','//evil.test','/\\evil.test','/auth/callback'])assert.equal(authNext(raw),'/profil');
assert.equal(authNext('/topluluk?manage=1'),'/topluluk?manage=1');
process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='test-only';
const middleware=load('src/middleware.ts',{'@supabase/ssr':{createServerClient(_u,_k,options){return {auth:{async getUser(){options.cookies.setAll([{name:'qa-session',value:'refreshed-test',options:{path:'/',httpOnly:true,sameSite:'lax'}}]);return {data:{user}};}},from(table){return {select(){return this},eq(){return this},async maybeSingle(){return {data:table==='system_settings'?{value:{enabled:maintenance}}:{role:'member',onboarding_completed_at:complete?'2026-10-04':null}}}}}}}}}).middleware;
(async()=>{
 let r=await middleware(new NextRequest('https://q-gang.com/onboarding'));assert(!r.headers.get('location'),'Onboarding must not redirect to itself');
 r=await middleware(new NextRequest('https://q-gang.com/api/onboarding',{method:'POST'}));assert(!r.headers.get('location'),'Submission must reach the authenticated handler');
 r=await middleware(new NextRequest('https://q-gang.com/profil'));assert.equal(new URL(r.headers.get('location')).pathname,'/onboarding');assert(r.headers.get('set-cookie').includes('qa-session=refreshed-test'),'Refresh cookies survive redirect');
 complete=true;r=await middleware(new NextRequest('https://q-gang.com/profil'));assert(!r.headers.get('location'));
 maintenance=true;r=await middleware(new NextRequest('https://q-gang.com/onboarding'));assert.equal(new URL(r.headers.get('location')).pathname,'/bakim','Maintenance authorization remains enforced');
 console.log('PASS: onboarding no self-redirect, POST handler reachable, session refresh retained, safe next destinations and maintenance protection.');
})().catch(e=>{console.error(e);process.exit(1)});
