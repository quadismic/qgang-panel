import Link from "next/link";
import {createClient} from "@/lib/supabase/server";
import {getPermissions,allows} from "@/lib/permissions";
import {eventDays,eventDate} from "@/lib/events";
export async function UpcomingEventAlerts() {
 const {permissions}=await getPermissions();if(!allows(permissions,"events.manage"))return null;
 const s=await createClient();const now=new Date(),until=new Date(now);until.setUTCDate(until.getUTCDate()+8);
 const {data,error}=await s.from("community_events").select("id,title,starts_at,ends_at,date_only,capacity,organizer:profiles!community_events_organizer_id_fkey(display_name)").eq("status","published").gte("starts_at",now.toLocaleDateString("en-CA",{timeZone:"Europe/Istanbul"})+"T00:00:00+03:00").lte("starts_at",until.toISOString()).order("starts_at");
 const {data:overdue}=await s.from("community_events").select("id,title").eq("status","published").lt("ends_at",now.toISOString()).order("ends_at").limit(20);
 if(error)return null;const events=(data??[]).filter(e=>eventDays(e.starts_at,now)>=0&&eventDays(e.starts_at,now)<=7);
 return <section className="birthdayAdminPanel"><header><h2>Yaklaşan Etkinlikler · 7 Gün</h2></header>{events.map(e=><Link className="birthdayAdminRow" key={e.id} href={`/etkinlikler/${e.id}`}><div><b>{e.title}</b><small>{eventDate(e.starts_at,e.date_only)} · {(Array.isArray(e.organizer)?e.organizer[0]:e.organizer)?.display_name||"Düzenleyen belirtilmedi"}{e.capacity&&` · ${e.capacity} kişilik`}</small></div><strong>{eventDays(e.starts_at,now)===0?"BUGÜN":`${eventDays(e.starts_at,now)} GÜN`}</strong></Link>)}{!events.length&&<p className="muted">Önümüzdeki 7 gün içinde yayımlanmış etkinlik yok.</p>}{!!overdue?.length&&<details className="eventExpand"><summary>Tamamlanma kaydı bekleyen etkinlikler ({overdue.length})</summary>{overdue.map(e=><p key={e.id}><Link href={`/etkinlikler/${e.id}`}>{e.title}</Link></p>)}</details>}</section>;
}
