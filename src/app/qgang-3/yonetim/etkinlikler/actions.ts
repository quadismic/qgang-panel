"use server";
import {revalidatePath} from "next/cache";
import {createClient} from "@/lib/supabase/server";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function saveEvent(f:FormData){
 const s=await createClient();
 const id=String(f.get("id")??"");
 const date=(key:string)=>{const v=String(f.get(key)??"");return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)?new Date(v+":00+03:00").toISOString():null;};
 const start=date("start"),end=date("end");
 if(!start||!end||end<start)throw new Error("Tarihleri kontrol edin.");
 const {error}=await s.rpc("qgang_manage_event",{p_id:uuid.test(id)?id:null,p_title:String(f.get("title")??""),p_type:String(f.get("type")??""),p_description:String(f.get("description")??""),p_start:start,p_end:end,p_location:String(f.get("location")??""),p_status:String(f.get("status")??"draft")});
 if(error)throw new Error("Etkinlik kaydedilemedi.");
 revalidatePath("/qgang-3/yonetim/etkinlikler");
}
export async function confirmAttendance(f:FormData){
 const event=String(f.get("event")??""),user=String(f.get("user")??"");
 if(!uuid.test(event)||!uuid.test(user))throw new Error("Geçersiz kayıt.");
 const s=await createClient();
 const {error}=await s.rpc("verify_event_attendance",{p_event:event,p_user:user,p_attended:f.get("attended")==="yes",p_confirm:true});
 if(error)throw new Error("Katılım doğrulanamadı. Yetki ve etkinlik tarihini kontrol edin.");
 revalidatePath("/qgang-3/yonetim/etkinlikler");
}