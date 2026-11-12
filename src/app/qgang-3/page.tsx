import Link from "next/link";
import {redirect} from "next/navigation";
import {Inter} from "next/font/google";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "./preview.css";

const inter=Inter({subsets:["latin"],display:"swap",variable:"--font-qgang-modern"});
export const dynamic="force-dynamic";
export const metadata={title:"Q-GANG · Topluluk merkezi"};
type EventRow={id:string;title:string;starts_at:string;cover_url:string|null;type_id:string|null;legacy_type:string|null;status:string};
type Notice={id:string;title:string;published_at:string|null};
type ResponseRow={event_id:string;response:string};
const date=(value:string)=>new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"}).format(new Date(value));
const shortDate=(value:string|null)=>value?new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"short",timeZone:"Europe/Istanbul"}).format(new Date(value)):"";
const eventName=(event:EventRow,types:Record<string,string>)=>types[event.type_id??""]??event.legacy_type??"Etkinlik";
export default async function QGang3Preview(){
 const supabase=await createClient();
 const user=await getCurrentUser();
 if(!user)redirect("/login?next=/qgang-3");
 const {data:profile}=await supabase.from("profiles").select("onboarding_completed_at,avatar_url,handle,is_suspended").eq("id",user.id).maybeSingle();
 if(!profile?.onboarding_completed_at)redirect("/onboarding?next=/qgang-3");
 const {data:membership}=await supabase.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!membership||profile.is_suspended)redirect("/qgang-3/basvuru");
 const now=new Date().toISOString();
 const [{data:events},{data:history},{data:announcements},{data:types}]=await Promise.all([
  user?supabase.from("community_events").select("id,title,starts_at,cover_url,type_id,legacy_type,status").eq("status","published").gte("starts_at",now).order("starts_at",{ascending:true}).limit(3):Promise.resolve({data:[]}),
  user?supabase.from("community_events").select("id,title,starts_at,cover_url,type_id,legacy_type,status").eq("status","completed").order("starts_at",{ascending:false}).limit(4):Promise.resolve({data:[]}),
  supabase.from("announcements").select("id,title,published_at").order("published_at",{ascending:false}).limit(3),
  supabase.from("event_types").select("id,name")
 ]);
 const typeNames=Object.fromEntries((types??[]).map(t=>[t.id,t.name]));
 const ids=(events??[]).map(e=>e.id);
 const {data:responses}=user&&ids.length?await supabase.from("event_responses").select("event_id,response").in("event_id",ids).eq("response","going"): {data:[] as ResponseRow[]};
 const counts=(responses??[]).reduce((a,r)=>({...a,[r.event_id]:(a[r.event_id]??0)+1}),{} as Record<string,number>);
 return <main className={`qg3 ${inter.variable}`}>
  <div className="qg3-scene">
   <header className="qg3-header"><Link href="/qgang-3" className="qg3-brand"><span className="qg3-mark">◆</span><span>Q-GANG<small>KARDEŞLİK, DAİMA.</small></span></Link><Link className="qg3-login" href="/profil" aria-label="Profilim">{profile.avatar_url?<img src={profile.avatar_url} alt="" className="qg3-avatar" referrerPolicy="no-referrer"/>:<span className="qg3-avatar qg3-avatarblank">{(profile.handle??"Q").slice(0,1).toUpperCase()}</span>}</Link></header>
   <div className="qg3-heading"><h1>Yaklaşan Etkinlikler</h1><p>Katıl, oyna, buluş, üret.</p></div>
  </div>
  <div className="qg3-content">
   <section className="qg3-eventgrid" aria-label="Yaklaşan etkinlikler">
    {!user?<div className="qg3-empty qg3-wide">Etkinlikleri ve katılımcı sayılarını görmek için <Link href="/login">giriş yapın →</Link></div>:(events??[]).length===0?<div className="qg3-empty qg3-wide">Şu anda yaklaşan etkinlik bulunmuyor. Yeni etkinlikler burada görünecek.</div>:(events as EventRow[]).map(event=><article className="qg3-event" key={event.id}><div className="qg3-eventimage">{event.cover_url?<img src={event.cover_url} alt="" loading="lazy"/>:<span>◆</span>}</div><div className="qg3-eventinfo"><h2>{eventName(event,typeNames)}</h2><time dateTime={event.starts_at}>{date(event.starts_at)}</time><p>Katılıyor: {counts[event.id]??0}</p><Link href="/etkinlikler">Katıl →</Link></div></article>)}
   </section>
   <section className="qg3-activity qg3-panel"><div className="qg3-panelhead"><h2>Son Faaliyetler</h2><Link href="/etkinlikler">Tüm faaliyetler →</Link></div><div className="qg3-activityitems">{!user?<p>Faaliyetleri görmek için giriş yapın.</p>:(history??[]).length===0?<p>Henüz tamamlanan faaliyet bulunmuyor.</p>:(history as EventRow[]).map(e=><div className="qg3-activityitem" key={e.id}><span className="qg3-activitysymbol">◇</span><span><strong>{eventName(e,typeNames)}</strong><small>{shortDate(e.starts_at)}</small></span></div>)}</div></section>
   <div className="qg3-bottomgrid">
    <section className="qg3-panel"><div className="qg3-panelhead"><h2>Duyurular</h2><Link href="/duyurular">Tümü →</Link></div><div className="qg3-rows">{(announcements??[]).length?(announcements as Notice[]).map(a=><Link href="/duyurular" className="qg3-row" key={a.id}><span className="qg3-dot"/><span className="qg3-rowtitle">{a.title}</span><time>{shortDate(a.published_at)}</time></Link>):<p>Henüz duyuru yok.</p>}</div></section>
    <section className="qg3-panel"><div className="qg3-panelhead"><h2>Kararlar</h2></div><p className="qg3-muted">Numaralandırılmış icra kararları burada yayımlanacak.</p><p className="qg3-subtle">Karar kayıtları için veri kaynağı hazırlanıyor.</p></section>
    <section className="qg3-panel qg3-actionpanel"><div className="qg3-panelhead"><h2>Kurallar</h2></div><p>Topluluğun ilke, kural ve işleyiş esasları.</p><Link className="qg3-action" href="/kodeks">Kuralları incele →</Link></section>
    <section className="qg3-panel qg3-actionpanel"><div className="qg3-panelhead"><h2>Hiyerarşi</h2></div><p>Organizasyon yapısı ve görevler.</p><Link className="qg3-action" href="/topluluk">Hiyerarşiyi incele →</Link></section>
   </div>
   <footer className="qg3-footer"><span>Q-GANG · Kardeşlik, daima.</span><div><span>Steam grubu · Bağlantı bekleniyor</span><span>WhatsApp · Üyelere özel</span></div></footer>
  </div>
 </main>;
}