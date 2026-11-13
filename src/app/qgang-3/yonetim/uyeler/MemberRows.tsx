"use client";
import {useState} from "react";
import {changeMemberRole} from "./actions";
const roles:Record<string,string>={founder:"LİDER",admin:"VEKİLHARÇ",moderator:"KAPTAN",creator:"TEĞMEN",member:"ÜYE",guest:"MİSAFİR"};
export default function MemberRows({members}:{members:{id:string;handle:string|null;role:string}[]}){
 const [search,setSearch]=useState(""),[editing,setEditing]=useState<string|null>(null),[message,setMessage]=useState("");
 return <div className="qg-member-list"><input aria-label="Üye ara" placeholder="Üye ara..." value={search} onChange={e=>setSearch(e.target.value)}/>{members.filter(m=>(m.handle??"").toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr"))).map(m=><div className="qg-member-row" key={m.id}><div><strong>{m.handle??"Üye"}</strong><small>{roles[m.role]??m.role}</small></div>{m.role!=="founder"&&<button type="button" onClick={()=>{setEditing(editing===m.id?null:m.id);setMessage("");}}>Düzenle</button>}{editing===m.id&&<form action={async d=>{const result=await changeMemberRole(d);setMessage(result.message);if(result.ok)setEditing(null);}}><input type="hidden" name="member" value={m.id}/><select name="role" defaultValue={m.role}>{["member","creator","moderator","admin"].map(r=><option value={r} key={r}>{roles[r]}</option>)}</select><button type="submit">Kaydet</button></form>}</div>)}{message&&<p role="status">{message}</p>}</div>;
}
