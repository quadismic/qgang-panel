"use client";

import {useState,useTransition} from "react";
import {equipCosmetic,unequipCosmetic} from "./actions";

type Cosmetic={id:string;name:string;kind:string;unlock_level:number};
type Equipment={kind:string;cosmetic_id:string};
export default function CosmeticSelector({cosmetics,owned,equipped}:{
 cosmetics:Cosmetic[];owned:string[];equipped:Equipment[];
}){
 const [busy,start]=useTransition();
 const [message,setMessage]=useState("");
 const ownedSet=new Set(owned);
 const equippedMap=new Map(equipped.map(x=>[x.kind,x.cosmetic_id]));
 const kinds:Record<string,string>={frame:"Çerçeve",background:"Arka plan",name_effect:"İsim efekti",title:"Unvan"};
 return <div>
  <div className="qgop-cosmetics">
   {cosmetics.map(item=>{
    const unlocked=ownedSet.has(item.id),selected=equippedMap.get(item.kind)===item.id;
    return <div key={item.id} className={selected?"qgop-selected":""}>
     <span aria-hidden="true">{unlocked?"◆":"◇"}</span>
     <strong>{item.name}</strong>
     <small>{kinds[item.kind]??item.kind} · {unlocked?"AÇILDI":`SEVİYE ${item.unlock_level} · KİLİTLİ`}</small>
     {unlocked?<button type="button" disabled={busy||selected} onClick={()=>start(async()=>{
      const result=await equipCosmetic(item.id,item.kind);setMessage(result.message);
      if(result.ok)window.location.reload();
     })}>{selected?"KUŞANILDI":"KUŞAN"}</button>:null}
    </div>;
   })}
  </div>
  <div className="qgop-reset">
   {Object.entries(kinds).map(([kind,label])=>equippedMap.has(kind)?<button key={kind} type="button" disabled={busy} onClick={()=>start(async()=>{
    const result=await unequipCosmetic(kind);setMessage(result.message);
    if(result.ok)window.location.reload();
   })}>{label}: Standarta dön</button>:null)}
  </div>
  {message?<p role="status" className="qgop-cosmetic-message">{message}</p>:null}
 </div>;
}
