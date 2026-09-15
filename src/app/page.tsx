import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: campfires } = await supabase.from("campfires").select("id,slug,name,description").eq("is_active", true).order("name").limit(3);
  return <AppShell>
    <div className="pageHead"><div><span className="kicker">Q-GANG</span><h1>Home</h1></div><a className="button primary" href="/create">Paylaş</a></div>
    <section className="composer"><div className="avatar">Q</div><a href="/create">Ateşe ne bırakmak istersin?</a></section>
    <div className="empty"><b>Q-GANG canlı veritabanına bağlı.</b><p>İlk paylaşımlar üyelik sistemi aktive edildiğinde burada akacak.</p></div>
    <div className="cards">{(campfires ?? []).map(c => <a className="gameCard" href={"/campfires/"+c.slug} key={c.id}><span>🔥</span><h3>{c.name}</h3><p>{c.description}</p></a>)}</div>
  </AppShell>;
}
