"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
export function DecisionEditor({deputies=[],isFounder=false}: {deputies?:{id:string;handle:string;delegated:boolean}[];isFounder?:boolean}){
 const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [success,setSuccess]=useState("");
 async function submit(formData:FormData){
  setBusy(true);setError("");setSuccess("");
  const title=String(formData.get("title")??"").trim(),body=String(formData.get("body")??"").trim(),category=String(formData.get("category")??"Diğer"),visibility=String(formData.get("visibility")??"members");
  const s=createClient();const {error:e}=await s.from("qgang_decisions").insert({title,body,category,visibility,status:"draft"});
  setBusy(false);if(e){setError(e.message);return;}setSuccess("Taslak kaydedildi.");router.refresh();
 }
 async function delegation(id:string,enabled:boolean){
  setBusy(true);setError("");const s=createClient();const {error:e}=await s.rpc("qgang_set_decision_delegation",{p_deputy_id:id,p_enabled:enabled});setBusy(false);if(e)setError(e.message);else router.refresh();
 }
 return <div className="qg3-decisioneditor"><h2>Yeni karar taslağı</h2><form action={submit}><label>Başlık<input name="title" minLength={3} maxLength={200} required/></label><label>Etiket<select name="category"><option>Yönetim</option><option>Üyelik</option><option>Etkinlik</option><option>Disiplin</option><option>Diğer</option></select></label><label>Görünürlük<select name="visibility"><option value="members">Tüm üyeler</option><option value="management">Yalnızca yönetim</option></select></label><label>Karar metni<textarea name="body" minLength={5} maxLength={20000} rows={7} required/></label><button type="submit" disabled={busy}>{busy?"Kaydediliyor…":"Taslağı kaydet"}</button></form>{isFounder&&<section className="qg3-delegations"><h3>VEKİLHARÇ yayımlama yetkisi</h3>{deputies.length===0?<p>Aktif VEKİLHARÇ bulunamadı.</p>:deputies.map(d=><div key={d.id}><span>{d.handle}</span><button type="button" disabled={busy} onClick={()=>delegation(d.id,!d.delegated)}>{d.delegated?"Yetkiyi geri al":"Yayımlama yetkisi ver"}</button></div>)}</section>}{error&&<p role="alert" className="qg3-joinerror">{error}</p>}{success&&<p role="status">{success}</p>}</div>;
}
