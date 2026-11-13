import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"EXP ve Rozetler · Karargâh"};
export default async function ExpManagement(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/yonetim/exp");
 const db=await createClient();
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 const {data:m}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!m||p?.is_suspended||!["founder","admin"].includes(p?.role??""))redirect("/qgang-3");
 const {data:recent}=await db.from("operator_special_tasks").select("id,title,exp_amount,created_at,user_id").order("created_at",{ascending:false}).limit(12);
 const ids=[...new Set((recent??[]).map(x=>x.user_id))];
 const {data:profiles}=ids.length?await db.from("profiles").select("id,handle").in("id",ids):{data:[]};
 const names=new Map((profiles??[]).map(x=>[x.id,x.handle]));
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim">← KARARGÂH</Link><span>İLERLEME</span></header><h1>EXP VE ROZETLER</h1><p>Kişisel ilerleme · Kozmetik ödüller · Sıralama yok</p><div className="qg-hq-links"><Link href="/qgang-3/arsiv/exp"><strong>EXP KAYITLARI</strong><small>Üye ve kazanım türüne göre geçmiş</small><span>↗</span></Link>{p?.role==="founder"&&<Link href="/qgang-3/yonetim/ozel-gorev"><strong>ÖZEL GÖREV ÖDÜLÜ</strong><small>Gerekçeli 25–100 EXP</small><span>↗</span></Link>}<Link href="/qgang-3/yonetim/exp/rozetler"><strong>ROZET YÖNETİMİ</strong><small>Takdir, tanıma ve düzeltme</small><span>↗</span></Link><Link href="/qgang-3/profil"><strong>OPERATÖR DOSYASI</strong><small>Seviye ve kozmetik kazanımlar</small><span>↗</span></Link></div><section className="qg-hq-panel"><h2>SON ÖZEL GÖREV ÖDÜLLERİ</h2>{recent?.length?recent.map(x=><article key={x.id} className="qg-hq-entry"><div><strong>{x.title}</strong><span>+{x.exp_amount} EXP</span></div><p>{names.get(x.user_id)??"Üye"} · {new Date(x.created_at).toLocaleDateString("tr-TR")}</p></article>):<p>Henüz özel görev ödülü yok.</p>}</section></div></main>;
}
