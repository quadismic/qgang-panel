"use client";
import {RichTextEditor} from "@/components/RichTextEditor";

export function CodexComposer({action,sections}:{action:(formData:FormData)=>void|Promise<void>;sections:{number:string;title:string}[]}){
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
    <section className="codexWriting"><RichTextEditor name="body" required rows={12} placeholder="Hüküm metnini yazın…"/></section>
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