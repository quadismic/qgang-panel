import {normalizeRich,validRich} from "@/lib/rich-text";
import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
export async function POST(req:Request){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return NextResponse.redirect(new URL("/login?next=/disiplin",req.url),303);
 const f=await req.formData(),id=String(f.get("action_id")||""),text=normalizeRich(String(f.get("appeal")||""));
 const destination=f.get("return_to")==="/disiplin?tab=requests"?"/disiplin?tab=requests":"/account";
 const reply=(key:string,value:string)=>{const url=new URL(destination,req.url);url.searchParams.set(key,value);return NextResponse.redirect(url,303)};
 const {data:actor}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();if(!actor||actor.role==="guest")return reply("appeal_error","permission");
 if(!/^[0-9a-f-]{36}$/i.test(id)||!validRich(text,1500,10))return reply("appeal_error","validation");
 const {data:a,error}=await s.from("moderation_actions").select("id,issuer_role,finality_status,status").eq("id",id).eq("target_user_id",user.id).maybeSingle();
 if(error||!a||a.issuer_role==="founder"||a.finality_status!=="final"||a.status==="revoked")return reply("appeal_error","permission");
 const {error:save}=await s.from("moderation_appeals").insert({action_id:id,user_id:user.id,body:text,status:"open"});return save?reply("appeal_error",save.code==="23505"?"duplicate":"save"):reply("appealed","1");
}
