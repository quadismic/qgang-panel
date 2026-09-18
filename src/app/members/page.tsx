import Link from "next/link";
import {brandTheme} from "@/config/brand-theme";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {roleLabel} from "@/lib/roles";\nimport {RankInsignia} from "@/components/RankInsignia";
export const dynamic="force-dynamic";

const levels=["founder","admin","moderator","community","member"] as const;
const rankIcon:Record<string,string>={founder:"♛",admin:"◆",moderator:"▲",community:"✦",member:"•"};

export default async function Members(){
 const s=await createClient();
 const {data}=await s.from("profiles").select("id,display_name,handle,role,avatar_url").order("created_at",{ascending:true}).limit(100);
 const people=data??[];
 const groups=levels.map(role=>({role,people:people.filter((p:any)=>p.role===role)})).filter(g=>g.people.length);
 return <AppShell right={false}>
  <section className="registryHero roomScene orgHero" style={{backgroundImage:`linear-gradient(90deg,rgba(4,3,2,.76),rgba(4,3,2,.32) 48%,rgba(4,3,2,.14)),url(${brandTheme.rooms.registry})`}}>
   <h1>Topluluk</h1><p>Q-GANG teşkilat yapısı, görev zinciri ve rütbe düzeni.</p>
   <div><b>{people.length}<small>TOPLAM ÜYE</small></b><b>{groups.length}<small>AKTİF RÜTBE</small></b></div>
  </section>
  <section className="orgChart" aria-label="Q-GANG teşkilat şeması">
   <header><span>TEŞKİLAT ŞEMASI</span><b>HİYERARŞİK DÜZEN</b></header>
   {groups.length?<div className="orgTree">{groups.map((group,gi)=><div className={"orgLevel org-"+group.role} key={group.role}>
    {gi>0&&<div className="orgTrunk" aria-hidden="true"/>}
    <div className="orgRankTitle"><RankInsignia role={group.role} size="sm"/>{roleLabel(group.role)}</div>
    <div className="orgBranch">{group.people.map((p:any)=><Link href={"/u/"+p.handle} className="orgPerson" key={p.id}>
      <div className="orgPortrait">{p.avatar_url?<img src={p.avatar_url} alt=""/>:<span>{p.display_name?.slice(0,1).toUpperCase()||"Q"}</span>}</div>
      <strong>{p.display_name}</strong><small>@{p.handle}</small>
      <div className="orgInsignia"><RankInsignia role={p.role} size="sm"/><b>{roleLabel(p.role)}</b></div>
    </Link>)}</div>
   </div>)}</div>:<div className="orgEmpty"><span>◇</span><h2>Teşkilat henüz oluşturulmadı.</h2><p>Üyeler katıldıkça hiyerarşi burada şekillenecek.</p></div>}
  </section>
 </AppShell>
}