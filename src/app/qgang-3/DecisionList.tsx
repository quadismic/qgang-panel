"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
type Decision={id:string;title:string;body:string;category:string;visibility:string;status:string;decision_year:number|null;decision_number:number|null;published_at:string|null;repeal_reason:string|null};
export function DecisionList({items,manage=false,canPublish=false}: {items:Decision[];manage?:boolean;canPublish?:boolean}){
 const router=useRouter();const [open,setOpen]=useState<string|null>(null);const [busy,setBusy]=useState<string|null>(null);const [error,setError]=useState("");
 async function act(id:string,kind:"publish"|"repeal"){
  const reason=kind==="repeal"?window.prompt("Yürürlükten kaldırma gerekçesi (en az 5 karakter):"):null;
  if(kind==="repeal"&&(!reason||reason.trim().length<5))return;
  setBusy(id);setError("");const s=createClient();
  const {error:e}=await s.rpc(kind==="publish"?"qgang_publish_decision":"qgang_repeal_decision",kind==="publish"?{p_id:id}:{p_id:id,p_reason:reason});
  setBusy(null);if(e){setError("İşlem tamamlanamadı: "+e.message);return;}router.refresh();
 }
 return <div className="qg3-decisionlist">{error&&<p role="alert" className="qg3-joinerror">{error}</p>}{items.length===0&&<p className="qg3-muted">Henüz karar bulunmuyor.</p>}{items.map(d=><article className="qg3-decisionrow" key={d.id}><button type="button" className="qg3-decisiontoggle" aria-expanded={open===d.id} onClick={()=>setOpen(open===d.id?null:d.id)}><span className="qg3-decisionnumber">{d.decision_number?`[${d.decision_year}-${d.decision_number}]`:"[Taslak]"}</span><span className="qg3-decisiontitle">{d.title}</span><span className="qg3-decisioncategory">{d.category}</span><span aria-hidden="true">{open===d.id?"−":"+"}</span></button>{open===d.id&&<div className="qg3-decisionbody"><p>{d.body}</p><small>{d.published_at?new Date(d.published_at).toLocaleDateString("tr-TR"):"Henüz yayımlanmadı"} · {d.visibility==="management"?"Yönetime özel":"Üyelere açık"}{d.status==="repealed"?" · YÜRÜRLÜKTEN KALDIRILDI":""}</small>{d.repeal_reason&&<p className="qg3-decisionrepeal">Kaldırılma gerekçesi: {d.repeal_reason}</p>}{manage&&canPublish&&d.status==="draft"&&<button disabled={busy===d.id} type="button" onClick={()=>act(d.id,"publish")}>Kararı yayımla</button>}{manage&&canPublish&&d.status==="published"&&<button disabled={busy===d.id} type="button" onClick={()=>act(d.id,"repeal")}>Yürürlükten kaldır</button>}</div>}</article>)}</div>;
}
