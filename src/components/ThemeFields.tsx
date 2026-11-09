"use client";
import {useState} from "react";
import {Input,Select,Textarea,Button} from "@/components/ui/Primitives";
import {accessiblePalette,campaignExpiry,parseThemeImport,themeKeys,themePresets,type ThemePalette,type ThemeSettings} from "@/lib/theme";
const labels={background:"Ana zemin",surface:"Yüzey",raised:"Yükseltilmiş yüzey",text:"Metin",muted:"İkincil metin",line:"Ayırıcı",accent:"Bağlantı ve vurgu",action:"Ana düğme",actionText:"Ana düğme metni"};
const presets={classic:"Q-GANG Klasik",gtaVi:"GTA VI · Vice City gün batımı",winter:"Yılbaşı · Kış gecesi",bayram:"Bayram · Zeytin ve altın"};
export function validThemeDraft(value:ThemeSettings){
 return accessiblePalette(value.palette)&&(!value.campaign||accessiblePalette(value.campaign.palette)&&campaignExpiry(value.campaign.endsOn)!==null);
}
export function ThemeFields({value,onChange}:{value:ThemeSettings;onChange:(v:ThemeSettings)=>void}){
 const [json,setJson]=useState(""),[error,setError]=useState("");
 const change=(v:ThemeSettings)=>{setError("");onChange(v);};
 function fields(palette:ThemePalette,update:(p:ThemePalette)=>void){
  return <div className="qgThemeColors">{themeKeys.map(k=><label key={k}>{labels[k]}<Input type="color" value={palette[k]} onChange={e=>update({...palette,[k]:e.target.value})}/></label>)}</div>;
 }
 const campaign=value.campaign;
 return <details open><summary>Tema renkleri</summary><div className="qgThemeFields">
  <label>Kalıcı tema hazır paleti<Select value="" onChange={e=>{const preset=themePresets[e.target.value as keyof typeof themePresets];if(preset)change({...value,palette:{...preset}});}}><option value="">Palet seç</option>{Object.entries(presets).map(([key,label])=><option key={key} value={key}>{label}</option>)}</Select></label>
  {fields(value.palette,palette=>change({...value,palette}))}
  <label>Geçici tema hazır paleti<Select value="" onChange={e=>{const preset=themePresets[e.target.value as keyof typeof themePresets];if(preset)change({...value,campaign:{palette:{...preset},endsOn:campaign?.endsOn??""}});}}><option value="">Palet seç</option>{Object.entries(presets).map(([key,label])=><option key={key} value={key}>{label}</option>)}</Select></label>
  {campaign&&<><label>Son gün (Türkiye saati)<Input type="date" value={campaign.endsOn} onChange={e=>change({...value,campaign:{...campaign,endsOn:e.target.value}})}/></label><p>Son günün sonunda kalıcı palet kendiliğinden geri gelir.</p>{fields(campaign.palette,palette=>change({...value,campaign:{...campaign,palette}}))}<Button onClick={()=>change({...value,campaign:null})}>Geçici temayı kaldır</Button></>}
  {!validThemeDraft(value)&&<p role="alert">Yayımlamak için bitiş tarihini ve okunabilir renkleri kontrol et.</p>}
  <details><summary>Tema ayarını içe veya dışa aktar</summary><label>Tema JSON’u<Textarea value={json} rows={7} maxLength={8000} onChange={e=>setJson(e.target.value)}/></label><div className="qgThemeActions"><Button onClick={()=>{try{change(parseThemeImport(json));}catch(e){setError(e instanceof SyntaxError?"Tema JSON’u okunamadı.":(e as Error).message);}}}>Önizlemeye al</Button><Button onClick={()=>setJson(JSON.stringify(value,null,2))}>Ayarı göster</Button></div>{error&&<p role="alert">{error}</p>}</details>
 </div></details>;
}
