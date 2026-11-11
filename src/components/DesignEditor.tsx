"use client";
import {ThemeFields,validThemeDraft} from "@/components/ThemeFields";
import {Input} from "@/components/ui/Primitives";

import {useEffect,useRef,useState,useTransition} from "react";
import type {DesignSettings} from "@/lib/design";
import {resetDesign,restoreDesign,saveDesign} from "@/app/control/design/actions";
import {createClient} from "@/lib/supabase/client";
const targets=[["homeHeroImage","Lobi üst görseli"],["favicon","Site simgesi"]] as const;
export function DesignEditor({initial,history}:{initial:DesignSettings,history:{id:number,created_at:string}[]}){
 const [d,setD]=useState(initial),[pending,start]=useTransition(),[saved,setSaved]=useState(false),[uploading,setUploading]=useState(""),frame=useRef<HTMLIFrameElement>(null);
 const set=(k:keyof DesignSettings,v:any)=>{setSaved(false);setD(x=>({...x,[k]:v}))};
 useEffect(()=>{frame.current?.contentWindow?.postMessage({type:"qgang-design-preview",design:d},location.origin)},[d]);
 const upload=async(k:keyof DesignSettings,file?:File)=>{if(!file)return;if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>10*1024*1024){alert("PNG, JPG veya WebP; en fazla 10 MB.");return}setUploading(String(k));const s=createClient(),ext=file.name.split(".").pop()?.toLowerCase()||"webp",name=`${String(k)}/${Date.now()}-${crypto.randomUUID()}.${ext}`;const {error}=await s.storage.from("qgang-design").upload(name,file,{cacheControl:"3600"});if(error){alert(error.message);setUploading("");return}const {data}=s.storage.from("qgang-design").getPublicUrl(name);set(k,data.publicUrl);setUploading("")};
 return <div className="designCenter">
  <aside className="designControls">
   <div className="designHead"><span>TASARIM MERKEZİ</span><h1>Görünüm</h1><p>Yeni Q-GANG yapısının renklerini ve gerçekten kullanılan marka görsellerini yönet.</p></div>
   <ThemeFields value={d.theme} onChange={v=>set("theme",v)}/>
   <details open><summary>Lobi ve marka görselleri</summary><p className="designAssetIntro">Lobi görseli ana sayfanın üst alanında kullanılır. Eski karargâh, konsey portresi ve sayfa bazlı arka plan ayarları kaldırıldı.</p><div className="assetGrid">{targets.map(([k,label])=><div className="assetRow" key={k}><div><b>{label}</b><small>{String(d[k]).split("/").pop()}</small></div><label className="assetUpload"><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(k,e.target.files?.[0])}/>{uploading===k?"Yükleniyor…":"Görsel yükle"}</label></div>)}</div></details>
   <details><summary>Geçmiş & Geri Al</summary><div className="designHistory">{history.length?history.map(h=><button key={h.id} onClick={()=>start(async()=>setD(await restoreDesign(h.id)))}><b>{new Date(h.created_at).toLocaleString("tr-TR")}</b><span>Bu sürüme dön ↶</span></button>):<p>Henüz önceki yayın yok.</p>}</div></details>
   <div className="designActions"><button onClick={()=>start(async()=>{setD(await resetDesign());setSaved(false)})}>Varsayılana dön</button><button className="primary" disabled={pending||!!uploading||!validThemeDraft(d.theme)} onClick={()=>start(async()=>{setD(await saveDesign(d));setSaved(true)})}>{pending?"Kaydediliyor…":saved?"Yayınlandı ✓":"Yayınla"}</button></div>
  </aside>
  <section className="designPreview"><header><span>GERÇEK SAYFA · CANLI ÖNİZLEME</span><a href="/" target="_blank" className="qgAction">Yeni sekmede aç</a></header><iframe ref={frame} src="/?designPreview=1" title="Q-GANG canlı tasarım önizlemesi" onLoad={()=>frame.current?.contentWindow?.postMessage({type:"qgang-design-preview",design:d},location.origin)}/><p>Değişiklikler yalnızca bu önizlemede görünür. “Yayınla” gerçek siteye uygular.</p></section>
 </div>
}
