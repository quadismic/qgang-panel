import {textPreview} from "@/lib/text-preview";
import {lobbyEventData,LobbyEvent} from "@/components/LobbyEvent";
import {announcementLink} from "@/lib/announcements";
import Link from "next/link";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {QGIcon} from "@/components/QGIcon";
import {richPlain} from "@/lib/rich-text";
export const dynamic="force-dynamic";
export const metadata={title:"Ana Sayfa"};
const shortDate=(v:string)=>new Intl.DateTimeFormat("tr-TR",{timeZone:"Europe/Istanbul",day:"numeric",month:"short"}).format(new Date(v));
export default async function Lobby(){
 const s=await createClient();
 const [eventData,announcements]=await Promise.all([
  lobbyEventData(),
  s.from("announcement_feed").select("id,title,body,category,is_pinned,published_at,regulation_id,status,effective_at").order("is_pinned",{ascending:false}).order("published_at",{ascending:false}).limit(4)
 ]);
 const notices=(announcements.data??[]).map(a=>({id:a.id,title:a.title,description:textPreview(richPlain(a.body||""),150),href:announcementLink(a),label:a.category==="KARAR"?"İcra Kararı":"Duyuru",date:a.published_at,pinned:a.is_pinned}));
 return <AppShell right={false}><div className="clanLobby">
  <header className="clanHero">
   <div className="clanHeroCopy"><p className="clanEyebrow">OYUN TOPLULUĞU</p><h1>Q-GANG</h1><h2>Oyun, yoldaşlık ve düzen.</h2><p>Birlikte oynayan, ekip ruhunu paylaşan ve oyun gecelerinde buluşan bağımsız bir oyun topluluğuyuz.</p><Link className="clanPrimaryLink" href="/topluluk">Topluluğu tanı <span aria-hidden="true">→</span></Link></div>
   <div className="clanHeroArt" aria-hidden="true"><div className="clanHeroFlag"><img src="/brand/qg-mark.svg" alt="" width={440} height={440}/></div></div>
  </header>

  <section className="clanEventCard" aria-label="Yaklaşan etkinlik"><LobbyEvent data={eventData}/></section>

  <div className="clanHomeGrid">
   <section className="clanAnnouncements" aria-labelledby="clan-announcements-title">
    <header className="clanSectionHeading"><QGIcon name="announcements"/><h2 id="clan-announcements-title">Duyurular</h2><Link href="/duyurular">Tüm duyurular <span aria-hidden="true">→</span></Link></header>
    {announcements.error?<p className="clanEmpty" role="status">Duyurular şu anda yüklenemedi.</p>:notices.length?<ul>{notices.map(item=><li key={item.id}><Link href={item.href}><span className="clanNoticeIcon"><QGIcon name="document"/></span><span className="clanNoticeCopy"><small>{item.pinned?"Sabit · ":""}{item.label}</small><strong>{item.title}</strong>{item.description&&<span>{item.description}</span>}</span>{item.date&&<time dateTime={item.date}>{shortDate(item.date)}</time>}</Link></li>)}</ul>:<p className="clanEmpty">Henüz duyuru yok.</p>}
   </section>
   <nav className="clanQuickLinks" aria-label="Hızlı erişim"><h2>Hızlı Erişim</h2><Link href="/topluluk"><QGIcon name="people"/><span>Üyeler</span><QGIcon name="chevron"/></Link><Link href="/etkinlikler"><QGIcon name="calendar"/><span>Etkinlikler</span><QGIcon name="chevron"/></Link><Link href="/kodeks"><QGIcon name="rules"/><span>Kodeks</span><QGIcon name="chevron"/></Link></nav>
  </div>
 </div></AppShell>;
}
