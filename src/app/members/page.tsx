import Link from "next/link";
import {brandTheme} from "@/config/brand-theme";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {roleLabel} from "@/lib/roles";
import {RankInsignia} from "@/components/RankInsignia";
import {pageMeta} from "@/lib/design";
export const dynamic="force-dynamic";
export const metadata=pageMeta.members;
export default async function Members(){
 const s=await createClient();
 const {data}=await s.from("profiles").select("id,display_name,handle,role,avatar_url").order("created_at",{ascending:true}).limit(100);
 const people=data??[];const order=["founder","admin","moderator","creator","member"];const levels=order.map(role=>({role,people:people.filter((p:any)=>p.role===role)})).filter(x=>x.people.length);
 return <AppShell right={false}>
  <section className="registryHero roomScene orgHero" style={{backgroundImage:`linear-gradient(90deg,rgba(4,3,2,.76),rgba(4,3,2,.32) 48%,rgba(4,3,2,.14)),url(${brandTheme.rooms.registry})`}}>
   <h1>Topluluk</h1><p>Q-GANG üyeleri ve topluluk kimlikleri.</p>
   <div><b>{people.length}<small>TOPLAM ÜYE</small></b></div>
  </section>
  <section className="orgChart" aria-label="Q-GANG topluluk üyeleri">
   <header><span>TOPLULUK</span><b>ÜYE KAYITLARI</b></header>
   {people.length?<div className="orgTree orgTreePlates">{levels.map((level:any)=><section className={`orgLevel org-${level.role}`} key={level.role}>{<div className="orgTrunk"/>}<div className="orgBranch orgPlateBranch">{level.people.map((p:any)=><Link href={"/u/"+p.handle} className={`memberPlate memberPlate-${p.role}`} key={p.id}><div className={"memberPlatePortrait memberPlatePortrait-"+p.role}>{p.avatar_url?<img src={p.avatar_url} alt=""/>:<span>{p.display_name?.slice(0,1).toUpperCase()||"Q"}</span>}{["founder","admin"].includes(p.role)&&<img className="memberRankFrame" src="/assets/ranks/leader-frame.png" alt=""/>}{p.role==="founder"&&<img className="memberRankCrown" src="/assets/ranks/leader-crown.png" alt=""/>}{p.role==="moderator"&&<img className="memberRankFrame memberCaptainFrame" src="/assets/ranks/captain-frame.png" alt=""/>}</div><div className="memberPlateCopy"><strong>{p.display_name}</strong><small>@{p.handle}</small></div><div className="memberPlateRank"><RankInsignia role={p.role} size="sm"/><b>{roleLabel(p.role)}</b></div></Link>)}</div></section>)}</div>:<div className="orgEmpty"><span>◇</span><h2>Topluluk henüz oluşturulmadı.</h2><p>Üyeler katıldıkça burada görünecek.</p></div>}
  </section>
 </AppShell>
}