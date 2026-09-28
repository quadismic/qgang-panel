import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const labels: Record<string, string> = { research: "Araştırma", review: "İnceleme", thought: "Düşünce", game: "Oyun", technology: "Teknoloji", video: "Video" };
function videoId(url?: string | null) { if (!url) return null; try { const u = new URL(url); return u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v"); } catch { return null; } }
export default async function Publication({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const s = await createClient();
  const { data: p } = await s.from("publications").select("title,excerpt,body,cover_url,content_type,published_at,reading_minutes,youtube_url,author:profiles!publications_author_id_fkey(display_name,handle)").eq("slug", slug).eq("status", "published").maybeSingle();
  if (!p) notFound(); const author = Array.isArray((p as any).author) ? (p as any).author[0] : (p as any).author; const id = videoId((p as any).youtube_url);
  return <AppShell right={false}><article className="publicationArticle">{p.cover_url && <img className="publicationArticleCover" src={p.cover_url} alt="" />}<header><small>{labels[p.content_type] || "Yayın"}</small><h1>{p.title}</h1><p>{p.excerpt}</p><div>{author?.display_name || "Q-GANG"} · {p.reading_minutes} dk · {p.published_at ? new Date(p.published_at).toLocaleDateString("tr-TR") : ""}</div></header>{id && <div className="publicationVideo"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={p.title} allowFullScreen /></div>}<div className="publicationBody">{p.body.split("\n").filter(Boolean).map((paragraph: string, i: number) => <p key={i}>{paragraph}</p>)}</div><Link href="/publications" className="publicationBack">← Yayınlara dön</Link></article></AppShell>;
}
