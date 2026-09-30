"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {currentQaeManager} from "@/lib/qae";
import {askAster} from "@/lib/qae-provider";

export async function awakenAster(formData:FormData){
 if(!await currentQaeManager())redirect("/entities/aster?error=auth");
 const s=await createClient();const title=String(formData.get("title")||"").trim(),body=String(formData.get("body")||"").trim(),sourceType=String(formData.get("source_type")||"manual").trim(),sourceRef=String(formData.get("source_ref")||"").trim();
 if(title.length<2||body.length<2)redirect("/entities/aster?error=validation");
 const {data:taskId,error:createError}=await s.rpc("qae_create_task",{p_entity_code:"QAE-001",p_title:title,p_instruction:body,p_source_type:sourceType,p_source_ref:sourceRef||null});
 if(createError||!taskId)redirect("/entities/aster?error=task");
 const {data:task,error:claimError}=await s.rpc("qae_claim_task",{p_task_id:taskId});
 if(claimError||!task)redirect("/entities/aster?error=claim");
 try{
  const result=await askAster({title:task.title,body:task.instruction,sourceType:task.source_type||"manual",sourceRef:task.source_ref});
  const {error}=await s.rpc("qae_complete_task",{p_task_id:taskId,p_title:result.candidate.title,p_body:result.candidate.body,p_provider:result.provider,p_model:result.model});
  if(error)throw error;
 }catch(e){await s.rpc("qae_fail_task",{p_task_id:taskId,p_error:e instanceof Error?e.message:"unknown cognition error"});redirect("/entities/aster?error=cognition")}
 revalidatePath("/entities/aster");redirect("/entities/aster?ok=awakened");
}
