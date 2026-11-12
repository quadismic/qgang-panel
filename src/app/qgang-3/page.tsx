import Link from "next/link";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "./preview.css";

export const dynamic="force-dynamic";
export const metadata={title:"Q-GANG 3.0 · Önizleme"};
type EventRow={id:string;title:string;description:string|null;starts_at:string;cover_url:string|null;location:string|null;type_id:string|null;status:string};
const formatDate=(value:string)=>new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",weekday:"long",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Istanbul"}).format(new Date(value));
export default async function QGang3Preview(){
 const supabase=await createClient();
 const user=await getCurrentUser();
 const now=new Date().toISOString();
 const [{data:events,error},{data:history},{data:announcements}]=await Promise.all([
  user?supabase.from("community_events").select("id,title,description,starts_at,cover_url,location,type_id,status").eq("status","published").gte("starts_at",now).order("starts_at",{ascending:true}).limit(6):Promise.resolve({data:[],error:null}),
  user?supabase.from("community_events").select("id,title,description,starts_at,cover_url,location,type_id,status").eq("status","completed").order("starts_at",{ascending:false}).limit(4):Promise.resolve({data:[]}),
  supabase.from("announcements").select("id,title,published_at").order("published_at",{ascending:false}).limit(3)
 ]);
 return <main className="qg3">
  <header className="qg3-header"><Link href="/qgang-3" className="qg3-brand"><span className="qg3-mark">◆</span><span>Q-GANG<small>KARDEŞLİK, DAİMA.</small></span></Link><nav aria-label="Ana menü"><a href="#etkinlikler">Etkinlikler</a><a href="#duyurular">Duyurular</a><Link href="/topluluk">Topluluk</Link><Link href="/kodeks">Kodeks</Link></nav><Link className="qg3-login" href={user?"/account":"/login"}>{user?"Profilim":"Giriş yap"}</Link></header>
  <section id="etkinlikler" className="qg3-section"><div className="qg3-sectionhead"><div><span className="qg3-eyebrow">BİRLİKTE</span><h2>Etkinlikler ve klan faaliyetleri</h2></div><Link href="/etkinlikler">Etkinlik arşivi ↗</Link></div>
   {!user?<div className="qg3-empty"><strong>Etkinlikleri görmek için giriş yapın.</strong><p>Topluluk etkinlikleri yalnızca yetkili üyeler tarafından görüntülenebilir.</p><Link href="/login">Giriş yap →</Link></div>:error?<p className="qg3-empty" role="alert">Etkinlikler şu anda yüklenemedi.</p>:(events??[]).length===0?<div className="qg3-empty"><strong>Şimdilik planlanmış etkinlik yok.</strong><p>Yeni etkinlikler yayımlandığında burada görünecek.</p></div>:<div className="qg3-grid">{(events as EventRow[]).map(event=><article className="qg3-card" key={event.id}><div className="qg3-cover">{event.cover_url?<img src={event.cover_url} alt="" loading="lazy"/>:<span aria-hidden="true">QG</span>}</div><div className="qg3-cardbody"><span className="qg3-tag">{event.type_id??"ETKİNLİK"}</span><h3>{event.title}</h3><time dateTime={event.starts_at}>{formatDate(event.starts_at)}</time>{event.location&&<p className="qg3-place">{event.location}</p>}<Link href="/etkinlikler">Etkinliklere git <span aria-hidden="true">→</span></Link></div></article>)}</div>}
   {user&&(history??[]).length>0&&<div className="qg3-history"><div className="qg3-sectionhead"><div><span className="qg3-eyebrow">ARŞİVDEN</span><h2>Son faaliyetler</h2></div></div><div className="qg3-historygrid">{(history as EventRow[]).map(event=><article key={event.id} className="qg3-historycard"><div className="qg3-historythumb">{event.cover_url?<img src={event.cover_url} alt="" loading="lazy"/>:<span>◆</span>}</div><div><small>{event.type_id??"FAALİYET"}</small><strong>{event.title}</strong><time dateTime={event.starts_at}>{formatDate(event.starts_at)}</time></div></article>)}</div></div>}
  </section>
  <section id="duyurular" className="qg3-section qg3-notices"><div className="qg3-sectionhead"><div><span className="qg3-eyebrow">TOPLULUKTAN</span><h2>Son duyurular</h2></div><Link href="/duyurular">Tüm duyurular ↗</Link></div><div className="qg3-noticelist">{(announcements??[]).length?(announcements??[]).map(a=><Link href="/announcements" key={a.id}><span>{a.title}</span><span aria-hidden="true">↗</span></Link>):<p>Henüz duyuru yok.</p>}</div></section>
  <section className="qg3-section qg3-codex"><div><span className="qg3-eyebrow">İLKELERİMİZ</span><h2>Q-GANG Kodeksi</h2><p>Topluluğumuzun üyelik, yönetim ve ortak yaşam esasları.</p></div><Link href="/kodeks">Kodeksi oku ↗</Link></section>
  <section className="qg3-section qg3-links"><div><span className="qg3-eyebrow">BAĞLANTIDA KAL</span><h2>Bağlantılar</h2></div><div className="qg3-linkgrid"><div><strong>Steam grubu</strong><small>Oyun ve organizasyon</small><span>Bağlantı bekleniyor</span></div><div><strong>WhatsApp topluluğu</strong><small>İletişim ve buluşmalar</small><span>Üyelere özel bağlantı</span></div></div></section>
  <footer className="qg3-footer"><strong>Q-GANG</strong><span>Kardeşlik, daima.</span><span>3.0 geliştirme önizlemesi</span></footer>
 </main>;
}