import {announcementType,announcementTypeLabel,announcementLink} from "@/lib/announcements";
import Link from "next/link";
import type {CSSProperties} from "react";
import {AppShell} from "@/components/AppShell";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign,pageMeta} from "@/lib/design";
import {QGIcon} from "@/components/QGIcon";
import {richPlain} from "@/lib/rich-text";
export const dynamic="force-dynamic";
export const metadata=pageMeta.home;

const kindLabel:Record<string,string>={research:"ARAŞTIRMA",review:"İNCELEME",thought:"DÜŞÜNCE",game:"OYUN",technology:"TEKNOLOJİ",video:"VİDEO"};
const shortDate=(v:string|null)=>v?new Date(v).toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"}):"";
export default async function Headquarters(){
 const s=await createClient();const user=await getCurrentUser();
 const {data:designRow}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();const design=normalizeDesign(designRow?.settings??defaultDesign);
 const [{data:viewerProfile},{data:membership},{data:announcements},{data:publications},{data:birthdays}]=await Promise.all([
  user?s.from("profiles").select("role").eq("id",user.id).maybeSingle():Promise.resolve({data:null}),
  user?s.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle():Promise.resolve({data:null}),
  s.from("announcement_feed").select("id,title,body,category,priority,is_pinned,published_at,regulation_id,status,effective_at").order("is_pinned",{ascending:false}).order("published_at",{ascending:false}).limit(12),
  s.from("publications").select("title,slug,excerpt,cover_url,content_type,published_at,youtube_url,author:profiles!publications_author_id_fkey(display_name,handle)").eq("status","published").order("published_at",{ascending:false}).limit(4),user?s.rpc("list_today_community_birthdays"):Promise.resolve({data:[]})
 ]);
 const manage=!!viewerProfile&&["founder","admin"].includes(viewerProfile.role);
 const priorityRank:Record<string,number>={critical:3,important:2,normal:1};
 const notices=(announcements??[]).map(a=>({...a,category:announcementType(a.category)})).sort((a:any,b:any)=>Number(b.is_pinned)-Number(a.is_pinned)||(priorityRank[b.priority]||0)-(priorityRank[a.priority]||0)||new Date(b.published_at||0).getTime()-new Date(a.published_at||0).getTime()).slice(0,3);
 const pubs=(publications??[]).map((p:any)=>{const author=Array.isArray(p.author)?p.author[0]:p.author;return{...p,kind:p.youtube_url?"video":p.content_type,authorName:author?.display_name||author?.handle||"Q-GANG"}});
 return <AppShell right={false}><div className="commandHQ homeV2">
  <section className="commandHero commandPoster" style={{"--command-bg":`url(${design.commandBackground})`} as CSSProperties}>
   <div className="commandAtmosphere" aria-hidden="true"/>
   <div className="commandCouncil commandCouncilPoster" aria-hidden="true">{design.council.filter(m=>m.enabled).map((slot,i,all)=>{const left=i%2===0,depth=Math.floor(i/2),side=left?"left":"right";return <img key={slot.id} className={`councilMember councilPortrait ${side} depth-${Math.min(depth,2)} ${slot.id}`} src={slot.src} alt="" style={{"--council-scale":slot.scale/100,"--poster-depth":depth} as CSSProperties}/>})}</div>
   <div className="commandPortrait commandQuadPoster" aria-hidden="true"><img src={design.quadSrc} alt=""/></div>
   <div className="commandTitle commandTitleMinimal">{!user&&<Link href="/login">KİMLİĞİNİ DOĞRULA</Link>}</div>
  </section>

  {(birthdays??[]).length>0&&<section className="birthdayBanner birthdayBannerHome"><span className="birthdaySigil">✦</span><div><small>BUGÜN TOPLULUKTA</small><h2>{(birthdays??[]).map((b:any)=>b.display_name).join(" · ")}</h2><p>{(birthdays??[]).length===1?"Bugün doğum günü. Nice yıllara!":"Bugün doğum günlerini kutluyoruz. Nice yıllara!"}</p></div></section>}

  <div className="homeEditorialGrid">
   <section className="homeFeedSection homeNotices"><header className="homeSectionHead"><div><span><QGIcon name="announcements"/></span><div><h2>DUYURULAR</h2><p>Topluluğa ilişkin resmî açıklamalar, kararlar ve önemli gelişmeler.</p></div></div><Link href="/duyurular">TÜM DUYURULAR <QGIcon name="chevron"/></Link></header>
    <div className="homeNoticeList">{notices.length?notices.map((a:any)=><Link href={announcementLink(a)} className={"homeNotice "+(a.is_pinned?"isPinned ":"")+a.priority} key={a.id}><div className={"homeNoticeVisual noticeCover noticeCover-"+a.category.toLowerCase()+" noticePriority-"+a.priority}><span><QGIcon name={a.category==="KARAR"?"seal":"announcements"}/></span></div><div className="homeNoticeContent"><span className="homeNoticeKind">{announcementTypeLabel(a.category)}</span><h3>{a.title}</h3><p>{richPlain(a.body).slice(0,115)||"Ayrıntılar için duyuruyu aç."}</p><footer><time>{shortDate(a.published_at)}</time>{a.is_pinned&&<b>SABİT</b>}</footer></div><QGIcon name="chevron"/></Link>):<div className="homeFeedEmpty"><b>Henüz duyuru yok.</b><span>İlk resmî kayıt yayımlandığında burada görünecek.</span></div>}</div>
   </section>

   <section className="homeFeedSection homePublications"><header className="homeSectionHead"><div><span><QGIcon name="document"/></span><div><h2>SON YAYINLAR</h2><p>Araştırmalar, incelemeler, düşünceler, oyun, teknoloji ve daha fazlası.</p></div></div><Link href="/yayinlar">TÜM YAYINLAR <QGIcon name="chevron"/></Link></header>
    <div className="homePubList">{pubs.length?pubs.map((p:any)=><Link href={"/yayinlar/"+p.slug} className="homePubRow" key={p.slug}><div className="homePubThumb">{p.cover_url?<img src={p.cover_url} alt=""/>:<span><QGIcon name="document"/></span>}</div><div className="homePubRowBody"><b className={"pubBadge pubBadge-"+p.kind}>{kindLabel[p.kind]||"YAYIN"}</b><h3>{p.title}</h3><p>{richPlain(p.excerpt||"").slice(0,115)||"Bu yayın için henüz özet eklenmedi."}</p><footer><span>{p.authorName}</span><time>{shortDate(p.published_at)}</time></footer></div><QGIcon name="chevron"/></Link>):<div className="homeFeedEmpty"><b>Arşiv hazırlanıyor.</b><span>İlk yayın yayımlandığında burada görünecek.</span></div>}</div>
   </section>
  </div>
 </div></AppShell>
}