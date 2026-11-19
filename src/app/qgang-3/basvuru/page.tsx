import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../../qgang-4.css";
export const dynamic="force-dynamic";
export const metadata={title:"Üyelik Durumu | Q-GANG"};
export default async function Pending(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/");
 const db=await createClient();const [{data:p},{data:m}]=await Promise.all([db.from("profiles").select("onboarding_completed_at,is_suspended").eq("id",user.id).maybeSingle(),db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle()]);
 if(!p?.onboarding_completed_at)redirect("/onboarding?next=/");if(m&&!p.is_suspended)redirect("/");
 return <main className="q4"><div className="q4-wrap"><header className="q4-head"><div><h1>Q-GANG<span className="q4-dot">.</span></h1><p>KLÂN SİCİLİ / 4.0</p></div></header><section className="q4-section"><div className="q4-sectionhead"><h2>ÜYELİK DURUMU</h2></div><p className="q4-muted">{p?.is_suspended?"Hesabınızın erişimi sınırlandırılmıştır.":"Üyelik kaydınız yönetim onayı bekliyor."}</p><p><Link href="/" style={{color:"#e8e9ec"}}>DURUMU YENİDEN KONTROL ET →</Link></p></section></div></main>;
}