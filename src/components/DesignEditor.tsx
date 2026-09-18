"use client";
import {useState,useTransition} from "react";
import type {DesignSettings} from "@/lib/design";
import {resetDesign,saveDesign} from "@/app/control/design/actions";
const Range=({label,value,min,max,onChange}:{label:string,value:number,min:number,max:number,onChange:(n:number)=>void})=><label className="designField"><span>{label}<b>{value}</b></span><input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
export function DesignEditor({initial}:{initial:DesignSettings}){
 const [d,setD]=useState(initial),[pending,start]=useTransition(),[saved,setSaved]=useState(false);
 const set=(k:keyof DesignSettings,v:any)=>{setSaved(false);setD(x=>({...x,[k]:v}))};
 const vars:any={"--qg-primary":d.primary,"--qg-bone":d.bone,"--qg-bronze":d.bronze,"--qg-sidebar-width":d.sidebarWidth+"px","--qg-sidebar-emblem":d.sidebarEmblem+"px","--qg-hero-overlay":d.heroOverlay/100,"--qg-quad-scale":d.quadScale/100,"--qg-quad-y":d.quadY,"--qg-login-width":d.loginPanelWidth+"px","--qg-login-emblem":d.loginEmblem+"px","--qg-login-overlay":d.loginOverlay/100};
 return <div className="designCenter" style={vars}>
  <aside className="designControls">
   <div className="designHead"><span>TASARIM MERKEZİ</span><h1>Q-GANG görünümü</h1><p>Güvenli tasarım değişkenlerini buradan yönet.</p></div>
   <details open><summary>Marka & Sidebar</summary>
    <div className="colorRow">{(["primary","bone","bronze"] as const).map(k=><label key={k}>{k==="primary"?"Kırmızı":k==="bone"?"Kemik":"Bronz"}<input type="color" value={d[k]} onChange={e=>set(k,e.target.value)}/></label>)}</div>
    <Range label="Sidebar genişliği" value={d.sidebarWidth} min={160} max={260} onChange={v=>set("sidebarWidth",v)}/>
    <Range label="Arma boyutu" value={d.sidebarEmblem} min={36} max={100} onChange={v=>set("sidebarEmblem",v)}/>
   </details>
   <details open><summary>Karargâh</summary>
    <Range label="Quad ölçeği %" value={d.quadScale} min={65} max={140} onChange={v=>set("quadScale",v)}/>
    <Range label="Quad Y konumu %" value={d.quadY} min={-30} max={30} onChange={v=>set("quadY",v)}/>
    <div className="councilEditor"><span className="designSubhead">KONSEY ÜYELERİ</span>{d.council.map((m,i)=><div className="councilSlot" key={m.id}><label className="councilToggle"><input type="checkbox" checked={m.enabled} onChange={e=>set("council",d.council.map((x,j)=>j===i?{...x,enabled:e.target.checked}:x))}/><b>{m.id.replace("-"," ").toUpperCase()}</b><em>{m.enabled?"Aktif":"Gizli"}</em></label>{m.enabled&&<><Range label="Ölçek %" value={m.scale} min={60} max={150} onChange={v=>set("council",d.council.map((x,j)=>j===i?{...x,scale:v}:x))}/><Range label="Y konumu %" value={m.y} min={-30} max={30} onChange={v=>set("council",d.council.map((x,j)=>j===i?{...x,y:v}:x))}/></>}</div>)}</div>
    <Range label="Karartma" value={d.heroOverlay} min={0} max={80} onChange={v=>set("heroOverlay",v)}/>
   </details>
   <details><summary>Login</summary>
    <Range label="Panel genişliği" value={d.loginPanelWidth} min={360} max={720} onChange={v=>set("loginPanelWidth",v)}/>
    <Range label="Arma boyutu" value={d.loginEmblem} min={48} max={160} onChange={v=>set("loginEmblem",v)}/>
    <Range label="Karartma" value={d.loginOverlay} min={0} max={80} onChange={v=>set("loginOverlay",v)}/>
   </details>
   <details><summary>Metin</summary>
    <label className="designText">Motto<input value={d.motto} onChange={e=>set("motto",e.target.value)}/></label>
    <label className="designText">Sağ şerit<textarea rows={3} value={d.systemLine} onChange={e=>set("systemLine",e.target.value)}/></label>
   </details>
   <div className="designActions"><button onClick={()=>start(async()=>{setD(await resetDesign());setSaved(false)})}>Varsayılana dön</button><button className="primary" disabled={pending} onClick={()=>start(async()=>{setD(await saveDesign(d));setSaved(true)})}>{pending?"Kaydediliyor…":saved?"Kaydedildi ✓":"Yayınla"}</button></div>
  </aside>
  <section className="designPreview"><header><span>CANLI ÖNİZLEME</span><a href="/" target="_blank">Tam sayfada aç ↗</a></header><div className="previewStage">
    <div className="previewRail"><div className="previewEmblem">Q</div><strong>Q-GANG</strong><i/><span>⌂ &nbsp; Karargâh</span><span>§ &nbsp; Kurallar</span><span>♙ &nbsp; Topluluk</span></div>
    <div className="previewHero"><div className="previewQuad">QUAD</div><button>KİMLİĞİNİ DOĞRULA</button></div>
   </div><p>Slider ve renk değişiklikleri bu önizlemede anında görünür. “Yayınla” gerçek siteye uygular.</p>
  </section>
 </div>
}
