"use client";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
const order=["/","/search","/campfires","/members"];
function rank(path:string){const i=order.findIndex(x=>x==="/"?path==="/":path.startsWith(x));return i<0?2:i}
export function EmberStage({children}:{children:React.ReactNode}){const path=usePathname();const prev=useRef(path);const [dir,setDir]=useState<"forward"|"back">("forward");const [tick,setTick]=useState(0);useEffect(()=>{if(prev.current===path)return;setDir(rank(path)<rank(prev.current)?"back":"forward");prev.current=path;setTick(x=>x+1)},[path]);return <div key={path+"-"+tick} className={"emberStage "+dir}><div className="emberTrace" aria-hidden="true"/>{children}</div>}