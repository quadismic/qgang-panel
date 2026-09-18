import Link from "next/link";
import {RankInsignia} from "@/components/RankInsignia";
import {AppShell} from "@/components/AppShell";
import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {eraLabel} from "@/lib/identity";
import "../profile-public.css";
export const dynamic="force-dynamic";

export default async function Profile(){
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)redirect("/login?next=/profile");
 const [{data:p},{data:membership},{data:accounts}]=await Promise.all([
  s.from("profiles").select("display_name,handle,bio,avatar_url,role,qgang_era,qgang_seal,onboarding_completed_at").eq("id",user.id).maybeSingle(),
  s.from("community_memberships").select("member_no,status").eq("user_id",user.id).eq("status","active").maybeSingle(),
  s.from("connected_accounts").select("provider,provider_handle,profile_url").eq("user_id",user.id).in("provider",["google","steam"])
 ]);
 if(!p)redirect("/onboarding?next=/profile");
 if(!p.onboarding_completed_at)redirect("/onboarding?next=/profile");
 const role=({founder:"LİDER",admin:"VEKİLHARÇ",moderator:"KAPTAN",community:"TEĞMEN",member:"ÜYE"} as Record<string,string>)[p.role]??String(p.role).toUpperCase();
 return <AppShell right={false}><main className="playerProfile"><section className="playerIdentity"><div className="playerIdentityTop"><span>Q-GANG · KİMLİK</span><b>{p.qgang_seal?`${eraLabel(p.qgang_era)} · ${p.qgang_seal}`:"KİMLİK BEKLENİYOR"}</b></div><div className="playerIdentityMain"><div className="playerIdentityAvatar">{p.avatar_url?<img src={p.avatar_url} alt="" referrerPolicy="no-referrer"/>:p.display_name.slice(0,1).toUpperCase()}</div><div className="playerIdentityCopy"><small>{membership?"TOPLULUK #"+String(membership.member_no).padStart(3,"0"):"Q-GANG"}</small><h1>{p.display_name}</h1><span>@{p.handle}</span><div className="playerIdentityBadges"><span className="playerRankBadge"><RankInsignia role={p.role} size="sm"/>{role}</span></div></div><div className="playerConnect"><Link className="button" href="/settings">Kimliği Düzenle</Link></div></div></section><div className="playerProfileGrid"><div className="playerProfileMain"><section className="playerPanel"><div className="playerPanelHead"><div><small>KİMLİK</small><h2>Hakkında</h2></div></div><p className="playerBio">{p.bio||"Henüz bir açıklama eklenmedi."}</p></section></div><aside className="playerProfileSide"><section className="playerPanel"><div className="playerPanelHead"><div><small>BAĞLI HESAPLAR</small><h2>Kimlikler</h2></div></div><div className="playerAccounts">{(accounts??[]).map((a:any)=><div className="playerAccount" key={a.provider}><div><b>{a.provider==="steam"?"Steam":"Google"}</b><span>{a.provider_handle||"Bağlı"}</span></div><span>Aktif</span></div>)}</div><div className="accountLinks" style={{marginTop:12}}><Link href="/account">Hesap Merkezi <span>→</span></Link></div></section></aside></div></main></AppShell>
}