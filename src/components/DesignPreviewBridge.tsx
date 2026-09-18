"use client";
import {useEffect} from "react";
export function DesignPreviewBridge(){
 useEffect(()=>{const fn=(e:MessageEvent)=>{if(e.data?.type!=="qgang-design-preview")return;const d=e.data.design||{},r=document.documentElement.style;
 const vars:any={"--qg-primary":d.primary,"--qg-bone":d.bone,"--qg-bronze":d.bronze,"--qg-sidebar-width":d.sidebarWidth+"px","--qg-sidebar-emblem":d.sidebarEmblem+"px","--qg-hero-overlay":d.heroOverlay/100,"--qg-quad-scale":d.quadScale/100,"--qg-quad-y":d.quadY,"--qg-login-width":d.loginPanelWidth+"px","--qg-login-emblem":d.loginEmblem+"px","--qg-login-overlay":d.loginOverlay/100};Object.entries(vars).forEach(([k,v])=>r.setProperty(k,String(v)))};
 window.addEventListener("message",fn);return()=>window.removeEventListener("message",fn)},[]);return null;
}