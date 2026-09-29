import {richPlain} from "@/lib/rich-text";
import Link from "next/link";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export const metadata={title:"Yayınlar"};

const typeLabel:Record<string,string>={research:"Araştırma",review:"İnceleme",thought:"Düşünce",game:"Oyun",technology:"Teknoloji",video:"Video"};
export default async function Publications(){
 const s=await createClient();
 const [{data:publications},{data:announcements}]=await Promise.all([
  s.from("publications").select("title,slug,excerpt,cover_url,content_type,published_at,reading_minutes,youtube_url,author:profiles!publications_author_id_fkey(display_name,handle)").eq("status","published").order("published_at",{ascending:false}).limit(48),
  s.from("announcements").select("id,title,body,category,priority,is_pinned,published_at").order("published_at",{ascending:false}).limit(48)
 ]);
 const entries=[
  ...(publications??[]).map((x:any)=>({...x,_source:"publication",_date:x.published_at})),
  ...(announcements??[]).map((x:any)=>({...x,_source:"announcement",_date:x.published_at}))
 ].sort((a:any,b:any)=>new Date(b._date||0).getTime()-new Date(a._date||0).getTime());
 return <AppShell right={false}><main className="publicationIndex"><section className="publicationHero"><small>Q-GANG · YAYIN ARŞİVİ</small><h1>Yayınlar</h1><p>Duyurular, kararlar, araştırmalar, incelemeler, düşünceler ve videolar tek bir kayıt altında.</p></section><section className="publicationGrid">{entries.map((entry:any)=>{if(entry._source==="announcement")return <article key={`a-${entry.id}`} className="publicationCard publicationCardNotice"><span className="publicationCover"><span>{entry.category==="KARAR"?"§":"!"}</span></span><div><small>{entry.category||"DUYURU"}{entry.priority&&entry.priority!=="normal"?` · ${String(entry.priority).toUpperCase()}`:""}{entry.is_pinned?" · SABİT":""}</small><h2>{entry.title}</h2><p>{richPlain(entry.body||"")||"Q-GANG resmî yayını."}</p><footer><span>Q-GANG</span><span>{entry.published_at?new Date(entry.published_at).toLocaleDateString("tr-TR"):""}</span></footer></div></article>;const author=Array.isArray(entry.author)?entry.author[0]:entry.author;return <Link href={`/publications/${entry.slug}`} key={`p-${entry.slug}`} className="publicationCard">{entry.cover_url?<img src={entry.cover_url} alt=""/>:<span className="publicationCover">Q</span>}<div><small>{typeLabel[entry.content_type]||"Yayın"}{entry.youtube_url?" · VİDEO":""}</small><h2>{entry.title}</h2><p>{richPlain(entry.excerpt||"")||"Bu yayın için henüz özet eklenmedi."}</p><footer><span>{author?.display_name||"Q-GANG"}</span><span>{entry.reading_minutes} dk · {entry.published_at?new Date(entry.published_at).toLocaleDateString("tr-TR"):""}</span></footer></div></Link>})}{!entries.length&&<section className="publicationEmpty"><h2>Arşiv hazırlanıyor.</h2><p>İlk yayın yayımlandığında burada görünecek.</p></section>}</section></main></AppShell>
}