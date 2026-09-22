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
 const people=data??[];
 return <AppShell right={false}>
  <section className="registryHero roomScene orgHero" style={{backgroundImage:`linear-gradient(90deg,rgba(4,3,2,.76),rgba(4,3,2,.32) 48%,rgba(4,3,2,.14)),url(${brandTheme.rooms.registry})`}}>
   <h1>Topluluk</h1><p>Q-GANG üyeleri ve topluluk kimlikleri.</p>
   <div><b>{people.length}<small>TOPLAM ÜYE</small></b></div>
  </section>
  <section className="orgChart" aria-label="Q-GANG topluluk üyeleri">
   <header><span>TOPLULUK</span><b>ÜYE KAYITLARI</b></header>
   {people.length?<div className="orgBranch orgCommunityGrid">{people.map((p:any)=><Link href={"/u/"+p.handle} className="orgPerson" key={p.id}>
    <div className="orgPortrait">{p.avatar_url?<img src={p.avatar_url} alt=""/>:<span>{p.display_name?.slice(0,1).toUpperCase()||"Q"}</span>}</div>
    <strong>{p.display_name}</strong><small>@{p.handle}</small>
    <div className="orgInsignia"><RankInsignia role={p.role} size="sm"/><b>{roleLabel(p.role)}</b></div>
   </Link>)}</div>:<div className="orgEmpty"><span>◇</span><h2>Topluluk henüz oluşturulmadı.</h2><p>Üyeler katıldıkça burada görünecek.</p></div>}
  </section>
 </AppShell>
}