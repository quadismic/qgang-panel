
import {Input,Textarea,Button} from "@/components/ui/Primitives";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {currentQaeManager,getAsterSnapshot,getAsterConversation} from "@/lib/qae";
import {awakenAster} from "./actions";
import {AsterPresence,AsterSubmit} from "./AsterPresence";
import {AsterConsultation} from "./AsterConsultation";
export const dynamic="force-dynamic";
export const metadata={title:"Aster"};

async function propose(formData:FormData){"use server";if(!await currentQaeManager())redirect("/entities/aster?error=auth");const s=await createClient();const title=String(formData.get("title")||"").trim(),body=String(formData.get("body")||"").trim(),sourceType=String(formData.get("source_type")||"manual").trim(),sourceRef=String(formData.get("source_ref")||"").trim();if(title.length<2||body.length<2)redirect("/entities/aster?error=validation");const {error}=await s.rpc("qae_create_memory_proposal",{p_entity_code:"QAE-001",p_title:title,p_body:body,p_source_type:sourceType,p_source_ref:sourceRef||null});if(error)redirect("/entities/aster?error=save");revalidatePath("/entities/aster");redirect("/entities/aster?ok=proposed")}
async function review(formData:FormData){"use server";if(!await currentQaeManager())redirect("/entities/aster?error=auth");const s=await createClient();const id=String(formData.get("id")||""),decision=String(formData.get("decision")||"");if(!id||!["approved","rejected"].includes(decision))redirect("/entities/aster?error=validation");const {error}=await s.rpc("qae_review_memory_proposal",{p_proposal_id:id,p_decision:decision});if(error)redirect("/entities/aster?error=review");revalidatePath("/entities/aster");redirect("/entities/aster?ok=reviewed")}

export default async function AsterPage({searchParams}:{searchParams:Promise<{error?:string;ok?:string;conversation?:string}>}){
 const q=await searchParams;const [{entity,memories,proposals,activity,tasks},manager,chat]=await Promise.all([getAsterSnapshot(),currentQaeManager(),getAsterConversation(q.conversation)]);
 return <AppShell right={false}><main className="qaePage">
  <section className="qaeHero"><AsterPresence responding={q.ok==="awakened"||q.ok==="responded"}/><div className="qaeHeroCopy"><div className="qaeEyebrow">Q-GANG ARTIFICIAL ENTITY · {entity?.code??"QAE-001"}</div><h1>{entity?.name??"ASTER"}</h1><p className="qaeRole">{entity?.function_title??"Institutional Memory / Keeper of Records"}</p><p className="qaePurpose">{entity?.purpose??"Q-GANG'in kurumsal hafızasını korur."}</p></div></section>
  {q.error&&<p className="notice" role="alert">Aster işlemi tamamlanamadı. Yetkiyi ve alanları kontrol edin.</p>}
  <AsterConsultation conversationId={chat.conversation?.id} messages={chat.messages}/>
  {manager&&<section className="qaeConsole"><header><small>QAE-001 · YÖNETİCİ TETİKLEMESİ</small><h2>Aster'i uyandır</h2></header><form action={awakenAster}><Input aria-label="Başlık" name="title" required minLength={2} placeholder="Hafıza başlığı"/><Textarea aria-label="İçerik" name="body" required minLength={2} placeholder="Aster'in korumasını istediğiniz olay, karar veya bağlam"/><div><Input aria-label="Kaynak türü" name="source_type" defaultValue="manual" placeholder="Kaynak türü"/><Input aria-label="Kaynak referansı" name="source_ref" placeholder="Kaynak referansı (opsiyonel)"/></div><AsterSubmit/></form></section>}
  <section className="qaeTasks"><header><small>SON GÖREVLER</small><b>{tasks.length}</b></header>{tasks.length?tasks.map((t:any)=><div className="qaeTask" key={t.id}><strong>{t.title}</strong><span>{String(t.status).toUpperCase()}</span><small>{t.provider&&t.model?t.provider+" · "+t.model:t.error_message||"QAE Core"}</small></div>):<p className="qaeEmpty">Aster henüz uyandırılmadı.</p>}</section>
  <section className="qaeGrid">
   <article><header><small>KALICI HAFIZA</small><b>{memories.length}</b></header>{memories.length?memories.map((m:any)=><div className="qaeRecord" key={m.id}><strong>{m.title}</strong><p>{m.body}</p><small>{m.source_type}{m.source_ref?` · ${m.source_ref}`:""}</small></div>):<p className="qaeEmpty">Aster'in onaylanmış hafıza kaydı henüz yok.</p>}</article>
   <article><header><small>HAFIZA ÖNERİLERİ</small><b>{proposals.length}</b></header>{proposals.length?proposals.map((m:any)=><div className="qaeRecord" key={m.id}><strong>{m.title}</strong><small>{m.status.toUpperCase()}</small>{manager&&m.status==="pending"&&<form className="qaeReview" action={review}><input type="hidden" name="id" value={m.id}/><Button type="submit" level="secondary" name="decision" value="approved">ONAYLA</Button><Button type="submit" level="secondary" name="decision" value="rejected">REDDET</Button></form>}</div>):<p className="qaeEmpty">Bekleyen hafıza önerisi yok.</p>}</article>
   <article><header><small>FAALİYET</small><b>{activity.length}</b></header>{activity.length?activity.map((a:any)=><div className="qaeRecord" key={a.id}><strong>{a.event_type}</strong><small>{new Date(a.created_at).toLocaleString("tr-TR")}</small></div>):<p className="qaeEmpty">Henüz faaliyet kaydı yok.</p>}</article>
  </section>
 </main></AppShell>
}