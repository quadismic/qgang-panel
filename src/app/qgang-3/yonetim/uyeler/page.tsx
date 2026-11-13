import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import MemberRows from "./MemberRows";
import "../karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"Üye Yönetimi · Q-GANG"};
export default async function Members(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/yonetim/uyeler");
 const db=await createClient();
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 const {data:membership}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!membership||p?.role!=="founder"||p.is_suspended)redirect("/qgang-3");
 const {data:active}=await db.from("community_memberships").select("user_id").eq("status","active");
 const ids=(active??[]).map(x=>x.user_id);
 const {data:profiles}=ids.length?await db.from("profiles").select("id,handle,role").in("id",ids):{data:[]};
 const members=(profiles??[]).sort((a,b)=>(a.handle??"").localeCompare(b.handle??"","tr"));
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim">← KARARGÂH</Link><span>ÜYELER</span></header><h1>ÜYE YÖNETİMİ</h1><p>{members.length} aktif üye · Rütbe işlemleri</p><section className="qg-hq-panel"><MemberRows members={members}/></section></div></main>;
}
