import {thumbnail} from "@/lib/presentation-image";
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
export default async function Members({searchParams}:{searchParams:Promise<{manage?:string;view?:string;member?:string;edit?:string;error?:string;saved?:string;role?:string;era_changed?:string;era_error?:string;deleted?:string;delete_error?:string;legacy_linked?:string;legacy_error?:string;badge_catalog?:string}>}){
 const q=await searchParams;const {permissions}=await getPermissions();const canViewManagement=allows(permissions,"members.view");
 const s=await createClient();
 const [{data},{data:birthdays}]=await Promise.all([s.rpc("list_active_community_members"),s.rpc("list_today_community_birthdays")]);
 const people=data??[];
 return <AppShell right={false}><div className="communityPage">
  <section className="registryHero roomScene orgHero unifiedPageHero" style={{backgroundImage:`linear-gradient(90deg,rgba(4,3,2,.76),rgba(4,3,2,.32) 48%,rgba(4,3,2,.14)),url(${brandTheme.rooms.registry})`}}>
   <h1>Topluluk</h1><p>Q-GANG üyeleri ve topluluk kimlikleri.</p>
   <div><b>{people.length}<small>TOPLAM ÜYE</small></b></div>
  </section>
  <nav className="sectionTools lobbyCommunityTabs" aria-label="Topluluk bölümleri"><Link className="qgAction" aria-current={!q.manage&&q.view!=="schema"?"page":undefined} href="/topluluk">Üyeler</Link><Link className="qgAction" href="/yayinlar">Yayınlar</Link><Link className="qgAction" aria-current={!q.manage&&q.view==="schema"?"page":undefined} href="/topluluk?view=schema">Yönetim şeması</Link>{canViewManagement&&<Link className="qgAction" aria-current={q.manage?"page":undefined} href="/topluluk?manage=1">Üye yönetimi</Link>}</nav>
 {canViewManagement&&q.manage?(q.edit?<MemberProfileEditor params={Promise.resolve({id:q.edit})} searchParams={Promise.resolve(q)}/>:<CommunityManagement searchParams={Promise.resolve(q)}/>):<>
  {(birthdays??[]).length>0&&<section className="birthdayBanner"><span className="birthdaySigil">✦</span><div><small>BUGÜN TOPLULUKTA</small><h2>{(birthdays??[]).map((b:any)=>b.display_name).join(" · ")}</h2><p>{(birthdays??[]).length===1?"Bugün doğum günü. Nice yıllara!":"Bugün doğum günlerini kutluyoruz. Nice yıllara!"}</p></div></section>}{q.view==="schema"?<CommunityOrgChart people={people}/>:people.length?<ul className="lobbyMemberList">{[...people].sort((a,b)=>(a.display_name||a.handle).localeCompare(b.display_name||b.handle,"tr")).map(p=><li key={p.id}><Link href={"/u/"+p.handle}><span className="lobbyMemberAvatar">{p.avatar_url?<img src={thumbnail(p.avatar_url,128)} alt="" width={44} height={44} loading="lazy" decoding="async"/>:(p.display_name||p.handle||"Q").slice(0,1).toLocaleUpperCase("tr-TR")}</span><span><strong>{p.display_name||p.handle}</strong><small>@{p.handle}</small></span></Link></li>)}</ul>:<p>Henüz üye kaydı yok.</p>}
 </>}
 </div></AppShell>
}