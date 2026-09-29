import {normalizeRich,richPlain,validRich} from "@/lib/rich-text";
import {RichTextEditor} from "@/components/RichTextEditor";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {getCurrentUser} from "@/lib/supabase/server";
import {hasPermission} from "@/lib/access";
import Link from "next/link";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export const metadata={title:"Yayınlar"};

const typeLabel:Record<string,string>={research:"Araştırma",review:"İnceleme",thought:"Düşünce",game:"Oyun",technology:"Teknoloji",video:"Video"};
async function publishNotice(formData:FormData){"use server";const s=await createClient();const user=await getCurrentUser();if(!user)redirect("/login?next=/publications");if(!await hasPermission(user.id,"announcements.publish"))redirect("/publications");const title=String(formData.get("title")||"").trim(),body=normalizeRich(String(formData.get("body")||"")),category=String(formData.get("category")||"DUYURU").toUpperCase();if(!title||!validRich(body,50000,1)||!["DUYURU","KARAR"].includes(category))redirect("/publications?error=validation");const priority=category==="DUYURU"?String(formData.get("priority")||"normal"):"normal";const {error}=await s.from("announcements").insert({title,body,category,priority:["normal","important","critical"].includes(priority)?priority:"normal",is_pinned:formData.get("pinned")==="on",created_by:user.id});if(error)redirect("/publications?error=save");revalidatePath("/publications");revalidatePath("/")}

export default async function Publications(){
 const s=await createClient();const user=await getCurrentUser();
 const [{data:publications},{data:announcements},canPublishNotice]=await Promise.all([
  s.from("publications").select("title,slug,excerpt,cover_url,content_type,published_at,reading_minutes,youtube_url,author:profiles!publications_author_id_fkey(display_name,handle)").eq("status","published").order("published_at",{ascending:false}).limit(48),
  s.from("announcements").select("id,title,body,category,priority,is_pinned,published_at").order("published_at",{ascending:false}).limit(48),
  hasPermission(user?.id,"announcements.publish")
 ]);
 const entries=[
  ...(publications??[]).map((x:any)=>({...x,_source:"publication",_date:x.published_at})),
  ...(announcements??[]).map((x:any)=>({...x,_source:"announcement",_date:x.published_at}))
 ].sort((a:any,b:any)=>new Date(b._date||0).getTime()-new Date(a._date||0).getTime());
 return <AppShell right={false}><main className="publicationIndex"><section className="publicationHero"><small>Q-GANG · YAYIN ARŞİVİ</small><h1>Yayınlar</h1><p>Duyurular, kararlar, araştırmalar, incelemeler, düşünceler ve videolar tek bir kayıt altında.</p></section><section className="publicationGrid">{entries.map((entry:any)=>{if(entry._source==="announcement")return <article key={`a-${entry.id}`} className="publicationCard publicationCardNotice"><span className="publicationCover"><span>{entry.category==="KARAR"?"§":"!"}</span></span><div><small>{entry.category||"DUYURU"}{entry.priority&&entry.priority!=="normal"?` · ${String(entry.priority).toUpperCase()}`:""}{entry.is_pinned?" · SABİT":""}</small><h2>{entry.title}</h2><p>{richPlain(entry.body||"")||"Q-GANG resmî yayını."}</p><footer><span>Q-GANG</span><span>{entry.published_at?new Date(entry.published_at).toLocaleDateString("tr-TR"):""}</span></footer></div></article>;const author=Array.isArray(entry.author)?entry.author[0]:entry.author;return <Link href={`/publications/${entry.slug}`} key={`p-${entry.slug}`} className="publicationCard">{entry.cover_url?<img src={entry.cover_url} alt=""/>:<span className="publicationCover">Q</span>}<div><small>{typeLabel[entry.content_type]||"Yayın"}{entry.youtube_url?" · VİDEO":""}</small><h2>{entry.title}</h2><p>{richPlain(entry.excerpt||"")||"Bu yayın için henüz özet eklenmedi."}</p><footer><span>{author?.display_name||"Q-GANG"}</span><span>{entry.reading_minutes} dk · {entry.published_at?new Date(entry.published_at).toLocaleDateString("tr-TR"):""}</span></footer></div></Link>})}{!entries.length&&<section className="publicationEmpty"><h2>Arşiv hazırlanıyor.</h2><p>İlk yayın yayımlandığında burada görünecek.</p></section>}</section>{canPublishNotice&&<section className="publicationNoticeComposer"><small>RESMÎ YAYIN</small><h2>Duyuru / Karar yayımla</h2><form action={publishNotice}><label>Tür<select name="category"><option>DUYURU</option><option>KARAR</option></select></label><label>Önem<select name="priority"><option value="normal">Normal</option><option value="important">Önemli</option><option value="critical">Kritik</option></select></label><label>Başlık<input name="title" required/></label><div className="qgEditorField"><span>Metin</span><RichTextEditor name="body" required rows={8}/></div><label><input type="checkbox" name="pinned"/> Sabitle</label><button>YAYIMLA →</button></form></section>}</main></AppShell>
}