"use client";
import {useRef,useId,type ReactNode} from "react";
import {QGIcon} from "@/components/QGIcon";
// The native popover top layer escapes every ancestor stacking context and clipping boundary.
export function ProfileActionMenu({children}:{children:ReactNode}){
 const id=useId(),panel=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 function position(){const p=panel.current,t=trigger.current;if(!p||!t)return;const r=t.getBoundingClientRect();p.style.left=Math.max(8,Math.min(r.left,window.innerWidth-p.offsetWidth-8))+"px";p.style.top=Math.max(8,Math.min(r.bottom+6,window.innerHeight-p.offsetHeight-8))+"px";}
 return <><button ref={trigger} type="button" className="qgButton qgIconButton profileActionTrigger" aria-label="Profil işlemleri" popoverTarget={id} onClick={()=>requestAnimationFrame(position)}><QGIcon name="more"/></button><div ref={panel} id={id} popover="auto" className="profileActionPopover" onToggle={e=>{if(e.newState==="open")position();}}>{children}</div></>;
}
