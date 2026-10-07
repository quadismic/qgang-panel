import Link from "next/link";
import {createClient} from "@/lib/supabase/server";
import {getPermissions,allows} from "@/lib/permissions";
import {EventRow} from "@/components/EventList";
import {QGIcon} from "@/components/QGIcon";
export async function homeEventData() {
 const {permissions}=await getPermissions();if(!allows(permissions,"events.view"))return null;
 const s=await createClient();const [{data:upcoming,error:a},{data:types,error:b}]=await Promise.all([
 s.from("community_events").select("id,title,type_id,legacy_type,starts_at,ends_at,date_only,location").eq("status","published").gte("ends_at",new Date().toISOString()).order("starts_at").order("id").limit(2),
 s.from("event_types").select("id,name").order("sort_order").order("id")]);
 if(a||b||!types?.length)return null;return {upcoming:upcoming??[],types:types??[]};
}
export function UpcomingEvents({data}:{data:NonNullable<Awaited<ReturnType<typeof homeEventData>>>}) {
 return <section className="homeUpcomingEvents"><header className="homeSectionHead"><div><span><QGIcon name="calendar"/></span><div><h2>YAKLAŞAN ETKİNLİK</h2></div></div><Link href="/etkinlikler">Tüm etkinlikler <QGIcon name="chevron"/></Link></header><div className="homeUpcomingList">{data.upcoming.length?data.upcoming.slice(0,2).map(e=><EventRow key={e.id} event={e} types={data.types} compact/>):<div className="homeUpcomingEmpty"><p>Henüz yaklaşan etkinlik yok.</p><Link className="qgButton qgButton-tertiary" href="/etkinlikler?view=archive">Etkinlik arşivini gör <QGIcon name="archive"/></Link></div>}</div></section>;
}
