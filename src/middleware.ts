import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";
const publicRoutes=["/","/login","/onboarding","/maintenance","/qgang-3/basvuru"];
export async function middleware(request:NextRequest){
 const path=request.nextUrl.pathname;
 if(!publicRoutes.includes(path)&&!path.startsWith("/api/")&&!path.startsWith("/auth/")){
  const target=request.nextUrl.clone();target.pathname="/";target.search="";return NextResponse.redirect(target,307);
 }
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return NextResponse.next();
 let response=NextResponse.next({request});
 const db=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
 const {data:{user}}=await db.auth.getUser();
 const {data:maintenance}=await db.from("system_settings").select("value").eq("key","maintenance").maybeSingle();
 const enabled=Boolean((maintenance?.value as {enabled?:boolean}|null)?.enabled);
 if(enabled&&!["/login","/onboarding","/maintenance"].includes(path)&&!path.startsWith("/api/")&&!path.startsWith("/auth/")){
  let allowed=false;
  if(user){const {data:p}=await db.from("profiles").select("role").eq("id",user.id).maybeSingle();allowed=p?.role==="founder"||p?.role==="admin";}
  if(!allowed){const target=request.nextUrl.clone();target.pathname="/maintenance";target.search="";return NextResponse.redirect(target);}
 }
 if(!enabled&&path==="/maintenance"){const target=request.nextUrl.clone();target.pathname="/";target.search="";return NextResponse.redirect(target);}
 if(user&&!["/login","/onboarding","/maintenance"].includes(path)&&!path.startsWith("/api/")&&!path.startsWith("/auth/")){
  const {data:p}=await db.from("profiles").select("onboarding_completed_at").eq("id",user.id).maybeSingle();
  if(!p?.onboarding_completed_at){const target=request.nextUrl.clone();target.pathname="/onboarding";target.search="";target.searchParams.set("next",path);return NextResponse.redirect(target);}
 }
 return response;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]};
