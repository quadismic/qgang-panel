"use server";
import {revalidatePath} from "next/cache";
import {changeMemberRole} from "@/app/qgang-3/yonetim/uyeler/actions";
import {admitMember} from "@/app/qgang-3/yonetim/uyeler/admission";
import {awardSpecialTask} from "@/app/qgang-3/yonetim/ozel-gorev/actions";
import {createClient} from "@/lib/supabase/server";
export async function setRank(data:FormData){const r=await changeMemberRole(data);if(!r.ok)throw new Error(r.message);revalidatePath("/")}
export async function admit(data:FormData){await admitMember(data);revalidatePath("/")}
export async function award(data:FormData){const r=await awardSpecialTask({userId:String(data.get("member")??""),title:String(data.get("title")??""),justification:String(data.get("reason")??""),exp:Number(data.get("exp")??0)});if(!r.ok)throw new Error(r.message);revalidatePath("/")}
export async function addFund(data:FormData){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error("Oturum gerekli");
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).single();
 if(p?.is_suspended||!["founder","admin"].includes(p?.role??""))throw new Error("Yetki yok");
 const kind=String(data.get("kind")??""),amount=Number(data.get("amount")),title=String(data.get("title")??"").trim();
 if(!["support","expense"].includes(kind)||!Number.isFinite(amount)||amount<=0||title.length<3||title.length>150)throw new Error("Geçersiz işlem");
 const {error}=await db.from("fund_transactions").insert({kind,amount,title,created_by:user.id});
 if(error)throw new Error("Bütçe işlemi kaydedilemedi");revalidatePath("/");
}
