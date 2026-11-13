import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"Yayın Yönetimi · Q-GANG"};
export default async function PublicationManagement(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/yonetim/yayinlar");
 const db=await createClient();
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 const {data:m}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!m||p?.is_suspended||!["founder","admin","creator"].includes(p?.role??""))redirect("/qgang-3");
 const {data:publications}=await db.from("publications").select("id,title,slug,status,content_type,created_at,published_at").order("updated_at",{ascending:false}).limit(60);
 const drafts=(publications??[]).filter(x=>x.status!=="published").length;
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim">← KARARGÂH</Link><span>YAYINLAR</span></header><h1>YAYIN YÖNETİMİ</h1><p>{drafts} yayımlanmamış · {(publications??[]).length} içerik gösteriliyor</p><div className="qg-hq-links" style={{marginBottom:20}}><Link href="/studio"><strong>YAYIN STÜDYOSU</strong><small>Oluşturma ve düzenleme araçları</small><span>↗</span></Link></div><section className="qg-hq-panel"><h2>SON İÇERİKLER</h2>{publications?.length?publications.map(x=><article key={x.id} className="qg-hq-entry"><div><strong>{x.title}</strong><span>{x.status}</span></div><p>{x.content_type} · {new Date(x.created_at).toLocaleDateString("tr-TR")}</p><small>{x.status==="published"?"Yayında":"Taslak / işlem bekliyor"} · <Link href="/studio">Stüdyoya git ↗</Link></small></article>):<p>Yayın kaydı bulunamadı.</p>}</section></div></main>;
}
