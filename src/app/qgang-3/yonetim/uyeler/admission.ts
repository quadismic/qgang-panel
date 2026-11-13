"use server";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
export async function admitMember(formData:FormData){
 const id=String(formData.get("candidate")??"");
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return;
 const db=await createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)throw new Error("Oturum gerekli.");
 const {error}=await db.rpc("qgang_admit_member",{p_user_id:id});
 if(error)throw new Error("Üyelik kabul edilemedi. Adayın durumunu kontrol edin.");
 revalidatePath("/qgang-3/yonetim/uyeler");
 revalidatePath("/qgang-3/yonetim");
}