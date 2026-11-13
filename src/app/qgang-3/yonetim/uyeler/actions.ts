"use server";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
export async function changeMemberRole(data:FormData){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();
 if(!user)return {ok:false,message:"Oturum gerekli."};
 const {data:profile}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 if(profile?.role!=="founder"||profile.is_suspended)return {ok:false,message:"Yetki yok."};
 const id=String(data.get("member")??""),role=String(data.get("role")??"");
 const {error}=await db.rpc("qgang_set_member_role",{p_member_id:id,p_role:role});
 if(error)return {ok:false,message:"Rütbe güncellenemedi."};
 revalidatePath("/qgang-3/yonetim/uyeler");revalidatePath("/qgang-3/yonetim");
 return {ok:true,message:"Rütbe güncellendi."};
}
