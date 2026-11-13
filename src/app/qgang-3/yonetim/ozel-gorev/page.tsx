import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import AwardForm from "./AwardForm";
import "./style.css";
export const dynamic="force-dynamic";
export const metadata={title:"Özel Görev EXP · Q-GANG"};
export default async function SpecialTaskAdmin(){
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/yonetim/ozel-gorev");
 const db=await createClient();
 const {data:profile}=await db.from("profiles").select("role,is_suspended").eq("id",user.id).maybeSingle();
 if(profile?.role!=="founder"||profile.is_suspended)redirect("/qgang-3");
 const {data:memberships}=await db.from("community_memberships").select("user_id").eq("status","active");
 const ids=(memberships??[]).map(m=>m.user_id);
 const {data:profiles}=ids.length?await db.from("profiles").select("id,handle").in("id",ids).eq("is_suspended",false):{data:[]};
 const members=(profiles??[]).sort((a,b)=>(a.handle??"").localeCompare(b.handle??"","tr"));
 const {data:recent}=await db.from("operator_special_tasks").select("id,title,justification,exp_amount,created_at,user_id").order("created_at",{ascending:false}).limit(15);
 const names=new Map(members.map(m=>[m.id,m.handle]));
 return <main className="qg-task-page"><div className="qg-task-shell"><header><Link href="/qgang-3">← Q-GANG</Link><span>LİDER / YÖNETİM</span></header><h1>ÖZEL GÖREV <em>EXP</em></h1><p>Doğrulanmış katkıları gerekçeli olarak ödüllendir. 25–100 EXP.</p><div className="qg-task-grid"><section><h2>YENİ ÖDÜL</h2><AwardForm members={members}/></section><section><h2>SON ONAYLAR</h2>{recent?.length?recent.map(item=><article key={item.id}><strong>{item.title}</strong><span>+{item.exp_amount} EXP · {names.get(item.user_id)??"Üye"}</span><p>{item.justification}</p><small>{new Date(item.created_at).toLocaleDateString("tr-TR")}</small></article>):<p>Henüz özel görev ödülü verilmedi.</p>}</section></div></div></main>;
}
