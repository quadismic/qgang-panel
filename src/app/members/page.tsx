import {CommunityOrgChart} from "@/components/CommunityOrgChart";
import {CommunityManagement} from "@/components/CommunityManagement";
import {MemberProfileEditor} from "@/components/MemberProfileEditor";
import {getPermissions,allows} from "@/lib/permissions";
import Link from "next/link";
import {brandTheme} from "@/config/brand-theme";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {pageMeta} from "@/lib/design";
export const dynamic="force-dynamic";
export const metadata=pageMeta.members;
export default async function Members({searchParams}:{searchParams:Promise<{manage?:string;member?:string;edit?:string;error?:string;saved?:string;role?:string;era_changed?:string;era_error?:string;deleted?:string;delete_error?:string;legacy_linked?:string;legacy_error?:string;badge_catalog?:string}>}){
 const q=await searchParams;const {permissions}=await getPermissions();const canViewManagement=allows(permissions,"members.view");
 const s=await createClient();
 const [{data},{data:birthdays}]=await Promise.all([s.rpc("list_active_community_members"),s.rpc("list_today_community_birthdays")]);
 const people=data??[];
 return <AppShell right={false}>
  <section className="registryHero roomScene orgHero unifiedPageHero" style={{backgroundImage:`linear-gradient(90deg,rgba(4,3,2,.76),rgba(4,3,2,.32) 48%,rgba(4,3,2,.14)),url(${brandTheme.rooms.registry})`}}>
   <h1>Topluluk</h1><p>Q-GANG üyeleri ve topluluk kimlikleri.</p>
   <div><b>{people.length}<small>TOPLAM ÜYE</small></b></div>
  </section>
  {canViewManagement&&<nav className="sectionTools" aria-label="Topluluk işlemleri"><Link className="qgAction" aria-current={!q.manage?"page":undefined} href="/topluluk">Üyeler</Link><Link className="qgAction" aria-current={q.manage?"page":undefined} href="/topluluk?manage=1">Üye Yönetimi</Link></nav>}
 {canViewManagement&&q.manage?(q.edit?<MemberProfileEditor params={Promise.resolve({id:q.edit})} searchParams={Promise.resolve(q)}/>:<CommunityManagement searchParams={Promise.resolve(q)}/>):<>
  {(birthdays??[]).length>0&&<section className="birthdayBanner"><span className="birthdaySigil">✦</span><div><small>BUGÜN TOPLULUKTA</small><h2>{(birthdays??[]).map((b:any)=>b.display_name).join(" · ")}</h2><p>{(birthdays??[]).length===1?"Bugün doğum günü. Nice yıllara!":"Bugün doğum günlerini kutluyoruz. Nice yıllara!"}</p></div></section>}<CommunityOrgChart people={people}/>
 </>}
 </AppShell>
}