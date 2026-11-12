import Link from "next/link";
import {redirect} from "next/navigation";
import {brandTheme} from "@/config/brand-theme";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "./preview.css";
import {EventJoinButton} from "./EventJoinButton";

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
 const [{data:events},{data:history},{data:types}]=await Promise.all([
  user?supabase.from("community_events").select("id,title,starts_at,cover_url,type_id,legacy_type,status").eq("status","published").gte("starts_at",now).order("starts_at",{ascending:true}).limit(3):Promise.resolve({data:[]}),
  user?supabase.from("community_events").select("id,title,starts_at,cover_url,type_id,legacy_type,status").eq("status","completed").order("starts_at",{ascending:false}).limit(4):Promise.resolve({data:[]}),
  supabase.from("event_types").select("id,name")
 ]);
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
   <header className="qg3-header"><Link href="/qgang-3" className="qg3-brand"><img className="qg3-brandlogo" src={brandTheme.emblem} alt="Q-GANG"/></Link><Link className={`qg3-rankcard qg3-rank-${rank.tone}`} href="/profil" aria-label={`Profilim, yetki seviyesi ${rank.name}`}><span className="qg3-rankportrait">{profile.avatar_url?<img src={profile.avatar_url} alt="" className="qg3-avatar" referrerPolicy="no-referrer"/>:<span className="qg3-avatar qg3-avatarblank">{(profile.handle??"Q").slice(0,1).toUpperCase()}</span>}</span><span className="qg3-ranklabel">Yetki seviyesi: <strong>{rank.name}</strong></span></Link></header>
   <div className="qg3-heading"><h1>Yaklaşan Etkinlikler</h1><p>Katıl, oyna, buluş, üret.</p></div>
  </div>
  <div className="qg3-content">
   <section className="qg3-eventgrid" aria-label="Yaklaşan etkinlikler">
    {!user?<div className="qg3-empty qg3-wide">Etkinlikleri ve katılımcı sayılarını görmek için <Link href="/login">giriş yapın →</Link></div>:(events??[]).length===0?<div className="qg3-empty qg3-wide">Şu anda yaklaşan etkinlik bulunmuyor. Yeni etkinlikler burada görünecek.</div>:(events as EventRow[]).map(event=><article className="qg3-event" key={event.id}><div className="qg3-eventimage">{event.cover_url?<img src={event.cover_url} alt="" loading="lazy"/>:<span>◆</span>}</div><div className="qg3-eventinfo"><h2>{eventName(event,typeNames)}</h2><time dateTime={event.starts_at}>{date(event.starts_at)}</time><EventJoinButton eventId={event.id} initialJoined={ownJoined.has(event.id)} initialCount={counts[event.id]??(ownJoined.has(event.id)?1:0)}/></div></article>)}
   </section>
   <section className="qg3-activity qg3-panel"><div className="qg3-panelhead"><h2>Son Faaliyetler</h2><Link href="/etkinlikler">Tüm faaliyetler →</Link></div><div className="qg3-activityitems">{!user?<p>Faaliyetleri görmek için giriş yapın.</p>:(history??[]).length===0?<p>Henüz tamamlanan faaliyet bulunmuyor.</p>:(history as EventRow[]).map(e=><div className="qg3-activityitem" key={e.id}><span className="qg3-activitysymbol">◇</span><span><strong>{eventName(e,typeNames)}</strong><small>{shortDate(e.starts_at)}</small></span></div>)}</div></section>
   <div className="qg3-bottomgrid">
    <section className="qg3-panel"><div className="qg3-panelhead"><h2>Kararlar</h2></div><p className="qg3-muted">Numaralandırılmış icra kararları burada yayımlanacak.</p><p className="qg3-subtle">Karar kayıtları için veri kaynağı hazırlanıyor.</p></section>
    <section className="qg3-panel qg3-actionpanel"><div className="qg3-panelhead"><h2>Arşiv</h2></div><p>Kararları, geçmiş etkinlikleri ve yayınları tek aramayla bulun.</p><form className="qg3-archiveform" action="/qgang-3/arsiv" method="get"><input name="q" type="search" placeholder="Arşivde ara..." aria-label="Arşivde ara"/><button type="submit">Ara →</button></form><Link className="qg3-archivelink" href="/qgang-3/arsiv">Tüm arşivi görüntüle →</Link></section>
    <section className="qg3-panel qg3-actionpanel"><div className="qg3-panelhead"><h2>Kurallar</h2></div><p>Topluluğun ilke, kural ve işleyiş esasları.</p><Link className="qg3-action" href="/kodeks">Kuralları incele →</Link></section>
    <section className="qg3-panel qg3-actionpanel"><div className="qg3-panelhead"><h2>Hiyerarşi</h2></div><p>Organizasyon yapısı ve görevler.</p><Link className="qg3-action" href="/topluluk">Hiyerarşiyi incele →</Link></section>
   </div>
   <footer className="qg3-footer"><span>Q-GANG · Kardeşlik, daima.</span><div><span>Steam grubu · Bağlantı bekleniyor</span><span>WhatsApp · Üyelere özel</span></div></footer>
  </div>
 </main>;
}