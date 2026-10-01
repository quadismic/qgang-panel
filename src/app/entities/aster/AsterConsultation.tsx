"use client";
import {useEffect,useRef} from "react";
import {useFormStatus} from "react-dom";
import {consult} from "./chat-actions";

function SendButton(){
 const {pending}=useFormStatus();
 useEffect(()=>{if(!pending)return;window.dispatchEvent(new CustomEvent("aster-state",{detail:"awakening"}));const t=setTimeout(()=>window.dispatchEvent(new CustomEvent("aster-state",{detail:"processing"})),650);return()=>clearTimeout(t)},[pending]);
 return <button className="qaeAskButton" disabled={pending}>{pending?"HAFIZADA ARIYOR…":"ASTER'E DANIŞ"}</button>
}
export function AsterConsultation({conversationId,messages}:{conversationId?:string;messages:any[]}){
 const end=useRef<HTMLDivElement>(null);
 useEffect(()=>{end.current?.scrollIntoView({behavior:"smooth",block:"nearest"})},[messages.length]);
 return <section className="qaeConsult">
  <header className="qaeConsultHead"><div><small>QAE-001 · KURUMSAL HAFIZA BAĞLANTISI</small><h2>Aster'e Danış</h2></div><span>{conversationId?"OTURUM AÇIK":"YENİ OTURUM"}</span></header>
  <div className="qaeTranscript" aria-live="polite">
   {!messages.length&&<div className="qaeWelcome"><strong>Kayıtlar hazır.</strong><p>Q-GANG geçmişi, kararları ve onaylanmış kurumsal hafıza hakkında sorun. Aster kayıt bulamazsa bunu açıkça belirtir.</p></div>}
   {messages.map((m:any)=><article key={m.id} className={"qaeMessage "+(m.role==="assistant"?"is-aster":"is-human")}>
    <div className="qaeMessageMeta"><b>{m.role==="assistant"?"ASTER":"SİZ"}</b><time>{new Date(m.created_at).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</time></div>
    <div className="qaeMessageBody">{m.body}</div>
    {m.role==="assistant"&&Array.isArray(m.sources)&&m.sources.length>0&&<details className="qaeSources"><summary>DAYANILAN KAYITLAR · {m.sources.length}</summary>{m.sources.map((s:any)=><div key={s.key}><b>{s.key}</b><span>{s.title}</span><small>{s.sourceType}{s.sourceRef?" · "+s.sourceRef:""}</small></div>)}</details>}
   </article>)}
   <div ref={end}/>
  </div>
  <form action={consult} className="qaeComposer">{conversationId&&<input type="hidden" name="conversation_id" value={conversationId}/>}<textarea name="question" required minLength={2} maxLength={4000} placeholder="Aster'e bir kayıt sorun…" rows={3}/><div className="qaeComposerFoot"><small>Yanıtlar onaylanmış Q-GANG kayıtlarıyla kaynaklandırılır.</small><SendButton/></div></form>
 </section>
}
