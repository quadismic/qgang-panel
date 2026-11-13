import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import MemberRows from "./MemberRows";
import {admitMember} from "./admission";
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
 const {data:candidates}=await db.rpc("qgang_pending_membership_candidates");
 const members=(profiles??[]).sort((a,b)=>(a.handle??"").localeCompare(b.handle??"","tr"));
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim">← KARARGÂH</Link><span>ÜYELER</span></header><h1>ÜYE YÖNETİMİ</h1><p>{members.length} aktif üye · Rütbe işlemleri</p><section className="qg-hq-panel"><h2>ÜYELER</h2><MemberRows members={members}/></section><section className="qg-hq-panel" style={{marginTop:16}}><h2>DEĞERLENDİRME BEKLEYEN PROFİLLER · {candidates?.length??0}</h2><p style={{color:"#aab6c5",fontSize:12}}>Google hesabı doğrulanmış ve profilini tamamlamış kişiler. Bu liste üyelik başvurusu yapıldığını tek başına göstermez.</p>{candidates?.length?candidates.map((candidate:{id:string;handle:string|null;created_at:string})=><article className="qg-hq-entry" key={candidate.id}><strong>{candidate.handle??"Profil"}</strong><p>{new Date(candidate.created_at).toLocaleDateString("tr-TR")} · Üyelik onayı bekliyor</p><form action={admitMember} className="qg-admit-form"><input type="hidden" name="candidate" value={candidate.id}/><button type="submit">ÜYELİĞE KABUL ET</button></form></article>):<p>Bekleyen profil yok.</p>}</section></div></main>;
}
