"use client";
import {Select} from "@/components/ui/Primitives";

import {useState} from "react";
import {RichText} from "@/components/RichText";
import {type CodexRule,isEffective} from "@/lib/codex";
export function DisciplineBasisPicker({rules}:{rules:CodexRule[]}){
 const [id,setId]=useState("");
 const options=rules.filter(r=>isEffective(r)&&(r.kind==="KURAL"||(r.kind==="YÖNERGE"&&rules.some(p=>p.id===r.basis_rule_id&&isEffective(p)&&p.revision===r.basis_revision))));
 const selected=options.find(r=>r.id===id);
 return <div className="disciplineBasisPicker"><label>DAYANAK KURAL / YÖNERGE<Select name="regulation_id" required value={id} onChange={e=>setId(e.target.value)}><option value="" disabled>Yürürlükte bir hüküm seç</option>{options.map(r=><option value={r.id} key={r.id}>{r.kind} § {r.number} — {r.title}</option>)}</Select></label>{selected&&<details open><summary>Seçilen hüküm · sürüm {selected.revision}</summary><RichText value={selected.body||""}/><a href={`/kodeks?rule=${selected.id}`} className="qgAction">Kodeks'te incele</a></details>}{!options.length&&<p>Seçilebilir yürürlükte hüküm bulunmuyor.</p>}</div>;
}
