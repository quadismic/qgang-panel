"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";
async function admin(){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();
 if(!user)redirect("/login?next=/control/design");
 const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(!p||!["founder","admin"].includes(p.role))redirect("/");
 return {s,user};
}
export async function saveDesign(input:any){
 const {s,user}=await admin();const settings=normalizeDesign(input);
 const {error}=await s.from("design_settings").upsert({key:"active",settings,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:"key"});
 if(error)throw new Error(error.message);
 revalidatePath("/", "layout");return settings;
}
export async function resetDesign(){return saveDesign(defaultDesign)}
