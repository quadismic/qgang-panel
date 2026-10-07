"use client";
import {useRef,useState,type ReactNode} from "react";
import {useRouter} from "next/navigation";
export function EventActionForm({children,className=""}:{children:ReactNode;className?:string}) {
 const router=useRouter(),locked=useRef(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
 return <form action="/api/events" method="post" className={className} onSubmit={async e=>{
  e.preventDefault();if(locked.current)return;const fields=new FormData(e.currentTarget);locked.current=true;setBusy(true);setError("");
  try {const response=await fetch("/api/events",{method:"POST",headers:{Accept:"application/json"},body:fields});const body=await response.json();if(!response.ok){setError(body.error||"Kayıt güncellenemedi.");return;}router.push(body.redirect||"/etkinlikler?saved=1");router.refresh();}
  catch{setError("Bağlantı kurulamadı. Alanların korundu; yeniden deneyebilirsin.")}
  finally{locked.current=false;setBusy(false)}
 }}><fieldset disabled={busy} className="eventFormFields">{children}</fieldset>{busy&&<p role="status" className="eventFormWide">Kaydediliyor…</p>}{error&&<p role="alert" className="notice eventFormWide">{error}</p>}</form>;
}
