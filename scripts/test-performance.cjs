const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict'),sharp=require('sharp');
function load(file,deps={},globals={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{exports,require:n=>deps[n]??(n==='@/lib/theme'?load('src/lib/theme.ts'):require(n)),URL,URLSearchParams,AbortSignal,process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://kttebbvinfmauthmayqp.supabase.co',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'public-test-key'}},...globals});return exports;}
function requestCache(f){const memo=new Map();return(...args)=>{const k=JSON.stringify(args);if(!memo.has(k))memo.set(k,f(...args));return memo.get(k)}}
(async()=>{
 const calls=[];const rows={alice:{id:'alice',role:'admin',is_suspended:false},bob:{id:'bob',role:'member',is_suspended:false},banned:{id:'banned',role:'founder',is_suspended:true}};
 const db={from:table=>{let id;const q={select:()=>q,eq:(k,v)=>{if(k==='id'||k==='user_id')id=v;return q},maybeSingle:async()=>{calls.push([table,id]);return {data:table==='profiles'?rows[id]:{status:'active'}}},then:resolve=>{calls.push([table,id]);return Promise.resolve({data:[{permission:'members.manage'}]}).then(resolve)}};return q}};
 const mocks={'react':{cache:requestCache},'@/lib/supabase/server':{createClient:async()=>db,getCurrentUser:async()=>({id:'alice'})}};
 const viewer=load('src/lib/viewer.ts',mocks);mocks['@/lib/viewer']=viewer;
 const access=load('src/lib/access.ts',mocks),permissions=load('src/lib/permissions.ts',mocks);
 await Promise.all([access.hasPermission('alice','members.manage'),permissions.getPermissions(),viewer.getViewerProfile('alice'),viewer.getViewerMembership('alice'),viewer.getViewerMembership('alice')]);
 assert.equal(calls.filter(c=>c[0]==='profiles'&&c[1]==='alice').length,1);assert.equal(calls.filter(c=>c[0]==='role_permissions').length,1);assert.equal(calls.filter(c=>c[0]==='community_memberships').length,1);
 assert.equal((await viewer.getViewerProfile('bob')).id,'bob');assert.equal(await access.hasPermission('banned','members.manage'),false);
 // A new render has fresh request-local caches, including a permission/suspension change.
 rows.alice.is_suspended=true;const next=load('src/lib/viewer.ts',mocks);assert.equal((await next.getViewerProfile('alice')).is_suspended,true);assert.equal(calls.filter(c=>c[0]==='profiles'&&c[1]==='alice').length,2);
 let reads=0,value={primary:'#112233'},invalidate=0;const cache=new Map();
 const publicDb={from:()=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>{reads++;return {data:{settings:value},error:null}}};return q}};
 const nextCache={unstable_cache:fn=>(...args)=>{const key=JSON.stringify(args);if(!cache.has(key))cache.set(key,fn(...args));return cache.get(key)},revalidateTag:tag=>{assert.equal(tag,'qg-public-design');invalidate++;cache.clear()},revalidatePath:()=>{}};
 const designs=load('src/lib/design-server.ts',{'react':{cache:f=>f},'next/cache':nextCache,'@supabase/supabase-js':{createClient:(url,key,options)=>{assert.equal(url,'https://kttebbvinfmauthmayqp.supabase.co');assert.equal(key,'public-test-key');assert.equal(options.auth.persistSession,false);assert.equal(options.auth.autoRefreshToken,false);assert(!options.global.headers);return publicDb}},'@/lib/design':load('src/lib/design.ts')});
 assert.equal((await designs.getActiveDesign()).primary,'#112233');await designs.getActiveDesign();assert.equal(reads,1);
 const adminDb={auth:{getUser:async()=>({data:{user:{id:'leader'}}})},from:()=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:null}),upsert:async input=>{value=input.settings;return {error:null}}};return q}};
 const actions=load('src/app/control/design/actions.ts',{'next/cache':nextCache,'next/navigation':{redirect:()=>{throw Error('redirect')}},'@/lib/supabase/server':{createClient:async()=>adminDb},'@/lib/design':load('src/lib/design.ts'),'@/lib/access':{hasPermission:async()=>true}});
 await actions.saveDesign({primary:'#445566'});assert.equal(invalidate,1);assert.equal((await designs.getActiveDesign()).primary,'#445566');assert.equal(reads,2);
 const {unstable_doesMiddlewareMatch}=require('next/experimental/testing/server');
 const middlewareConfig=load('src/middleware.ts').config;
 for(const path of ['/perf/qg-hash.webp','/assets/ranks/leader-frame.png','/brand/qgang-emblem.webp','/custom-font.woff2','/_next/static/chunks/a.js'])assert.equal(unstable_doesMiddlewareMatch({config:middlewareConfig,url:'https://q-gang.com'+path}),false);
 for(const path of ['/api/events','/auth/callback','/topluluk','/gizlilik/verilerim'])assert.equal(unstable_doesMiddlewareMatch({config:middlewareConfig,url:'https://q-gang.com'+path}),true);
 const manifest=require('../src/lib/performance-assets.json'),images=load('src/lib/presentation-image.ts',{'@/lib/performance-assets.json':manifest});let before=0,after=0;
 const sourceSizes=[2108864,2194109,2580793,2326648];let index=0;
 for(const [source,variants]of Object.entries(manifest)){
  for(const v of variants){const meta=await sharp('public'+v.src).metadata();assert.equal(meta.format,'webp');assert.equal(meta.width,v.width);assert.equal(fs.statSync('public'+v.src).size,v.bytes)}
  if(source.startsWith('https:')){before+=sourceSizes[index++];after+=variants.find(v=>v.width>=960).bytes;assert(images.portraitSources(source).includes('480w'))}
 }
 assert(after<before*0.2);assert.equal(images.thumbnail('https://evil.example/x.png'),'https://evil.example/x.png');assert.equal(images.thumbnail('https://kttebbvinfmauthmayqp.supabase.co/storage/v1/object/private/qgang-documents/a.png'),'https://kttebbvinfmauthmayqp.supabase.co/storage/v1/object/private/qgang-documents/a.png');assert(images.thumbnail('https://kttebbvinfmauthmayqp.supabase.co/storage/v1/object/public/qgang-avatars/a.png',256).startsWith('/_next/image?'));
 // The OAuth SDK is fetched on interaction; the destination sanitization is unchanged.
 const authNext=load('src/lib/auth-next.ts');
 for(const requested of ['/etkinlikler?view=archive','//evil.example']){
  let imports=0,oauth;
  const authDeps={'react':{useState:initial=>[initial,()=>{}]},'@/lib/auth-next':authNext};
  Object.defineProperty(authDeps,'@/lib/supabase/client',{get(){imports++;return {createClient:()=>({auth:{signInWithOAuth:async args=>{oauth=args;return {error:null}}}})}}});
  const auth=load('src/components/AuthButtons.tsx',authDeps,{location:{origin:'https://q-gang.com',search:'?next='+encodeURIComponent(requested)}});
  const tree=auth.AuthButtons();assert.equal(imports,0);
  function button(n){if(!n||typeof n!=='object')return null;if(n.type==='button')return n;for(const c of [n.props?.children].flat(Infinity)){const b=button(c);if(b)return b;}return null;}
  await button(tree).props.onClick();assert.equal(imports,1);assert.equal(oauth.provider,'google');
  const target=new URL(oauth.options.redirectTo);assert.equal(target.origin,'https://q-gang.com');assert.equal(target.searchParams.get('next'),authNext.authNext(requested));
 }
 console.log(`PASS performance: shared reads 1 profile/1 membership/1 permission query, separate viewers/renders, suspension, public-only design cache and save invalidation, decoded image variants (${before} => ${after} bytes), private/foreign image URLs untouched`);
})().catch(e=>{console.error(e);process.exit(1)});
