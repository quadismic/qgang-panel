"use client";
import {LoadMore} from "./ui/LoadMore";
import {OverflowMenu} from "./ui/OverflowMenu";
import {Select,Button,EmptyState} from "./ui/Primitives";
import {QGIcon} from "./QGIcon";
import {useMemo,useState} from "react";
import {RichText} from "@/components/RichText";
import {richPlain} from "@/lib/rich-text";
import {ConfirmSubmitButton} from "@/components/ConfirmSubmitButton";

export type BudgetEntry={id:string;kind:string;amount:number|string;title:string;description:string|null;category:string|null;supporter_name:string|null;is_anonymous:boolean;created_at:string};
const money=(amount:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:2}).format(amount);
const dateParts=(date:string)=>{
  const value=new Date(date);
  return {day:new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"short",timeZone:"Europe/Istanbul"}).format(value),year:new Intl.DateTimeFormat("tr-TR",{year:"numeric",timeZone:"Europe/Istanbul"}).format(value)};
};
export function sortBudgetEntries(entries:BudgetEntry[],sort:string) {
  return [...entries].sort((a,b)=>{
    const difference=sort==="amount-desc"?Number(b.amount)-Number(a.amount):sort==="amount-asc"?Number(a.amount)-Number(b.amount):sort==="oldest"?Date.parse(a.created_at)-Date.parse(b.created_at):Date.parse(b.created_at)-Date.parse(a.created_at);
    return difference||a.id.localeCompare(b.id);
  });
}
export function BudgetLedger({entries,canDelete}:{entries:BudgetEntry[];canDelete:boolean}) {
  const [sort,setSort]=useState("newest"),[shown,setShown]=useState(7),[expanded,setExpanded]=useState<string|null>(null);
  const sorted=useMemo(()=>sortBudgetEntries(entries,sort),[entries,sort]);
  return <section className="budgetLedger">
    <header className="budgetLedgerHead"><div><h2>Bütçe Defteri</h2><p>Mali hareketlerin kronolojik kaydı.</p></div><div><span>{entries.length} İŞLEM</span><label><span className="sr-only">Bütçe kayıtlarını sırala</span><Select value={sort} onChange={e=>{setSort(e.target.value);setShown(7);}}><option value="newest">Tarih (Yeni → Eski)</option><option value="oldest">Tarih (Eski → Yeni)</option><option value="amount-desc">Tutar (Yüksek → Düşük)</option><option value="amount-asc">Tutar (Düşük → Yüksek)</option></Select></label></div></header>
    <div className="budgetLedgerRows">{sorted.slice(0,shown).map(entry=>{
      const date=dateParts(entry.created_at),income=entry.kind==="support",open=expanded===entry.id;
      return <article className={"budgetEntry "+(income?"income":"expense")} key={entry.id}>
        <div className="budgetEntryLine"><time dateTime={entry.created_at}><strong>{date.day}</strong><small>{date.year}</small></time>
          <span className="budgetCategory"><QGIcon name={entry.category==="DESTEK"?"income":"record"}/>{entry.category||"GENEL"}</span>
          <div className="budgetEntryCopy"><h3>{entry.title}</h3>{entry.description&&<p>{richPlain(entry.description)}</p>}{entry.supporter_name&&!entry.is_anonymous&&<small>Destekçi · {entry.supporter_name}</small>}</div>
          <strong className="budgetAmount"><span aria-label={income?"Gelir":"Gider"}>{income?"+":"−"}</span> {money(Number(entry.amount))}</strong>
          <OverflowMenu label={entry.title+" işlem seçenekleri"}>
            <Button level="tertiary" aria-expanded={open} aria-controls={"budget-detail-"+entry.id} onClick={e=>{setExpanded(open?null:entry.id);e.currentTarget.closest("details")?.removeAttribute("open");}}>Kaydı {open?"kapat":"görüntüle"}</Button>
            {canDelete&&<form action="/api/fund/delete" method="post"><input type="hidden" name="id" value={entry.id}/><ConfirmSubmitButton className="budgetDelete" message="Bu sehven oluşturulmuş kayıt kalıcı olarak silinecek. Gerçekleşmiş işlemler için silme yerine reversal kullanmalısın. Devam edilsin mi?">Kaydı sil</ConfirmSubmitButton></form>}
          </OverflowMenu>
        </div>
        {open&&<section className="budgetEntryDetail" id={"budget-detail-"+entry.id} aria-label="Kayıt ayrıntısı"><h4>{entry.title}</h4>{entry.description?<RichText value={entry.description}/>:<p>Bu kayıt için açıklama girilmemiş.</p>}<button type="button" className="qgAction" onClick={()=>setExpanded(null)}>Ayrıntıyı kapat</button></section>}
      </article>;
    })}</div>
    {!entries.length&&<EmptyState title="Bütçe defteri boş." message="İlk gelir veya gider kaydı burada görünecek."/>}
    {shown<sorted.length&&<LoadMore count={Math.min(10,sorted.length-shown)} onClick={()=>setShown(value=>value+10)}/>}
  </section>;
}
