import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {manageBadge} from "./actions";
import "../../karargah.css";
export const dynamic="force-dynamic";
export const metadata={title:"Rozet Yönetimi · Karargâh"};
export default async function Badges(){
 const u=await getCurrentUser();if(!u)redirect("/login?next=/qgang-3/yonetim/exp/rozetler");
 const s=await createClient();
 const {data:p}=await s.from("profiles").select("role,is_suspended").eq("id",u.id).maybeSingle();
 const {data:m}=await s.from("community_memberships").select("status").eq("user_id",u.id).eq("status","active").maybeSingle();
 if(!m||p?.is_suspended||!["founder","admin"].includes(p?.role??""))redirect("/qgang-3");
 const [{data:badges},{data:active},{data:awards}]=await Promise.all([s.from("badges").select("id,name,slug,norm_type,active").eq("active",true).order("sort_order"),s.from("community_memberships").select("user_id").eq("status","active"),s.from("profile_badges").select("id,user_id,badge_id,reason,granted_at").is("revoked_at",null).order("granted_at",{ascending:false}).limit(60)]);
 const ids=(active??[]).map(x=>x.user_id);
 const {data:people}=ids.length?await s.from("profiles").select("id,handle").in("id",ids):{data:[]};
 const names=new Map((people??[]).map(x=>[x.id,x.handle]));
 const badgeNames=new Map((badges??[]).map(x=>[x.id,x.name]));
 const allowed=(badges??[]).filter(x=>x.norm_type==="discretionary"||(p.role==="founder"&&x.norm_type==="high_honor")||x.norm_type==="historical"||x.norm_type==="achievement");
 return <main className="qg-hq"><div className="qg-hq-shell"><header><Link href="/qgang-3/yonetim/exp">← EXP VE ROZETLER</Link><span>ROZETLER</span></header><h1>ROZET YÖNETİMİ</h1><p>Takdir ve tarihsel kayıtlar · Gerekçeli işlemler</p><section className="qg-hq-panel"><h2>ROZET İŞLEMİ</h2><form action={manageBadge} className="qg-sanction-form"><label>ÜYE<select name="user" required>{(people??[]).map(x=><option key={x.id} value={x.id}>{x.handle}</option>)}</select></label><label>ROZET<select name="badge" required>{allowed.map(x=><option key={x.id} value={x.id}>{x.name} ({x.norm_type})</option>)}</select></label><label>İŞLEM<select name="action"><option value="award">Takdir et</option><option value="recognize">Tarihsel kazanımı tanı</option></select></label><label>GEREKÇE<input name="reason" minLength={3} maxLength={2000} required/></label><label>KANIT (Tarihsel tanıma için zorunlu)<textarea name="evidence" maxLength={2000}/></label><button type="submit">ROZET İŞLEMİNİ KAYDET</button></form></section><section className="qg-hq-panel" style={{marginTop:18}}><h2>SON ROZET KAYITLARI</h2>{awards?.length?awards.map(x=><article className="qg-hq-entry" key={x.id}><div><strong>{names.get(x.user_id)??"Üye"} · {badgeNames.get(x.badge_id)??"Rozet"}</strong><span>{new Date(x.granted_at).toLocaleDateString("tr-TR")}</span></div><p>{x.reason}</p><form action={manageBadge} className="qg-attendance-form"><input type="hidden" name="user" value={x.user_id}/><input type="hidden" name="award" value={x.id}/><input name="reason" required minLength={3} maxLength={2000} placeholder="Geri alma / düzeltme gerekçesi"/><input name="evidence" placeholder="Düzeltme kanıtı"/><button name="action" value="revoke">GERİ AL</button>{p.role==="founder"&&<button name="action" value="correct">DÜZELT</button>}</form></article>):<p>Rozet kaydı bulunamadı.</p>}</section></div></main>;
}