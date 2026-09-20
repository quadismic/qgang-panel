import Link from "next/link";
import {RankInsignia} from "@/components/RankInsignia";
import {AppShell} from "@/components/AppShell";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import {eraLabel} from "@/lib/identity";
import {roleLabel} from "@/lib/roles";
import "../profile-public.css";
export const dynamic="force-dynamic";

export default async function Profile(){
 const s=await createClient();
 const user=await getCurrentUser();
 if(!user)redirect("/login?next=/profile");
 const [{data:p},{data:membership},{data:accounts}]=await Promise.all([
  s.from("profiles").select("display_name,handle,bio,avatar_url,role,qgang_era,qgang_seal,onboarding_completed_at").eq("id",user.id).maybeSingle(),
  s.from("community_memberships").select("member_no,status").eq("user_id",user.id).eq("status","active").maybeSingle(),
  s.from("connected_accounts").select("provider,provider_handle,profile_url").eq("user_id",user.id).in("provider",["google","steam"])
 ]);
 if(!p)redirect("/onboarding?next=/profile");
 if(!p.onboarding_completed_at)redirect("/onboarding?next=/profile");
 const role=roleLabel(p.role);
 return <AppShell right={false}><main className="playerProfile profileV2"><section className="playerIdentity profileV2Hero"><div className="playerIdentityTop"><span>Q-GANG · KİMLİK</span><b>{p.qgang_seal?`${eraLabel(p.qgang_era)} · ${p.qgang_seal}`:"KİMLİK BEKLENİYOR"}</b></div><div className="playerIdentityMain"><div className="playerIdentityAvatar">{p.avatar_url?<img src={p.avatar_url} alt="" referrerPolicy="no-referrer"/>:p.display_name.slice(0,1).toUpperCase()}</div><div className="playerIdentityCopy"><small>{membership?"TOPLULUK #"+String(membership.member_no).padStart(3,"0"):"Q-GANG"}</small><h1>{p.display_name}</h1><span>@{p.handle}</span><div className="playerIdentityBadges"><span className="playerRankBadge"><RankInsignia role={p.role} size="sm"/>{role}</span>{membership&&<span className="playerStatusBadge">AKTİF ÜYE</span>}</div></div><div className="playerConnect"><Link className="button" href="/settings">Kimliği Düzenle</Link></div></div></section><div className="playerProfileGrid profileV2Grid"><div className="playerProfileMain profileV2Main"><section className="playerPanel"><div className="playerPanelHead"><div><small>KİMLİK</small><h2>Hakkında</h2></div></div><p className="playerBio">{p.bio||"Henüz bir açıklama eklenmedi."}</p></section><section className="playerPanel playerDossier profileV2Dossier"><div className="playerPanelHead"><div><small>Q-GANG KAYDI</small><h2>Kimlik Bilgileri</h2></div></div><div className="playerDossierGrid"><div><span>Rütbe</span><b>{role}</b></div><div><span>Dönem</span><b>{eraLabel(p.qgang_era)}</b></div><div><span>Mühür</span><b>{p.qgang_seal||"—"}</b></div><div><span>Üyelik</span><b>{membership?`#${String(membership.member_no).padStart(3,"0")}`:"—"}</b></div></div></section></div><aside className="playerProfileSide profileV2Side"><section className="playerPanel profileV2AccountsPanel"><div className="playerPanelHead"><div><small>BAĞLI HESAPLAR</small><h2>Kimlikler</h2></div></div><div className="playerAccounts">{(accounts??[]).map((a:any)=><div className="playerAccount" key={a.provider}><span className={`playerProviderIcon provider-${a.provider}`} aria-hidden="true">{a.provider==="steam"?"S":"G"}</span><div><b>{a.provider==="steam"?"Steam":"Google"}</b><span>{a.provider_handle||"Bağlı"}</span></div><span>Aktif</span></div>)}</div><div className="accountLinks" style={{marginTop:12}}><Link href="/account">Hesap Merkezi <span>→</span></Link></div></section></aside></div></main></AppShell>
}