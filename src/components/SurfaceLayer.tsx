"use client";
import {useEffect,useRef} from "react";
export function SurfaceLayer({open,onClose,title,kicker="Q-GANG",children,wide=false}:{open:boolean;onClose:()=>void;title:string;kicker?:string;children:React.ReactNode;wide?:boolean}){
 const panel=useRef<HTMLElement>(null);
 useEffect(()=>{if(!open)return;const before=document.body.style.overflow;document.body.style.overflow="hidden";const esc=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",esc);requestAnimationFrame(()=>panel.current?.focus());return()=>{document.body.style.overflow=before;window.removeEventListener("keydown",esc)}},[open,onClose]);
 return <><div className={"surfaceVeil "+(open?"open":"")} onClick={onClose}/><aside ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-hidden={!open} className={"surfaceLayer "+(wide?"wide ":"")+(open?"open":"")}><header><div><span className="kicker">{kicker}</span><h2>{title}</h2></div><button type="button" onClick={onClose} aria-label="Kapat">×</button></header><div className="surfaceLayerBody">{children}</div><footer><span>Q-GANG · ONE SURFACE</span><i>Ana ekran hep arkanda.</i></footer></aside></>
}