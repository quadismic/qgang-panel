"use client";
import {useMemo,useState} from "react";
import {PERMISSIONS,type AppRole} from "@/lib/roles";
type Row={role:AppRole;permission:string;enabled:boolean};
const ROLES:[AppRole,string][]=[["founder","LİDER"],["admin","VEKİLHARÇ"],["moderator","KAPTAN"],["creator","TEĞMEN"],["member","ÜYE"],["guest","PLATFORM"]];
const DEFAULTS:Record<AppRole,string[]>={
 founder:PERMISSIONS.map(([p])=>p),
 admin:["members.view","members.manage","members.delete","discipline.view","discipline.issue","discipline.review","announcements.publish","announcements.delete","budget.view","budget.manage","budget.delete","design.manage","access.manage","publications.view","publications.write","publications.publish","publications.delete"],
 moderator:["members.view","members.manage","discipline.view","discipline.issue","announcements.publish","budget.view","publications.view","publications.write"],
 creator:["members.view","discipline.view","budget.view","publications.view","publications.write"],
 member:["members.view","publications.view"],guest:[]
};
export function AccessMatrixEditor({rows}:{rows:Row[]}){
 const initial=useMemo(()=>{const s=new Set<string>();rows.filter(x=>x.enabled).forEach(x=>s.add(x.role+":"+x.permission));PERMISSIONS.forEach(([p])=>s.add("founder:"+p));return s},[rows]);
 const [state,setState]=useState<Set<string>>(()=>new Set(initial));
 const [saved]=useState<Set<string>>(()=>new Set(initial));
 const dirty=useMemo(()=>state.size!==saved.size||[...state].some(x=>!saved.has(x)),[state,saved]);
 function resetDefaults(){const n=new Set<string>();for(const [r] of ROLES)for(const p of DEFAULTS[r])n.add(r+":"+p);setState(n)}
 return <section className="accessMatrix panel"><header><div><span className="kicker">YETKİ MATRİSİ</span><h2>Rütbe × Yetki</h2></div><small>{rows.length} kayıt · {state.size} açık · {dirty?"taslak değişti":"değişiklik yok"}</small></header><button type="button" onClick={resetDefaults}>VARSAYILANLARA DÖN</button></section>;
}
