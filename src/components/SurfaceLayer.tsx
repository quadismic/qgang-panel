"use client";
import {useId} from "react";
import {Dialog} from "./ui/Dialog";
import {IconButton} from "./ui/Primitives";
export function SurfaceLayer({open,onClose,title,kicker="Q-GANG",children,wide=false}:{open:boolean;onClose:()=>void;title:string;kicker?:string;children:React.ReactNode;wide?:boolean}){const id=useId();return <Dialog open={open} onClose={onClose} labelledBy={id} className={"surfaceLayer "+(wide?"wide ":"")+(open?"open":"")}><header><div><span className="kicker">{kicker}</span><h2 id={id}>{title}</h2></div><IconButton icon="close" label="Kapat" onClick={onClose}/></header><div className="surfaceLayerBody">{children}</div></Dialog>}
