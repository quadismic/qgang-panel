"use client";
import {useState,useTransition} from "react";
import {awardSpecialTask} from "./actions";
type Member={id:string;handle:string|null};
export default function AwardForm({members}:{members:Member[]}){
 const [userId,setUserId]=useState(members[0]?.id??"");
 const [title,setTitle]=useState("");const [justification,setJustification]=useState("");
 const [exp,setExp]=useState(25);const [pending,startTransition]=useTransition();
 const [message,setMessage]=useState("");const [success,setSuccess]=useState(false);
 function submit(e:React.FormEvent){e.preventDefault();setMessage("");startTransition(async()=>{const result=await awardSpecialTask({userId,title,justification,exp});setMessage(result.message);setSuccess(result.ok);if(result.ok){setTitle("");setJustification("");}});}
 return <form onSubmit={submit} className="qg-task-form">
 <label>ÜYE<select required value={userId} onChange={e=>setUserId(e.target.value)}>{members.map(m=><option key={m.id} value={m.id}>{m.handle??"İsimsiz üye"}</option>)}</select></label>
 <label>GÖREV ADI<input required minLength={5} maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Örn. Topluluk arşivini düzenleme"/></label>
 <label>GEREKÇE<textarea required minLength={15} maxLength={2000} rows={5} value={justification} onChange={e=>setJustification(e.target.value)} placeholder="Tamamlanan çalışmayı ve neden ödüllendirildiğini açıklayın."/></label>
 <label>EXP ÖDÜLÜ<input required type="number" min={25} max={100} step={1} value={exp} onChange={e=>setExp(Number(e.target.value))}/></label>
 <p>Ödül kalıcı EXP defterine kaydedilir. Gönderimden önce üye ve gerekçeyi kontrol edin.</p>
 <button disabled={pending||!userId} type="submit">{pending?"KAYDEDİLİYOR...":"ÖDÜLÜ ONAYLA"}</button>
 {message?<p role="status" style={{color:success?"#85d7a6":"#ff9a9a"}}>{message}</p>:null}
 </form>;
}
