"use server";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
export async function savePublication(f:FormData){
 const s=await createClient(),id=String(f.get("id")??"");
 const {error}=await s.rpc("qgang_manage_publication",{p_id:/^[0-9a-f-]{36}$/i.test(id)?id:null,p_title:String(f.get("title")??""),p_slug:String(f.get("slug")??""),p_excerpt:String(f.get("excerpt")??""),p_body:String(f.get("body")??""),p_type:String(f.get("type")??"thought"),p_status:String(f.get("status")??"draft")});
 if(error)throw new Error("Yayın kaydedilemedi. Alanları ve yetkiyi kontrol edin.");
 revalidatePath("/qgang-3/yonetim/yayinlar");
}