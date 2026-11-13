import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {EventJoinButton} from "../EventJoinButton";
import "../preview.css";
export const dynamic="force-dynamic";
export const metadata={title:"Etkinlikler"};
export default async function Events(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/etkinlikler");
 const db=await createClient();
 const {data:member}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 const {data:p}=await db.from("profiles").select("is_suspended").eq("id",user.id).maybeSingle();
 if(!member||p?.is_suspended)redirect("/qgang-3/basvuru");
 const {data:events}=await db.from("community_events").select("id,title,description,starts_at,ends_at,location,status").in("status",["published","completed"]).order("starts_at",{ascending:false}).limit(100);
 const ids=(events??[]).map(e=>e.id);
 const {data:responses}=ids.length?await db.from("event_responses").select("event_id,user_id,response").in("event_id",ids):{data:[]};
 const {data:attendances}=ids.length?await db.from("event_attendance").select("event_id,user_id,attended").in("event_id",ids):{data:[]};
 const counts=new Map<string,number>();for(const r of responses??[]){if(r.response==="going")counts.set(r.event_id,(counts.get(r.event_id)??0)+1)}
 const joined=new Set((responses??[]).filter(r=>r.user_id===user.id&&r.response==="going").map(r=>r.event_id));
 const verified=new Set((attendances??[]).filter(r=>r.user_id===user.id&&r.attended).map(r=>r.event_id));
 const now=Date.now();
 return <main className="qg3" style={{minHeight:"100vh"}}><div className="qg3-content"><p><Link href="/">← Ana sayfa</Link></p><h1>ETKİNLİKLER</h1><p>Yaklaşan buluşmalar ve faaliyet arşivi</p><div className="qg3-eventgrid">{(events??[]).map(e=><article className="qg3-event" key={e.id}><div className="qg3-eventinfo"><h2>{e.title}</h2><time>{new Date(e.starts_at).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul",dateStyle:"medium",timeStyle:"short"})}</time><p>{e.description}</p><p>{e.location}</p>{new Date(e.starts_at).getTime()>now&&e.status==="published"?<EventJoinButton eventId={e.id} initialJoined={joined.has(e.id)} initialCount={counts.get(e.id)??0}/>:<p>{verified.has(e.id)?"Katılımın doğrulandı":e.status==="completed"?"Tamamlandı":"Geçmiş etkinlik"}</p>}</div></article>)}</div>{!events?.length&&<p>Henüz etkinlik bulunmuyor.</p>}</div></main>;
}