"use client";
import {useEffect,useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";

const GOOGLE_CLIENT_ID="440772662668-ojvph7ct3b9fpc0jkc0n7sj1tu0ao7pi.apps.googleusercontent.com";

declare global{
 interface Window{
  google?:{accounts:{id:{
   initialize:(config:{client_id:string;callback:(response:{credential?:string})=>void;auto_select?:boolean;cancel_on_tap_outside?:boolean;nonce?:string;use_fedcm_for_prompt?:boolean})=>void;
   prompt:()=>void;
  }}};
 }
}

function GoogleIcon(){return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"/><path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.36l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/></svg>}

function makeNonce(){
"use client";
import {useEffect,useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";

const GOOGLE_CLIENT_ID="440772662668-ojvph7ct3b9fpc0jkc0n7sj1tu0ao7pi.apps.googleusercontent.com";

declare global{
 interface Window{
  google?:{accounts:{id:{
   initialize:(config:{client_id:string;callback:(response:{credential?:string})=>void;auto_select?:boolean;cancel_on_tap_outside?:boolean;nonce?:string;use_fedcm_for_prompt?:boolean})=>void;
   renderButton:(parent:HTMLElement,options:{type?:"standard"|"icon";theme?:"outline"|"filled_blue"|"filled_black";size?:"large"|"medium"|"small";text?:"signin_with"|"signup_with"|"continue_with"|"signin";shape?:"rectangular"|"pill"|"circle"|"square";logo_alignment?:"left"|"center";width?:number})=>void;
  }}};
 }
}

function GoogleIcon(){return <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"/><path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.36l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/></svg>}

function makeNonce(){
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}
async function sha256(value:string){
 const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
 return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("");
}

export function AuthButtons(){
 const [busy,setBusy]=useState(false);
 const [ready,setReady]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const callbackRef=useRef<(response:{credential?:string})=>void>(()=>{});
 const nonceRef=useRef("");
 const googleButtonRef=useRef<HTMLDivElement>(null);

 useEffect(()=>{
  callbackRef.current=async response=>{
   if(!response.credential){setBusy(false);setError("Google kimliği alınamadı. Lütfen yeniden deneyin.");return}
   setBusy(true);
   const s=createClient();
   const {data,error:authError}=await s.auth.signInWithIdToken({provider:"google",token:response.credential,nonce:nonceRef.current});
   if(authError||!data.user){setBusy(false);setError("Giriş tamamlanamadı. Lütfen yeniden deneyin.");return}
   const google=(data.user.identities??[]).find(i=>i.provider==="google");
   if(google){
    const meta=(google.identity_data??{}) as Record<string,unknown>;
    const handle=String(meta.full_name||meta.name||data.user.email||"").trim()||null;
    const avatar=String(meta.avatar_url||meta.picture||"").trim()||null;
    const {error:accountError}=await s.from("connected_accounts").upsert({
     user_id:data.user.id,provider:"google",provider_user_id:google.id,provider_handle:handle,profile_url:null,
     metadata:{avatar,email:meta.email||data.user.email||null}
    },{onConflict:"user_id,provider"});
    if(accountError){setBusy(false);setError("Google hesabı bağlandı ancak profil bağlantısı kaydedilemedi. Lütfen yeniden deneyin.");return}
    if(avatar){
     const {data:profileAvatar}=await s.from("profiles").select("avatar_url").eq("id",data.user.id).maybeSingle();
     if(!profileAvatar?.avatar_url){
      const {error:avatarError}=await s.from("profiles").update({avatar_url:avatar,updated_at:new Date().toISOString()}).eq("id",data.user.id);
      if(avatarError){setBusy(false);setError("Google hesabı bağlandı ancak profil resmi eşitlenemedi. Lütfen yeniden deneyin.");return}
     }
    }
   }
   const next=new URLSearchParams(location.search).get("next")||"/profile";
   const safeNext=next.startsWith("/")&&!next.startsWith("//")?next:"/profile";
   const {data:profile}=await s.from("profiles").select("onboarding_completed_at").eq("id",data.user.id).maybeSingle();
   location.assign(profile?.onboarding_completed_at?safeNext:`/onboarding?next=${encodeURIComponent(safeNext)}`);
  };
 },[]);

 useEffect(()=>{
  const init=async()=>{
   if(!window.google)return;
   const raw=makeNonce();
   nonceRef.current=raw;
   window.google.accounts.id.initialize({
    client_id:GOOGLE_CLIENT_ID,
    callback:r=>callbackRef.current(r),
    auto_select:false,
    cancel_on_tap_outside:true,
    nonce:await sha256(raw),
    use_fedcm_for_prompt:true
   });
   if(googleButtonRef.current){
    googleButtonRef.current.replaceChildren();
    const width=Math.max(240,Math.min(360,window.innerWidth-64));
    window.google.accounts.id.renderButton(googleButtonRef.current,{theme:"filled_black",size:"large",text:"continue_with",shape:"rectangular",logo_alignment:"left",width});
   }
   setReady(true);
  };
  if(window.google){void init();return}
  const existing=document.querySelector<HTMLScriptElement>('script[data-qgang-google-id]');
  if(existing){existing.addEventListener("load",()=>void init(),{once:true});return}
  const script=document.createElement("script");
  script.src="https://accounts.google.com/gsi/client";
  script.async=true;script.defer=true;script.dataset.qgangGoogleId="true";
  script.onload=()=>void init();
  script.onerror=()=>{setReady(false);setError("Google giriş servisine ulaşılamadı. Lütfen yeniden deneyin.");};
  document.head.appendChild(script);
 },[]);

 return <div className="authButtons">
  {error&&<div className="qgangInlineError" role="alert"><span>GİRİŞ BAŞARISIZ</span><p>{error}</p></div>}
  <div className="googleSignIn" aria-busy={busy}>{!ready&&<button disabled><GoogleIcon/><span>Google hazırlanıyor…</span><b className="authArrow" aria-hidden="true">→</b></button>}<div ref={googleButtonRef} hidden={!ready}/>{busy&&<span className="googleSignInBusy">Google ile giriş yapılıyor…</span>}</div>
 </div>
}
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}
async function sha256(value:string){
 const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
 return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("");
}

export function AuthButtons(){
 const [busy,setBusy]=useState(false);
 const [ready,setReady]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const callbackRef=useRef<(response:{credential?:string})=>void>(()=>{});
 const nonceRef=useRef("");

 useEffect(()=>{
  callbackRef.current=async response=>{
   if(!response.credential){setBusy(false);setError("Google kimliği alınamadı. Lütfen yeniden deneyin.");return}
   const s=createClient();
   const {data,error:authError}=await s.auth.signInWithIdToken({provider:"google",token:response.credential,nonce:nonceRef.current});
   if(authError||!data.user){setBusy(false);setError("Giriş tamamlanamadı. Lütfen yeniden deneyin.");return}
   const google=(data.user.identities??[]).find(i=>i.provider==="google");
   if(google){
    const meta=(google.identity_data??{}) as Record<string,unknown>;
    const handle=String(meta.full_name||meta.name||data.user.email||"").trim()||null;
    const avatar=String(meta.avatar_url||meta.picture||"").trim()||null;
    const {error:accountError}=await s.from("connected_accounts").upsert({
     user_id:data.user.id,provider:"google",provider_user_id:google.id,provider_handle:handle,profile_url:null,
     metadata:{avatar,email:meta.email||data.user.email||null}
    },{onConflict:"user_id,provider"});
    if(accountError){setBusy(false);setError("Google hesabı bağlandı ancak profil bağlantısı kaydedilemedi. Lütfen yeniden deneyin.");return}
    if(avatar){
     const {data:profileAvatar}=await s.from("profiles").select("avatar_url").eq("id",data.user.id).maybeSingle();
     if(!profileAvatar?.avatar_url){
      const {error:avatarError}=await s.from("profiles").update({avatar_url:avatar,updated_at:new Date().toISOString()}).eq("id",data.user.id);
      if(avatarError){setBusy(false);setError("Google hesabı bağlandı ancak profil resmi eşitlenemedi. Lütfen yeniden deneyin.");return}
     }
    }
   }
   const next=new URLSearchParams(location.search).get("next")||"/profile";
   const safeNext=next.startsWith("/")&&!next.startsWith("//")?next:"/profile";
   const {data:profile}=await s.from("profiles").select("onboarding_completed_at").eq("id",data.user.id).maybeSingle();
   location.assign(profile?.onboarding_completed_at?safeNext:`/onboarding?next=${encodeURIComponent(safeNext)}`);
  };
 },[]);

 useEffect(()=>{
  const init=async()=>{
   if(!window.google)return;
   const raw=makeNonce();
   nonceRef.current=raw;
   window.google.accounts.id.initialize({
    client_id:GOOGLE_CLIENT_ID,
    callback:r=>callbackRef.current(r),
    auto_select:false,
    cancel_on_tap_outside:true,
    nonce:await sha256(raw),
    use_fedcm_for_prompt:true
   });
   setReady(true);
  };
  if(window.google){void init();return}
  const existing=document.querySelector<HTMLScriptElement>('script[data-qgang-google-id]');
  if(existing){existing.addEventListener("load",()=>void init(),{once:true});return}
  const script=document.createElement("script");
  script.src="https://accounts.google.com/gsi/client";
  script.async=true;script.defer=true;script.dataset.qgangGoogleId="true";
  script.onload=()=>void init();
  script.onerror=()=>{setReady(false);setError("Google giriş servisine ulaşılamadı. Lütfen yeniden deneyin.");};
  document.head.appendChild(script);
 },[]);

 function login(){
  if(!ready||!window.google){setError("Google giriş servisi henüz hazır değil. Lütfen yeniden deneyin.");return}
  setError(null);setBusy(true);window.google.accounts.id.prompt();window.setTimeout(()=>setBusy(false),15000);
 }

 return <div className="authButtons">
  {error&&<div className="qgangInlineError" role="alert"><span>GİRİŞ BAŞARISIZ</span><p>{error}</p></div>}
  <button disabled={busy||!ready} onClick={login}><GoogleIcon/><span>{busy?"Google açılıyor…":ready?"Google ile devam et":"Google hazırlanıyor…"}</span><b className="authArrow" aria-hidden="true">→</b></button>
 </div>
}
