import {thumbnail} from "@/lib/presentation-image";
import {CommunityManagement} from "@/components/CommunityManagement";
import {MemberProfileEditor} from "@/components/MemberProfileEditor";
import {getPermissions,allows} from "@/lib/permissions";
import Link from "next/link";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {pageMeta} from "@/lib/design";
import {RankInsignia} from "@/components/RankInsignia";
import {roleLabel} from "@/lib/roles";
export const dynamic="force-dynamic";
export const metadata=pageMeta.members;
export default async function Members({searchParams}:{searchParams:Promise<{manage?:string;view?:string;member?:string;edit?:string;error?:string;saved?:string;role?:string;era_changed?:string;era_error?:string;deleted?:string;delete_error?:string;legacy_linked?:string;legacy_error?:string;badge_catalog?:string}>}){
 const q=await searchParams;const {permissions}=await getPermissions();const canViewManagement=allows(permissions,"members.manage");
 const s=await createClient();
 const {data}=await s.rpc("list_active_community_members");
 const people=data??[];
 return <AppShell right={false}><div className="communityPage clanMembersPage">
  <section className="clanSubpageHero">
   <h1>Üyeler</h1><p>Topluluk mensupları, profilleri ve rütbeleri.</p>
  </section>
  {canViewManagement&&<nav className="sectionTools lobbyCommunityTabs" aria-label="Üye yönetimi"><Link className="qgAction" aria-current={q.manage?"page":undefined} href="/topluluk?manage=1">Üye yönetimi</Link></nav>}
 {canViewManagement&&q.manage?(q.edit?<MemberProfileEditor params={Promise.resolve({id:q.edit})} searchParams={Promise.resolve(q)}/>:<CommunityManagement searchParams={Promise.resolve(q)}/>):<>
  {people.length?<ul className="lobbyMemberList">{[...people].sort((a,b)=>(a.display_name||a.handle).localeCompare(b.display_name||b.handle,"tr")).map(p=><li key={p.id}><Link href={"/u/"+p.handle}><span className="lobbyMemberAvatar">{p.avatar_url?<img src={thumbnail(p.avatar_url,128)} alt="" width={44} height={44} loading="lazy" decoding="async"/>:(p.display_name||p.handle||"Q").slice(0,1).toLocaleUpperCase("tr-TR")}</span><span className="lobbyMemberCopy"><strong>{p.display_name||p.handle}</strong><small>@{p.handle}</small><span className="lobbyMemberRank"><RankInsignia role={p.role} size="sm"/>{roleLabel(p.role)}</span></span></Link></li>)}</ul>:<p>Henüz üye kaydı yok.</p>}
 </>}
 </div></AppShell>
}
