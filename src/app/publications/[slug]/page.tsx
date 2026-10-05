import {cache,Suspense} from "react";
import {PublicationComments} from "@/components/PublicationComments";
import {RichText} from "@/components/RichText";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import type {Metadata} from "next";
import {richPlain} from "@/lib/rich-text";
import {previousPublicationSlug} from "@/lib/publication-slug-aliases";

export const dynamic = "force-dynamic";
const getPublishedPublication=cache(async(slug:string)=>{
  const s=await createClient();
  const {data,error}=await s.from("publications").select("id,author_id,title,excerpt,body,cover_url,content_type,published_at,reading_minutes,youtube_url").in("slug",[slug,previousPublicationSlug(slug)].filter((v):v is string=>Boolean(v))).eq("status","published").maybeSingle();
  if(error)throw error;
  return data;
});
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const p=await getPublishedPublication(slug);
  if(!p)return {title:"Yayın bulunamadı",robots:{index:false,follow:false}};
  const url=`https://q-gang.com/yayinlar/${encodeURIComponent(slug)}`;
  const description=richPlain(p.excerpt||"").replace(/\s+/g," ").trim().slice(0,200);
  const image=new URL(p.cover_url||"/brand/qgang-mark.png","https://q-gang.com").href;
  return {title:p.title,description,alternates:{canonical:url},openGraph:{type:"article",locale:"tr_TR",siteName:"Q-GANG",url,title:p.title,description,images:[{url:image,alt:p.title}],...(p.published_at?{publishedTime:p.published_at}:{})},twitter:{card:"summary_large_image",title:p.title,description,images:[image]}};
}
const labels: Record<string, string> = { research: "Araştırma", review: "İnceleme", thought: "Düşünce", game: "Oyun", technology: "Teknoloji", video: "Video" };
function videoId(url?: string | null) { if (!url) return null; try { const u = new URL(url); return u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v"); } catch { return null; } }
export default async function Publication({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{comments_page?:string;commented?:string;comment_error?:string}> }) {
  const [{ slug }, query] = await Promise.all([params,searchParams]); const s = await createClient();
  const p=await getPublishedPublication(slug);
  if (!p) notFound(); const id = videoId(p.youtube_url);
  const {data:{user}}=await s.auth.getUser();
  // Public publication metadata must not depend on member-only profile access.
  const author=user?(await s.from("profiles").select("display_name,handle").eq("id",p.author_id).maybeSingle()).data:null;
  const page=Math.max(1,Math.min(10000,Number.parseInt(query.comments_page||"1",10)||1));
  const feedback=query.comment_error?(query.comment_error==="rate"?"Yeni yorum için 30 saniye bekleyin.":"Yorum işlemi tamamlanamadı. Üyeliğinizi ve yorumunuzu kontrol edin."):query.commented?"Yorum işlemi tamamlandı.":undefined;
  return <AppShell right={false}><article className="publicationArticle">{p.cover_url && <img className="publicationArticleCover" src={p.cover_url} alt="" />}<header><small>{labels[p.content_type] || "Yayın"}</small><h1>{p.title}</h1><RichText value={p.excerpt}/><div>{author?.display_name || "Q-GANG"} · {p.reading_minutes} dk · {p.published_at ? new Date(p.published_at).toLocaleDateString("tr-TR") : ""}</div></header>{id && <div className="publicationVideo"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={p.title} allowFullScreen /></div>}<RichText className="publicationBody" value={p.body}/><Suspense fallback={<p className="muted" role="status">Yorumlar yükleniyor…</p>}><PublicationComments publicationId={p.id} slug={slug} authorId={p.author_id} viewerId={user?.id} page={page} feedback={feedback}/></Suspense><Link href="/yayinlar" className="publicationBack qgAction">Yayınlara dön</Link></article></AppShell>;
}
