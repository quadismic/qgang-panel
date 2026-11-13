"use server";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
export async function recordSanction(formData:FormData){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();
 if(!user)return {ok:false,message:"Oturum gerekli."};
 const {data:profile}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 if(profile?.role!=="founder"||profile.is_suspended)return {ok:false,message:"Yetki yok."};
 const member=String(formData.get("member")??""),kind=String(formData.get("kind")??""),reason=String(formData.get("reason")??"").trim(),days=Number(formData.get("days"));
 if(reason.length<5||reason.length>1000)return {ok:false,message:"Gerekçe 5–1000 karakter olmalı."};
 const {error}=await db.rpc("qgang_record_sanction",{p_member_id:member,p_kind:kind,p_reason:reason,p_duration_days:kind==="temporary_restriction"?days:null});
 if(error)return {ok:false,message:"Yaptırım kaydedilemedi. Alanları ve yetkiyi kontrol edin."};
 revalidatePath("/qgang-3/yonetim/yaptirimlar");revalidatePath("/qgang-3/yonetim");
 return {ok:true,message:"Yaptırım kaydedildi."};
}
