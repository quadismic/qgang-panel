"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";import {hasPermission} from "@/lib/access";
async function admin(){const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login?next=/control/design");if(!await hasPermission(user.id,"design.manage"))redirect("/");return {s,user}}
export async function saveDesign(input:any){const {s,user}=await admin();const {data:old}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();if(old?.settings)await s.from("design_history").insert({settings:old.settings,created_by:user.id});const settings=normalizeDesign(input);const {error}=await s.from("design_settings").upsert({key:"active",settings,updated_by:user.id,updated_at:new Date().toISOString()},{onConflict:"key"});if(error)throw new Error(error.message);revalidatePath("/","layout");return settings}
export async function restoreDesign(id:number){const {s}=await admin();const {data,error}=await s.from("design_history").select("settings").eq("id",id).single();if(error||!data)throw new Error("Tasarım sürümü bulunamadı");return saveDesign(data.settings)}
export async function resetDesign(){return saveDesign(defaultDesign)}