import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export async function POST(req:Request){
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.redirect(new URL("/login?next=/control/community",req.url),303);
 const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(p?.role!=="founder")return NextResponse.redirect(new URL("/",req.url),303);
 const {error}=await s.rpc("advance_qgang_era");
 return NextResponse.redirect(new URL(error?"/control/community?era_error=1":"/control/community?era_changed=1",req.url),303);
}