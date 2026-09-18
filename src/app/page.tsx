import Link from "next/link";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
export const dynamic="force-dynamic";
const tl=(n:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(n);
export default async function Headquarters(){
 const s=await createClient(); const {data:{user}}=await s.auth.getUser();
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
 return <AppShell right={false}><div className="commandHQ"><section className="commandHero"><div className="heroWords left">DAİMA<br/>DAHA<br/>İLERİ</div><div className="commandFigure"><span className="figureHood"/><span className="figureMask"><i/></span><span className="figureMantle"/></div><div className="heroWords right">NİZAM<br/>GÜÇ<br/>BİRLİK</div><div className="commandTitle"><span>QG // KARARGÂH</span><h1>Q-GANG</h1><b>KARARGÂH</b><i/><p>TOPLULUKTAN DAHA FAZLASI<br/>BİR DÜZEN</p>{!user&&<Link href="/login">KİMLİĞİNİ DOĞRULA</Link>}</div></section><section className="commandModules">{cards.map(c=><Link href={c.href} className="commandPanel" key={c.href}><header><span>{c.icon}</span><h2>{c.title}</h2><small>{c.sub}</small></header><div><strong>{c.value}</strong><p>{c.text}</p></div><footer>İNCELE <b>→</b></footer></Link>)}</section><section className="commandMotto"><blockquote>“Düzen, özgürlüğün en güçlü hâlidir.”</blockquote><span>Q-GANG</span><div className="mottoMask"><i/></div><p>SİSTEM<br/>İNSANLARLA<br/>YAŞAR.</p></section><footer className="secureLine"><i/> QG // BAĞLANTI KURULDU <span>VERITAS IN TENEBRIS</span></footer></div></AppShell>
}