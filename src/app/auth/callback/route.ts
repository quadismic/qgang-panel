import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

const PROD_ORIGIN="https://q-gang.com";
export async function GET(request:Request){
 const url=new URL(request.url);
 const code=url.searchParams.get("code");
 let next=url.searchParams.get("next")||"/profile";
 try{next=decodeURIComponent(next)}catch{}
 if(!next.startsWith("/")||next.startsWith("//"))next="/profile";
 const origin=url.hostname==="localhost"?url.origin:PROD_ORIGIN;
 if(code){
  const s=await createClient();
  const {error}=await s.auth.exchangeCodeForSession(code);
  if(!error){
   const {data:{user}}=await s.auth.getUser();
   if(user){
    const google=(user.identities??[]).find(i=>i.provider==="google");
    if(google){
     const meta:any=google.identity_data??{};
     const handle=meta.full_name||meta.name||user.email||null;
     await s.from("connected_accounts").upsert({user_id:user.id,provider:"google",provider_user_id:google.id,provider_handle:handle,profile_url:null,metadata:{avatar:meta.avatar_url||meta.picture||null,email:meta.email||null}},{onConflict:"user_id,provider"});
    }
    const avatar=(user.user_metadata?.avatar_url||user.user_metadata?.picture||null) as string|null;
    if(avatar)await s.from("profiles").update({avatar_url:avatar,updated_at:new Date().toISOString()}).eq("id",user.id);
    const {data:profile}=await s.from("profiles").select("onboarding_completed_at").eq("id",user.id).maybeSingle();
    if(!profile?.onboarding_completed_at)return NextResponse.redirect(new URL("/onboarding?next="+encodeURIComponent(next),origin));
   }
   return NextResponse.redirect(new URL(next,origin));
  }
 }
 return NextResponse.redirect(new URL("/login?error=oauth",origin));
}