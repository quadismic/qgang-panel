import Link from "next/link";
import {createClient} from "@/lib/supabase/server";
import {getPermissions,allows} from "@/lib/permissions";
import {eventDate,eventCover} from "@/lib/events";
export async function homeEventData() {
 const {permissions}=await getPermissions();if(!allows(permissions,"events.view"))return null;
 const s=await createClient();const [{data:upcoming,error:a},{data:recent,error:b},{data:types}]=await Promise.all([
 s.from("community_events").select("id,title,type_id,legacy_type,starts_at,ends_at,date_only").eq("status","published").gte("ends_at",new Date().toISOString()).order("starts_at").limit(3),
 s.from("community_events").select("id,title,type_id,legacy_type,starts_at,date_only,cover_url,event_attendance(attended)").eq("status","completed").order("starts_at",{ascending:false}).limit(3),
 s.from("event_types").select("id,name")]);
 if(a||b)return null;return {upcoming:upcoming??[],recent:recent??[],types:types??[]};
}
export function UpcomingEvents({data}:{data:NonNullable<Awaited<ReturnType<typeof homeEventData>>>}) {
 if(!data.upcoming.length)return null;return <section className="homeUpcomingEvents"><header className="homeSectionHead"><div><h2>YAKLAŞAN ETKİNLİKLER</h2></div><Link href="/etkinlikler">TÜM ETKİNLİKLER →</Link></header><div className="eventUpcomingGrid">{data.upcoming.map(e=><Link key={e.id} className="managementPanel eventCard" href={`/etkinlikler/${e.id}`}><span className="kicker">{data.types.find(t=>t.id===e.type_id)?.name||e.legacy_type}</span><h3>{e.title}</h3><time dateTime={e.starts_at}>{eventDate(e.starts_at,e.date_only)}</time></Link>)}</div></section>;
}
export function RecentEvents({data}:{data:NonNullable<Awaited<ReturnType<typeof homeEventData>>>}) {
 return <section className="homeFeedSection homeEvents"><header className="homeSectionHead"><div><h2>SON ETKİNLİKLER</h2></div><Link href="/etkinlikler?view=archive">ARŞİV →</Link></header><div className="homePubList">{data.recent.map(e=><Link key={e.id} className="homePubRow" href={`/etkinlikler/${e.id}`}><div className="homePubThumb">{eventCover(e.cover_url)?<img src={eventCover(e.cover_url)!} alt=""/>:<span>✦</span>}</div><div className="homePubRowBody"><b className="kicker">{data.types.find(t=>t.id===e.type_id)?.name||e.legacy_type}</b><h3>{e.title}</h3><time>{eventDate(e.starts_at,true)}</time><p>{(e.event_attendance??[]).filter(a=>a.attended).length} doğrulanmış katılım</p></div></Link>)}{!data.recent.length&&<div className="homeFeedEmpty"><b>Etkinlik arşivi hazırlanıyor.</b></div>}</div></section>;
}
