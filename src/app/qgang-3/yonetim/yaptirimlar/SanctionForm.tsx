"use client";
import {useState} from "react";
import {recordSanction} from "./actions";
export default function SanctionForm({members}:{members:{id:string;handle:string|null}[]}){
 const [kind,setKind]=useState("warning"),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 return <form className="qg-sanction-form" action={async data=>{if((kind==="expulsion"||kind==="temporary_restriction")&&!window.confirm(kind==="expulsion"?"Üyelik hemen sonlandırılacak. Onaylıyor musunuz?":"Etkinlik katılımı süre boyunca engellenecek. Onaylıyor musunuz?"))return;setBusy(true);const r=await recordSanction(data);setMessage(r.message);setBusy(false);if(r.ok)(document.querySelector(".qg-sanction-form") as HTMLFormElement)?.reset();}}>
 <label>ÜYE<select name="member" required>{members.map(m=><option value={m.id} key={m.id}>{m.handle??"Üye"}</option>)}</select></label>
 <label>YAPTIRIM<select name="kind" value={kind} onChange={e=>setKind(e.target.value)}><option value="warning">Uyarı</option><option value="reprimand">Kınama</option><option value="temporary_restriction">Geçici yararlanamama</option><option value="demotion">Rütbe düşürme</option><option value="removal_from_office">Görevden alma</option><option value="expulsion">Üyelikten çıkarma</option></select></label>
 {kind==="temporary_restriction"&&<label>SÜRE (GÜN)<input name="days" type="number" min="1" max="365" defaultValue="7" required/></label>}
 <label>GEREKÇE<textarea name="reason" required minLength={5} maxLength={1000} rows={3} placeholder="Kısa gerekçe..."/></label>
 <button type="submit" disabled={busy||!members.length}>{busy?"KAYDEDİLİYOR...":"YAPTIRIMI KAYDET"}</button>
 {message&&<p role="status">{message}</p>}
 <small>Üyelikten çıkarma üyeliği sonlandırır. Geçici yaptırım yeni etkinlik katılımlarını engeller. Rütbe değişiklikleri ayrıca yönetilir. Kodeks hükümleri saklıdır.</small>
 </form>;
}
