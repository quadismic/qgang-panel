import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export async function POST(req:Request){
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.redirect(new URL("/login?next=/onboarding",req.url),303);
 const f=await req.formData();
 const nick=String(f.get("nick")??"").trim();
 const birth=String(f.get("birth_date")??"");
 let next=String(f.get("next")??"/");
 if(!next.startsWith("/")||next.startsWith("//"))next="/";
 if(!/^[A-Za-z0-9_]{3,20}$/.test(nick))return NextResponse.redirect(new URL("/onboarding?error=nick&next="+encodeURIComponent(next),req.url),303);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(birth))return NextResponse.redirect(new URL("/onboarding?error=birth&next="+encodeURIComponent(next),req.url),303);
 const {error}=await s.rpc("complete_qgang_onboarding",{p_nick:nick,p_birth_date:birth});
 if(error){
   const msg=(error.message||"").toLowerCase();
   const code=msg.includes("nick_taken")||msg.includes("duplicate")?"taken":msg.includes("birth")?"birth":"nick";
   return NextResponse.redirect(new URL("/onboarding?error="+code+"&next="+encodeURIComponent(next),req.url),303);
 }
 return NextResponse.redirect(new URL(next,req.url),303);
}