"use server";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
export async function manageBadge(f:FormData){
 const action=String(f.get("action")??"");
 if(!["award","recognize","revoke","correct"].includes(action))throw new Error("Geçersiz işlem.");
 const s=await createClient();
 const {error}=await s.rpc("manage_badge",{p_action:action,p_user:String(f.get("user")??""),p_badge:f.get("badge")||null,p_award:f.get("award")||null,p_reason:String(f.get("reason")??""),p_evidence:String(f.get("evidence")??"")});
 if(error)throw new Error("Rozet işlemi gerçekleştirilemedi. Yetki, gerekçe ve rozet türünü kontrol edin.");
 revalidatePath("/qgang-3/yonetim/exp/rozetler");
}