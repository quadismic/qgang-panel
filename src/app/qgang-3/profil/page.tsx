import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../preview.css";
import "./operator.css";

export const dynamic="force-dynamic";
export const metadata={title:"Operatör Dosyası · Q-GANG"};
const ranks:Record<string,string>={founder:"LİDER",admin:"VEKİLHARÇ",moderator:"KAPTAN",creator:"TEĞMEN",member:"ÜYE"};
const date=(value:string)=>new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Istanbul"}).format(new Date(value));

export default async function OperatorProfile(){
 const user=await getCurrentUser();
 if(!user)redirect("/login?next=/qgang-3/profil");
 const db=await createClient();
 const {data:profile}=await db.from("profiles").select("handle,avatar_url,role,onboarding_completed_at,is_suspended").eq("id",user.id).maybeSingle();
 if(!profile?.onboarding_completed_at)redirect("/onboarding?next=/qgang-3/profil");
 const {data:membership}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!membership||profile.is_suspended)redirect("/qgang-3/basvuru");
 const [{count:published},{data:responses}]=await Promise.all([
  db.from("publications").select("id",{count:"exact",head:true}).eq("author_id",user.id).eq("status","published"),
  db.from("event_responses").select("event_id,response").eq("user_id",user.id).eq("response","going")
 ]);
 const joined=(responses??[]).length;
 return <main className="qg3 qgop">
  <div className="qgop-shell">
   <header className="qgop-top"><Link href="/qgang-3" className="qgop-logo">Q-GANG</Link><span>OPERATÖR DOSYASI</span><Link href="/qgang-3" aria-label="Ana sayfaya dön">← ANA SAYFA</Link></header>
   <div className="qgop-grid">
    <aside className="qgop-person">
     <div className="qgop-portrait">{profile.avatar_url?<img src={profile.avatar_url} alt="Profil fotoğrafı" referrerPolicy="no-referrer"/>:<div className="qgop-silhouette" aria-hidden="true">{(profile.handle??"Q").slice(0,1).toUpperCase()}</div>}</div>
     <h1>{profile.handle??"OPERATÖR"}</h1>
     <div className="qgop-rank">{ranks[profile.role??""]??"ÜYE"}</div>
     <div className="qgop-personmeta"><span>PERSONEL DURUMU <b>AKTİF</b></span><span>TOPLULUK <b>Q-GANG</b></span></div>
     <div className="qgop-scene" aria-hidden="true"><span>Q-GANG</span><small>KARDEŞLİK, DAİMA.</small></div>
    </aside>
    <div className="qgop-main">
     <section className="qgop-exp"><div className="qgop-level"><small>LVL</small><strong>01</strong></div><div className="qgop-expmain"><div className="qgop-exptop"><strong>DENEYİM (EXP)</strong><span>0 EXP</span></div><div className="qgop-progress"><span/></div><p>EXP kazanım motoru etkinleştirildiğinde doğrulanmış faaliyetlerin burada gösterilecek.</p></div></section>
     <div className="qgop-stats"><div><strong>{joined}</strong><small>KATILIM BEYANI</small></div><div><strong>{published??"—"}</strong><small>YAYIN</small></div><div><strong>—</strong><small>DOĞRULANMIŞ ETKİNLİK</small></div><div><strong>—</strong><small>NİŞAN</small></div></div>
     <nav className="qgop-tabs" aria-label="Operatör bölümleri"><a href="#genel" className="active">GENEL BAKIŞ</a><a href="#envanter">ENVANTER</a><a href="#gunluk">FAALİYET GÜNLÜĞÜ</a><a href="#kazanımlar">KAZANIMLAR</a><a href="#ayarlar">AYARLAR</a></nav>
     <div className="qgop-panels" id="genel"><section className="qgop-panel" id="gunluk"><h2>SON KAZANIMLAR</h2><div className="qgop-placeholder"><span>▤</span><strong>Henüz EXP kaydı bulunmuyor</strong><p>Doğrulanmış etkinlikler ve yayınlar EXP sistemine bağlandığında kazanımların burada listelenecek.</p></div></section><section className="qgop-panel" id="kazanımlar"><h2>SIRADAKİ ÖDÜL</h2><div className="qgop-reward"><span className="qgop-frame" aria-hidden="true">◇</span><div><strong>Koyu Metal Çerçeve</strong><small>SEVİYE 3</small><p>Kozmetik ödül sistemi hazırlanıyor.</p></div></div></section></div>
     <section className="qgop-panel qgop-inventory" id="envanter"><h2>KOZMETİK ENVANTER</h2><div className="qgop-cosmetics"><div><span>◉</span><strong>Profil Çerçevesi</strong><small>Standart</small></div><div><span>▧</span><strong>Profil Arka Planı</strong><small>Standart</small></div><div><span>QUAD</span><strong>Kullanıcı Adı Efekti</strong><small>Standart</small></div><div><span>◇</span><strong>Kozmetik Unvan</strong><small>Henüz açılmadı</small></div></div></section>
     <section className="qgop-panel qgop-settings" id="ayarlar"><h2>OPERATÖR AYARLARI</h2><p>Profil bilgilerini ve hesap tercihlerini mevcut hesap yönetimi üzerinden düzenleyebilirsin.</p><Link href="/profil">Hesap ayarlarına git ↗</Link></section>
    </div>
   </div>
  </div>
 </main>;
}