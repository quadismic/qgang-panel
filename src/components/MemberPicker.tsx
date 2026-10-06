"use client";
import {Button,Input} from "@/components/ui/Primitives";

import {useEffect,useId,useRef,useState} from "react";
import {roleLabel} from "@/lib/roles";
export type MemberChoice={id:string;display_name:string;handle:string;role:string;avatar_url?:string|null;detail?:string};
export function MemberPicker({name,label="Üye seç",scope="accounts",required=true,onChange,initialMember}:{name:string;label?:string;scope?:"report"|"discipline"|"accounts"|"badges"|"active"|"captains"|"legacy"|"management";initialMember?:MemberChoice|null;required?:boolean;onChange?:(member:MemberChoice|null)=>void}){
 const id=useId(),input=useRef<HTMLInputElement>(null),[query,setQuery]=useState(""),[selected,setSelected]=useState<MemberChoice|null>(initialMember??null),[items,setItems]=useState<MemberChoice[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(""),[open,setOpen]=useState(false),[cursor,setCursor]=useState(-1);
 useEffect(()=>{input.current?.setCustomValidity(required&&!selected?"Listeden bir kişi seçin.":"");},[required,selected]);
 useEffect(()=>{
  const controller=new AbortController();let active=true;
  if(selected||query.trim().replace(/^@/,"").length<2){setItems([]);setBusy(false);return()=>controller.abort();}
  setBusy(true);setError("");setItems([]);setCursor(-1);
  const timer=setTimeout(async()=>{try{const response=await fetch(`/api/member-search?scope=${scope}&q=${encodeURIComponent(query.trim())}`,{signal:controller.signal,cache:"no-store"});if(!response.ok)throw Error();const data=await response.json();if(active)setItems(data.items??[]);}catch{if(active&&!controller.signal.aborted)setError("Arama tamamlanamadı. Yeniden deneyin.");}finally{if(active)setBusy(false);}},300);
  return()=>{active=false;clearTimeout(timer);controller.abort();};
 },[query,scope,selected]);
 function choose(member:MemberChoice|null){setSelected(member);setQuery("");setItems([]);setOpen(false);onChange?.(member);}
 return <div className="qgMemberPicker"><label htmlFor={id}>{label}{!required&&<small> · İsteğe bağlı</small>}</label><input type="hidden" name={name} value={selected?.id||""}/>
 {selected?<div className="qgMemberSelected">{selected.avatar_url?<img src={selected.avatar_url} alt=""/>:<span className="qgMemberAvatar" aria-hidden="true">{selected.display_name.slice(0,1)}</span>}<div><b>{selected.display_name}</b><small>{selected.handle?"@"+selected.handle:"Tarihsel kayıt"}{selected.role?" · "+roleLabel(selected.role):""}{selected.detail?" · "+selected.detail:""}</small></div><Button level="secondary" type="button" className="qgAction" onClick={()=>{choose(null);setTimeout(()=>input.current?.focus(),0)}}>Değiştir</Button></div>:
 <><Input id={id} ref={input} aria-describedby={id+"-status"} aria-invalid={!!error} role="combobox" aria-autocomplete="list" aria-expanded={open&&items.length>0} aria-controls={id+"-results"} aria-activedescendant={cursor>=0?id+"-"+cursor:undefined} autoComplete="off" required={required} value={query} placeholder="Rumuz veya üye adı ara…" onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onChange={e=>{setQuery(e.target.value);setOpen(true);setCursor(-1)}} onKeyDown={e=>{if(e.key==="Escape")setOpen(false);if(items.length&&["ArrowDown","ArrowUp"].includes(e.key)){e.preventDefault();setOpen(true);setCursor(i=>Math.max(0,Math.min(items.length-1,i+(e.key==="ArrowDown"?1:-1))));}if(e.key==="Enter"){e.preventDefault();if(open&&cursor>=0&&items[cursor])choose(items[cursor]);}}}/>
 {open&&items.length>0&&<div id={id+"-results"} role="listbox" aria-label={label} className="qgMemberResults">{items.map((member,i)=><Button level="secondary" id={id+"-"+i} key={member.id} type="button" role="option" aria-selected={cursor===i} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(member)}>{member.avatar_url?<img src={member.avatar_url} alt="" loading="lazy"/>:<span className="qgMemberAvatar" aria-hidden="true">{member.display_name.slice(0,1)}</span>}<span><b>{member.display_name}</b><small>{member.handle?"@"+member.handle:"Tarihsel kayıt"}{member.role?" · "+roleLabel(member.role):""}{member.detail?" · "+member.detail:""}</small></span></Button>)}</div>}
 <small id={id+"-status"} className="qgMemberStatus" role="status">{busy?"Aranıyor…":error|| (query.trim().length<2?"Aramak için en az 2 karakter yazın.":!items.length?"Eşleşen kişi bulunamadı.":"Listeden kişiyi seçin.")}</small></>}
 </div>;
}
