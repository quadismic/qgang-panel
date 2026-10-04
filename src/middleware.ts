import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";

const canonical:Record<string,string>={"/control/community":"/yonetim/uyelik","/control/access":"/yonetim/erisim","/control/system":"/yonetim/sistem","/control/design":"/yonetim/tasarim","/control/publications":"/yonetim/yayinlar","/control/moderation":"/yonetim/moderasyon","/rules":"/kodeks","/publications":"/yayinlar","/members":"/topluluk","/penalties":"/disiplin","/control":"/yonetim","/budget":"/butce","/profile":"/profil","/announcements":"/duyurular","/maintenance":"/bakim"};
const internal:Record<string,string>={"/yonetim/uyelik":"/control/community","/yonetim/erisim":"/control/access","/yonetim/sistem":"/control/system","/yonetim/tasarim":"/control/design","/yonetim/yayinlar":"/control/publications","/yonetim/moderasyon":"/control/moderation","/kodeks":"/rules","/duyurular":"/announcements","/yayinlar":"/publications","/topluluk":"/members","/disiplin":"/penalties","/yonetim":"/control","/butce":"/budget","/profil":"/profile","/bakim":"/maintenance"};
function remap(path:string,map:Record<string,string>){for(const [from,to] of Object.entries(map))if(path===from||path.startsWith(from+"/"))return to+path.slice(from.length);return null}
export async function middleware(request:NextRequest){
 const started=performance.now();const timings:string[]=[];
 const finish=(result:NextResponse)=>{if(process.env.VERCEL_ENV==="preview")result.headers.set("Server-Timing",[...timings,`middleware;dur=${(performance.now()-started).toFixed(1)}`].join(", "));return result};
 const path=request.nextUrl.pathname;
 const publicPath=remap(path,canonical);if(publicPath){const target=request.nextUrl.clone();target.pathname=publicPath;return finish(NextResponse.redirect(target,308))}
 const sourcePath=remap(path,internal);const makeResponse=()=>sourcePath?NextResponse.rewrite(new URL(sourcePath+request.nextUrl.search,request.url),{request}):NextResponse.next({request});let response=makeResponse();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return finish(response);
 const supabase=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=makeResponse();items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
 const redirectWithSession=(target:URL)=>{const redirected=NextResponse.redirect(target);response.cookies.getAll().forEach(cookie=>redirected.cookies.set(cookie));return finish(redirected)};
 const timed=async<T>(name:string,work:PromiseLike<T>):Promise<T>=>{const start=performance.now();try{return await work}finally{timings.push(`${name};dur=${(performance.now()-start).toFixed(1)}`)}};
 const [authResult,maintenanceResult]=await Promise.all([timed("auth",supabase.auth.getUser()),timed("maintenance",supabase.from("system_settings").select("value").eq("key","maintenance").maybeSingle())]);
 const user=authResult.data.user;const maintenance=maintenanceResult.data;
 const exempt=path==="/login"||path.startsWith("/auth/")||path==="/bakim";
 const maintenanceOn=Boolean((maintenance?.value as any)?.enabled);
 const needsOnboarding=Boolean(user&&!exempt&&path!=="/onboarding"&&path!=="/api/onboarding"&&path!=="/api/logout");
 const {data:profile}=user&&!exempt&&(maintenanceOn||needsOnboarding)?await timed("profile",supabase.from("profiles").select("role,onboarding_completed_at").eq("id",user.id).maybeSingle()):{data:null};
 if(maintenanceOn&&!exempt){
  let allowed=false;
  if(user){
   const mp=profile;
   if(mp?.role==="founder"||mp?.role==="admin")allowed=true;
   else if(mp?.role==="moderator"||mp?.role==="creator"){const {data:grant}=await timed("maintenance_access",supabase.from("maintenance_access").select("user_id").eq("user_id",user.id).maybeSingle());allowed=Boolean(grant)}
  }
  if(!allowed){const target=request.nextUrl.clone();target.pathname="/bakim";target.search="";return redirectWithSession(target)}
 }
 if(!maintenanceOn&&path==="/bakim"){const target=request.nextUrl.clone();target.pathname="/";target.search="";return redirectWithSession(target)}
 if(needsOnboarding){
  if(!profile?.onboarding_completed_at){
   const target=request.nextUrl.clone();target.pathname="/onboarding";target.search="";target.searchParams.set("next",path+request.nextUrl.search);
   return redirectWithSession(target);
  }
 }
 return finish(response);
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]};
