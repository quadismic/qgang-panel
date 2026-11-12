import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {DecisionList} from "../DecisionList";
import {DecisionEditor} from "../DecisionEditor";
import "../preview.css";
export const dynamic="force-dynamic";
export const metadata={title:"İcra Kararları · Q-GANG"};
export default async function DecisionsPage(){
 const s=await createClient(),u=await getCurrentUser();
 if(!u)redirect("/login?next=/qgang-3/kararlar");
 const {data:p}=await s.from("profiles").select("role,is_suspended,onboarding_completed_at").eq("id",u.id).maybeSingle();
 if(!p?.onboarding_completed_at)redirect("/onboarding?next=/qgang-3/kararlar");
 const {data:m}=await s.from("community_memberships").select("status").eq("user_id",u.id).eq("status","active").maybeSingle();
 if(!m||p.is_suspended)redirect("/qgang-3/basvuru");
 const founder=p.role==="founder",deputy=p.role==="admin",canDraft=founder||deputy||p.role==="moderator";
 const [{data:decisions},{data:delegation},{data:deputyProfiles}]=await Promise.all([
  s.from("qgang_decisions").select("id,title,body,category,visibility,status,decision_year,decision_number,published_at,repeal_reason").order("created_at",{ascending:false}).limit(150),
  s.from("qgang_decision_delegations").select("deputy_id").is("revoked_at",null),
  founder?s.from("profiles").select("id,handle").eq("role","admin"):Promise.resolve({data:[]})
 ]);
 const canPublish=founder||(deputy&&(delegation??[]).some(d=>d.deputy_id===u.id));
 const deputies=(deputyProfiles??[]).map(d=>({id:d.id,handle:d.handle??"VEKİLHARÇ",delegated:(delegation??[]).some(x=>x.deputy_id===d.id)}));
 const published=(decisions??[]).filter(d=>d.status!=="draft");
 const drafts=(decisions??[]).filter(d=>d.status==="draft");
 return <main className="qg3 qg3-archivepage"><div className="qg3-content"><div className="qg3-archivehead"><Link href="/qgang-3">← Ana sayfa</Link><h1>İcra Kararları</h1><p>Q-GANG yönetiminin resmî kararları</p></div><section className="qg3-panel"><h2>Yayımlanan kararlar</h2><DecisionList items={published} manage canPublish={canPublish}/></section>{canDraft&&<section className="qg3-panel qg3-decisionmanagement"><h2>Taslaklar ve öneriler</h2><DecisionList items={drafts} manage canPublish={canPublish}/><DecisionEditor deputies={deputies} isFounder={founder}/></section>}</div></main>;
}
