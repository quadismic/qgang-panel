"use client";
import {useMemo,useState} from "react";
import {PERMISSIONS,ROLE_LABEL,type AppRole} from "@/lib/roles";
type Row={role:AppRole;permission:string;enabled:boolean};
const ROLES:[AppRole,string][]=[["founder","LİDER"],["admin","VEKİLHARÇ"],["moderator","KAPTAN"],["creator","TEĞMEN"],["member","ÜYE"],["guest","PLATFORM"]];
const DESC:Record<string,string>={"members.view":"Topluluk ve üye kayıtlarını görür.","members.manage":"Üyelik ve izin verilen rütbe işlemlerini yönetir.","members.delete":"Uygun kullanıcı hesabını kalıcı siler.","discipline.view":"Disiplin sicili ve arşivini görür.","discipline.issue":"Yeni yaptırım kararı oluşturur.","discipline.review":"Karar ve itiraz incelemesi yapar.","announcements.publish":"Duyuru ve karar yayımlar.","budget.view":"Hazine kayıtlarını görüntüler.","budget.manage":"Gelir/gider oluşturur ve yönetir.","design.manage":"Tasarım Merkezi ayarlarını değiştirir.","access.manage":"Erişim Merkezi yetki matrisini yönetir.","maintenance.access":"Bakım erişimi kişi bazında Sistem Merkezi’nden verilir.","announcements.delete":"Duyuruyu kalıcı olarak siler.","budget.delete":"Sehven oluşmuş, geri alınmamış bütçe kaydını siler.","publications.view":"Yayın kayıtlarını görüntüler.","publications.write":"Yayın oluşturur ve düzenler.","publications.publish":"Yayını kamuya açar veya yayından kaldırır.","publications.delete":"Yayını kalıcı olarak siler."};
export function AccessMatrixEditor({rows}:{rows:Row[]}){
 const initial=useMemo(()=>{const s=new Set<string>();rows.filter(x=>x.enabled).forEach(x=>s.add(x.role+":"+x.permission));return s},[rows]);
 const [state]=useState<Set<string>>(()=>new Set(initial));
 return <section className="accessMatrix panel"><div className="accessTable">{PERMISSIONS.map(([p,label])=><div className="accessRow" key={p}><div className="permissionCopy"><strong>{label}</strong><small>{DESC[p]}</small><code>{p}</code></div><>{ROLES.map(([role])=>{const on=state.has(role+":"+p);return <button type="button" key={role} aria-label={ROLE_LABEL[role]+" "+label}><i/>{on?"AÇIK":"KAPALI"}</button>})}</></div>)}</div></section>;
}
