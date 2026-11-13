import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "./preview.css";
import {EventJoinButton} from "./EventJoinButton";
import {DecisionList} from "./DecisionList";

type QIconName="calendar"|"layers"|"gavel"|"book"|"hierarchy"|"archive"|"target"|"flame"|"diamond";
function QIcon({name,size=26}:{name:QIconName;size?:number}){
 const common={fill:"none",stroke:"currentColor",strokeWidth:1.85,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
 const paths:Record<QIconName,React.ReactNode>={
 calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h3v3H8z"/></>,
 layers:<><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></>,
 gavel:<><path d="m14 4 6 6M11 7l6 6M3 18l10-10M2 21h13M4 17l3 3M12 3l3-2 7 7-3 3"/></>,
 book:<><path d="M12 6c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1ZM12 6v15M5 9h4M15 9h4"/></>,
 hierarchy:<><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="9" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 8v5M5 17v-4h14v4M12 13v4"/></>,
 archive:<><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v12h14V9M10 14h4"/></>,
 target:<><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5"/></>,
 flame:<><path d="M12 22c-5 0-8-3-8-8 0-4 3-7 5-10 0 4 2 5 3 6 2-2 3-4 3-8 4 4 5 8 5 12 0 5-3 8-8 8ZM12 22c-2 0-3-2-3-4 0-2 2-4 3-5 1 2 3 3 3 5 0 2-1 4-3 4Z"/></>,
 diamond:<><path d="m12 2 10 10-10 10L2 12 12 2Z"/></>
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...common}>{paths[name]}</svg>;
}

export const dynamic="force-dynamic";
export const metadata={title:"Q-GANG · Topluluk merkezi"};
type EventRow={id:string;title:string;starts_at:string;cover_url:string|null;type_id:string|null;legacy_type:string|null;status:string};
type ResponseRow={event_id:string;response:string};
const date=(value:string)=>new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"}).format(new Date(value));
const shortDate=(value:string|null)=>value?new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"short",timeZone:"Europe/Istanbul"}).format(new Date(value)):"";
const eventName=(event:EventRow,types:Record<string,string>)=>types[event.type_id??""]??event.legacy_type??"Etkinlik";
export default async function QGang3Preview(){
 const supabase=await createClient();
 const user=await getCurrentUser();
 if(!user)redirect("/login?next=/qgang-3");
 const {data:profile}=await supabase.from("profiles").select("onboarding_completed_at,avatar_url,handle,is_suspended,role").eq("id",user.id).maybeSingle();
 if(!profile?.onboarding_completed_at)redirect("/onboarding?next=/qgang-3");
 const {data:membership}=await supabase.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!membership||profile.is_suspended)redirect("/qgang-3/basvuru");
 const rankMap:Record<string,{name:string;tone:string}>={founder:{name:"LİDER",tone:"leader"},admin:{name:"VEKİLHARÇ",tone:"deputy"},moderator:{name:"KAPTAN",tone:"captain"},creator:{name:"TEĞMEN",tone:"lieutenant"},member:{name:"ÜYE",tone:"member"}};
 const rank=rankMap[profile.role??""]??{name:"ÜYE",tone:"member"};
 const now=new Date().toISOString();
 const [{data:events},{data:history},{data:types},{data:decisions}]=await Promise.all([
  user?supabase.from("community_events").select("id,title,starts_at,cover_url,type_id,legacy_type,status").eq("status","published").gte("starts_at",now).order("starts_at",{ascending:true}).limit(3):Promise.resolve({data:[]}),
  user?supabase.from("community_events").select("id,title,starts_at,cover_url,type_id,legacy_type,status").eq("status","completed").order("starts_at",{ascending:false}).limit(4):Promise.resolve({data:[]}),
  supabase.from("event_types").select("id,name"),
  supabase.from("qgang_decisions").select("id,title,body,category,visibility,status,decision_year,decision_number,published_at,repeal_reason").in("status",["published","repealed"]).order("published_at",{ascending:false}).limit(3)
 ]);
 const {data:birthdayProfiles}=await supabase.from("profiles").select("id,handle,birthday_month,birthday_day").eq("birthday_visibility","community").not("birthday_month","is",null).not("birthday_day","is",null).eq("is_suspended",false);
 const {data:activeBirthdayMembers}=await supabase.from("community_memberships").select("user_id").eq("status","active");
 const activeBirthdayIds=new Set((activeBirthdayMembers??[]).map(m=>m.user_id));
 const istanbulToday=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Istanbul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const [currentYear,currentMonth,currentDay]=istanbulToday.split("-").map(Number);
 const todayUtc=Date.UTC(currentYear,currentMonth-1,currentDay);
 const birthdays=(birthdayProfiles??[]).filter(p=>activeBirthdayIds.has(p.id)).flatMap(p=>{
  const month=Number(p.birthday_month),day=Number(p.birthday_day);
  if(month<1||month>12||day<1||day>31)return [];
  let next:Date|null=null;
  for(let y=currentYear;y<=currentYear+1;y++){const d=new Date(Date.UTC(y,month-1,day));if(d.getUTCMonth()===month-1&&d.getUTCDate()===day&&d.getTime()>=todayUtc){next=d;break;}}
  if(!next)return [];
  const days=Math.round((next.getTime()-todayUtc)/86400000);
  return days<30?[{id:p.id,handle:p.handle??"Üye",days,day,month}]:[];
 }).sort((a,b)=>a.days-b.days||a.handle.localeCompare(b.handle,"tr"));
 const typeNames=Object.fromEntries((types??[]).map(t=>[t.id,t.name]));
 const ids=(events??[]).map(e=>e.id);
 const {data:responses}=ids.length?await supabase.from("event_responses").select("event_id,response").eq("user_id",user.id).in("event_id",ids):{data:[] as ResponseRow[]};
 const ownJoined=new Set((responses??[]).filter(r=>r.response==="going").map(r=>r.event_id));
 const countEntries=await Promise.all(ids.map(async id=>{
  const {data,error}=await supabase.rpc("qgang_event_attendee_count",{p_event_id:id});
  return [id,error?null:Number(data??0)] as const;
 }));
 const counts=Object.fromEntries(countEntries);
 return <main className="qg3">
  <div className="qg3-scene">
   <header className="qg3-header"><Link href="/qgang-3" className="qg3-brand"><img className="qg3-brandlogo" src="/brand/qgang-logo.png" alt="Q-GANG logosu"/><span className="qg3-brandword">Q-GANG</span></Link><Link className="qg3-header-profile" href="/qgang-3/profil" aria-label="Operatör dosyam">Profilim →</Link></header>
   <div className="qg3-heading"><h1>BİZ KİMİZ?</h1><div className="qg3-aboutbox"><p>Q-GANG, dijital oyunları temel ortak faaliyet olarak benimseyen; üyeleri arasında sosyal, kültürel ve düşünsel etkileşimi, dayanışmayı ve ortak üretimi geliştirmeyi amaçlayan bağımsız ve gönüllü bir topluluktur.</p></div></div>
  </div>
  <div className="qg3-content"><Link href="/qgang-3/profil" className="qg3-operatorcard"><span className="qg3-opavatar">{profile.avatar_url?<img src={profile.avatar_url} alt="" referrerPolicy="no-referrer"/>:(profile.handle??"Q").slice(0,1).toUpperCase()}</span><span className="qg3-opidentity"><small>OPERATÖR DOSYASI</small><strong>{profile.handle??"Operatör"}</strong><span className="qg3-oprank">{rank.name}</span></span><span className="qg3-opright"><span>PERSONEL KAYDI</span><b>DOSYAYI AÇ ↗</b></span></Link>
   <section className="qg3-panel" style={{marginBottom:18}}><div className="qg3-panelhead"><h2><QIcon name="calendar"/>Doğum Günü Takibi</h2><span style={{fontSize:12,color:"#b5bfcd"}}>ÖNÜMÜZDEKİ 30 GÜN</span></div>
    {birthdays.length?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12,padding:"10px 0"}}>{birthdays.map(b=><div key={b.id} style={{background:"#141c27",border:"1px solid #3c4551",padding:16,display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}><div><strong>{b.handle}</strong><div style={{color:"#aebac8",fontSize:12,marginTop:5}}>{String(b.day).padStart(2,"0")}.{String(b.month).padStart(2,"0")}</div></div><strong style={{color:b.days===0?"#f27b90":"#dce6ef",fontSize:12}}>{b.days===0?"BUGÜN 🎂":b.days===1?"YARIN":b.days+" GÜN"}</strong></div>)}</div>:<p style={{color:"#aab6c5",padding:"10px 0"}}>Önümüzdeki 30 gün içinde paylaşımı açık bir doğum günü bulunmuyor.</p>}
    <p style={{color:"#8794a4",fontSize:11}}>Yalnızca doğum gününü toplulukla paylaşmayı seçen aktif üyeler gösterilir.</p>
   </section>
   <div className="qg3-maincolumns"><section className="qg3-panel qg3-eventssection"><div className="qg3-panelhead"><h2><QIcon name="calendar"/>Yaklaşan Etkinlikler</h2><Link href="/etkinlikler">Tüm etkinlikler →</Link></div><div className="qg3-eventgrid" aria-label="Yaklaşan etkinlikler">
    {!user?<div className="qg3-empty qg3-wide">Etkinlikleri ve katılımcı sayılarını görmek için <Link href="/login">giriş yapın →</Link></div>:(events??[]).length===0?<div className="qg3-empty qg3-wide qg3-eventempty"><div className="qg3-emptyemblem" aria-hidden="true"><QIcon name="target" size={38}/></div><div className="qg3-emptycopy"><strong>Buralar soğuk...</strong><p>Yeni etkinlik gözükmüyor. Karargâh sessiz; yeni bir buluşma için etkinlikleri keşfet.</p></div><Link className="qg3-emptycta" href="/etkinlikler">Etkinliklere göz at <span aria-hidden="true">↗</span></Link></div>:(events as EventRow[]).map(event=><article className="qg3-event" key={event.id}><div className="qg3-eventimage">{event.cover_url?<img src={event.cover_url} alt="" loading="lazy"/>:<span>◆</span>}</div><div className="qg3-eventinfo"><h2>{eventName(event,typeNames)}</h2><time dateTime={event.starts_at}>{date(event.starts_at)}</time><EventJoinButton eventId={event.id} initialJoined={ownJoined.has(event.id)} initialCount={counts[event.id]??(ownJoined.has(event.id)?1:0)}/></div></article>)}
   </div></section>
   <section className="qg3-activity qg3-panel"><div className="qg3-panelhead"><h2><QIcon name="layers"/>Son Faaliyetler</h2><Link href="/etkinlikler">Tüm faaliyetler →</Link></div><div className="qg3-activityitems">{!user?<p>Faaliyetleri görmek için giriş yapın.</p>:(history??[]).length===0?<p>Henüz tamamlanan faaliyet bulunmuyor.</p>:(history as EventRow[]).map(e=><div className="qg3-activityitem" key={e.id}><span className="qg3-activitysymbol"><QIcon name={eventName(e,typeNames).toUpperCase().includes("BBQ")?"flame":"target"} size={25}/></span><span><strong>{eventName(e,typeNames)}</strong><small>{shortDate(e.starts_at)}</small></span></div>)}</div></section></div>
   <div className="qg3-bottomgrid">
    <section className="qg3-panel qg3-decisionspanel"><div className="qg3-panelhead"><h2><QIcon name="gavel"/>Kararlar</h2><Link href="/qgang-3/kararlar">Tüm kararlar →</Link></div><DecisionList items={decisions??[]}/></section>
   </div>
   <nav className="qg3-quicklinks" aria-label="Topluluk bağlantıları">
    <Link className="qg3-quicklink" href="/kodeks"><span className="qg3-quickicon" aria-hidden="true"><QIcon name="book" size={40}/></span><strong>Kurallar</strong><span className="qg3-quickarrow" aria-hidden="true">→</span></Link>
    <Link className="qg3-quicklink" href="/topluluk"><span className="qg3-quickicon" aria-hidden="true"><QIcon name="hierarchy" size={40}/></span><strong>Hiyerarşi</strong><span className="qg3-quickarrow" aria-hidden="true">→</span></Link>
    <Link className="qg3-quicklink" href="/qgang-3/arsiv"><span className="qg3-quickicon" aria-hidden="true"><QIcon name="archive" size={40}/></span><strong>Arşiv</strong><span className="qg3-quickarrow" aria-hidden="true">→</span></Link>
   </nav>
   <footer className="qg3-footer"><span>Q-GANG · Kardeşlik, daima.</span><div><span>Steam grubu · Bağlantı bekleniyor</span><span>WhatsApp · Üyelere özel</span></div></footer>
  </div>
 </main>;
}