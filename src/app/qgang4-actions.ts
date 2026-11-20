"use server";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";

async function founderDb(){
 const db=await createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)throw new Error("Oturum gerekli");
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 if(p?.role!=="founder"||p.is_suspended)throw new Error("Lider yetkisi gerekli");
 return db;
}
export async function setRank(data:FormData){
 const db=await founderDb(),id=String(data.get("member")??""),role=String(data.get("role")??"");
 if(!["member","creator","moderator","admin"].includes(role))throw new Error("Geçersiz rütbe");
 const {error}=await db.rpc("qgang_set_member_role",{p_member_id:id,p_role:role});
 if(error)throw new Error("Rütbe güncellenemedi");revalidatePath("/");
}
export async function admit(data:FormData){
 const db=await founderDb(),id=String(data.get("candidate")??"");
 if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error("Geçersiz aday");
 const {error}=await db.rpc("qgang_admit_member",{p_user_id:id});
 if(error)throw new Error("Üyelik onaylanamadı");revalidatePath("/");
}
export async function award(data:FormData){
 const db=await founderDb(),id=String(data.get("member")??""),title=String(data.get("title")??"").trim(),reason=String(data.get("reason")??"").trim(),exp=Number(data.get("exp"));
 if(title.length<5||title.length>160||reason.length<15||reason.length>2000||!Number.isInteger(exp)||exp<25||exp>100)throw new Error("EXP bilgileri geçersiz");
 const {error}=await db.rpc("approve_operator_special_task",{p_user_id:id,p_title:title,p_justification:reason,p_exp:exp});
 if(error)throw new Error("EXP kaydedilemedi");revalidatePath("/");
}
export async function addFund(data:FormData){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error("Oturum gerekli");
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 if(p?.is_suspended||!["founder","admin"].includes(p?.role??""))throw new Error("Yetki yok");
 const kind=String(data.get("kind")??""),amount=Number(data.get("amount")),title=String(data.get("title")??"").trim();
 if(!["support","expense"].includes(kind)||!Number.isFinite(amount)||amount<=0||title.length<3||title.length>150)throw new Error("Geçersiz işlem");
 const {error}=await db.from("fund_transactions").insert({kind,amount,title,created_by:user.id});
 if(error)throw new Error("Bütçe işlemi kaydedilemedi");revalidatePath("/");
}
