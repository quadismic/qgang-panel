import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";

const canonical:Record<string,string>={"/rules":"/kodeks","/publications":"/yayinlar","/members":"/topluluk","/penalties":"/disiplin","/control":"/yonetim","/budget":"/butce","/profile":"/profil","/announcements":"/yayinlar"};
const internal:Record<string,string>={"/kodeks":"/rules","/yayinlar":"/publications","/topluluk":"/members","/disiplin":"/penalties","/yonetim":"/control","/butce":"/budget","/profil":"/profile"};
function remap(path:string,map:Record<string,string>){for(const [from,to] of Object.entries(map))if(path===from||path.startsWith(from+"/"))return to+path.slice(from.length);return null}
export async function middleware(request:NextRequest){
 const path=request.nextUrl.pathname;
 const publicPath=remap(path,canonical);if(publicPath){const target=request.nextUrl.clone();target.pathname=publicPath;return NextResponse.redirect(target,308)}
 const sourcePath=remap(path,internal);let response=sourcePath?NextResponse.rewrite(new URL(sourcePath+request.nextUrl.search,request.url),{request}):NextResponse.next({request});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return response;
 const supabase=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
 const {data:{user}}=await supabase.auth.getUser();
 const exempt=path==="/login"||path.startsWith("/auth/")||path==="/onboarding"||path==="/api/onboarding";
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
