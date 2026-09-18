import Link from "next/link";
import type {CSSProperties} from "react";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {brandTheme} from "@/config/brand-theme";
import {defaultDesign,normalizeDesign} from "@/lib/design";
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
  {href:"/rules",icon:"§",title:"KURALLAR",sub:"CODEX",value:(rules??[]).length+" kayıt",text:"Topluluk düzeni, üyelik, davranış ve disiplin."},
  {href:"/members",icon:"♙",title:"TOPLULUK",sub:"REGISTRY",value:String(members??0),text:"Aktif üyeler, kimlikler ve roller."},
  {href:"/announcements",icon:"▤",title:"DUYURULAR",sub:"DECREES",value:"KAYIT",text:"Karargâhtan yayımlanan güncel duyurular."},
  {href:"/penalties",icon:"⚖",title:"CEZALAR",sub:"TRIBUNAL",value:"SİCİL",text:"Kararlar, dayanaklar ve yaptırım kayıtları."},
  {href:"/fund",icon:"◉",title:"BÜTÇE",sub:"TREASURY",value:tl(balance),text:"Ortak kaynak, gelirler ve giderler."}
 ];
 return <AppShell right={false}><div className="commandHQ"><section className="commandHero" style={{"--command-bg":`url(${design.commandBackground})`} as CSSProperties}><div className="heroWords left">DAİMA<br/>DAHA<br/>İLERİ</div><div className="commandCouncil" aria-hidden="true">{brandTheme.command.council.map((m:any)=>{const slot=design.council.find(x=>x.id===m.id);if(!slot?.enabled)return null;return <img key={m.id} className={`councilMember ${m.side} ${m.id}`} src={slot.src||m.src} alt="" style={{"--council-scale":slot.scale/100,"--council-x":slot.x,"--council-y":slot.y} as CSSProperties}/>})}</div><div className="commandPortrait" aria-hidden="true"><img src={design.quadSrc} alt=""/></div><div className="heroWords right">NİZAM<br/>GÜÇ<br/>BİRLİK</div><div className="commandTitle commandTitleMinimal">{!user&&<Link href="/login">KİMLİĞİNİ DOĞRULA</Link>}</div></section><section className="commandModules">{cards.map(c=><Link href={c.href} className="commandPanel" key={c.href}><header><span>{c.icon}</span><h2>{c.title}</h2></header><div><strong>{c.value}</strong><p>{c.text}</p></div><footer>İNCELE <b>→</b></footer></Link>)}</section><section className="commandMotto"><blockquote>“{design.motto}”</blockquote><span>Q-GANG</span><div className="mottoArtwork mottoEmblem" aria-hidden="true"><img src={design.emblemSrc} alt=""/></div><p>{design.systemLine.split("\\n").map((x,i)=><span key={i}>{x}<br/></span>)}</p></section><footer className="secureLine"><i/> BAĞLANTI KURULDU <span>VERITAS IN TENEBRIS</span></footer></div></AppShell>
}