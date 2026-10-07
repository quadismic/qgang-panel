import {EventActionForm} from "@/components/EventActionForm";
import {EventAttendanceArchive} from "@/components/EventAttendanceArchive";
import {notFound,redirect} from "next/navigation";
import {AppShell} from "@/components/AppShell";
import {EventForm} from "@/components/EventForm";
import {MemberPicker} from "@/components/MemberPicker";
import {Button,EmptyState} from "@/components/ui/Primitives";
import {createClient} from "@/lib/supabase/server";
import {getPermissions,allows} from "@/lib/permissions";
import {EventDetailHeader} from "@/components/EventDetailHeader";
import {EventDetailActions} from "@/components/EventDetailActions";
import {eventReturnHref} from "@/lib/event-navigation";
export const dynamic="force-dynamic";
export default async function EventDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string;returnTo?:string}>}) {
 const {user,permissions}=await getPermissions();if(!user)redirect("/login?next=/etkinlikler");
 if(!allows(permissions,"events.view"))return <AppShell right={false}><EmptyState title="Etkinliklere erişim yetkin yok"/></AppShell>;
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();const s=await createClient();
 const {data:e}=await s.from("community_events").select("*,organizer:profiles!community_events_organizer_id_fkey(display_name,handle)").eq("id",id).maybeSingle();if(!e)notFound();
 const manage=allows(permissions,"events.manage"),attendance=allows(permissions,"events.attendance");
 const [{data:types},{data:awards},{data:responses},{data:summary}]=await Promise.all([
 s.from("event_types").select("id,name,active").order("sort_order"),
 s.from("event_attendance").select("id,attended,historical_name,user_id,member:profiles!event_attendance_user_id_fkey(display_name,handle)").eq("event_id",id),
 s.from("event_responses").select("response").eq("event_id",id).eq("user_id",user.id).maybeSingle(),
 e.status!=="draft"?s.rpc("event_response_summary",{p_event:id}):Promise.resolve({data:null})]);
 const counts=summary?.[0];const q=await searchParams,saved=q.saved,returnHref=eventReturnHref(q.returnTo,e.status==="completed");
 return <AppShell right={false}><div className="eventsPage"><EventDetailHeader event={e} typeName={types?.find(t=>t.id===e.type_id)?.name||e.legacy_type||"Etkinlik"} returnHref={returnHref}/><EventDetailActions editForm={manage?<> <EventForm event={e} types={(types??[]).filter(t=>t.active||t.id===e.type_id)}/> </>:undefined} statusForm={manage&&allows(permissions,"events.publish")?<> <EventActionForm className="eventForm"><input type="hidden" name="action" value="status"/><input type="hidden" name="id" value={id}/><label>Yeni durum<select name="status" className="qgSelect" defaultValue={e.status}><option value="draft">Taslak</option><option value="published">Yayımla</option><option value="completed">Tamamlandı</option><option value="cancelled">İptal Et</option></select></label><label className="eventConfirmation"><input type="checkbox" name="confirm" value="yes" required/> Etkinliğin durumunu değiştirmeyi onaylıyorum.</label><Button type="submit">Durumu Kaydet</Button></EventActionForm> </>:undefined} attendanceForm={attendance&&["published","completed"].includes(e.status)&&new Date(e.starts_at)<=new Date()?<> <p>Yalnız gerçekleşmiş katılımı doğrula. Yanlış kaydı aynı üye için “Katılmadı” seçerek düzelt.</p><EventActionForm className="eventForm"><input type="hidden" name="action" value="attendance"/><input type="hidden" name="id" value={id}/><MemberPicker name="user_id" label="Üye" scope="events"/><label>Yoklama<select name="attended" className="qgSelect"><option value="yes">Katıldı</option><option value="no">Katılmadı / kaydı düzelt</option></select></label><label className="eventConfirmation"><input type="checkbox" name="confirm" required value="yes"/> Yoklama kaydını doğruluyorum.</label><Button type="submit" level="primary">Yoklamayı Kaydet</Button></EventActionForm><ul>{(awards??[]).map(a=>{const member=Array.isArray(a.member)?a.member[0]:a.member;return <li key={a.id}>{member?.display_name||a.historical_name} · {a.attended===null?"Doğrulama bekliyor":a.attended?"Katıldı":"Katılmadı"}</li>})}</ul> </>:undefined} linksForm={allows(permissions,"events.archive")&&(awards??[]).some(a=>a.historical_name)?<> {(awards??[]).filter(a=>a.historical_name).map(a=><EventActionForm className="eventForm" key={a.id}><input type="hidden" name="action" value="link"/><input type="hidden" name="id" value={id}/><input type="hidden" name="attendance_id" value={a.id}/><p className="eventFormWide">Eski rumuz: <b>{a.historical_name}</b>{a.user_id?" · Hesaba bağlı":" · Eşleşme bekliyor"}</p><MemberPicker name="user_id" scope="events" label="Doğrulanan hesap"/><label className="eventConfirmation"><input type="checkbox" name="confirm" value="yes" required/> Bu hesabın tarihsel üyeye ait olduğunu doğruladım.</label><Button type="submit">Kimliği Eşleştir</Button></EventActionForm>)} </>:undefined} />
 {saved&&<p className="notice" role="status">Kayıt güncellendi.</p>}
 <section className="managementPanel eventDetail">{e.description&&<p className="eventDescription">{e.description}</p>}{e.location&&<p><b>Buluşma:</b> {e.location}</p>}{e.organizer&&<p><b>Düzenleyen:</b> {e.organizer.display_name||e.organizer.handle}</p>}{counts&&<p className="eventResponseCounts">{counts.going} “Katılacağım” yanıtı{e.capacity&&` / ${e.capacity} kişilik kapasite`}{counts.waiting>0&&` · ${counts.waiting} kişi bekleme sırasında`}</p>}
 {e.status==="published"&&new Date(e.starts_at)>new Date()&&<EventActionForm className="eventResponse"><input type="hidden" name="action" value="respond"/><input type="hidden" name="id" value={id}/><label>Katılım yanıtın<select name="response" className="qgSelect" defaultValue={responses?.response||"maybe"}><option value="going">Katılacağım</option><option value="maybe">Belki</option><option value="not_going">Katılmayacağım</option></select></label><Button level="primary" type="submit">Yanıtı Kaydet</Button>{counts?.my_waiting&&<p role="status">Bekleme sırasındasın. Yer açıldığında sıran korunarak katılım listesine geçersin.</p>}<small>Yanıtın gerçek katılım kaydı değildir; yoklama ayrıca doğrulanır.</small></EventActionForm>}</section>
 {e.status==="completed"&&<EventAttendanceArchive records={awards??[]}/>}
 </div></AppShell>;
}
