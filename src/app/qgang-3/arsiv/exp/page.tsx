import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "./exp.css";
export const dynamic="force-dynamic";
export const metadata={title:"EXP Kayıtları · Q-GANG Arşiv"};
type Props={searchParams:Promise<{member?:string;category?:string;page?:string}>};
const categories:Record<string,string>={all:"Tüm kazanımlar",event_attendance:"Etkinlik katılımı",event_organizer:"Organizatörlük",publication:"Yayın",membership_anniversary:"Üyelik kıdemi",special_task:"Özel görev",correction:"Düzeltme",legacy_import:"Eski kayıt"};
const fmt=(v:string)=>new Intl.DateTimeFormat("tr-TR",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/Istanbul"}).format(new Date(v));
export default async function ExpArchive({searchParams}:Props){
 const params=await searchParams;
 const user=await getCurrentUser();if(!user)redirect("/login?next=/qgang-3/arsiv/exp");
 const db=await createClient();
 const {data:profile}=await db.from("profiles").select("role,is_suspended,onboarding_completed_at,handle").eq("id",user.id).maybeSingle();
 if(!profile?.onboarding_completed_at)redirect("/onboarding?next=/qgang-3/arsiv/exp");
 const {data:membership}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!membership||profile.is_suspended||profile.role==="guest")redirect("/qgang-3");
 const canInspect=profile.role==="founder"||profile.role==="admin";
 const category=params.category&&categories[params.category]?params.category:"all";
 const page=Math.min(100,Math.max(1,Number.parseInt(params.page??"1",10)||1));
 const selected=canInspect&&params.member&&/^[0-9a-f-]{36}$/i.test(params.member)?params.member:user.id;
 let members:{id:string;handle:string|null}[]=[];
 if(canInspect){
  const {data:active}=await db.from("community_memberships").select("user_id").eq("status","active");
  const ids=(active??[]).map(m=>m.user_id);
  if(ids.length){const {data:people}=await db.from("profiles").select("id,handle").in("id",ids).eq("is_suspended",false);members=(people??[]).sort((a,b)=>(a.handle??"").localeCompare(b.handle??"","tr"));}
 }
 const validTarget=!canInspect||selected===user.id||members.some(m=>m.id===selected);
 const target=validTarget?selected:user.id;
 const {data:entries,error}=await db.rpc("operator_exp_archive",{p_user_id:target,p_source_type:category==="all"?null:category,p_limit:51,p_offset:(page-1)*50});
 const rows=(entries??[]).slice(0,50);const hasNext=(entries??[]).length>50;
 const targetName=target===user.id?profile.handle:members.find(m=>m.id===target)?.handle;
 const total=rows.reduce((sum:number,item:{exp_delta:number})=>sum+item.exp_delta,0);
 const qs=(newPage:number)=>"/qgang-3/arsiv/exp?"+new URLSearchParams({member:target,category,page:String(newPage)}).toString();
 return <main className="qg-exp-archive"><div className="qg-exp-shell"><header><Link href="/qgang-3/arsiv">← ARŞİV</Link><span>Q-GANG / OPERATÖR KAYITLARI</span><Link href="/qgang-3/profil">DOSYAM</Link></header><h1>EXP <em>GEÇMİŞİ</em></h1><p className="qg-exp-intro">Doğrulanmış kazanımların değiştirilemez kayıt geçmişi. Bu ekran bir üye sıralaması değildir.</p>
 <form action="/qgang-3/arsiv/exp" method="get" className="qg-exp-filters">
 <label>OPERATÖR{canInspect?<select name="member" defaultValue={target}>{members.map(m=><option key={m.id} value={m.id}>{m.handle??"Üye"}</option>)}</select>:<div className="qg-exp-readonly">{profile.handle??"OPERATÖR"}</div>}</label>
 <label>KAZANIM TÜRÜ<select name="category" defaultValue={category}>{Object.entries(categories).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
 <button type="submit">KAYITLARI SORGULA</button></form>
 <section className="qg-exp-results"><div className="qg-exp-resultshead"><div><small>SEÇİLEN OPERATÖR</small><h2>{targetName??"OPERATÖR"}</h2></div><div><small>BU SAYFADAKİ NET EXP</small><strong>{total>=0?"+":""}{total.toLocaleString("tr-TR")}</strong></div></div>
 {error?<p role="alert">Kayıtlar yüklenemedi. Lütfen yeniden deneyin.</p>:rows.length?rows.map((entry:{id:string;source_type:string;reason:string;awarded_at:string;exp_delta:number})=><article key={entry.id}><div><span className="qg-exp-category">{categories[entry.source_type]??entry.source_type}</span><p>{entry.reason}</p><time dateTime={entry.awarded_at}>{fmt(entry.awarded_at)}</time></div><strong className={entry.exp_delta<0?"negative":""}>{entry.exp_delta>0?"+":""}{entry.exp_delta} EXP</strong></article>):<p className="qg-exp-empty">Bu sorguya uygun EXP kaydı bulunamadı.</p>}
 <nav className="qg-exp-pagination">{page>1?<Link href={qs(page-1)}>← ÖNCEKİ</Link>:<span/>}<span>SAYFA {page}</span>{hasNext?<Link href={qs(page+1)}>SONRAKİ →</Link>:<span/>}</nav></section></div></main>;
}
