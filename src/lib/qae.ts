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
export async function currentQaeManager(){
 const s=await createClient(); const user=await getCurrentUser(); if(!user)return null;
 const {data}=await s.rpc("qae_is_manager");
 return data===true?user:null;
}
export async function currentQaeInvoker(){
 const s=await createClient(); const user=await getCurrentUser(); if(!user)return null;
 const {data}=await s.rpc("qae_can_invoke");
 return data===true?user:null;
}

export async function getAsterConversation(id?:string){
 const s=await createClient(); const user=await getCurrentUser(); if(!user)return {conversation:null,messages:[]};
 let conversation:any=null;
 if(id){const {data}=await s.from("ai_conversations").select("id,title,created_at,updated_at").eq("id",id).eq("user_id",user.id).maybeSingle();conversation=data}
 if(!conversation){const {data}=await s.from("ai_conversations").select("id,title,created_at,updated_at").eq("user_id",user.id).order("updated_at",{ascending:false}).limit(1).maybeSingle();conversation=data}
 if(!conversation)return {conversation:null,messages:[]};
 const {data:messages}=await s.from("ai_messages").select("id,role,body,sources,provider,model,created_at").eq("conversation_id",conversation.id).order("created_at",{ascending:true}).limit(60);
 return {conversation,messages:messages??[]};
}
