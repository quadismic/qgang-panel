"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
type Props={eventId:string;initialJoined:boolean;initialCount:number};
export function EventJoinButton({eventId,initialJoined,initialCount}:Props){
 const [joined,setJoined]=useState(initialJoined);
 const [count,setCount]=useState(initialCount);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function toggle(){
  if(busy)return;
  setBusy(true);setError("");
  const next=!joined;
  try{
   const s=createClient();
   const {data:{user},error:authError}=await s.auth.getUser();
   if(authError||!user)throw new Error("Katılmak için yeniden giriş yapın.");
   const {error:writeError}=await s.from("event_responses").upsert({event_id:eventId,user_id:user.id,response:next?"going":"not_going"},{onConflict:"event_id,user_id"});
   if(writeError)throw new Error("Katılım kaydedilemedi. Lütfen tekrar deneyin.");
   setJoined(next);
   setCount(n=>Math.max(0,n+(next?1:-1)));
   const {data:actual,error:countError}=await s.rpc("qgang_event_attendee_count",{p_event_id:eventId});
   if(!countError&&typeof actual==="number")setCount(actual);
  }catch(e){setError(e instanceof Error?e.message:"İşlem başarısız.");}
  finally{setBusy(false);}
 }
 return <div className="qg3-joinwrap"><p aria-live="polite">Katılıyor: {count}</p><button className={`qg3-joinbutton ${joined?"is-joined":""}`} type="button" disabled={busy} aria-pressed={joined} onClick={toggle}>{busy?"Kaydediliyor…":joined?"✓ Katılıyorsun":"Katıl →"}</button>{error&&<small className="qg3-joinerror" role="alert">{error}</small>}</div>;
}
