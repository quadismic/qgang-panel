"use client";
import dynamic from "next/dynamic";
import {useCallback,useEffect,useState} from "react";
const IdentityLayer=dynamic(()=>import("./IdentityLayer").then(m=>m.IdentityLayer));
const TreasuryLayer=dynamic(()=>import("./TreasuryLayer").then(m=>m.TreasuryLayer));
type Me={display_name?:string|null;handle?:string|null;bio?:string|null;avatar_url?:string|null;role?:string|null}|null;
type Treasury={balance:number;support:number;expense:number;adjust:number;transactions:any[];contributors:{name:string;amount:number}[]}|null;
export function SurfaceController({user,me,manage=false,treasury=null}:{user:boolean;me:Me;manage?:boolean;treasury?:Treasury}){
 const[layer,setLayer]=useState<"identity"|"treasury"|null>(null),close=useCallback(()=>setLayer(null),[]);
 useEffect(()=>{const identity=()=>setLayer("identity"),treasuryOpen=()=>setLayer("treasury");window.addEventListener("qgang:identity",identity);window.addEventListener("qgang:treasury",treasuryOpen);return()=>{window.removeEventListener("qgang:identity",identity);window.removeEventListener("qgang:treasury",treasuryOpen)}},[]);
 return <>{layer==="identity"&&<IdentityLayer user={user} me={me} manage={manage} onClose={close}/>}{layer==="treasury"&&<TreasuryLayer open onClose={close} initial={treasury}/>}</>;
}
