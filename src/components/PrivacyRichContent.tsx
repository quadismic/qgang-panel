"use client";
import {useState} from "react";import {deferredContent} from "@/lib/external-content";
export function PrivacyRichContent({html,className}:{html:string;className:string}){
 const [enabled,setEnabled]=useState<Set<string>>(()=>new Set());
 return <div className={className} onClick={event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>("button[data-external-src]");const source=button?.dataset.externalSrc;if(source)setEnabled(previous=>new Set(previous).add(source));}} dangerouslySetInnerHTML={{__html:deferredContent(html,enabled)}}/>;
}
