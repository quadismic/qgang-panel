"use client";
import {Button,Input} from "@/components/ui/Primitives";

import {useRef,useState} from "react";
import {ImageCropper} from "@/components/ImageCropper";
export function PublicationCoverField({defaultUrl=""}:{defaultUrl?:string}){
 const input=useRef<HTMLInputElement>(null); const [crop,setCrop]=useState<File|null>(null),[preview,setPreview]=useState(defaultUrl),[mode,setMode]=useState<"upload"|"url">(defaultUrl?"url":"upload");
 const choose=(f?:File)=>{if(!f)return;if(!["image/png","image/jpeg","image/webp"].includes(f.type)||f.size>20*1024*1024){alert("PNG, JPG veya WebP seç. Kaynak görsel en fazla 20 MB olabilir.");return}setCrop(f)};
 const done=(file:File,url:string)=>{if(input.current){const dt=new DataTransfer();dt.items.add(file);input.current.files=dt.files}setPreview(url);setCrop(null)};
 return <div className="publicationCoverField"><span>Kapak görseli</span><div className="coverMode"><Button level="secondary" type="button" className={mode==="upload"?"active":""} onClick={()=>setMode("upload")}>GÖRSEL YÜKLE</Button><Button level="secondary" type="button" className={mode==="url"?"active":""} onClick={()=>setMode("url")}>URL KULLAN</Button></div>{mode==="upload"?<><div className="publicationCoverPreview">{preview?<img src={preview} alt="Kapak önizlemesi"/>:<b>16:9</b>}<Button level="secondary" type="button" onClick={()=>input.current?.click()}>{preview?"KADRAJI DEĞİŞTİR":"GÖRSEL SEÇ VE KIRP"}</Button></div><Input aria-label="cover file" ref={input} hidden type="file" name="cover_file" accept="image/png,image/jpeg,image/webp" onChange={e=>choose(e.target.files?.[0])}/><input type="hidden" name="cover_url" value={defaultUrl}/></>:<label>Kapak görseli URL<Input name="cover_url" type="url" defaultValue={defaultUrl}/></label>}{crop&&<ImageCropper file={crop} kind="publication" onCancel={()=>setCrop(null)} onDone={done}/>}</div>
}