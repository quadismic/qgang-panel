"use client";
import {LoadMore} from "./ui/LoadMore";
import {OverflowMenu} from "./ui/OverflowMenu";
import {EmptyState,Metadata} from "./ui/Primitives";
import {useEffect,useState} from "react";
import {NormBadge} from "@/components/NormBadge";
import {RichText} from "@/components/RichText";
import {ConfirmSubmitButton} from "@/components/ConfirmSubmitButton";
import {richPlain} from "@/lib/rich-text";
import {announcementLink} from "@/lib/announcements";
export type AnnouncementEntry={id:string;title:string;body:string|null;category:string;priority:string;is_pinned:boolean;published_at:string;regulation_id?:string|null;revision?:number|null;effective_at?:string|null;status?:string|null;historical?:boolean|null};
export function AnnouncementsLedger({items,canDelete=false}:{items:AnnouncementEntry[];canDelete?:boolean;query?:string;category?:string}){
 const [shown,setShown]=useState(5),[open,setOpen]=useState<Set<string>>(new Set());
 useEffect(()=>{const id=window.location.hash.slice(1).replace(/^duyuru-/,""),index=items.findIndex(a=>a.id===id);if(index>=0){setShown(n=>Math.max(n,index+1));setOpen(prev=>new Set(prev).add(id));requestAnimationFrame(()=>document.getElementById("duyuru-"+id)?.scrollIntoView());}},[items]);
 const toggle=(id:string)=>setOpen(prev=>{const next=new Set(prev);if(next.has(id))next.delete(id);else next.add(id);return next});
 return <section className="announcementLedger"><div className="announcementResultCount">{items.length} kayıt</div>
 {!items.length&&<EmptyState title="Kayıt bulunamadı." message="Bu görünümde duyuru yok. Arama ve filtrelerini değiştirebilirsin."/>}
 {items.slice(0,shown).map(a=>{const expanded=open.has(a.id),date=new Date(a.published_at),valid=!Number.isNaN(date.getTime()),dateText=valid?date.toLocaleDateString("tr-TR",{day:"2-digit",month:"short",timeZone:"Europe/Istanbul"}):"—",year=valid?date.toLocaleDateString("tr-TR",{year:"numeric",timeZone:"Europe/Istanbul"}):"";return <article key={a.id} id={"duyuru-"+a.id} className={"announcementRow announcement-"+a.category.toLowerCase()+" "+a.priority}><aside className="announcementDate"><span aria-hidden="true">◇</span><time dateTime={a.published_at}>{dateText}<small>{year}</small></time></aside><div className="announcementContent"><div className="normBadges"><NormBadge kind={a.category}/><NormBadge priority={a.priority}/>{a.is_pinned&&<span className="announcementPinned">◆ SABİT</span>}</div><h3>{a.title}</h3><p className="announcementSummary">{richPlain(a.body||"").slice(0,240)}{richPlain(a.body||"").length>240?"…":""}</p>{a.regulation_id&&<Metadata className="announcementDecisionMeta"><span>{a.historical?"TARİHSEL KAYIT":a.status==="yururlukten_kaldirildi"?"YÜRÜRLÜKTEN KALDIRILDI":a.effective_at&&Date.parse(a.effective_at)>Date.now()?"İLERİ TARİHLİ":"YÜRÜRLÜKTE"} · Sürüm {a.revision}</span>{a.effective_at&&<time>Yürürlük: {new Date(a.effective_at).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul"})}</time>}</Metadata>}</div><div className="announcementActions">{canDelete&&!a.regulation_id&&<OverflowMenu label={a.title+" işlemleri"}><form action="/api/announcements/delete" method="post"><input type="hidden" name="id" value={a.id}/><ConfirmSubmitButton message="Bu duyuru kalıcı olarak silinecek. Devam edilsin mi?">Duyuruyu sil</ConfirmSubmitButton></form></OverflowMenu>}<button className="announcementRead" type="button" aria-expanded={expanded} aria-controls={"announcement-body-"+a.id} onClick={()=>toggle(a.id)}>{expanded?"Detayları kapat":"Detayları görüntüle"}<span aria-hidden="true">{expanded?"↑":"→"}</span></button></div>{expanded&&<div id={"announcement-body-"+a.id} className="announcementFull"><RichText value={a.body}/>{a.regulation_id&&<a className="qgAction" href={announcementLink(a)}>İcra Kararı · Kodeks kaydı ve geçmişi →</a>}</div>}</article>})}
 {shown<items.length&&<LoadMore count={Math.min(7,items.length-shown)} onClick={()=>setShown(n=>Math.min(n+7,items.length))}/>}
 </section>;
}
