"use client";
import {useEffect,useState} from "react";
import {useFormStatus} from "react-dom";

type State="sleeping"|"awakening"|"processing"|"responding";
const asset:Record<State,string>={
 sleeping:"/entities/aster/aster-sleeping.webp",
 awakening:"/entities/aster/aster-awakening.webp",
 processing:"/entities/aster/aster-processing.webp",
 responding:"/entities/aster/aster-responding.webp"
};
const label:Record<State,string>={
 sleeping:"UYKUDA",awakening:"UYANIYOR",processing:"HAFIZADA ARIYOR",responding:"YANITLIYOR"
};

export function AsterPresence({responding=false}:{responding?:boolean}){
 const [state,setState]=useState<State>(responding?"responding":"sleeping");
 useEffect(()=>{if(!responding)return;setState("responding");const id=setTimeout(()=>setState("sleeping"),12000);return()=>clearTimeout(id)},[responding]);\n useEffect(()=>{const fn=(e:Event)=>{const s=(e as CustomEvent).detail;if(s==="awakening"||s==="processing")setState(s)};window.addEventListener("aster-state",fn);return()=>window.removeEventListener("aster-state",fn)},[]);
 return <div className="qaePresence" data-state={state}>
  <div className="qaePortrait" aria-hidden="true">{(Object.keys(asset) as State[]).map(s=><img key={s} src={asset[s]} alt="" className={state===s?"is-active":""}/>)}</div>
  <div className="qaePresenceState"><span/>{label[state]}</div>
 </div>
}

export function AsterSubmit(){
 const {pending}=useFormStatus();const [phase,setPhase]=useState<"idle"|"awakening"|"processing">("idle");
 useEffect(()=>{if(!pending){setPhase("idle");return}setPhase("awakening");const id=setTimeout(()=>setPhase("processing"),650);return()=>clearTimeout(id)},[pending]);
 useEffect(()=>{if(phase==="idle")return;document.documentElement.dataset.asterClientState=phase;window.dispatchEvent(new CustomEvent("aster-state",{detail:phase}));return()=>{delete document.documentElement.dataset.asterClientState}},[phase]);
 return <button type="submit" disabled={pending}>{pending?(phase==="awakening"?"ASTER UYANIYOR…":"HAFIZADA ARIYOR…"):"ASTER'İ UYANDIR"}</button>
}
