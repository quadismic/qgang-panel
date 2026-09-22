"use client";
import {useState} from "react";
export function ProgressiveList({children,initial=5,step=10,className=""}:{children:React.ReactNode[];initial?:number;step?:number;className?:string}){
 const [shown,setShown]=useState(initial);const total=children.length,more=shown<total;
 return <div className={"progressiveList "+className}>{children.slice(0,shown)}{more&&<div className="progressiveGate"><div className="progressiveFade"/><button type="button" onClick={()=>setShown(v=>Math.min(v+step,total))}>DEVAMINI GÖSTER · {total-shown} KAYIT</button></div>}</div>
}