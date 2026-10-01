import {createClient,getCurrentUser} from "@/lib/supabase/server";

export type QaeStatus="active"|"paused"|"retired";
export async function getAster(){
 const s=await createClient();
 const {data,error}=await s.from("ai_entities").select("id,code,name,function_title,purpose,status,created_at").eq("code","QAE-001").single();
 if(error)return null;
 return data;
}
export async function getAsterSnapshot(){
 const s=await createClient(); const entity=await getAster(); if(!entity)return {entity:null,memories:[],proposals:[],activity:[],tasks:[]};
 const [{data:memories},{data:proposals},{data:activity},{data:tasks}]=await Promise.all([
  s.from("ai_institutional_memory").select("id,title,body,source_type,source_ref,created_at").eq("entity_id",entity.id).order("created_at",{ascending:false}).limit(12),
  s.from("ai_memory_proposals").select("id,title,body,source_type,source_ref,status,created_at").eq("entity_id",entity.id).order("created_at",{ascending:false}).limit(12),
  s.from("ai_entity_activity").select("id,event_type,object_type,object_id,metadata,created_at").eq("entity_id",entity.id).order("created_at",{ascending:false}).limit(20),
  s.from("ai_entity_tasks").select("id,title,status,provider,model,error_message,created_at,completed_at").eq("entity_id",entity.id).order("created_at",{ascending:false}).limit(10)
 ]);
 return {entity,memories:memories??[],proposals:proposals??[],activity:activity??[],tasks:tasks??[]};
}
export async function currentQaeManager(){\n const s=await createClient(); const user=await getCurrentUser(); if(!user)return null;\n const {data}=await s.rpc("qae_is_manager");\n return data===true?user:null;\n}\nexport async function currentQaeInvoker(){\n const s=await createClient(); const user=await getCurrentUser(); if(!user)return null;\n const {data}=await s.rpc("qae_can_invoke");\n return data===true?user:null;\n}
