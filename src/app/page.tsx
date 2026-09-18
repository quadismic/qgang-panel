import Link from "next/link";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
export const dynamic="force-dynamic";
const tl=(n:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(n);
export default async function Headquarters(){
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 const [{count:members},{data:rules},{data:fund},{data:actions}]=await Promise.all([
  s.from("community_memberships").select("*",{count:"exact",head:true}).eq("status","active"),
  s.from("regulations").select("id,title,number").eq("status","active").order("published_at",{ascending:false}).limit(5),
  s.from("fund_transactions").select("kind,amount,reversed_at").order("created_at",{ascending:false}).limit(100),
  s.from("moderation_actions").select("id,status").eq("status","active").limit(50)
 ]);
 const live=(fund??[]).filter((x:any)=>!x.reversed_at);
 const income=live.filter((x:any)=>x.kind==="support").reduce((a:number,x:any)=>a+Number(x.amount),0);
 const expense=live.filter((x:any)=>x.kind==="expense").reduce((a:number,x:any)=>a+Number(x.amount),0);
 const adjust=live.filter((x:any)=>x.kind==="adjustment").reduce((a:number,x:any)=>a+Number(x.amount),0);
 const balance=income-expense+adjust;
 return <AppShell right={false}><div className="commandHQ">
  <section className="commandHero">
   <div className="heroStandard heroStandardLeft"><span>DAİMA</span><span>DAHA</span><span>İLERİ</span></div>
   <div className="commandFigure" aria-hidden="true"><span className="figureHood"/><span className="figureMask"><i/></span><span className="figureMantle"/></div>
   <div className="heroStandard heroStandardRight"><span>NİZAM</span><span>GÜÇ</span><span>BİRLİK</span></div>
   <div className="commandTitle"><span className="kicker">QG // COMMAND INTERFACE</span><h1>Q-GANG</h1><b>KARARGÂH</b><i/><p>TOPLULUKTAN DAHA FAZLASI<br/>BİR DÜZEN</p>{!user&&<Link href="/login" className="commandAccess">KİMLİĞİNİ DOĞRULA</Link>}</div>
  </section>
  <section className="commandModules">
   <Link href="/rules" className="commandPanel"><header><span className="moduleSigil">§</span><h2>KURALLAR</h2><small>CODEX</small></header><div className="panelBody commandRules">{(rules??[]).slice(0,5).map((r:any,i:number)=><p key={r.id}><em>{["I","II","III","IV","V"][i]}.</em>{r.title}</p>)}{!(rules??[]).length&&<><p><em>I.</em>Topluluk Düzeni</p><p><em>II.</em>Üyelik ve Roller</p><p><em>III.</em>Davranış Kuralları</p><p><em>IV.</em>Disiplin Süreçleri</p></>}</div><footer>İNCELE <b>→</b></footer></Link>
   <Link href="/members" className="commandPanel"><header><span className="moduleSigil">♙</span><h2>TOPLULUK</h2><small>REGISTRY</small></header><div className="panelBody registryNumbers"><strong>{members??0}</strong><span>AKTİF ÜYE</span><div className="registrySeals"><i/><i/><i/><i/><i/></div></div><footer>GÖRÜNTÜLE <b>→</b></footer></Link>
   <Link href="/announcements" className="commandPanel"><header><span className="moduleSigil">▤</span><h2>DUYURULAR</h2><small>DECREES</small></header><div className="panelBody decreeList"><p><i className="signal red"/>Karargâh duyuruları</p><p><i className="signal gold"/>Topluluk kayıtları</p><p><i className="signal ash"/>Yeni emirler burada</p></div><footer>TÜM DUYURULAR <b>→</b></footer></Link>
   <Link href="/penalties" className="commandPanel tribunal"><header><span className="moduleSigil">⚖</span><h2>CEZALAR</h2><small>TRIBUNAL</small></header><div className="panelBody tribunalStats"><strong>{actions?.length??0}</strong><span>AKTİF CEZA</span><p>Kararlar · Dayanaklar · Kayıt</p></div><footer>KAYITLARI İNCELE <b>→</b></footer></Link>
   <Link href="/fund" className="commandPanel treasury"><header><span className="moduleSigil">◉</span><h2>BÜTÇE</h2><small>TREASURY</small></header><div className="panelBody"><strong className="treasuryBalance">{tl(balance)}</strong><span>MEVCUT BAKİYE</span><div className="treasuryFlow"><p>↑ {tl(income)}<small>GELİR</small></p><p>↓ {tl(expense)}<small>GİDER</small></p></div></div><footer>DETAYLARI GÖR <b>→</b></footer></Link>
  </section>
  <section className="commandMotto"><blockquote>“Düzen, özgürlüğün en güçlü hâlidir.”</blockquote><span>Q-GANG</span><div className="mottoMask" aria-hidden="true"><span/></div><p>SİSTEM<br/>İNSANLARLA<br/>YAŞAR.</p></section>
  <footer className="secureLine"><i/> QG // SECURE CONNECTION ESTABLISHED <span>VERITAS IN TENEBRIS</span></footer>
 </div></AppShell>
}