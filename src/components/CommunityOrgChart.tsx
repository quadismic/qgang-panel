import Link from "next/link";
import {RankPortrait} from "@/components/RankPortrait";
import {RankInsignia} from "@/components/RankInsignia";
import {roleLabel} from "@/lib/roles";
type Person={id:string;role:string;handle:string;display_name:string;avatar_url?:string|null};
const order=["founder","admin","moderator","creator","member"];
export function CommunityOrgChart({people}:{people:Person[]}){
 const levels=order.map(role=>({role,people:people.filter(p=>p.role===role)})).filter(level=>level.people.length);
 return <section className="qgOrgChart" aria-label="Q-GANG topluluk hiyerarşisi">{levels.length?<div className="qgOrgLevels">{levels.map(level=><section className={"qgOrgLevel qgOrgLevel-"+level.role} key={level.role} aria-labelledby={"rank-"+level.role}><header><h2 id={"rank-"+level.role}>{roleLabel(level.role)}</h2><span>{level.people.length} kişi</span></header><ul className="qgOrgMembers">{level.people.map(p=><li key={p.id}><Link href={"/u/"+p.handle} className="qgOrgCard"><div className="qgOrgPortrait"><RankPortrait role={p.role} src={p.avatar_url} name={p.display_name||"Q"} size="card"/></div><div className="qgOrgIdentity"><strong>{p.display_name}</strong><small>@{p.handle}</small><span className="qgOrgRank"><RankInsignia role={p.role} size="sm"/><b>{roleLabel(p.role)}</b></span></div></Link></li>)}</ul></section>)}</div>:<div className="orgEmpty"><h2>Topluluk henüz oluşturulmadı.</h2><p>Üyeler katıldıkça burada görünecek.</p></div>}</section>;
}
