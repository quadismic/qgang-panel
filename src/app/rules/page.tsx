import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {canManage} from "@/lib/roles";
export const dynamic="force-dynamic";

async function addRule(formData:FormData){"use server";
 const s=await createClient(); const {data:{user}}=await s.auth.getUser(); if(!user)redirect("/login");
 const {data:me}=await s.from("profiles").select("role").eq("id",user.id).single(); if(!canManage(me?.role))return;
 const title=String(formData.get("title")||"").trim(); const body=String(formData.get("body")||"").trim(); if(!title)return;
 await s.from("regulations").insert({title,body,number:String(formData.get("number")||"").trim()||null,kind:String(formData.get("kind")||"KURAL"),status:"yururlukte",effective_at:new Date().toISOString(),created_by:user.id});
 revalidatePath("/rules"); revalidatePath("/");
}

export default async function Rules(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser();
 const [{data:rules},{data:me}]=await Promise.all([
  s.from("regulations").select("id,title,body,kind,number,status,published_at,effective_at").order("sort_order").order("published_at",{ascending:false}).limit(50),
  user?s.from("profiles").select("role").eq("id",user.id).single():Promise.resolve({data:null})
 ]);
 const list=rules??[]; const manage=canManage(me?.role);
 return <AppShell right={false}>
  <section className="codexHero"><span>Q-GANG // CODEX</span><h1>Kurallar</h1><p>Topluluğun yürürlükteki düzeni, ilkeleri ve kararları.</p></section>
  <div className="codexGrid">
   <section className="rulesLedger"><div className="ledgerHead"><span>§ KAYIT DEFTERİ</span><b>{list.length} DÜZENLEME</b></div>
    {list.length?list.map((r:any)=><article key={r.id}><span>{r.number||"§"}</span><div><small>{r.kind}</small><h2>{r.title}</h2>{r.body&&<p>{r.body}</p>}<time>{r.effective_at?"Yürürlük · "+new Date(r.effective_at).toLocaleDateString("tr-TR"):"Yürürlük tarihi belirtilmedi"}</time></div><em>{r.status.replaceAll("_"," ")}</em></article>):<div className="rulesEmpty"><span>§</span><h2>Codex henüz boş.</h2><p>İlk Q-GANG düzenlemesi yayımlandığında burada görünecek.</p></div>}
   </section>
   {manage&&<aside className="codexEditor"><span>YÖNETİM // YENİ KAYIT</span><h2>Codex'e düzenleme ekle</h2><form action={addRule}><label>Madde / No<input name="number" placeholder="01 veya §1"/></label><label>Tür<select name="kind" defaultValue="KURAL"><option>KURAL</option><option>YÖNERGE</option><option>KARAR</option><option>İLKE</option></select></label><label>Başlık<input name="title" required placeholder="Düzenleme başlığı"/></label><label>Metin<textarea name="body" rows={8} placeholder="Kural veya karar metni…"/></label><button type="submit">KAYDI YAYIMLA →</button></form></aside>}
  </div>
 </AppShell>
}