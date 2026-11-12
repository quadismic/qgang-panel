import Link from "next/link";
import {redirect} from "next/navigation";
import {Inter} from "next/font/google";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../preview.css";
const inter=Inter({subsets:["latin"],display:"swap",variable:"--font-qgang-modern"});
export const dynamic="force-dynamic";
export const metadata={title:"Üyelik değerlendirmesi · Q-GANG"};
export default async function PendingMembership(){
 const user=await getCurrentUser();
 if(!user)redirect("/login?next=/qgang-3");
 const s=await createClient();
 const [{data:p},{data:m}]=await Promise.all([
  s.from("profiles").select("onboarding_completed_at,handle,is_suspended").eq("id",user.id).maybeSingle(),
  s.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle()
 ]);
 if(!p?.onboarding_completed_at)redirect("/onboarding?next=/qgang-3");
 if(m&&!p.is_suspended)redirect("/qgang-3");
 return <main className={`qg3 ${inter.variable}`}><header className="qg3-header"><Link href="/qgang-3" className="qg3-brand"><span className="qg3-mark">◆</span><span>Q-GANG<small>KARDEŞLİK, DAİMA.</small></span></Link><Link className="qg3-login" href="/profil">Profilim</Link></header><section className="qg3-pending"><span className="qg3-pendingicon">◇</span><h1>{p.is_suspended?"Hesap erişiminiz sınırlandırıldı":"Üyelik değerlendirmesi"}</h1><p>{p.is_suspended?"Topluluk yönetimiyle iletişime geçebilirsiniz.":"Google hesabınız doğrulandı ve profiliniz oluşturuldu. Q-GANG üyeliğiniz yönetim tarafından kabul edildiğinde ana sayfa ve üyelere özel etkinlikler erişime açılacaktır."}</p><div className="qg3-pendingactions"><Link className="qg3-action" href="/profil">Profilimi görüntüle →</Link><Link className="qg3-login" href="/qgang-3">Durumu yeniden kontrol et</Link></div></section></main>;
}