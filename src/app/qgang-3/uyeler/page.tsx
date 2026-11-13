import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "../preview.css";
export const dynamic="force-dynamic";
export const metadata={title:"Topluluk ve Hiyerarşi"};
const roles:Record<string,string>={founder:"LİDER",admin:"VEKİLHARÇ",moderator:"KAPTAN",creator:"TEĞMEN",member:"ÜYE"};
export default async function Members(){
 const u=await getCurrentUser();if(!u)redirect("/login?next=/qgang-3/uyeler");
 const db=await createClient();const {data:m}=await db.from("community_memberships").select("status").eq("user_id",u.id).eq("status","active").maybeSingle();
 if(!m)redirect("/qgang-3/basvuru");
 const {data:members}=await db.from("community_memberships").select("user_id,joined_at").eq("status","active").order("joined_at");
 const ids=(members??[]).map(m=>m.user_id);
 const {data:people}=ids.length?await db.from("profiles").select("id,handle,role,avatar_url").in("id",ids):{data:[]};
 const order=["founder","admin","moderator","creator","member"];
 const sorted=[...(people??[])].sort((a,b)=>order.indexOf(a.role)-order.indexOf(b.role)||a.handle.localeCompare(b.handle,"tr"));
 return <main className="qg3"><div className="qg3-content"><p><Link href="/">← Ana sayfa</Link></p><h1>TOPLULUK</h1><p>Q-GANG hiyerarşisi ve aktif üyeler</p><div className="qg3-archiveresults">{sorted.map(p=><article className="qg3-archiverow" key={p.id}><span className="qg3-archivetype">{roles[p.role]??"ÜYE"}</span><div><h2>{p.handle}</h2></div></article>)}</div></div></main>;
}