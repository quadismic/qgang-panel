"use client";
import {useState} from "react";
import {recordSanction} from "./actions";
export default function SanctionForm({members}:{members:{id:string;handle:string|null;role:string}[]}){
 const [memberId,setMemberId]=useState(members[0]?.id??"");
 const [kind,setKind]=useState("warning"),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 return <form className="qg-sanction-form" action={async data=>{if(["expulsion","temporary_restriction","demotion","removal_from_office"].includes(kind)&&!window.confirm("Bu yaptırımın sonucu hemen uygulanacak. Onaylıyor musunuz?"))return;setBusy(true);const r=await recordSanction(data);setMessage(r.message);setBusy(false);if(r.ok)(document.querySelector(".qg-sanction-form") as HTMLFormElement)?.reset();}}>
 <label>ÜYE<select name="member" required value={memberId} onChange={e=>setMemberId(e.target.value)}>{members.map(m=><option value={m.id} key={m.id}>{m.handle??"Üye"}</option>)}</select></label>
 <label>YAPTIRIM<select name="kind" value={kind} onChange={e=>setKind(e.target.value)}><option value="warning">Uyarı</option><option value="reprimand">Kınama</option><option value="temporary_restriction">Geçici yararlanamama</option><option value="demotion">Rütbe düşürme</option><option value="removal_from_office">Görevden alma</option><option value="expulsion">Üyelikten çıkarma</option></select></label>
 {kind==="demotion"&&<label>YENİ RÜTBE<select name="targetRole" required>{(()=>{const current=members.find(m=>m.id===memberId)?.role;const ranks=["member","creator","moderator","admin"];const index=ranks.indexOf(current??"");return ranks.slice(0,Math.max(0,index)).reverse().map(r=><option value={r} key={r}>{{member:"ÜYE",creator:"TEĞMEN",moderator:"KAPTAN",admin:"VEKİLHARÇ"}[r]}</option>);})()}</select></label>}
 {kind==="removal_from_office"&&<p>Yönetim görevi kaldırılacak ve rütbe ÜYE olacak.</p>}
 {kind==="temporary_restriction"&&<label>SÜRE (GÜN)<input name="days" type="number" min="1" max="365" defaultValue="7" required/></label>}
 <label>GEREKÇE<textarea name="reason" required minLength={5} maxLength={1000} rows={3} placeholder="Kısa gerekçe..."/></label>
 <button type="submit" disabled={busy||!members.length}>{busy?"KAYDEDİLİYOR...":"YAPTIRIMI KAYDET"}</button>
 {message&&<p role="status">{message}</p>}
 <small>Üyelikten çıkarma üyeliği sonlandırır. Geçici yaptırım yeni etkinlik katılımlarını engeller. Rütbe düşürme ve görevden alma rütbeyi anında günceller. Kodeks hükümleri saklıdır.</small>
 </form>;
}
