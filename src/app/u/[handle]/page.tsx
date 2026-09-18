import {RankInsignia} from "@/components/RankInsignia";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {notFound} from "next/navigation";
import "../../profile-public.css";
export const dynamic="force-dynamic";

export default async function PublicProfile({params}:{params:Promise<{handle:string}>}){
 const {handle}=await params;
 const s=await createClient();
 const {data:p}=await s.from("profiles").select("id,display_name,handle,bio,role,created_at").eq("handle",handle.toLowerCase()).maybeSingle();
 if(!p)notFound();
 const {data:membership}=await s.from("community_memberships").select("status,member_no,joined_at").eq("user_id",p.id).eq("status","active").maybeSingle();
 const {data:accounts}=await s.from("connected_accounts").select("provider,provider_handle,profile_url").eq("user_id",p.id).in("provider",["steam","discord"]);
 const role=({founder:"LİDER",admin:"VEKİLHARÇ",moderator:"KAPTAN",community:"TEĞMEN",member:"ÜYE"} as Record<string,string>)[p.role]??p.role.toUpperCase();
 return <AppShell right={false}><main className="playerProfile"><section className="playerIdentity"><div className="playerIdentityTop"><span>Q-GANG · ÜYE KİMLİĞİ</span><b>{membership?"TOPLULUK #"+String(membership.member_no).padStart(3,"0"):"Q-GANG"}</b></div><div className="playerIdentityMain"><div className="playerIdentityAvatar">{p.display_name.slice(0,1).toUpperCase()}</div><div className="playerIdentityCopy"><small>Q-GANG TOPLULUĞU</small><h1>{p.display_name}</h1><span>@{p.handle}</span><div className="playerIdentityBadges">{membership&&<span>TOPLULUK ÜYESİ</span>}<span className="playerRankBadge"><RankInsignia role={p.role} size="sm"/>{role}</span></div></div></div></section><div className="playerProfileGrid"><div className="playerProfileMain"><section className="playerPanel"><div className="playerPanelHead"><div><small>KİMLİK</small><h2>Hakkında</h2></div></div><p className="playerBio">{p.bio||"Henüz kendisi hakkında bir bilgi eklemedi."}</p></section></div><aside className="playerProfileSide"><section className="playerPanel"><div className="playerPanelHead"><div><small>BAĞLI HESAPLAR</small><h2>Kimlikler</h2></div></div><div className="playerAccounts">{(accounts??[]).map((a:any)=>{const name=a.provider==="steam"?"Steam":a.provider==="discord"?"Discord":a.provider;return a.profile_url?<a className="playerAccount" href={a.profile_url} target="_blank" rel="noreferrer" key={a.provider}><div><b>{name}</b><span>{a.provider_handle||"Bağlı hesap"}</span></div><span>Aç ↗</span></a>:<div className="playerAccount" key={a.provider}><div><b>{name}</b><span>{a.provider_handle||"Bağlı hesap"}</span></div><span>Bağlı</span></div>})}{!(accounts??[]).length&&<div className="playerAccountLocked">Henüz bağlı hesap bulunmuyor.</div>}</div></section></aside></div></main></AppShell>
}