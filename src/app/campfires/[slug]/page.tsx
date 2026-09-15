import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Fire({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: fire } = await supabase.from("campfires").select("id,slug,name,description").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!fire) notFound();
  const { count } = await supabase.from("campfire_members").select("*", { count: "exact", head: true }).eq("campfire_id", fire.id);
  return <AppShell><section className="fireHero"><span>🔥 CAMPFIRE</span><h1>{fire.name}</h1><p>{fire.description}</p><div><button className="primary">🔥 Ateşe Katıl</button><button>🎮 Birlikte Oyna</button></div></section>
    <div className="sectionTitle"><h2>Ateşin başında</h2><span>{count ?? 0} üye</span></div>
    <div className="empty"><b>Ateş hazır.</b><p>İlk paylaşımı bekliyor.</p></div>
  </AppShell>;
}
