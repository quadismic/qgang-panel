import {NextResponse} from "next/server";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
const KINDS=new Set(["profile_comment","moderation","appeal","badge","announcement"]);
export async function POST(req:Request){
 const s=await createClient();const user=await getCurrentUser();
 if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 let input:any;try{input=await req.json()}catch{return NextResponse.json({error:"invalid_json"},{status:400})}
 const userId=String(input?.user_id||""),kind=String(input?.kind||""),body=String(input?.body||"").trim(),entityId=input?.entity_id?String(input.entity_id):null,dedupe=input?.dedupe_key?String(input.dedupe_key).slice(0,180):null;
 if(!userId||userId===user.id||!KINDS.has(kind)||body.length<1||body.length>300)return NextResponse.json({error:"invalid_notification"},{status:400});
 const {data:target}=await s.from("profiles").select("id").eq("id",userId).maybeSingle();if(!target)return NextResponse.json({error:"target_not_found"},{status:404});
 if(dedupe){const {data:existing}=await s.from("notifications").select("id").eq("user_id",userId).eq("actor_id",user.id).eq("dedupe_key",dedupe).maybeSingle();if(existing)return NextResponse.json({ok:true,id:existing.id,deduped:true});}
 const {data,error}=await s.from("notifications").insert({user_id:userId,actor_id:user.id,kind,entity_id:entityId,body,dedupe_key:dedupe}).select("id").single();
 if(error)return NextResponse.json({error:"notification_create_failed"},{status:400});
 return NextResponse.json({ok:true,id:data.id},{status:201});
}
