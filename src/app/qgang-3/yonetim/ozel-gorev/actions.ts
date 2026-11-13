"use server";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
export async function awardSpecialTask(input:{userId:string;title:string;justification:string;exp:number}){
 const db=await createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)return {ok:false,message:"Oturum açmanız gerekiyor."};
 const {data:profile}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 if(profile?.role!=="founder"||profile.is_suspended)return {ok:false,message:"Bu işlem yalnızca LİDER tarafından yapılabilir."};
 const title=input.title.trim(),justification=input.justification.trim(),exp=Number(input.exp);
 if(title.length<5||title.length>160||justification.length<15||justification.length>2000||!Number.isInteger(exp)||exp<25||exp>100)return {ok:false,message:"Görev bilgilerini ve 25–100 EXP sınırını kontrol edin."};
 const {error}=await db.rpc("approve_operator_special_task",{p_user_id:input.userId,p_title:title,p_justification:justification,p_exp:exp});
 if(error)return {ok:false,message:"Ödül verilemedi. Üye ve yetki bilgilerini kontrol edin."};
 revalidatePath("/qgang-3/profil");revalidatePath("/qgang-3/yonetim/ozel-gorev");
 return {ok:true,message:"Özel görev ödülü kaydedildi."};
}
