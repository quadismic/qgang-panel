import {RichText} from "@/components/RichText";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function Campfire({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const s = await createClient();
  const { data: fire } = await s.from("campfires").select("id,name,description,cover_url").eq("slug", slug).eq("is_active", true).maybeSingle(); if (!fire) notFound();
  const { data: posts } = await s.from("posts").select("id,body,created_at,profiles!posts_author_id_fkey(display_name,handle)").eq("campfire_id", fire.id).eq("is_removed",false).order("created_at",{ascending:false}).limit(40);
  return <AppShell right={false}><main className="publicationIndex"><section className="publicationHero" style={fire.cover_url ? {backgroundImage:`linear-gradient(90deg,rgba(10,7,5,.88),rgba(10,7,5,.5)),url(${fire.cover_url})`} : undefined}><small>KAMP ATEŞİ</small><h1>{fire.name}</h1><RichText value={fire.description}/></section><section className="publicationEmpty">{(posts??[]).map((post:any)=>{const author=Array.isArray(post.profiles)?post.profiles[0]:post.profiles;return <article key={post.id}><b>{author?.display_name||"Q-GANG"}</b><RichText value={post.body}/></article>})}{!(posts??[]).length&&<p>Bu ateşte henüz gönderi yok.</p>}</section></main></AppShell>;
}
