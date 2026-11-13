"use server";

import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";

export async function equipCosmetic(cosmeticId:string,kind:string){
 const db=await createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)return {ok:false,message:"Oturum açman gerekiyor."};
 if(!["frame","background","name_effect","title"].includes(kind))return {ok:false,message:"Geçersiz kozmetik türü."};
 const {data:owned,error:ownedError}=await db.from("operator_inventory").select("cosmetic_id").eq("user_id",user.id).eq("cosmetic_id",cosmeticId).maybeSingle();
 if(ownedError||!owned)return {ok:false,message:"Bu kozmetik henüz açılmadı."};
 const {data:item}=await db.from("operator_cosmetics").select("kind,active").eq("id",cosmeticId).maybeSingle();
 if(!item?.active||item.kind!==kind)return {ok:false,message:"Bu kozmetik kullanılamıyor."};
 const {error}=await db.from("operator_equipment").upsert({user_id:user.id,kind,cosmetic_id:cosmeticId,equipped_at:new Date().toISOString()},{onConflict:"user_id,kind"});
 if(error)return {ok:false,message:"Seçim kaydedilemedi."};
 revalidatePath("/qgang-3/profil");
 return {ok:true,message:"Kozmetik kuşanıldı."};
}

export async function unequipCosmetic(kind:string){
 const db=await createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)return {ok:false,message:"Oturum açman gerekiyor."};
 if(!["frame","background","name_effect","title"].includes(kind))return {ok:false,message:"Geçersiz kozmetik türü."};
 const {error}=await db.from("operator_equipment").delete().eq("user_id",user.id).eq("kind",kind);
 if(error)return {ok:false,message:"Kozmetik kaldırılamadı."};
 revalidatePath("/qgang-3/profil");
 return {ok:true,message:"Standart görünüm seçildi."};
}
