import Link from "next/link";
import type {CSSProperties} from "react";
import {AppShell} from "@/components/AppShell";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign,pageMeta} from "@/lib/design";
import {QGIcon,QGIconName} from "@/components/QGIcon";
import {richPlain} from "@/lib/rich-text";
export const dynamic="force-dynamic";
export const metadata=pageMeta.home;

const kindLabel:Record<string,string>={research:"ARAŞTIRMA",review:"İNCELEME",thought:"DÜŞÜNCE",game:"OYUN",technology:"TEKNOLOJİ",video:"VİDEO"};
const shortDate=(v:string|null)=>v?new Date(v).toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"}):"";
export default async function Headquarters(){
 const s=await createClient();const user=await getCurrentUser();
 const {data:designRow}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();const design=normalizeDesign(designRow?.settings??defaultDesign);
 const [{data:viewerProfile},{data:membership},{data:announcements},{data:publications}]=await Promise.all([
  user?s.from("profiles").select("role").eq("id",user.id).maybeSingle():Promise.resolve({data:null}),
  user?s.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle():Promise.resolve({data:null}),
  s.from("announcements").select("id,title,body,category,priority,is_pinned,published_at").order("is_pinned",{ascending:false}).order("published_at",{ascending:false}).limit(12),
  s.from("publications").select("title,slug,excerpt,cover_url,content_type,published_at,youtube_url,author:profiles!publications_author_id_fkey(display_name,handle)").eq("status","published").order("published_at",{ascending:false}).limit(3)
 ]);
 const manage=!!viewerProfile&&["founder","admin"].includes(viewerProfile.role);
 const priorityRank:Record<string,number>={critical:3,important:2,normal:1};
 const notices=(announcements??[]).sort((a:any,b:any)=>Number(b.is_pinned)-Number(a.is_pinned)||(priorityRank[b.priority]||0)-(priorityRank[a.priority]||0)||new Date(b.published_at||0).getTime()-new Date(a.published_at||0).getTime()).slice(0,3);
 const pubs=(publications??[]).map((p:any)=>{const author=Array.isArray(p.author)?p.author[0]:p.author;return{...p,kind:p.youtube_url?"video":p.content_type,authorName:author?.display_name||author?.handle||"Q-GANG"}});
 const quick=[
  {href:"/kodeks",icon:"rules",title:"KODEKS",text:"İlkeler, kurallar ve normatif yapı."},
  {href:"/topluluk",icon:"community",title:"TOPLULUK",text:"Üyeler, kimlikler ve roller."},
  {href:"/disiplin",icon:"discipline",title:"DİSİPLİN",text:"Kararlar, süreçler ve kayıtlar."},
  ...(manage?[{href:"/yonetim",icon:"control",title:"YÖNETİM",text:"Yapı, yetkiler ve organizasyon."}]:[]),
  ...((membership||manage)?[{href:"/butce",icon:"treasury",title:"BÜTÇE",text:"Hazine kayıtları ve işlemler."}]:[])
 ];
 return <AppShell right={false}><div className="commandHQ homeV2">
  <section className="commandHero commandPoster" style={{"--command-bg":`url(${design.commandBackground})`} as CSSProperties}>
   <div className="commandAtmosphere" aria-hidden="true"/>
   <div className="commandCouncil commandCouncilPoster" aria-hidden="true">{design.council.filter(m=>m.enabled).map((slot,i,all)=>{const left=i%2===0,depth=Math.floor(i/2),side=left?"left":"right";return <img key={slot.id} className={`councilMember councilPortrait ${side} depth-${Math.min(depth,2)} ${slot.id}`} src={slot.src} alt="" style={{"--council-scale":slot.scale/100,"--poster-depth":depth} as CSSProperties}/>})}</div>
   <div className="commandPortrait commandQuadPoster" aria-hidden="true"><img src={design.quadSrc} alt=""/></div>
   <div className="commandTitle commandTitleMinimal">{!user&&<Link href="/login">KİMLİĞİNİ DOĞRULA</Link>}</div>
  </section>

  <section className="homeFeedSection homeNotices"><header className="homeSectionHead"><div><span><QGIcon name="announcements"/></span><div><h2>DUYURULAR</h2><p>Topluluğa ilişkin resmî açıklamalar, kararlar ve önemli gelişmeler.</p></div></div><Link href="/duyurular">TÜM DUYURULAR <QGIcon name="chevron"/></Link></header>
   <div className="homeNoticeList">{notices.length?notices.map((a:any)=><Link href="/duyurular" className={"homeNotice "+(a.is_pinned?"isPinned ":"")+a.priority} key={a.id}><time>{shortDate(a.published_at)}</time><span className="homeNoticeKind">{a.category}</span><div><h3>{a.title}</h3><p>{richPlain(a.body).slice(0,150)||"Ayrıntılar için duyuruyu aç."}</p></div><QGIcon name="chevron"/></Link>):<div className="homeFeedEmpty"><b>Henüz duyuru yok.</b><span>İlk resmî kayıt yayımlandığında burada görünecek.</span></div>}</div>
  </section>

  <section className="homeFeedSection homePublications"><header className="homeSectionHead"><div><span><QGIcon name="document"/></span><div><h2>SON YAYINLAR</h2><p>Araştırmalar, incelemeler, düşünceler, oyun, teknoloji ve daha fazlası.</p></div></div><Link href="/yayinlar">TÜM YAYINLAR <QGIcon name="chevron"/></Link></header>
   <div className="homePubRail">{pubs.length?pubs.map((p:any)=><Link href={"/yayinlar/"+p.slug} className="homePubCard" key={p.slug}><div className="homePubCover">{p.cover_url?<img src={p.cover_url} alt=""/>:<span><QGIcon name="document"/></span>}<b className={"pubBadge pubBadge-"+p.kind}>{kindLabel[p.kind]||"YAYIN"}</b></div><div className="homePubBody"><h3>{p.title}</h3><p>{richPlain(p.excerpt||"").slice(0,165)||"Bu yayın için henüz özet eklenmedi."}</p><footer><span>{p.authorName}</span><time>{shortDate(p.published_at)}</time></footer></div></Link>):<div className="homeFeedEmpty"><b>Arşiv hazırlanıyor.</b><span>İlk yayın yayımlandığında burada görünecek.</span></div>}</div>
  </section>

  <section className="homeQuick"><header className="homeSectionHead"><div><span><QGIcon name="hierarchy"/></span><div><h2>HIZLI ERİŞİM</h2><p>Sistemin ana bölümlerine hızlı erişim.</p></div></div></header><div className="homeQuickGrid">{quick.map(c=><Link href={c.href} className="homeQuickCard" key={c.href}><span><QGIcon name={c.icon as QGIconName}/></span><h3>{c.title}</h3><p>{c.text}</p><b><QGIcon name="chevron"/></b></Link>)}</div></section>
 </div></AppShell>
}