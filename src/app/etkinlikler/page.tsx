import {EventActionForm} from "@/components/EventActionForm";
import {MemberPicker} from "@/components/MemberPicker";
import {EventArchiveImport} from "@/components/EventArchiveImport";
import Link from "next/link";
import {redirect} from "next/navigation";
import {AppShell} from "@/components/AppShell";
import {EventForm} from "@/components/EventForm";
import {Button,Input,Textarea,EmptyState} from "@/components/ui/Primitives";
import {createClient} from "@/lib/supabase/server";
import {getPermissions,allows} from "@/lib/permissions";
import {eventDate,eventCover} from "@/lib/events";
export const dynamic="force-dynamic";
export const metadata={title:"Etkinlikler · Q-GANG"};
export default async function Events({searchParams}:{searchParams:Promise<{view?:string;type?:string;from?:string;to?:string;member?:string;saved?:string}>}) {
 const {user,permissions}=await getPermissions();if(!user)redirect("/login?next=/etkinlikler");
 if(!allows(permissions,"events.view"))return <AppShell right={false}><EmptyState title="Etkinliklere erişim yetkin yok"/></AppShell>;
 const s=await createClient(),q=await searchParams;const manage=allows(permissions,"events.manage"),archive=q.view==="archive";
 const {data:types,error:typeError}=await s.from("event_types").select("id,name,description,sort_order,active").order("sort_order").order("id");
 let query=s.from("community_events").select("id,title,type_id,legacy_type,starts_at,ends_at,date_only,status,description,cover_url,event_attendance(user_id,attended)").order("starts_at",{ascending:!archive});
 if(archive)query=query.eq("status","completed");else if(!manage)query=query.eq("status","published").gte("ends_at",new Date().toISOString());else query=query.neq("status","completed");
 if(q.type)query=query.eq("type_id",q.type);
 if(q.from&&/^\d{4}-\d{2}-\d{2}$/.test(q.from))query=query.gte("starts_at",q.from+"T00:00:00+03:00");
 if(q.to&&/^\d{4}-\d{2}-\d{2}$/.test(q.to))query=query.lte("starts_at",q.to+"T23:59:59+03:00");
 const {data:events,error}=await query;
 const {data:proposals}=await s.from("event_proposals").select("id,title,description,type_id,status,created_at,event_id").order("created_at",{ascending:false});
 const {data:selectedMember}=q.member?await s.from("profiles").select("id,display_name,handle,role,avatar_url").eq("id",q.member).maybeSingle():{data:null};
 const list=(events??[]).filter(e=>!q.member||(e.event_attendance??[]).some(a=>a.user_id===q.member&&a.attended));
 return <AppShell right={false}><div className="eventsPage"><section className="managementHero"><span className="kicker">Q-GANG · BİR ARADA</span><h1>Etkinlikler</h1><p>Buluşmalar, oyun geceleri ve ortak anılar.</p></section>
 {q.saved&&<p className="notice" role="status">Kayıt güncellendi.</p>}
 {(error||typeError)?<p className="notice" role="alert">Etkinlik kayıtları şu anda yüklenemiyor.</p>:<>
 <nav className="eventTabs" aria-label="Etkinlik görünümleri"><Link className={`qgButton qgButton-${!archive?"primary":"secondary"}`} href="/etkinlikler" aria-current={!archive?"page":undefined}>Yaklaşan Etkinlikler</Link><Link className={`qgButton qgButton-${archive?"primary":"secondary"}`} href="/etkinlikler?view=archive" aria-current={archive?"page":undefined}>Etkinlik Arşivi</Link></nav>
 <form className="eventFilters" method="get"><input type="hidden" name="view" value={archive?"archive":"upcoming"}/><label>Tür<select className="qgSelect" name="type" defaultValue={q.type||""}><option value="">Tümü</option>{(types??[]).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label>Başlangıç<Input type="date" name="from" defaultValue={q.from}/></label><label>Bitiş<Input type="date" name="to" defaultValue={q.to}/></label>{archive&&<MemberPicker name="member" label="Üye" scope="event-filter" required={false} initialMember={selectedMember}/>}<Button type="submit">Filtrele</Button></form>
 <div className="eventCardGrid">{list.map(e=><Link className="managementPanel eventCard" href={`/etkinlikler/${e.id}`} key={e.id}>{eventCover(e.cover_url)&&<img src={eventCover(e.cover_url)!} alt=""/>}<span className="kicker">{types?.find(t=>t.id===e.type_id)?.name||e.legacy_type}</span><h2>{e.title}</h2><time dateTime={e.starts_at}>{eventDate(e.starts_at,e.date_only)}</time><p>{e.description.slice(0,180)}</p><small>{({draft:"Taslak",published:"Yayımlandı",completed:"Tamamlandı",cancelled:"İptal edildi"})[e.status as "draft"]}{archive&&` · ${(e.event_attendance??[]).filter(a=>a.attended).length} doğrulanmış katılım`}</small></Link>)}</div>{!list.length&&<EmptyState title={archive?"Bu kapsamda arşiv kaydı yok":"Bu kapsamda etkinlik yok"}/>}
 {manage&&<details className="managementPanel eventExpand"><summary>Etkinlik Oluştur</summary><EventForm types={(types??[]).filter(t=>t.active)}/></details>}
 {allows(permissions,"events.propose")&&<details className="managementPanel eventExpand"><summary>Etkinlik Öner</summary><EventForm types={(types??[]).filter(t=>t.active)} proposal/></details>}
 {!!proposals?.length&&<section className="managementPanel"><h2>{manage?"Etkinlik Önerileri":"Önerilerim"}</h2>{proposals.map(p=><article className="eventProposal" key={p.id}><h3>{p.title}</h3><p>{p.description}</p><small>{p.status==="pending"?"İnceleme bekliyor":p.status==="accepted"?"Kabul edildi":"Uygun bulunmadı"}</small>{manage&&p.status==="pending"&&<EventActionForm><input name="action" type="hidden" value="review"/><input name="id" type="hidden" value={p.id}/><select name="status" className="qgSelect"><option value="accepted">Kabul et</option><option value="declined">Uygun bulma</option></select><label><input name="confirm" type="checkbox" required value="yes"/> Öneri kararını onaylıyorum.</label><Button type="submit">Kararı Kaydet</Button></EventActionForm>}{manage&&p.status!=="declined"&&!p.event_id&&<details className="eventExpand"><summary>Öneriden Etkinlik Taslağı Oluştur</summary><EventForm types={(types??[]).filter(t=>t.active)} seed={p}/></details>}</article>)}</section>}
 {allows(permissions,"events.archive")&&<EventArchiveImport/>}
 {allows(permissions,"events.settings")&&<details className="managementPanel eventExpand"><summary>Etkinlik Türleri ve Sıralama</summary>{(types??[]).map(t=><EventActionForm key={t.id} className="eventForm"><input type="hidden" name="action" value="type"/><input type="hidden" name="id" value={t.id}/><label>Tür adı<Input name="name" defaultValue={t.name} required maxLength={80}/></label><label>Sıra<Input name="sort_order" type="number" min={1} max={99} defaultValue={t.sort_order} required/></label><label className="eventFormWide">Açıklama<Textarea name="description" defaultValue={t.description} maxLength={1000}/></label><Button type="submit">Türü Kaydet</Button></EventActionForm>)}</details>}
 </>}</div></AppShell>;
}
