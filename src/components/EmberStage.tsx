"use client";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
const order=["/","/search","/campfires","/members"];
function rank(path:string){const i=order.findIndex(x=>x==="/"?path==="/":path.startsWith(x));return i<0?2:i}
export function EmberStage({children}:{children:React.ReactNode}){const path=usePathname();const prevPath=useRef(path);const previous=useRef<React.ReactNode>(null);const current=useRef<React.ReactNode>(children);const [transition,setTransition]=useState<{old:React.ReactNode;dir:"forward"|"back"}|null>(null);
if(path===prevPath.current){current.current=children}
useEffect(()=>{if(path===prevPath.current)return;const dir=rank(path)<rank(prevPath.current)?"back":"forward";const old=current.current;previous.current=old;current.current=children;prevPath.current=path;setTransition({old,dir});const timer=window.setTimeout(()=>{previous.current=null;setTransition(null)},760);return()=>window.clearTimeout(timer)},[path,children]);
return <div className={"emberWorld "+(transition?"shifting "+transition.dir:"")}><div className="emberTrace" aria-hidden="true"/>{transition&&<div className="emberScene emberSceneOld" aria-hidden="true">{transition.old}</div>}<div className="emberScene emberSceneNew">{children}</div></div>}