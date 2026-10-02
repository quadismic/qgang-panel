"use client";
import type {AppRole} from "@/lib/roles";
type Row={role:AppRole;permission:string;enabled:boolean};
export function AccessMatrixEditor({rows}:{rows:Row[]}){
 return <section className="accessMatrix panel"><header><div><span className="kicker">YETKİ MATRİSİ</span><h2>Rütbe × Yetki</h2></div><small>{rows.length} yetki kaydı yüklendi.</small></header></section>;
}
