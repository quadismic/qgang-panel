"use server";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";

async function founderDb(){
 const db=await createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)throw new Error("Oturum gerekli");
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 if(p?.role!=="founder"||p.is_suspended)throw new Error("Lider yetkisi gerekli");
 return db;
}
export async function setRank(data:FormData){
 const db=await founderDb(),id=String(data.get("member")??""),role=String(data.get("role")??"");
 if(!["member","creator","moderator","admin"].includes(role))throw new Error("Geçersiz rütbe");
 const {error}=await db.rpc("qgang_set_member_role",{p_member_id:id,p_role:role});
 if(error)throw new Error("Rütbe güncellenemedi");revalidatePath("/");
}
export async function admit(data:FormData){
 const db=await founderDb(),id=String(data.get("candidate")??"");
 if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error("Geçersiz aday");
 const {error}=await db.rpc("qgang_admit_member",{p_user_id:id});
 if(error)throw new Error("Üyelik onaylanamadı");revalidatePath("/");
}
export async function award(data:FormData){
 const db=await founderDb(),id=String(data.get("member")??""),title=String(data.get("title")??"").trim(),reason=String(data.get("reason")??"").trim(),exp=Number(data.get("exp"));
 if(title.length<5||title.length>160||reason.length<15||reason.length>2000||!Number.isInteger(exp)||exp<25||exp>100)throw new Error("EXP bilgileri geçersiz");
 const {error}=await db.rpc("approve_operator_special_task",{p_user_id:id,p_title:title,p_justification:reason,p_exp:exp});
 if(error)throw new Error("EXP kaydedilemedi");revalidatePath("/");
}
export async function addFund(data:FormData){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error("Oturum gerekli");
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 if(p?.is_suspended)throw new Error("Yetki yok");
 const {data:allowed}=await db.from("role_permissions").select("enabled").eq("role",p?.role??"guest").eq("permission","budget.manage").eq("enabled",true).maybeSingle();
 if(p?.role!=="founder"&&!allowed)throw new Error("Bütçe yönetimi yetkisi yok");
 const kind=String(data.get("kind")??""),amount=Number(data.get("amount")),title=String(data.get("title")??"").trim();
 if(!["support","expense"].includes(kind)||!Number.isFinite(amount)||amount<=0||title.length<3||title.length>150)throw new Error("Geçersiz işlem");
 const {error}=await db.from("fund_transactions").insert({kind,amount,title,created_by:user.id});
 if(error)throw new Error("Bütçe işlemi kaydedilemedi");revalidatePath("/");
}

export async function changeAccess(data:FormData){
 const db=await founderDb();
 const role=String(data.get("role")??""),permission=String(data.get("permission")??""),enabled=String(data.get("enabled"))==="true";
 if(!["admin","moderator","creator","member"].includes(role)||!["events.manage","events.attendance","budget.view","budget.manage","members.manage"].includes(permission))throw new Error("Geçersiz yetki");
 const {error}=await db.rpc("set_role_permission",{p_role:role,p_permission:permission,p_enabled:enabled});
 if(error)throw new Error("Yetki güncellenemedi");revalidatePath("/");
}
export async function recordEvent(data:FormData){
 const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error("Oturum gerekli");
 const {data:profile}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 if(profile?.is_suspended)throw new Error("Yetki yok");
 const {data:perm}=await db.from("role_permissions").select("permission").eq("role",profile?.role??"guest").eq("enabled",true).in("permission",["events.manage","events.attendance"]);
 const granted=new Set((perm??[]).map(x=>x.permission));
 if(profile?.role!=="founder"&&(!granted.has("events.manage")||!granted.has("events.attendance")))throw new Error("Etkinlik kaydı ve katılım yetkisi gerekli");
 const type=String(data.get("type")??""),date=String(data.get("date")??"");
 if(!["op-night","gang-up","bbq-gang","q-nity"].includes(type)||!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error("Etkinlik bilgileri geçersiz");
 const start=new Date(date+"T12:00:00+03:00");
 if(Number.isNaN(start.getTime())||start.toLocaleDateString("en-CA",{timeZone:"Europe/Istanbul"})!==date||start.getTime()>Date.now())throw new Error("Yalnız geçmiş etkinlik kaydedilebilir");
 const title=type.toUpperCase()+" · "+date;
 const participants=[...new Set(data.getAll("attendees").map(String))];
 if(!participants.length||participants.length>100||participants.some(id=>!/^[0-9a-f-]{36}$/i.test(id)))throw new Error("Katılımcıları seçin");
 const {data:existing}=await db.from("community_events").select("id").eq("type_id",type).gte("starts_at",date+"T00:00:00+03:00").lt("starts_at",new Date(new Date(date+"T00:00:00+03:00").getTime()+86400000).toISOString()).limit(1);
 let eventId=existing?.[0]?.id;
 if(!eventId){
  const {data:id,error}=await db.rpc("qgang_manage_event",{p_id:null,p_title:title,p_type:type,p_description:"Manuel geçmiş etkinlik kaydı",p_start:start.toISOString(),p_end:start.toISOString(),p_location:"",p_status:"completed"});
  if(error||!id)throw new Error("Etkinlik oluşturulamadı");eventId=id;
 }
 for(const id of participants){
  const {error}=await db.rpc("verify_event_attendance",{p_event:eventId,p_user:id,p_attended:true,p_confirm:true});
  if(error)throw new Error("Etkinlik oluşturuldu ancak katılım işlenemedi: "+id);
 }
 revalidatePath("/");
}
