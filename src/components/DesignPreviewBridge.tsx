"use client";
import {useEffect} from "react";
export function DesignPreviewBridge(){
 useEffect(()=>{const fn=(e:MessageEvent)=>{if(e.origin!==location.origin||e.data?.type!=="qgang-design-preview")return;const d=e.data.design||{},r=document.documentElement.style;
 const vars:any={"--qg-primary":d.primary,"--qg-bone":d.bone,"--qg-bronze":d.bronze,"--qg-sidebar-width":d.sidebarWidth+"px","--qg-sidebar-emblem":d.sidebarEmblem+"px","--qg-hero-overlay":d.heroOverlay/100,"--qg-quad-scale":d.quadScale/100,"--qg-quad-y":d.quadY,"--qg-login-width":d.loginPanelWidth+"px","--qg-login-emblem":d.loginEmblem+"px","--qg-login-overlay":d.loginOverlay/100};Object.entries(vars).forEach(([k,v])=>r.setProperty(k,String(v)));
 const hero=document.querySelector<HTMLElement>(".commandHero");if(hero&&d.commandBackground)hero.style.setProperty("--command-bg",`url("${String(d.commandBackground).replace(/["\\]/g,"")}")`);
 const quad=document.querySelector<HTMLImageElement>(".commandPortrait img");if(quad&&d.quadSrc)quad.src=d.quadSrc;
 const emblem=document.querySelector<HTMLImageElement>(".mottoEmblem img");if(emblem&&d.emblemSrc)emblem.src=d.emblemSrc;
 (d.council||[]).forEach((m:any)=>{const img=document.querySelector<HTMLImageElement>(".councilMember."+CSS.escape(m.id));if(img){if(m.src)img.src=m.src;img.style.display=m.enabled?"":"none";img.style.setProperty("--council-scale",String((m.scale||100)/100));img.style.setProperty("--council-x",String(m.x||0));img.style.setProperty("--council-y",String(m.y||0))}});
 };
 window.addEventListener("message",fn);return()=>window.removeEventListener("message",fn)},[]);return null;
}