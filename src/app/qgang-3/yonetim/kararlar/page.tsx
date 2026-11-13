import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {DecisionList} from "../../DecisionList";
import {DecisionEditor} from "../../DecisionEditor";
import "../../preview.css";
import "../karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"İcra Kararları · Karargâh"};
export default async function DecisionManagement(){
 const s=await createClient(),u=await getCurrentUser();
 if(!u)redirect("/login?next=/qgang-3/yonetim/kararlar");
 const {data:p}=await s.from("profiles").select("role,is_suspended").eq("id",u.id).maybeSingle();
 const {data:m}=await s.from("community_memberships").select("status").eq("user_id",u.id).eq("status","active").maybeSingle();
 if(!m||p?.is_suspended||!["founder","admin","moderator"].includes(p?.role??""))redirect("/qgang-3");
 const founder=p?.role==="founder",deputy=p?.role==="admin";
 const [{data:decisions},{data:delegations},{data:deputyProfiles}]=await Promise.all([
 s.from("qgang_decisions").select("id,title,body,category,visibility,status,decision_year,decision_number,published_at,repeal_reason").order("created_at",{ascending:false}).limit(150),
 s.from("qgang_decision_delegations").select("deputy_id").is("revoked_at",null),
 founder?s.from("profiles").select("id,handle").eq("role","admin"):Promise.resolve({data:[]})
 ]);
 const canPublish=founder||(deputy&&(delegations??[]).some(d=>d.deputy_id===u.id));
 const deputies=(deputyProfiles??[]).map(d=>({id:d.id,handle:d.handle??"VEKİLHARÇ",delegated:(delegations??[]).some(x=>x.deputy_id===d.id)}));
 const drafts=(decisions??[]).filter(d=>d.status==="draft");
 const published=(decisions??[]).filter(d=>d.status!=="draft");
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim">← KARARGÂH</Link><span>KARARLAR</span></header><h1>İCRA KARARLARI</h1><p>{drafts.length} taslak · {published.length} kayıt · {canPublish?"Yayımlama yetkisi aktif":"Taslak hazırlama yetkisi"}</p><div className="qg3"><section className="qg3-panel"><h2>Taslaklar</h2><DecisionList items={drafts} manage canPublish={canPublish}/><DecisionEditor deputies={deputies} isFounder={founder}/></section><section className="qg3-panel"><h2>Yayımlanan kararlar</h2><DecisionList items={published} manage canPublish={canPublish}/></section></div></div></main>;
}
