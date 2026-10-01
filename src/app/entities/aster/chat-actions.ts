"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
import {currentQaeInvoker} from "@/lib/qae";
import {consultAster,AsterSource} from "@/lib/qae-provider";

export async function consult(formData:FormData){
 if(!await currentQaeInvoker())redirect("/entities/aster?error=auth");
 const question=String(formData.get("question")||"").trim(),conversationId=String(formData.get("conversation_id")||"").trim()||null;
 if(question.length<2||question.length>4000)redirect("/entities/aster?error=question");
 const s=await createClient();
 const {data:cid,error:writeUser}=await s.rpc("qae_chat_append",{p_conversation_id:conversationId,p_role:"user",p_body:question,p_sources:[],p_provider:null,p_model:null});
 if(writeUser||!cid)redirect("/entities/aster?error=chat");
 const {data:memory}=await s.from("ai_institutional_memory").select("id,title,body,source_type,source_ref,created_at").order("created_at",{ascending:false}).limit(24);
 const words=question.toLocaleLowerCase("tr-TR").split(/\s+/).filter(w=>w.length>3);
 const ranked=(memory||[]).map((m:any)=>({m,score:words.reduce((n,w)=>n+((m.title+" "+m.body).toLocaleLowerCase("tr-TR").includes(w)?1:0),0)})).sort((a,b)=>b.score-a.score).slice(0,8).map(x=>x.m);
 const sources:AsterSource[]=ranked.map((m:any)=>({id:m.id,title:m.title,body:m.body,sourceType:m.source_type,sourceRef:m.source_ref,createdAt:m.created_at}));
 const {data:history}=await s.from("ai_messages").select("role,body").eq("conversation_id",cid).order("created_at",{ascending:false}).limit(8);
 try{
  const result=await consultAster({question,sources,history:(history||[]).reverse() as any});
  const citations=sources.map((x,i)=>({key:"K"+(i+1),id:x.id,title:x.title,sourceType:x.sourceType,sourceRef:x.sourceRef}));
  const {error}=await s.rpc("qae_chat_append",{p_conversation_id:cid,p_role:"assistant",p_body:result.body,p_sources:citations,p_provider:result.provider,p_model:result.model});
  if(error)throw error;
 }catch{redirect("/entities/aster?conversation="+cid+"&error=cognition")}
 revalidatePath("/entities/aster");
 redirect("/entities/aster?conversation="+cid+"&ok=responded");
}
