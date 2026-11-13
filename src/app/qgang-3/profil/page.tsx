import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import CosmeticSelector from "./CosmeticSelector";
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
 const [{count:published},{data:responses},{data:progress},{count:verifiedCount},{count:badgeCount},{data:ledger},{data:cosmetics},{data:inventory},{data:equipment}]=await Promise.all([
  db.from("publications").select("id",{count:"exact",head:true}).eq("author_id",user.id).eq("status","published"),
  db.from("event_responses").select("event_id,response").eq("user_id",user.id).eq("response","going"),
  db.from("operator_progress").select("total_exp,level,level_start_exp,next_level_exp").eq("user_id",user.id).maybeSingle(),
  db.from("event_attendance").select("id",{count:"exact",head:true}).eq("user_id",user.id).eq("attended",true).not("verified_at","is",null),
  db.from("profile_badges").select("id",{count:"exact",head:true}).eq("user_id",user.id).is("revoked_at",null),
  db.from("operator_exp_ledger").select("id,reason,exp_delta,awarded_at").eq("user_id",user.id).order("awarded_at",{ascending:false}).limit(5),
  db.from("operator_cosmetics").select("id,name,kind,unlock_level").eq("active",true).order("unlock_level",{ascending:true}),
  db.from("operator_inventory").select("cosmetic_id").eq("user_id",user.id),
  db.from("operator_equipment").select("kind,cosmetic_id").eq("user_id",user.id)
 ]);
 const joined=(responses??[]).length;
 const equipped=new Map((equipment??[]).map(item=>[item.kind,item.cosmetic_id]));
 const selected=(kind:string)=>(cosmetics??[]).find(item=>item.id===equipped.get(kind));
 const nextReward=(cosmetics??[]).find(item=>item.unlock_level>level);
 const totalExp=Number(progress?.total_exp??0),level=Number(progress?.level??1),startExp=Number(progress?.level_start_exp??0),nextExp=Number(progress?.next_level_exp??100);
 const percent=Math.min(100,Math.max(0,Math.round((totalExp-startExp)/(nextExp-startExp)*100)));
 return <main className="qg3 qgop">
  <div className="qgop-shell">
   <header className="qgop-top"><Link href="/qgang-3" className="qgop-logo">Q-GANG</Link><span>OPERATÖR DOSYASI</span><Link href="/qgang-3" aria-label="Ana sayfaya dön">← ANA SAYFA</Link></header>
   <div className="qgop-grid">
    <aside className="qgop-person">
     <div className={`qgop-portrait ${selected("frame")?.id?"qgop-custom-frame":""}`}>{profile.avatar_url?<img src={profile.avatar_url} alt="Profil fotoğrafı" referrerPolicy="no-referrer"/>:<div className="qgop-silhouette" aria-hidden="true">{(profile.handle??"Q").slice(0,1).toUpperCase()}</div>}</div>
     <h1 className={selected("name_effect")?"qgop-red-name":""}>{profile.handle??"OPERATÖR"}</h1>{selected("title")?<div className="qgop-cosmetic-title">{selected("title")?.name}</div>:null}
     <div className="qgop-rank">{ranks[profile.role??""]??"ÜYE"}</div>
     <div className="qgop-personmeta"><span>PERSONEL DURUMU <b>AKTİF</b></span><span>TOPLULUK <b>Q-GANG</b></span></div>
     <div className={`qgop-scene ${selected("background")?"qgop-custom-background":""}`} aria-hidden="true"><span>Q-GANG</span><small>KARDEŞLİK, DAİMA.</small></div>
    </aside>
    <div className="qgop-main">
     <section className="qgop-exp"><div className="qgop-level"><small>LVL</small><strong>{String(level).padStart(2,"0")}</strong></div><div className="qgop-expmain"><div className="qgop-exptop"><strong>DENEYİM (EXP)</strong><span>{totalExp.toLocaleString("tr-TR")} / {nextExp.toLocaleString("tr-TR")} EXP</span></div><div className="qgop-progress"><span style={{width:`${percent}%`}}/></div><p>EXP yalnızca doğrulanmış ve ödüllendirilmiş faaliyetlerden kazanılır.</p></div></section>
     <div className="qgop-stats"><div><strong>{joined}</strong><small>KATILIM BEYANI</small></div><div><strong>{published??"—"}</strong><small>YAYIN</small></div><div><strong>{verifiedCount??0}</strong><small>DOĞRULANMIŞ ETKİNLİK</small></div><div><strong>{badgeCount??0}</strong><small>NİŞAN</small></div></div>
     <nav className="qgop-tabs" aria-label="Operatör bölümleri"><a href="#genel" className="active">GENEL BAKIŞ</a><a href="#envanter">ENVANTER</a><a href="#gunluk">FAALİYET GÜNLÜĞÜ</a><a href="#kazanımlar">KAZANIMLAR</a><a href="#ayarlar">AYARLAR</a></nav>
     <div className="qgop-panels" id="genel"><section className="qgop-panel" id="gunluk"><h2>SON KAZANIMLAR</h2>{ledger?.length?<div className="qgop-ledger">{ledger.map(entry=><div key={entry.id}><span>{entry.reason}</span><strong>{entry.exp_delta>0?"+":""}{entry.exp_delta} EXP</strong></div>)}</div>:<div className="qgop-placeholder"><span>▤</span><strong>Henüz EXP kaydı bulunmuyor</strong><p>Doğrulanmış faaliyetlerin ödüllendirilmesiyle kayıtlar burada görünecek.</p></div>}</section><section className="qgop-panel" id="kazanımlar"><h2>SIRADAKİ ÖDÜL</h2><div className="qgop-reward"><span className="qgop-frame" aria-hidden="true">◇</span><div><strong>{nextReward?.name??"Tüm ödüller açıldı"}</strong><small>{nextReward?`SEVİYE ${nextReward.unlock_level}`:"TAMAMLANDI"}</small><p>{nextReward?"Seviye atladıkça kozmetik ödüller otomatik açılır.":"Mevcut katalogdaki tüm ödülleri kazandın."}</p></div></div></section></div>
     <section className="qgop-panel qgop-inventory" id="envanter"><h2>KOZMETİK ENVANTER</h2><CosmeticSelector cosmetics={cosmetics??[]} owned={(inventory??[]).map(item=>item.cosmetic_id)} equipped={equipment??[]}/></section>
     <section className="qgop-panel qgop-settings" id="ayarlar"><h2>OPERATÖR AYARLARI</h2><p>Profil bilgilerini ve hesap tercihlerini mevcut hesap yönetimi üzerinden düzenleyebilirsin.</p><Link href="/profil">Hesap ayarlarına git ↗</Link></section>
    </div>
   </div>
  </div>
 </main>;
}