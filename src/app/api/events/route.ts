import {sameOrigin} from "@/lib/privacy";
import {NextResponse} from "next/server";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {hasPermission} from "@/lib/access";
import {istanbulInput} from "@/lib/events";
import type {Permission} from "@/lib/roles";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(req:Request) {
 if(!sameOrigin(req))return NextResponse.json({error:"Geçersiz istek kaynağı."},{status:403});
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Oturum gerekli."},{status:401});
 const f=await req.formData();const action=String(f.get("action")||"");
 const perms:Record<string,Permission>={save:"events.manage",propose:"events.propose",status:"events.publish",respond:"events.view",attendance:"events.attendance",type:"events.settings",review:"events.manage",link:"events.archive"};
 const permission=perms[action];if(!permission||!await hasPermission(user.id,permission))return NextResponse.json({error:"Bu işlem için yetkin yok."},{status:403});
 const s=await createClient();const id=String(f.get("id")||"");
 const respond=(path:string)=>req.headers.get("accept")?.includes("application/json")?NextResponse.json({ok:true,redirect:path}):NextResponse.redirect(new URL(path,req.url),303);
 const back=()=>respond(uuid.test(id)?`/etkinlikler/${id}?saved=1`:"/etkinlikler?saved=1");
 const invalid=()=>NextResponse.json({error:"Alanları ve açık onayı kontrol et."},{status:400});
 let error: {message:string}|null=null;
 if(action==="save"||action==="propose") {
  const title=String(f.get("title")||"").trim(),description=String(f.get("description")||"").trim(),type_id=String(f.get("type_id")||"");
  if(!title||title.length>180||description.length>10000||(id&&!uuid.test(id)))return invalid();
  const {data:type}=await s.from("event_types").select("id").eq("id",type_id).eq("active",true).maybeSingle();if(!type){
   if(!id||action!=="save"||type_id)return invalid();
   const {data:old}=await s.from("community_events").select("type_id,legacy_type").eq("id",id).maybeSingle();if(!old||old.type_id||!old.legacy_type)return invalid();
  }
  if(action==="propose") {if(!description)return invalid();({error}=await s.from("event_proposals").insert({title,description,type_id,author_id:user.id}));}
  else {
   const starts_at=istanbulInput(String(f.get("starts_at")||"")),ends_at=istanbulInput(String(f.get("ends_at")||"")),location=String(f.get("location")||"").trim();
   const cap=String(f.get("capacity")||"");const capacity=cap?Number(cap):null;
   if(!starts_at||!ends_at||ends_at<starts_at||location.length>500||(capacity!==null&&(!Number.isInteger(capacity)||capacity<1||capacity>10000)))return invalid();
   const organizer_id=String(f.get("organizer_id")||user.id);if(!uuid.test(organizer_id))return invalid();
   const row={title,description,type_id:type_id||null,starts_at,ends_at,location,capacity,organizer_id};
   const proposal_id=String(f.get("proposal_id")||"");
   if(proposal_id){if(!uuid.test(proposal_id)||id)return invalid();({error}=await s.rpc("create_event_from_proposal",{p_proposal:proposal_id,p_details:row}));}
   else if(id)({error}=await s.from("community_events").update(row).eq("id",id).select("id").single());else ({error}=await s.from("community_events").insert({...row,created_by:user.id}));
  }
 } else if(action==="status") {
  const status=String(f.get("status"));if(!uuid.test(id)||!["published","completed","cancelled","draft"].includes(status)||f.get("confirm")!=="yes"||!await hasPermission(user.id,"events.manage"))return invalid();
  ({error}=await s.from("community_events").update({status}).eq("id",id).select("id").single());
 } else if(action==="respond") {
  const response=String(f.get("response"));if(!uuid.test(id)||!["going","maybe","not_going"].includes(response))return invalid();
  ({error}=await s.rpc("respond_to_event",{p_event:id,p_response:response}));
 } else if(action==="attendance") {
  const target=String(f.get("user_id"));if(!uuid.test(id)||!uuid.test(target)||f.get("confirm")!=="yes")return invalid();
  ({error}=await s.rpc("verify_event_attendance",{p_event:id,p_user:target,p_attended:f.get("attended")==="yes",p_confirm:true}));
 } else if(action==="review") {
  const status=String(f.get("status"));if(!uuid.test(id)||!["accepted","declined"].includes(status)||f.get("confirm")!=="yes")return invalid();
  ({error}=await s.from("event_proposals").update({status}).eq("id",id).select("id").single());
  if(!error)return respond("/etkinlikler?saved=1");
 } else if(action==="link") {
  const target=String(f.get("user_id")),record=String(f.get("attendance_id"));if(!uuid.test(id)||!uuid.test(target)||!uuid.test(record)||f.get("confirm")!=="yes")return invalid();
  ({error}=await s.rpc("link_event_historical_member",{p_attendance:record,p_user:target,p_confirm:true}));
 } else if(action==="type") {
  const name=String(f.get("name")||"").trim(),description=String(f.get("description")||"").trim(),sort_order=Number(f.get("sort_order"));
  if(!id||!name||name.length>80||description.length>1000||!Number.isInteger(sort_order)||sort_order<1||sort_order>99)return invalid();
  ({error}=await s.from("event_types").update({name,description,sort_order}).eq("id",id).select("id").single());
 }
 if(error)return NextResponse.json({error:"İşlem kaydedilemedi. Etkinlik durumunu, üyeliğini ve yetkini kontrol et."},{status:400});return back();
}
