import {AppShell} from "@/components/AppShell";
import {getAsterSnapshot} from "@/lib/qae";
export const dynamic="force-dynamic";
export const metadata={title:"ASTER · QAE-001"};
export default async function AsterPage(){
 const {entity,memories,proposals,activity}=await getAsterSnapshot();
 return <AppShell right={false}><main className="qaePage">
  <section className="qaeHero">
   <div className="qaeEyebrow">Q-GANG ARTIFICIAL ENTITY · {entity?.code??"QAE-001"}</div>
   <h1>{entity?.name??"ASTER"}</h1><p className="qaeRole">{entity?.function_title??"Institutional Memory / Keeper of Records"}</p>
   <p className="qaePurpose">{entity?.purpose??"Q-GANG'in kurumsal hafızasını korur."}</p>
   <div className="qaeState"><span/> UYKUDA</div>
  </section>
  <section className="qaeGrid">
   <article><header><small>KALICI HAFIZA</small><b>{memories.length}</b></header>{memories.length?memories.map((m:any)=><div className="qaeRecord" key={m.id}><strong>{m.title}</strong><p>{m.body}</p><small>{m.source_type}{m.source_ref?` · ${m.source_ref}`:""}</small></div>):<p className="qaeEmpty">Aster'in onaylanmış hafıza kaydı henüz yok.</p>}</article>
   <article><header><small>HAFIZA ÖNERİLERİ</small><b>{proposals.length}</b></header>{proposals.length?proposals.map((m:any)=><div className="qaeRecord" key={m.id}><strong>{m.title}</strong><small>{m.status.toUpperCase()}</small></div>):<p className="qaeEmpty">Bekleyen hafıza önerisi yok.</p>}</article>
   <article><header><small>FAALİYET</small><b>{activity.length}</b></header>{activity.length?activity.map((a:any)=><div className="qaeRecord" key={a.id}><strong>{a.event_type}</strong><small>{new Date(a.created_at).toLocaleString("tr-TR")}</small></div>):<p className="qaeEmpty">Henüz faaliyet kaydı yok.</p>}</article>
  </section>
 </main></AppShell>
}
