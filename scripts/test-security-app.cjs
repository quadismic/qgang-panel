const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict');
function load(file,mocks={},globals={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>mocks[n]??(n==='@/lib/theme'?load('src/lib/theme.ts'):require(n)),URL,URLSearchParams,Buffer,Date,Request,Response,AbortSignal,performance,process:{env:{}},...globals});return exports}
(async()=>{
 const {normalizeDesign}=load('src/lib/design.ts');
 for(const value of ['/x</style><script>alert(1)</script>','//evil.example/image','https://user:pass@example.com/x','/x%3c/script','/x\\evil','/a\nb'])assert.notEqual(normalizeDesign({loginBackground:value}).loginBackground,value);
 assert.equal(normalizeDesign({loginBackground:'https://example.com/a.webp?q=1'}).loginBackground,'https://example.com/a.webp?q=1');
 const design=load('src/components/DesignRuntime.tsx',{'@/components/ThemeCampaign':{ThemeCampaign:()=>null},'@/lib/design-server':{getActiveDesign:async()=>({...normalizeDesign({}),theme:undefined,loginBackground:'/x</style><script>alert(1)</script>'})}});
 const html=require('react-dom/server').renderToStaticMarkup(await design.DesignRuntime());assert(!html.includes('<script>'));assert.equal((html.match(/<\/style>/g)||[]).length,1);
 const {middleware}=load('src/middleware.ts');const {NextRequest}=require('next/server');
 for(const origin of [undefined,'null','https://evil.example','http://q-gang.com']){const r=await middleware(new NextRequest('https://q-gang.com/api/roles',{method:'POST',headers:origin?{origin}:{}}));assert.equal(r.status,403)}
 assert.equal((await middleware(new NextRequest('https://q-gang.com/api/roles',{method:'POST',headers:{origin:'https://q-gang.com'}}))).status,200);
 assert.equal((await middleware(new NextRequest('https://q-gang.com/api/roles',{method:'POST',headers:{origin:'https://q-gang.com','sec-fetch-site':'cross-site'}}))).status,403);
 const {profileImage}=load('src/lib/profile-image.ts');const sharp=require('sharp');const bytes=await sharp({create:{width:3,height:2,channels:3,background:'#ffffff'}}).png().toBuffer();const safe=await profileImage(new File([bytes],'x.png',{type:'image/png'}),3145728);assert.equal((await sharp(safe).metadata()).format,'webp');
 await assert.rejects(profileImage(new File(['<svg/>'],'x.png',{type:'image/png'}),3145728));await assert.rejects(profileImage(new File([bytes],'x.png',{type:'image/png'}),1));
 let cookie,deleted=false,saved=0,fetches=0;const user={id:'user'};
 const steam=load('src/app/auth/steam/route.ts',{'next/headers':{cookies:async()=>({get:()=>cookie?{value:cookie}:undefined,set:(_,v,options)=>{if(options.maxAge===0){assert.equal(options.path,"/");deleted=true;cookie=undefined}else cookie=v},delete:()=>{deleted=true;cookie=undefined}})},'@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user}})},from:()=>({upsert:async()=>{saved++;return {error:null}}})})}},{fetch:async()=>{fetches++;return new Response('is_valid:true\n')}});
 const start=await steam.GET(new Request('https://q-gang.com/auth/steam'));const auth=new URL(start.headers.get('location'));const callback=new URL(auth.searchParams.get('openid.return_to'));assert.equal(callback.searchParams.get('state').length,64);const stored=cookie;
 const invalid=new URL(callback);invalid.searchParams.set('state','0'.repeat(64));await steam.GET(new Request(invalid));assert.equal(saved,0);assert.equal(fetches,0);assert(deleted);
 cookie=stored;const valid=new URL(callback);for(const [k,v]of Object.entries({'openid.mode':'id_res','openid.return_to':callback.toString(),'openid.op_endpoint':'https://steamcommunity.com/openid/login','openid.identity':'https://steamcommunity.com/openid/id/12345678901234567','openid.claimed_id':'https://steamcommunity.com/openid/id/12345678901234567','openid.signed':'return_to,op_endpoint,identity,claimed_id,response_nonce','openid.response_nonce':new Date().toISOString().replace(/\.\d{3}Z/,'Z')+'random'}))valid.searchParams.set(k,v);
 for(const change of [u=>u.searchParams.set('openid.return_to','https://evil.example'),u=>u.searchParams.set('openid.signed','identity,claimed_id'),u=>u.searchParams.set('openid.response_nonce','2000-01-01T00:00:00Zold')]){cookie=stored;const bad=new URL(valid);change(bad);await steam.GET(new Request(bad));assert.equal(saved,0);assert.equal(fetches,0)}
 cookie=JSON.stringify({...JSON.parse(stored),userId:'another-user'});await steam.GET(new Request(valid));assert.equal(saved,0);
 cookie=JSON.stringify({...JSON.parse(stored),expires:0});await steam.GET(new Request(valid));assert.equal(saved,0);
 cookie=stored;
 await steam.GET(new Request(valid));assert.equal(saved,1);assert.equal(fetches,1);assert.equal(cookie,undefined);
 await steam.GET(new Request(valid));assert.equal(saved,1);assert.equal(fetches,1);
 for(const is_suspended of [false,true]){
  const supabase={from:table=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:{role:'founder',is_suspended}})};return q}};
  const mocks={'react':{cache:f=>f},'@/lib/supabase/server':{createClient:async()=>supabase,getCurrentUser:async()=>user}};
  mocks['@/lib/viewer']=load('src/lib/viewer.ts',mocks);
  assert.equal(await load('src/lib/access.ts',mocks).hasPermission(user.id,'members.manage'),!is_suspended);
  const permissions=await load('src/lib/permissions.ts',mocks).getPermissions();assert.equal(permissions.permissions.has('*'),!is_suspended);
 }
 const notifications=load('src/app/api/notifications/route.ts',{'@/lib/supabase/server':{getCurrentUser:async()=>user}});assert.equal((await notifications.POST()).status,403);
 console.log('PASS actual application: design raw-style breakout, URL validation, Origin gate, real image decoding, Steam session state/valid binding/replay rejection, forged notification API');
})().catch(e=>{console.error(e);process.exit(1)});
