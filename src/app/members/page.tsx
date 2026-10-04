import {CommunityManagement} from "@/components/CommunityManagement";
import {MemberProfileEditor} from "@/components/MemberProfileEditor";
import {getPermissions,allows} from "@/lib/permissions";
import type {CSSProperties} from "react";
import {RankPortrait} from "@/components/RankPortrait";
import Link from "next/link";
import {brandTheme} from "@/config/brand-theme";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {roleLabel} from "@/lib/roles";
import {RankInsignia} from "@/components/RankInsignia";
import {pageMeta} from "@/lib/design";
export const dynamic="force-dynamic";
export const metadata=pageMeta.members;
export default async function Members({searchParams}:{searchParams:Promise<{manage?:string;edit?:string;error?:string;saved?:string;role?:string;era_changed?:string;era_error?:string;deleted?:string;delete_error?:string;legacy_linked?:string;legacy_error?:string;badge_catalog?:string}>}){
 const q=await searchParams;const {permissions}=await getPermissions();const canViewManagement=allows(permissions,"members.view");
 const s=await createClient();
 const [{data},{data:birthdays}]=await Promise.all([s.rpc("list_active_community_members"),s.rpc("list_today_community_birthdays")]);
 const people=data??[];const order=["founder","admin","moderator","creator","member"];const levels=order.map(role=>({role,people:people.filter((p:any)=>p.role===role)})).filter(x=>x.people.length);
 return <AppShell right={false}>
  <section className="registryHero roomScene orgHero unifiedPageHero" style={{backgroundImage:`linear-gradient(90deg,rgba(4,3,2,.76),rgba(4,3,2,.32) 48%,rgba(4,3,2,.14)),url(${brandTheme.rooms.registry})`}}>
   <h1>Topluluk</h1><p>Q-GANG üyeleri ve topluluk kimlikleri.</p>
   <div><b>{people.length}<small>TOPLAM ÜYE</small></b></div>
  </section>
  {canViewManagement&&<nav className="sectionTools" aria-label="Topluluk işlemleri"><Link className="qgAction" href="/topluluk">Üyeler</Link><Link className="qgAction" href="/topluluk?manage=1">Üyelik, rütbe ve rozet yönetimi</Link></nav>}
 {canViewManagement&&q.manage?(q.edit?<MemberProfileEditor params={Promise.resolve({id:q.edit})} searchParams={Promise.resolve(q)}/>:<CommunityManagement searchParams={Promise.resolve(q)}/>):<>
  {(birthdays??[]).length>0&&<section className="birthdayBanner"><span className="birthdaySigil">✦</span><div><small>BUGÜN TOPLULUKTA</small><h2>{(birthdays??[]).map((b:any)=>b.display_name).join(" · ")}</h2><p>{(birthdays??[]).length===1?"Bugün doğum günü. Nice yıllara!":"Bugün doğum günlerini kutluyoruz. Nice yıllara!"}</p></div></section>}<section className="orgChart" aria-label="Q-GANG topluluk üyeleri">
   <header><span>TOPLULUK</span><b>ÜYE KAYITLARI</b></header>
   {people.length?<div className="orgTree orgTreePlates">{levels.map((level:any)=><section className={`orgLevel org-${level.role} orgDensity-${level.people.length<=2?"solo":level.people.length<=6?"light":level.people.length<=16?"medium":"dense"}`} key={level.role}>{<div className="orgTrunk"/>}<div className="orgBranch orgPlateBranch" style={{"--org-count":Math.min(level.people.length,8)} as CSSProperties}>{level.people.map((p:any)=><Link href={"/u/"+p.handle} className={`memberPlate memberPlate-${p.role}`} key={p.id}><RankPortrait role={p.role} src={p.avatar_url} name={p.display_name||"Q"} size="card"/><div className="memberPlateCopy"><strong>{p.display_name}</strong><small>@{p.handle}</small></div><div className="memberPlateRank"><RankInsignia role={p.role} size="sm"/><b>{roleLabel(p.role)}</b></div></Link>)}</div></section>)}</div>:<div className="orgEmpty"><span>◇</span><h2>Topluluk henüz oluşturulmadı.</h2><p>Üyeler katıldıkça burada görünecek.</p></div>}
  </section>
 </>}
 </AppShell>
}