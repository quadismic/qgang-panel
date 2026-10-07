import Link from "next/link";
import {Badge,EmptyState,Metadata} from "@/components/ui/Primitives";
import {QGIcon} from "@/components/QGIcon";
import {eventDate,EVENT_TYPES} from "@/lib/events";

export type EventListEntry={id:string;title:string;type_id:string|null;legacy_type:string|null;starts_at:string;date_only:boolean;location:string;status?:string;event_attendance?:{user_id:string|null;attended:boolean|null}[]};
export type EventTypeOption={id:string;name:string};
const statusLabels:Record<string,string>={draft:"Taslak",published:"Yayımlandı",completed:"Tamamlandı",cancelled:"İptal edildi"};
const responseLabels:Record<string,string>={going:"Katılacağım",maybe:"Belki",not_going:"Katılmayacağım"};
export function EventRow({event,types,response,viewerId,compact=false,returnTo}:{event:EventListEntry;types:EventTypeOption[];response?:string;viewerId?:string;compact?:boolean;returnTo?:string}){
 const parts=new Intl.DateTimeFormat("tr-TR",{timeZone:"Europe/Istanbul",day:"2-digit",month:"short",year:"numeric",weekday:"short"}).formatToParts(new Date(event.starts_at));
 const part=(type:string)=>parts.find(p=>p.type===type)?.value;
 const typeName=types.find(t=>t.id===event.type_id)?.name||event.legacy_type||"Etkinlik";
 const typeKey=EVENT_TYPES.some(t=>t.id===event.type_id)?event.type_id:"legacy";
 const ownAttendance=viewerId?event.event_attendance?.find(a=>a.user_id===viewerId):undefined;
 const participation=ownAttendance?ownAttendance.attended===true?"Katılımın doğrulandı":ownAttendance.attended===false?"Yoklama: katılmadı":"Yoklama bekliyor":response?`Yanıtın: ${responseLabels[response]||response}`:undefined;
 const detailHref=`/etkinlikler/${event.id}`+(returnTo?`?returnTo=${encodeURIComponent(returnTo)}`:"");
 const Heading=compact?"h3":"h2";
 return <article className={`eventLedgerRow ${compact?"eventLedgerRow-home":""}`}>
  <time className="eventDateStamp" dateTime={event.starts_at} aria-label={eventDate(event.starts_at,true)}><b>{part("day")}</b><span>{part("month")?.toLocaleUpperCase("tr-TR")}</span><small>{part("weekday")} · {part("year")}</small></time>
  <div className="eventLedgerContent"><Badge className={`eventTypeBadge eventTypeBadge-${typeKey}`}>{typeName}</Badge><Heading><Link href={detailHref}>{event.title}</Link></Heading>
   <Metadata className="eventLedgerMeta">{event.location&&<span className="eventLocation">{event.location}</span>}<time dateTime={event.starts_at}><QGIcon name="calendar"/>{eventDate(event.starts_at,event.date_only)}</time></Metadata>
  </div>
  <div className="eventLedgerActions">{!compact&&event.status&&<span className="eventRecordStatus">{statusLabels[event.status]||event.status}</span>}{!compact&&participation&&<span className="eventParticipation">{participation}</span>}{!compact&&event.status==="completed"&&<small>{event.event_attendance?.filter(a=>a.attended).length||0} doğrulanmış katılım</small>}<Link className="qgButton qgButton-tertiary eventDetailLink" href={detailHref} aria-label={`${event.title} — ayrıntılar`}>Etkinliği görüntüle <QGIcon name="chevron"/></Link></div>
 </article>;
}
export function EventList({events,types,responses=[],viewerId,archive=false,filtered=false,returnTo}:{events:EventListEntry[];types:EventTypeOption[];responses?:{event_id:string;response:string}[];viewerId?:string;archive?:boolean;filtered?:boolean;returnTo?:string}){
 return <section className="eventLedger" aria-label={archive?"Etkinlik arşiv kayıtları":"Yaklaşan etkinlik kayıtları"}>{events.length?events.map(e=><EventRow key={e.id} event={e} types={types} returnTo={returnTo} viewerId={viewerId} response={responses.find(r=>r.event_id===e.id)?.response}/>):<div className="eventCompactEmpty"><EmptyState title={filtered?"Bu filtrelerle etkinlik bulunamadı":archive?"Arşiv henüz boş":"Henüz yaklaşan etkinlik yok"}/>{filtered?<Link className="qgButton qgButton-tertiary" href={archive?"/etkinlikler?view=archive":"/etkinlikler"}>Filtreleri temizle</Link>:!archive&&<Link className="qgButton qgButton-tertiary" href="/etkinlikler?view=archive">Etkinlik arşivini gör <QGIcon name="chevron"/></Link>}</div>}</section>;
}
