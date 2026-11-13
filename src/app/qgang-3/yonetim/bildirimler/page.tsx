import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"Bildirimler · Karargâh"};
export default async function Notices(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/yonetim/bildirimler");
 const db=await createClient();
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 const {data:m}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!m||p?.is_suspended||!["founder","admin","moderator","creator"].includes(p?.role??""))redirect("/qgang-3");
 const canEvents=["founder","admin","moderator"].includes(p?.role);
 const canDecisions=canEvents;

 const [{count:drafts},{count:upcoming}]= await Promise.all([
 canDecisions?db.from("qgang_decisions").select("id",{count:"exact",head:true}).eq("status","draft"):Promise.resolve({count:0}),
 canEvents?db.from("community_events").select("id",{count:"exact",head:true}).eq("status","published").gte("starts_at",new Date().toISOString()):Promise.resolve({count:0})
 ]);
 const notices=[...(canDecisions?[{label:"Karar taslakları",count:drafts??0,href:"/qgang-3/yonetim/kararlar",desc:"Yönetimdeki taslak kararlar"}]:[]),...(canEvents?[{label:"Yaklaşan etkinlikler",count:upcoming??0,href:"/qgang-3/yonetim/etkinlikler",desc:"Planlanan faaliyetler"}]:[])];
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim">← KARARGÂH</Link><span>DURUM</span></header><h1>BİLDİRİMLER</h1><p>Güncel yönetim durumu · Otomatik mesaj gönderilmez</p><div className="qg-hq-links">{notices.map(n=><Link href={n.href} key={n.label}><strong>{n.label} · {n.count}</strong><small>{n.desc}</small><span>↗</span></Link>)}</div>{notices.length===0&&<p>Bu rütbeye atanmış yönetim bildirimi bulunmuyor.</p>}</div></main>;
}
