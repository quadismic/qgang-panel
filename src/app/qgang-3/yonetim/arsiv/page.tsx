import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"Yönetim Arşivi · Karargâh"};
export default async function ManagementArchive(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/yonetim/arsiv");
 const db=await createClient();
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 const {data:m}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!m||p?.is_suspended||!["founder","admin","moderator","creator"].includes(p?.role??""))redirect("/qgang-3");
 const founder=p?.role==="founder";
 const {data:sanctions}=founder?await db.from("qgang_sanctions").select("id,member_id,kind,reason,issued_at,previous_role,target_role").order("issued_at",{ascending:false}).limit(40):{data:[]};
 const ids=[...new Set((sanctions??[]).map(s=>s.member_id))];
 const {data:people}=ids.length?await db.from("profiles").select("id,handle").in("id",ids):{data:[]};
 const names=new Map((people??[]).map(x=>[x.id,x.handle]));
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim">← KARARGÂH</Link><span>ARŞİV</span></header><h1>YÖNETİM ARŞİVİ</h1><p>Geçmiş kayıtlar · Yetkiye göre erişim</p><div className="qg-hq-links"><Link href="/qgang-3/arsiv"><strong>TOPLULUK ARŞİVİ</strong><small>Etkinlik, yayın ve karar geçmişi</small><span>↗</span></Link>{["founder","admin"].includes(p?.role)&&<Link href="/qgang-3/arsiv/exp"><strong>EXP KAYITLARI</strong><small>Doğrulanmış ilerleme geçmişi</small><span>↗</span></Link>}{founder&&<Link href="/qgang-3/yonetim/yaptirimlar"><strong>YAPTIRIMLAR</strong><small>Yeni işlem ve kayıtlar</small><span>↗</span></Link>}</div>{founder&&<section className="qg-hq-panel" style={{marginTop:20}}><h2>SON YAPTIRIMLAR</h2>{sanctions?.length?sanctions.map(s=><article key={s.id} className="qg-hq-entry"><div><strong>{names.get(s.member_id)??"Üye"}</strong><span>{s.kind}</span></div><p>{s.reason}</p><small>{new Date(s.issued_at).toLocaleDateString("tr-TR")}{s.target_role?" · "+s.previous_role+" → "+s.target_role:""}</small></article>):<p>Yaptırım kaydı yok.</p>}</section>}</div></main>;
}
