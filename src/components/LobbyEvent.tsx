import Link from "next/link";
import {EventActionForm} from "@/components/EventActionForm";
import {getPermissions,allows} from "@/lib/permissions";
import {createClient} from "@/lib/supabase/server";
import {getViewerMembership} from "@/lib/viewer";
import {QGIcon} from "@/components/QGIcon";
import {Button} from "@/components/ui/Primitives";

export async function lobbyEventData(){
 const {user,permissions,role}=await getPermissions();
 const member=!!user&&(role==="founder"||role==="admin"||!!await getViewerMembership(user.id));
 if(!user||!allows(permissions,"events.view"))return {kind:"restricted" as const,guest:!user,member};
 if(!member)return {kind:"restricted" as const,guest:false,member:false};
 const s=await createClient();
 const {data:event,error}=await s.from("community_events").select("id,title,starts_at,date_only,location").eq("type_id","op-night").eq("status","published").gte("starts_at",new Date().toISOString()).order("starts_at").order("id").limit(1).maybeSingle();
 const canPropose=allows(permissions,"events.propose");
 if(error)return {kind:"error" as const,member:true};
 if(!event)return {kind:"empty" as const,canPropose,member:true};
 const [{data:own,error:responseError},{data:summary}]=await Promise.all([
  s.from("event_responses").select("response").eq("event_id",event.id).eq("user_id",user.id).maybeSingle(),
  s.rpc("event_response_summary",{p_event:event.id})
 ]);
 const counts=summary?.[0];
 return {kind:"event" as const,event,response:own?.response,going:counts?.going,waiting:counts?.waiting,myWaiting:counts?.my_waiting,responseError,canPropose,member:true};
}
export function LobbyEvent({data}:{data:Awaited<ReturnType<typeof lobbyEventData>>}){
 if(data.kind==="restricted")return data.guest?<section className="lobbyEvent lobbyEventShort"><h2>Oyun geceleri</h2><p>Oyun gecelerini görmek ve katılım bildirmek için giriş yap.</p><Link href="/login" className="qgAction">Giriş yap</Link></section>:null;
 if(data.kind==="error")return <section className="lobbyEvent lobbyEventShort"><h2>Oyun geceleri</h2><p role="status">Sıradaki oyun gecesi şu anda yüklenemedi.</p><Link href="/etkinlikler" className="qgAction">Etkinlikleri aç</Link></section>;
 if(data.kind==="empty")return <section className="lobbyEvent lobbyEventShort" aria-label="Sonraki oyun gecesi"><p className="kicker">SONRAKİ OYUN GECESİ</p><p className="lobbyEventInvitation">Bir sonraki oyun gecesinde ne oynayalım?</p><Link href={data.canPropose?"/etkinlikler?propose=1":"/etkinlikler"} className={data.canPropose?"qgAction qgActionPrimary":"qgAction"}>{data.canPropose?"Oyun öner":"Etkinlikleri gör"}</Link></section>;
 const {event,response,going,waiting,myWaiting,responseError}=data;
 const date=new Date(event.starts_at);
 const day=new Intl.DateTimeFormat("tr-TR",{timeZone:"Europe/Istanbul",weekday:"long",day:"numeric",month:"long"}).format(date);
 const hour=new Intl.DateTimeFormat("tr-TR",{timeZone:"Europe/Istanbul",hour:"2-digit",minute:"2-digit"}).format(date);
 const responseLabel=response==="going"?(myWaiting?"Bekleme listesindesin":myWaiting===false?"Katılıyorsun":"Katılım yanıtın kayıtlı"):response==="maybe"?"Belki katılacaksın":response==="not_going"?"Katılmayacaksın":null;
 return <section className="lobbyEvent" aria-labelledby="lobby-event-heading">
  <p className="kicker" id="lobby-event-heading">Sonraki Oyun Gecesi · OP-NIGHT</p>
  <h2><Link href={`/etkinlikler/${event.id}`}>{event.title}</Link></h2>
  <p className="lobbyEventMeta"><QGIcon name="calendar"/> <time dateTime={event.starts_at}>{day}{!event.date_only&&` · ${hour} TSİ`}</time></p>
  {event.location&&<p>{event.location}</p>}
  {going!=null&&<p>{going} kişinin yeri ayrıldı{Number(waiting)>0&&` · ${waiting} kişi bekliyor`}</p>}
  <div className="lobbyEventActions">
   {!responseError&&(responseLabel?<details className="lobbyRsvp"><summary>{responseLabel} <small>· Yanıtı değiştir</small></summary><EventActionForm><input type="hidden" name="action" value="respond"/><input type="hidden" name="id" value={event.id}/><input type="hidden" name="return_to" value="lobby"/><label>Katılım yanıtın<select className="qgSelect" name="response" defaultValue={response}><option value="going">Katılacağım</option><option value="maybe">Belki</option><option value="not_going">Katılmayacağım</option></select></label><Button type="submit">Yanıtı kaydet</Button></EventActionForm></details>:<EventActionForm><input type="hidden" name="action" value="respond"/><input type="hidden" name="id" value={event.id}/><input type="hidden" name="response" value="going"/><input type="hidden" name="return_to" value="lobby"/><Button className="lobbyJoin" level="primary" type="submit">Katılacağım</Button></EventActionForm>)}
   <Link className="lobbyTextLink" href="/etkinlikler">Tüm etkinlikler</Link>
  </div>
  {responseError&&<p role="status">Katılım yanıtın yüklenemedi. Etkinlik ayrıntısından kontrol edebilirsin.</p>}
 </section>;
}
