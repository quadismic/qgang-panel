import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
export async function POST(req:Request){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.redirect(new URL("/login?next=/onboarding",req.url),303);
 const f=await req.formData();const name=String(f.get("display_name")??"").trim(),handle=String(f.get("handle")??"").trim().toLowerCase(),birth=String(f.get("birth_date")??"").trim();
 let next=String(f.get("next")??"/");if(!next.startsWith("/")||next.startsWith("//"))next="/";
 const validBirth=!birth||(/^\\d{4}-\\d{2}-\\d{2}$/.test(birth)&&!Number.isNaN(Date.parse(birth)));
 if(name.length>60||!/^[a-z0-9_]{3,24}$/.test(handle)||!validBirth)return NextResponse.redirect(new URL("/onboarding?error=validation&next="+encodeURIComponent(next),req.url),303);
 const {error}=await s.rpc("complete_qgang_onboarding",{p_display_name:name,p_handle:handle,p_birth_date:birth||null,p_avatar_url:null});
 if(error){const msg=(error.message||"").toLowerCase();return NextResponse.redirect(new URL("/onboarding?error="+(msg.includes("taken")||msg.includes("duplicate")?"taken":"validation")+"&next="+encodeURIComponent(next),req.url),303)}
 return NextResponse.redirect(new URL(next,req.url),303);
}