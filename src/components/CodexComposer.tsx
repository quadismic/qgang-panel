"use client";
import {useRef,useState} from "react";

const tools:ReadonlyArray<readonly [string,string,string?]>=[
  ["B","bold"],["I","italic"],["U","underline"],["H2","formatBlock","h2"],
  ["•","insertUnorderedList"],["1.","insertOrderedList"],["↗","createLink"],["↶","undo"],["↷","redo"]
] as const;

export function CodexComposer({action,sections}:{action:(formData:FormData)=>void|Promise<void>;sections:{number:string;title:string}[]}){
 const editor=useRef<HTMLDivElement>(null); const [body,setBody]=useState("");
 function command(cmd:string,value?:string){
   editor.current?.focus();
   if(cmd==="createLink"){const url=window.prompt("Bağlantı adresi");if(!url)return;document.execCommand(cmd,false,url);return;}
   document.execCommand(cmd,false,value); setBody(editor.current?.innerHTML||"");
 }
 return <details className="codexComposer">
  <summary>＋ YENİ HÜKÜM YAYIMLA</summary>
  <form action={action} className="codexComposerForm">
   <div className="codexComposerMeta">
    <label><span>BÖLÜM</span><select name="section_number" required>{sections.map(s=><option key={s.number} value={s.number}>§ {s.number} — {s.title}</option>)}</select></label>
    <label><span>HÜKÜM NO</span><input name="number" required placeholder="01.01"/></label>
    <label><span>TÜR</span><select name="kind"><option>KURAL</option><option>YÖNERGE</option><option>KARAR</option><option>İLKE</option></select></label>
    <label className="codexTitleField"><span>BAŞLIK</span><input name="title" required placeholder="Hüküm başlığı"/></label>
   </div>
   <div className="codexComposerGrid">
    <section className="codexWriting">
     <div className="codexEditorToolbar" aria-label="Yazım araçları">{tools.map((t,i)=><button type="button" key={i} onClick={()=>command(t[1],t[2])} title={t[1]}>{t[0]}</button>)}</div>
     <div ref={editor} className="codexRichEditor" contentEditable suppressContentEditableWarning onInput={e=>setBody(e.currentTarget.innerHTML)} data-placeholder="Hüküm metnini yazın…"/>
     <input type="hidden" name="body" value={body}/>
     <small>{editor.current?.innerText.length||0} karakter · Taslak metin mühürlenmeden yürürlüğe girmez.</small>
    </section>
    <aside className="codexSealPanel">
     <header><b>YAYIM / MÜHÜRLEME</b><span>Son işlem</span></header>
     <label><span>YÜRÜRLÜK</span><select name="effective_mode" defaultValue="now"><option value="now">Derhal</option><option value="scheduled">İleri tarih</option></select></label>
     <label><span>İLERİ YÜRÜRLÜK TARİHİ</span><input type="datetime-local" name="effective_at"/></label>
     <label><span>DEĞİŞİKLİK / YAYIM GEREKÇESİ</span><textarea name="reason" rows={4} placeholder="İlk yayım veya değişiklik gerekçesi…"/></label>
     <div className="codexSealNotice">Mühürleme, hükmün resmî Codex kaydını oluşturur. Önceki sürümler değiştirilemez biçimde saklanır.</div>
     <button className="codexSealButton">CODEX'E MÜHÜRLE →</button>
    </aside>
   </div>
  </form>
 </details>
}