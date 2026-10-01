import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";

const canonical:Record<string,string>={"/control/community":"/yonetim/uyelik","/control/access":"/yonetim/erisim","/control/system":"/yonetim/sistem","/control/design":"/yonetim/tasarim","/control/publications":"/yonetim/yayinlar","/control/moderation":"/yonetim/moderasyon","/rules":"/kodeks","/publications":"/yayinlar","/members":"/topluluk","/penalties":"/disiplin","/control":"/yonetim","/budget":"/butce","/profile":"/profil","/announcements":"/duyurular","/maintenance":"/bakim"};
const internal:Record<string,string>={"/yonetim/uyelik":"/control/community","/yonetim/erisim":"/control/access","/yonetim/sistem":"/control/system","/yonetim/tasarim":"/control/design","/yonetim/yayinlar":"/control/publications","/yonetim/moderasyon":"/control/moderation","/kodeks":"/rules","/duyurular":"/announcements","/yayinlar":"/publications","/topluluk":"/members","/disiplin":"/penalties","/yonetim":"/control","/butce":"/budget","/profil":"/profile","/bakim":"/maintenance"};
function remap(path:string,map:Record<string,string>){for(const [from,to] of Object.entries(map))if(path===from||path.startsWith(from+"/"))return to+path.slice(from.length);return null}
export async function middleware(request:NextRequest){
 const path=request.nextUrl.pathname;
 const publicPath=remap(path,canonical);if(publicPath){const target=request.nextUrl.clone();target.pathname=publicPath;return NextResponse.redirect(target,308)}
 const sourcePath=remap(path,internal);const makeResponse=()=>sourcePath?NextResponse.rewrite(new URL(sourcePath+request.nextUrl.search,request.url),{request}):NextResponse.next({request});let response=makeResponse();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return response;
 const supabase=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=makeResponse();items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
 const {data:{user}}=await supabase.auth.getUser();
 const exempt=path==="/login"||path.startsWith("/auth/")||path==="/bakim";
 const {data:maintenance}=await supabase.from("system_settings").select("value").eq("key","maintenance").maybeSingle();
 const maintenanceOn=Boolean((maintenance?.value as any)?.enabled);
 if(maintenanceOn&&!exempt){
  let allowed=false;
  if(user){
   const {data:mp}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
   if(mp?.role==="founder"||mp?.role==="admin")allowed=true;
   else if(mp?.role==="moderator"||mp?.role==="creator"){const {data:grant}=await supabase.from("maintenance_access").select("user_id").eq("user_id",user.id).maybeSingle();allowed=Boolean(grant)}
  }
  if(!allowed){const target=request.nextUrl.clone();target.pathname="/bakim";target.search="";return NextResponse.redirect(target)}
 }
 if(!maintenanceOn&&path==="/bakim"){const target=request.nextUrl.clone();target.pathname="/";target.search="";return NextResponse.redirect(target)}
 if(user&&!exempt){
  const {data:p}=await supabase.from("profiles").select("onboarding_completed_at").eq("id",user.id).maybeSingle();
  if(!p?.onboarding_completed_at){
   const target=request.nextUrl.clone();target.pathname="/onboarding";target.search="";target.searchParams.set("next",path+request.nextUrl.search);
   return NextResponse.redirect(target);
  }
 }
 return response;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]};
