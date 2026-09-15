import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Campfires() {
  const supabase = await createClient();
  const { data: campfires } = await supabase.from("campfires").select("id,slug,name,description").eq("is_active", true).order("name");
  return <AppShell><div className="pageHead"><div><span className="kicker">PLAY</span><h1>Campfires</h1></div></div>
    <p className="intro">Her ateş bir oyunun etrafında kurulan küçük topluluk.</p>
    <div className="cards">{(campfires ?? []).map(c => <a className="gameCard" href={"/campfires/"+c.slug} key={c.id}><span>🔥</span><h3>{c.name}</h3><p>{c.description}</p><b>Ateşe git →</b></a>)}</div>
  </AppShell>;
}
