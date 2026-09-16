"use client";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
const order=["/","/search","/campfires","/members"];
function rank(path:string){const i=order.findIndex(x=>x==="/"?path==="/":path.startsWith(x));return i<0?2:i}
export function EmberStage({children}:{children:React.ReactNode}){const path=usePathname();const prev=useRef(path);const [motion,setMotion]=useState<"forward"|"back">("forward");useEffect(()=>{const a=rank(prev.current),b=rank(path);setMotion(b<a?"back":"forward");prev.current=path},[path]);return <div key={path} className={"emberStage "+motion}><div className="emberTrace" aria-hidden="true"/>{children}</div>}