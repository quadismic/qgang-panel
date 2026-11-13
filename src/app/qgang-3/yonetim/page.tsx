import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "./karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"Karargâh · Q-GANG"};
export default async function Headquarters(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/yonetim");
 const db=await createClient();
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 const {data:m}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!m||p?.is_suspended||!["founder","admin","moderator","creator"].includes(p?.role??""))redirect("/qgang-3");
 const founder=p?.role==="founder";
 const links=[{name:"Üyeler",href:founder?"/qgang-3/yonetim/uyeler":"/topluluk",desc:"Üye listesi"},{name:"Etkinlikler",href:["founder","admin","moderator"].includes(p?.role??"")?"/qgang-3/yonetim/etkinlikler":"/etkinlikler",desc:"Faaliyetler"},{name:"Yayınlar",href:["founder","admin","creator"].includes(p?.role??"")?"/qgang-3/yonetim/yayinlar":"/yayinlar",desc:"İçerikler"},{name:"Kararlar",href:["founder","admin","moderator"].includes(p?.role??"")?"/qgang-3/yonetim/kararlar":"/qgang-3/kararlar",desc:"İcra kararları"},{name:"Arşiv",href:"/qgang-3/arsiv",desc:"Kayıtlar"},...(["founder","admin"].includes(p?.role??"")?[{name:"EXP ve Rozetler",href:"/qgang-3/yonetim/exp",desc:"Kişisel ilerleme"}]:[]),...(founder?[{name:"Yaptırımlar",href:"/qgang-3/yonetim/yaptirimlar",desc:"Ceza işlemleri"}]:[])];
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3">← ANA SAYFA</Link><span>KOMUTA MERKEZİ</span></header><h1>KARARGÂH</h1><p>Topluluk yönetimi. Tek merkez, hızlı erişim.</p><div className="qg-hq-links">{links.map(x=><Link key={x.name} href={x.href}><strong>{x.name}</strong><small>{x.desc}</small><span>↗</span></Link>)}</div></div></main>;
}
