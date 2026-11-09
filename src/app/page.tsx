import {textPreview} from "@/lib/text-preview";
import {presentationImage,thumbnail} from "@/lib/presentation-image";
import {getActiveDesign} from "@/lib/design-server";
import {PUBLICATION_BADGE_LABELS,publicationKind} from "@/lib/publication-types";
import {lobbyEventData,LobbyEvent} from "@/components/LobbyEvent";
import {announcementLink} from "@/lib/announcements";
import Link from "next/link";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {QGIcon,type QGIconName} from "@/components/QGIcon";
import {richPlain} from "@/lib/rich-text";
export const dynamic="force-dynamic";
export const metadata={title:"Lobi"};
const shortDate=(v:string)=>new Intl.DateTimeFormat("tr-TR",{timeZone:"Europe/Istanbul",day:"numeric",month:"short"}).format(new Date(v));
type FeedItem={key:string;title:string;description:string;href:string;label:string;icon:QGIconName;image?:string|null;date:string|null;pinned?:boolean};
export default async function Lobby(){
 const s=await createClient();
 const [design,eventData,announcements,publications]=await Promise.all([
  getActiveDesign(),lobbyEventData(),
  s.from("announcement_feed").select("id,title,body,category,is_pinned,published_at,regulation_id,status,effective_at").order("is_pinned",{ascending:false}).order("published_at",{ascending:false}).limit(5),
  s.from("publications").select("title,slug,excerpt,cover_url,content_type,published_at,youtube_url").eq("status","published").order("published_at",{ascending:false}).limit(5)
 ]);
 const notices:FeedItem[]=(announcements.data??[]).map(a=>({key:"notice-"+a.id,title:a.title,description:textPreview(richPlain(a.body||""),110),href:announcementLink(a),label:a.category==="KARAR"?"İcra Kararı":"Duyuru",icon:"announcements",date:a.published_at,pinned:a.is_pinned}));
 const posts:FeedItem[]=(publications.data??[]).map(p=>{const kind=publicationKind(p.content_type,p.youtube_url);return {key:"publication-"+p.slug,title:p.title,description:textPreview(richPlain(p.excerpt||""),110),href:"/yayinlar/"+p.slug,label:PUBLICATION_BADGE_LABELS[kind]||"Yayın",icon:p.youtube_url?"video":"document",image:p.cover_url,date:p.published_at};});
 const feed=[...notices,...posts].sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||(b.date||"").localeCompare(a.date||"")).slice(0,8);
 return <AppShell right={false}><div className="lobbyPage">
  <header className="lobbyHero">
   <div><h1>Q-GANG</h1><p>Oyun topluluğu</p></div>
   <img src={presentationImage(design.quadSrc,480)} alt="" width={480} height={480} fetchPriority="high" decoding="async"/>
  </header>
  <LobbyEvent data={eventData}/>
  <section className="lobbyAbout" aria-labelledby="lobby-about">
   <div><h2 id="lobby-about">Biz kimiz?</h2><p>Q-GANG, birlikte oyun oynamak için bir araya gelen bağımsız ve gönüllü bir oyun topluluğudur.</p></div>
   <div className="lobbyAboutLinks"><details><summary>Nasıl katılırım?</summary><p>Hesabınla giriş yap. Etkinliklere erişimin varsa oyun gecesinde «Katılacağım» seçeneğini kullanabilirsin.</p><Link href="/topluluk">Topluluğu tanı</Link></details><Link href="/kodeks" className="lobbyTextLink">Kodeks <QGIcon name="chevron"/></Link></div>
  </section>
  <section className="lobbyFeed" aria-labelledby="lobby-feed">
   <header><h2 id="lobby-feed">Topluluk Akışı</h2><div><Link className="lobbyTextLink" href="/duyurular">Tüm duyurular</Link><Link className="lobbyTextLink" href="/yayinlar">Tüm yayınlar</Link></div></header>
   {eventData.kind==="event"&&eventData.canPropose&&<Link className="lobbyTextLink lobbyFeedPrompt" href="/etkinlikler?propose=1">Bu hafta ne oynayalım? Oyun gecesi öner <QGIcon name="chevron"/></Link>}
   {(announcements.error||publications.error)&&<p role="status">Akışın bir bölümü şu anda yüklenemedi.</p>}
   {feed.length?<ul>{feed.map(item=><li key={item.key}><Link href={item.href}>
    <span className="lobbyFeedIcon">{item.image?<img src={thumbnail(item.image,128)} alt="" width={44} height={44} loading="lazy" decoding="async"/>:<QGIcon name={item.icon}/>}</span>
    <div><p className="lobbyFeedMeta">{item.pinned&&"Sabit · "}{item.label}</p><h3>{item.title}</h3>{item.description&&<p>{item.description}</p>}</div>
    {item.date&&<time dateTime={item.date}>{shortDate(item.date)}</time>}
   </Link></li>)}</ul>:!announcements.error&&!publications.error&&<p>Henüz akış kaydı yok.</p>}
  </section>
 </div></AppShell>;
}
