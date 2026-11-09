const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
const React=require("react"),{renderToStaticMarkup}=require("react-dom/server");
function load(file,deps={}){
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,Date,Intl,require:n=>deps[n]??require(n)});
 return exports;
}
const {lobbyNavigation,lobbyNavActive}=load("src/lib/lobby-navigation.ts");
const base={canViewEvents:true,canViewDiscipline:true};
assert.deepEqual(Array.from(lobbyNavigation({}).primary,x=>x[2]),["Lobi","Topluluk"]);
assert.deepEqual(Array.from(lobbyNavigation(base).primary,x=>x[2]),["Lobi","Oyun & Etkinlikler","Topluluk"]);
assert.equal(lobbyNavigation(base).management.length,0);
assert.deepEqual(Array.from(lobbyNavigation({...base,canViewBudget:true,canManageDiscipline:true}).management,x=>x[0]),["/butce","/yonetim/moderasyon"]);
assert(lobbyNavActive("/yayinlar/bir-yayin","/topluluk"));
assert(!lobbyNavActive("/topluluk-diger","/topluluk"));
const link={default:({children,...props})=>React.createElement("a",props,children)};
const icon=load("src/components/QGIcon.tsx");
const primitives=load("src/components/ui/Primitives.tsx",{"@/components/QGIcon":icon});
const sample={id:"example",title:"Birlikte oyun gecesi",starts_at:"2099-07-03T18:00:00Z",date_only:false,location:"Steam"};
async function scenario({guest=false,member=true,event=sample,response=null,wait=false,grants=["events.view","events.propose"],eventError=false}={}){
 const calls=[];
 const deps={"next/link":link,"@/components/QGIcon":icon,
  "@/components/EventActionForm":{EventActionForm:({children})=>React.createElement("form",null,children)},
  "@/components/ui/Primitives":primitives,
  "@/lib/permissions":{getPermissions:async()=>({user:guest?null:{id:"member"},role:guest?"guest":"member",permissions:new Set(grants)}),allows:(p,k)=>p.has(k)},
  "@/lib/viewer":{getViewerMembership:async()=>member?{status:"active"}:null},
  "@/lib/supabase/server":{createClient:async()=>({from(name){
   const q={};for(const key of ["select","eq","gte","order","limit"])q[key]=(...args)=>{calls.push([name,key,...args]);return q;};
   q.maybeSingle=async()=>name==="community_events"?{data:event,error:eventError?{}:null}:{data:response?{response}:null};return q;
  },rpc:async(name)=>{calls.push([name]);return {data:[{going:3,waiting:wait?1:0,my_waiting:wait}]};}})}};
 const {lobbyEventData,LobbyEvent}=load("src/components/LobbyEvent.tsx",deps);
 const data=await lobbyEventData(),html=renderToStaticMarkup(React.createElement(LobbyEvent,{data}));
 return {calls,html,data};
}
(async()=>{
 const guest=await scenario({guest:true});assert.match(guest.html,/Giriş yap/);assert.equal(guest.calls.length,0);
 const unauthorized=await scenario({member:false});assert.equal(unauthorized.html,"");assert.equal(unauthorized.calls.length,0);
 assert.match((await scenario({event:null})).html,/Oyun gecesi öner/);
 assert.doesNotMatch((await scenario({event:null,grants:["events.view"]})).html,/Oyun gecesi öner/);
 assert.match((await scenario({eventError:true})).html,/yüklenemedi/);
 const filled=await scenario();assert.match(filled.html,/21:00 TSİ/);assert.match(filled.html,/Katılacağım/);assert.match(filled.html,/3 kişinin yeri ayrıldı/);
 assert(filled.calls.some(c=>c.join(":")==="community_events:eq:type_id:op-night"));
 assert(filled.calls.some(c=>c.join(":")==="community_events:eq:status:published"));
 assert(filled.calls.some(c=>c.join(":")==="event_responses:eq:user_id:member"));
 assert.match((await scenario({response:"going"})).html,/Katılıyorsun/);
 assert.match((await scenario({response:"going",wait:true})).html,/Bekleme listesindesin/);
 const navDeps={"next/link":link,"next/navigation":{usePathname:()=>"/"},"@/components/QGIcon":icon,"@/components/RankInsignia":{RankInsignia:()=>null},"@/config/brand-theme":{brandTheme:{emblem:"/emblem.webp"}},"@/lib/roles":{roleLabel:x=>x},"@/lib/lobby-navigation":{lobbyNavigation,lobbyNavActive}};
 const {NavClient}=load("src/components/NavClient.tsx",navDeps),{MobileNavClient}=load("src/components/MobileNavClient.tsx",navDeps);
 for(const component of [NavClient,MobileNavClient]){
  for(const state of [{guest:true},{guest:false},{guest:false,staff:true}]){
   const html=renderToStaticMarkup(React.createElement(component,{user:!state.guest,identity:state.guest?null:{display_name:"Üye",role:"member"},canViewEvents:!state.guest,canViewDiscipline:!state.guest,canViewBudget:state.staff,canManageDiscipline:state.staff}));
   assert.match(html,/Lobi/);assert.match(html,/Topluluk/);
   assert.equal(html.includes("/etkinlikler"),!state.guest);assert.equal(html.includes("/api/logout"),!state.guest);
   assert.equal(html.includes("/butce"),!!state.staff);assert.equal(html.includes("/yonetim/moderasyon"),!!state.staff);
   assert(!html.includes("mobileNavTrack"));
  }
 }
 if(process.env.QG_LOBBY_BROWSER_MODULE){
  const {chromium}=require("playwright");
  const bin=(await import(process.env.QG_LOBBY_BROWSER_MODULE)).default;
  const browser=await chromium.launch({executablePath:await bin.executablePath(),args:bin.args});
  const {themeVariables,themePresets,defaultTheme}=load("src/lib/theme.ts");
  const css=Array.from(fs.readFileSync("src/app/layout.tsx","utf8").matchAll(/import "\.\/([^"]+\.css)"/g),m=>fs.readFileSync("src/app/"+m[1],"utf8")).join("\n");
  try{
   const page=await browser.newPage();
   for(const width of [1440,390])for(const state of ["guest","member","staff"])for(const populated of [false,true]){
    const viewport={width,height:width===390?844:1000};
    await page.setViewportSize(viewport);
    const canViewEvents=state!=="guest",access={canViewEvents,canManageDiscipline:state==="staff",canViewBudget:state==="staff",user:canViewEvents,identity:canViewEvents?{display_name:"Üye",role:"member"}:null};
    const event=await scenario({guest:!canViewEvents,event:populated?sample:null});
    const lobby=load("src/app/page.tsx",{
     "next/link":link,"@/components/QGIcon":icon,
     "@/lib/text-preview":load("src/lib/text-preview.ts"),"@/lib/presentation-image":{presentationImage:x=>x,thumbnail:x=>x},
     "@/lib/design-server":{getActiveDesign:async()=>({quadSrc:"/brand/command/quad.webp"})},
     "@/lib/publication-types":{PUBLICATION_BADGE_LABELS:{},publicationKind:()=>null},
     "@/components/LobbyEvent":{lobbyEventData:async()=>event.data,LobbyEvent:()=>React.createElement("div",{dangerouslySetInnerHTML:{__html:event.html}})},
     "@/lib/announcements":load("src/lib/announcements.ts"),
     "@/lib/rich-text":{richPlain:x=>x},
     "@/lib/supabase/server":{createClient:async()=>({from(){const q={select:()=>q,order:()=>q,eq:()=>q,limit:async()=>({data:populated?[{id:"notice",title:"Topluluk duyurusu",slug:"yayin",published_at:"2026-11-09",body:"Deneme"}]:[]})};return q;}})},
     "@/components/AppShell":{AppShell:({children})=>React.createElement("div",{className:"appShell"},React.createElement(NavClient,access),React.createElement("main",{className:"content pageMotion"},children),React.createElement(MobileNavClient,access))}
    });
    await page.setContent('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style>'+renderToStaticMarkup(await lobby.default()));
    assert.equal(await page.locator(".lobbyPage").evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
    assert.match(await page.locator("body").evaluate(el=>getComputedStyle(el).fontFamily),/system-ui/);
    assert.equal(await page.locator(".pageMotion").evaluate(el=>getComputedStyle(el).animationName),"qgPageEnter");
    assert.equal(await page.locator(".lobbyHero h1").evaluate(el=>getComputedStyle(el).fontFamily.includes("Georgia")),true);
    assert.equal(await page.locator(".lobbyEvent").evaluate(el=>getComputedStyle(el).borderRadius),"12px");
    if(populated&&state==="member"){
     await page.evaluate(vars=>Object.entries(vars).forEach(([key,value])=>document.documentElement.style.setProperty(key,value)),themeVariables({...defaultTheme,palette:themePresets.gtaVi}));
     assert.match(await page.locator(".lobbyEvent h2").evaluate(el=>getComputedStyle(el).fontFamily),/system-ui/);
     assert.match(await page.locator(".lobbyEvent").evaluate(el=>getComputedStyle(el).backgroundImage),/rgb\(43, 27, 56\)/);
     await page.waitForFunction(()=>getComputedStyle(document.querySelector(".lobbyJoin")).backgroundColor==="rgb(163, 43, 105)",null,{timeout:2000});
    }
    if(width===390){
     assert(await page.locator(".lobbyMobileNav").isVisible());
     if(canViewEvents&&populated){
      const box=await page.getByRole("button",{name:"Katılacağım"}).boundingBox();
      assert(box&&box.height>=44&&box.y+box.height<viewport.height-65);
      assert.equal(await page.getByRole("button",{name:"Katılacağım"}).evaluate(el=>getComputedStyle(el).borderRadius),"9px");
     }
    }else assert(await page.locator(".lobbyRail").isVisible());

   }
  }finally{await browser.close();}
  console.log("PASS browser: 1440/390, filled/empty, three access roles, no content overflow and first-screen mobile RSVP.");
 }
 console.log("PASS Lobi: permission-gated game night, empty/error, RSVP states and guest/member/staff desktop and mobile navigation.");
})().catch(e=>{console.error(e);process.exitCode=1;});
