import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import SanctionForm from "./SanctionForm";
import "../karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"Yaptırımlar · Q-GANG"};
const kinds:Record<string,string>={warning:"Uyarı",reprimand:"Kınama",temporary_restriction:"Geçici yararlanamama",demotion:"Rütbe düşürme",removal_from_office:"Görevden alma",expulsion:"Üyelikten çıkarma"};
export default async function Sanctions(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/yonetim/yaptirimlar");
 const db=await createClient();
 const {data:p}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 const {data:m}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!m||p?.is_suspended||p?.role!=="founder")redirect("/qgang-3");
 const {data:active}=await db.from("community_memberships").select("user_id").eq("status","active");
 const ids=(active??[]).map(x=>x.user_id).filter(id=>id!==user.id);
 const {data:people}=ids.length?await db.from("profiles").select("id,handle").in("id",ids).eq("is_suspended",false):{data:[]};
 const members=(people??[]).sort((a,b)=>(a.handle??"").localeCompare(b.handle??"","tr"));
 const {data:recent}=await db.from("qgang_sanctions").select("id,member_id,kind,reason,duration_days,issued_at").order("issued_at",{ascending:false}).limit(30);
 const names=new Map(members.map(x=>[x.id,x.handle]));
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim">← KARARGÂH</Link><span>YAPTIRIMLAR</span></header><h1>YAPTIRIMLAR</h1><div className="qg-hq-grid"><section className="qg-hq-panel"><h2>YENİ YAPTIRIM</h2><SanctionForm members={members}/></section><section className="qg-hq-panel"><h2>SON İŞLEMLER</h2>{recent?.length?recent.map(x=><article className="qg-hq-entry" key={x.id}><div><strong>{names.get(x.member_id)??"Üye"}</strong><span>{kinds[x.kind]??x.kind}{x.duration_days?" · "+x.duration_days+" gün":""}</span></div><p>{x.reason}</p><small>{new Date(x.issued_at).toLocaleDateString("tr-TR")}</small></article>):<p>Henüz yaptırım kaydı yok.</p>}</section></div></div></main>;
}
