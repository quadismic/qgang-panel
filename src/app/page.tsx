import Link from "next/link";
import type {CSSProperties} from "react";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {brandTheme} from "@/config/brand-theme";
import {defaultDesign,normalizeDesign} from "@/lib/design";
import {QGIcon,QGIconName} from "@/components/QGIcon";
export const dynamic="force-dynamic";
const tl=(n:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(n);
export default async function Headquarters(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser();
 const {data:designRow}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle(); const design=normalizeDesign(designRow?.settings??defaultDesign);
 const [{count:members},{data:rules},{data:fund}]=await Promise.all([
  s.from("community_memberships").select("*",{count:"exact",head:true}).eq("status","active"),
  s.from("regulations").select("id,title").order("published_at",{ascending:false}).limit(5),
  s.from("fund_transactions").select("kind,amount,reversed_at").limit(100)
 ]);
 const live=(fund??[]).filter((x:any)=>!x.reversed_at),income=live.filter((x:any)=>x.kind==="support").reduce((a:number,x:any)=>a+Number(x.amount),0),expense=live.filter((x:any)=>x.kind==="expense").reduce((a:number,x:any)=>a+Number(x.amount),0),balance=income-expense;
 const cards=[
  {href:"/rules",icon:"rules",title:"KURALLAR",sub:"CODEX",value:(rules??[]).length+" kayıt",text:"Topluluk düzeni, üyelik, davranış ve disiplin."},
  {href:"/members",icon:"community",title:"TOPLULUK",sub:"REGISTRY",value:String(members??0),text:"Aktif üyeler, kimlikler ve roller."},
  {href:"/announcements",icon:"announcements",title:"DUYURULAR",sub:"DECREES",value:"KAYIT",text:"Karargâhtan yayımlanan güncel duyurular."},
  {href:"/penalties",icon:"discipline",title:"CEZALAR",sub:"TRIBUNAL",value:"SİCİL",text:"Kararlar, dayanaklar ve yaptırım kayıtları."},
  {href:"/budget",icon:"treasury",title:"BÜTÇE",sub:"TREASURY",value:tl(balance),text:"Ortak kaynak, gelirler ve giderler."}
 ];
 return <AppShell right={false}><div className="commandHQ"><section className="commandHero" style={{"--command-bg":`url(${design.commandBackground})`} as CSSProperties}><div className="commandCouncil" aria-hidden="true">{brandTheme.command.council.map((m:any)=>{const slot=design.council.find(x=>x.id===m.id);if(!slot)return null;return <img key={m.id} className={`councilMember ${m.side} ${m.id}`} src={slot.src||m.src} alt="" style={{"--council-scale":slot.scale/100,"--council-x":slot.x,"--council-y":slot.y,display:slot.enabled?"":"none"} as CSSProperties}/>})}</div><div className="commandPortrait" aria-hidden="true"><img src={design.quadSrc} alt=""/></div><div className="commandTitle commandTitleMinimal">{!user&&<Link href="/login">KİMLİĞİNİ DOĞRULA</Link>}</div></section><section className="commandModules">{cards.map(c=><Link href={c.href} className="commandPanel" key={c.href}><header><span><QGIcon name={c.icon as QGIconName}/></span><h2>{c.title}</h2></header><div><strong>{c.value}</strong><p>{c.text}</p></div><footer>İNCELE <b><QGIcon name="chevron"/></b></footer></Link>)}</section><section className="commandMotto commandMottoClean"><blockquote>“Hukuk düzeni kurar, düzen özgürlüğü mümkün kılar.”</blockquote></section></div></AppShell>
}