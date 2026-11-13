import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"Etkinlik Yönetimi · Q-GANG"};
export default async function EventManagement(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/yonetim/etkinlikler");
 const db=await createClient();
 const {data:profile}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 const {data:membership}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!membership||profile?.is_suspended||!["founder","admin","moderator"].includes(profile?.role??""))redirect("/qgang-3");
 const {data:events}=await db.from("community_events").select("id,title,status,starts_at,location,organizer_id").order("starts_at",{ascending:false}).limit(60);
 const ids=(events??[]).map(e=>e.id);
 const {data:responses}=ids.length?await db.from("event_responses").select("event_id,response").in("event_id",ids):{data:[]};
 const count=new Map<string,number>();for(const response of responses??[]){if(response.response==="going")count.set(response.event_id,(count.get(response.event_id)??0)+1);}
 const upcoming=(events??[]).filter(e=>e.status==="published"&&new Date(e.starts_at).getTime()>=Date.now()).length;
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim">← KARARGÂH</Link><span>ETKİNLİKLER</span></header><h1>ETKİNLİK YÖNETİMİ</h1><p>{upcoming} yaklaşan · {(events??[]).length} kayıt gösteriliyor</p><div className="qg-hq-links" style={{marginBottom:20}}><Link href="/etkinlikler"><strong>ETKİNLİK MERKEZİ</strong><small>Oluşturma ve mevcut işlem araçları</small><span>↗</span></Link></div><section className="qg-hq-panel"><h2>FAALİYETLER</h2>{events?.length?events.map(e=><article key={e.id} className="qg-hq-entry"><div><strong>{e.title}</strong><span>{e.status}</span></div><p>{new Date(e.starts_at).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul",dateStyle:"medium",timeStyle:"short"})}{e.location?" · "+e.location:""}</p><small>Katılım bildirimi: {count.get(e.id)??0} · <Link href="/etkinlikler">Yönetim araçlarına git ↗</Link></small></article>):<p>Etkinlik kaydı bulunamadı.</p>}</section></div></main>;
}
