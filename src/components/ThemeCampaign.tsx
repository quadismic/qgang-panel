"use client";
import {useEffect,useState} from "react";

export function ThemeCampaign({css,expiresAt,initialActive}:{css:string;expiresAt:number;initialActive:boolean}){
 const [active,setActive]=useState(initialActive);
 useEffect(()=>{
  let timer:ReturnType<typeof setTimeout>|undefined;
  const update=()=>{
   clearTimeout(timer);
   const remaining=expiresAt-Date.now();
   setActive(remaining>0);
   if(remaining>0)timer=setTimeout(update,Math.min(remaining,2_147_000_000));
  };
  update();
  window.addEventListener("focus",update);
  return()=>{clearTimeout(timer);window.removeEventListener("focus",update);};
 },[expiresAt]);
 return active?<style>{css}</style>:null;
}
