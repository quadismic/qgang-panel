import {PublicationComments} from "@/components/PublicationComments";
import {RichText} from "@/components/RichText";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const labels: Record<string, string> = { research: "Araştırma", review: "İnceleme", thought: "Düşünce", game: "Oyun", technology: "Teknoloji", video: "Video" };
function videoId(url?: string | null) { if (!url) return null; try { const u = new URL(url); return u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v"); } catch { return null; } }
export default async function Publication({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{comments_page?:string;commented?:string;comment_error?:string}> }) {
  const [{ slug }, query] = await Promise.all([params,searchParams]); const s = await createClient();
  const { data: p } = await s.from("publications").select("id,author_id,title,excerpt,body,cover_url,content_type,published_at,reading_minutes,youtube_url,author:profiles!publications_author_id_fkey(display_name,handle)").eq("slug", slug).eq("status", "published").maybeSingle();
  if (!p) notFound(); const author = Array.isArray((p as any).author) ? (p as any).author[0] : (p as any).author; const id = videoId((p as any).youtube_url);
  const {data:{user}}=await s.auth.getUser();
  const page=Math.max(1,Math.min(10000,Number.parseInt(query.comments_page||"1",10)||1));
  const feedback=query.comment_error?(query.comment_error==="rate"?"Yeni yorum için 30 saniye bekleyin.":"Yorum işlemi tamamlanamadı. Üyeliğinizi ve yorumunuzu kontrol edin."):query.commented?"Yorum işlemi tamamlandı.":undefined;
  return <AppShell right={false}><article className="publicationArticle">{p.cover_url && <img className="publicationArticleCover" src={p.cover_url} alt="" />}<header><small>{labels[p.content_type] || "Yayın"}</small><h1>{p.title}</h1><RichText value={p.excerpt}/><div>{author?.display_name || "Q-GANG"} · {p.reading_minutes} dk · {p.published_at ? new Date(p.published_at).toLocaleDateString("tr-TR") : ""}</div></header>{id && <div className="publicationVideo"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={p.title} allowFullScreen /></div>}<RichText className="publicationBody" value={p.body}/><PublicationComments publicationId={p.id} slug={slug} authorId={p.author_id} viewerId={user?.id} page={page} feedback={feedback}/><Link href="/publications" className="publicationBack qgAction">Yayınlara dön</Link></article></AppShell>;
}
