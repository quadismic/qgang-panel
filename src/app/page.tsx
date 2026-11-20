import {SignOutButton} from "@/components/SignOutButton";
import {setRank,admit,award,addFund} from "./qgang4-actions";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "./qgang-4.css";
export const dynamic="force-dynamic";
export const metadata={title:"Q-GANG | Klan Sicili",description:"Q-GANG üyelik ve hiyerarşi sicili"};
type Person={id:string;handle:string|null;role:string|null;birthday_month:number|null;birthday_day:number|null;birthday_visibility:string|null};
type Ledger={user_id:string;exp_delta:number;reason:string|null;source_type:string;awarded_at:string};
const order=["founder","admin","moderator","creator","member"];
const names:Record<string,string>={founder:"LİDER",admin:"VEKİLHARÇ",moderator:"KAPTAN",creator:"TEĞMEN",member:"ÜYE"};
const rankColor:Record<string,string>={founder:"#d5d5d5",admin:"#d66a72",moderator:"#72a8e6",creator:"#7bbf95",member:"#d6ba6b"};
const fmt=(n:number)=>new Intl.NumberFormat("tr-TR").format(n);
const day=(s:string)=>new Date(s).toLocaleDateString("tr-TR",{timeZone:"Europe/Istanbul",day:"2-digit",month:"short",year:"numeric"});
export default async function Home(){
 const db=await createClient();const user=await getCurrentUser();
 if(!user)redirect("/login?next=/");
 const {data:self}=await db.from("profiles").select("onboarding_completed_at,is_suspended,role").eq("id",user.id).maybeSingle();
 if(!self?.onboarding_completed_at)redirect("/onboarding?next=/");
 const {data:membership}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!membership||self.is_suspended)redirect("/qgang-3/basvuru");
 const [{data:members},{data:permissions},{data:fund},{data:expRows}]=await Promise.all([
  db.from("community_memberships").select("user_id,joined_at").eq("status","active").order("joined_at"),
  db.from("role_permissions").select("role,permission,enabled").eq("enabled",true),
  db.from("fund_transactions").select("id,kind,amount,title,created_at,reversed_at").is("reversed_at",null).order("created_at",{ascending:false}).limit(1000),
  db.rpc("qgang_member_exp_history",{p_limit:500})
 ]);
 const ids=(members??[]).map(m=>m.user_id);
 const [{data:profiles},{data:progress}]=await Promise.all([
  ids.length?db.from("profiles").select("id,handle,role,birthday_month,birthday_day,birthday_visibility").in("id",ids):Promise.resolve({data:[]}),
  ids.length?db.from("operator_progress").select("user_id,total_exp").in("user_id",ids):Promise.resolve({data:[]})
 ]);
 const people=(profiles??[]) as Person[];
 const personById=new Map(people.map(p=>[p.id,p]));
 const joinById=new Map((members??[]).map(m=>[m.user_id,m.joined_at]));
 const expById=new Map((progress??[]).map(p=>[p.user_id,Number(p.total_exp??0)]));
 const permissionsByRole=new Map<string,string[]>();
 for(const p of permissions??[]){const current=permissionsByRole.get(p.role)??[];current.push(p.permission);permissionsByRole.set(p.role,current)}
 const ledger=(expRows??[]) as Ledger[];
 const istanbul=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Istanbul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const [year,month,date]=istanbul.split("-").map(Number);const today=Date.UTC(year,month-1,date);
 const birthdays=people.filter(p=>p.birthday_visibility==="community"&&p.birthday_month&&p.birthday_day).flatMap(p=>{
  const mm=Number(p.birthday_month),dd=Number(p.birthday_day);
  for(let y=year;y<=year+1;y++){const d=Date.UTC(y,mm-1,dd);const test=new Date(d);if(test.getUTCMonth()!==mm-1||test.getUTCDate()!==dd)continue;const days=Math.round((d-today)/86400000);if(days>=0&&days<30)return [{...p,days,dd,mm}];}
  return [];
 }).sort((a,b)=>a.days-b.days);
 const fundVisible=Array.isArray(fund);
 const income=(fund??[]).filter(f=>f.kind==="support").reduce((sum,f)=>sum+Number(f.amount??0),0);
 const expense=(fund??[]).filter(f=>f.kind==="expense").reduce((sum,f)=>sum+Number(f.amount??0),0);
 const totalExp=people.reduce((sum,p)=>sum+(expById.get(p.id)??0),0);
 const canManage=["founder","admin"].includes(self.role??"");
 const isFounder=self.role==="founder";
 const {data:candidates}=isFounder?await db.rpc("qgang_pending_membership_candidates"):{data:[]};
 return <main className="q4"><div className="q4-wrap">
  <header className="q4-head"><div><h1>Q-GANG<span className="q4-dot">.</span></h1><p>KLÂN SİCİLİ <span>/</span> 4.0</p></div><div className="q4-headtools"><span className="q4-online"><i/> AKTİF SİSTEM</span><SignOutButton/></div></header>
  <section className="q4-stats" aria-label="Topluluk özeti">
   <div><strong>{fmt(people.length)}</strong><span>AKTİF ÜYE</span></div>
   <div><strong>{fmt(totalExp)}</strong><span>TOPLAM EXP</span></div>
   <div><strong>{fmt(birthdays.length)}</strong><span>30 GÜNDE DOĞUM GÜNÜ</span></div>
   <div><strong>{fundVisible?fmt(income-expense)+" ₺":"—"}</strong><span>BÜTÇE BAKİYESİ</span></div>
  </section>
  <section className="q4-section" id="hiyerarsi"><div className="q4-sectionhead"><h2><em>01</em> HİYERARŞİ</h2><span>{people.length} ÜYE · 5 RÜTBE</span></div>
   {order.map((role,i)=>{const group=people.filter(p=>p.role===role).sort((a,b)=>(a.handle??"").localeCompare(b.handle??"","tr"));return <details className="q4-rank" key={role} open={i===0?true:undefined}><summary><span className="q4-rankmark" style={{background:rankColor[role]}}/><b>{names[role]}</b><span>{group.length} ÜYE</span><span className="q4-expand">+</span></summary><div className="q4-rankbody"><p className="q4-permissions">YETKİLER · {(permissionsByRole.get(role)??[]).join(" · ")||"Temel üyelik ve görüntüleme"}</p>{group.length?group.map(p=><details className="q4-person" key={p.id}><summary><b>{p.handle??"Üye"}</b><span>{fmt(expById.get(p.id)??0)} EXP</span><span className="q4-expand">+</span></summary><div className="q4-personbody"><p>ÜYELİK: {joinById.get(p.id)?day(joinById.get(p.id)!):"—"}</p><p>RÜTBE: {names[role]}</p><p>EXP: {fmt(expById.get(p.id)??0)}</p><p>KAZANIM GEÇMİŞİ</p>{ledger.filter(e=>e.user_id===p.id).slice(0,30).map((e,i)=><div className="q4-ledger" key={i}><span>{e.reason??e.source_type} · {day(e.awarded_at)}</span><b>{e.exp_delta>0?"+":""}{e.exp_delta}</b></div>)}{!ledger.some(e=>e.user_id===p.id)&&<p>Gösterilecek EXP hareketi yok.</p>}{isFounder&&p.role!=="founder"&&<details className="q4-edit"><summary>RÜTBE DÜZENLE</summary><form action={setRank}><input type="hidden" name="member" value={p.id}/><select name="role" defaultValue={p.role??"member"}>{order.filter(r=>r!=="founder").map(r=><option key={r} value={r}>{names[r]}</option>)}</select><button type="submit">KAYDET</button></form></details>}</div></details>):<p className="q4-muted">Bu rütbede aktif üye yok.</p>}</div></details>})}
  </section>
  <section className="q4-section" id="dogum-gunleri"><div className="q4-sectionhead"><h2><em>02</em> DOĞUM GÜNLERİ</h2><span>ÖNÜMÜZDEKİ 30 GÜN</span></div>{birthdays.length?birthdays.map(p=><div className="q4-line" key={p.id}><b>{p.handle??"Üye"}</b><span>{String(p.dd).padStart(2,"0")}.{String(p.mm).padStart(2,"0")} · {p.days===0?"BUGÜN":p.days+" GÜN KALDI"}</span></div>):<p className="q4-muted">Önümüzdeki 30 günde paylaşımı açık doğum günü bulunmuyor.</p>}</section>
  <section className="q4-section" id="exp"><div className="q4-sectionhead"><h2><em>03</em> EXP SİCİLİ</h2><span>KAZANIM KAYITLARI</span></div>{[...people].sort((a,b)=>(expById.get(b.id)??0)-(expById.get(a.id)??0)).map(p=><details className="q4-person q4-exprow" key={p.id}><summary><b>{p.handle??"Üye"}</b><span>{fmt(expById.get(p.id)??0)} EXP</span><span className="q4-expand">+</span></summary><div className="q4-personbody">{ledger.filter(e=>e.user_id===p.id).slice(0,50).map((e,i)=><div className="q4-ledger" key={i}><span>{e.reason??e.source_type} · {day(e.awarded_at)}</span><b>{e.exp_delta>0?"+":""}{e.exp_delta}</b></div>)}{!ledger.some(e=>e.user_id===p.id)&&<p>Gösterilecek hareket bulunmuyor.</p>}</div></details>)}{isFounder&&<details className="q4-edit"><summary>ÖZEL GÖREV EXP VER</summary><form action={award}><select name="member" required>{people.map(p=><option key={p.id} value={p.id}>{p.handle??"Üye"}</option>)}</select><input name="title" placeholder="Görev başlığı (en az 5 karakter)" minLength={5} maxLength={160} required/><textarea name="reason" placeholder="Gerekçe (en az 15 karakter)" minLength={15} maxLength={2000} required/><input name="exp" type="number" min={25} max={100} defaultValue={25} required/><button type="submit">EXP KAYDET</button></form></details>}</section>
  <section className="q4-section" id="butce"><div className="q4-sectionhead"><h2><em>04</em> BÜTÇE</h2><span>GÜNCEL DURUM</span></div>{fundVisible?<><div className="q4-budget"><div><small>GELİR</small><strong>{fmt(income)} ₺</strong></div><div><small>GİDER</small><strong>{fmt(expense)} ₺</strong></div><div><small>BAKİYE</small><strong>{fmt(income-expense)} ₺</strong></div></div><details className="q4-person"><summary><b>İŞLEM GEÇMİŞİ</b><span>{fund?.length??0} KAYIT</span><span className="q4-expand">+</span></summary><div className="q4-personbody">{fund?.map(f=><div className="q4-ledger" key={f.id}><span>{f.title} · {day(f.created_at)}</span><b>{f.kind==="income"?"+":"−"}{fmt(Number(f.amount))} ₺</b></div>)}</div></details></>:<p className="q4-muted">Bütçe kayıtları için görüntüleme yetkiniz bulunmuyor.</p>}{canManage&&<details className="q4-edit"><summary>GELİR / GİDER EKLE</summary><form action={addFund}><select name="kind"><option value="support">GELİR</option><option value="expense">GİDER</option></select><input name="title" placeholder="İşlem açıklaması" required minLength={3}/><input name="amount" type="number" min="0.01" step="0.01" placeholder="Tutar (₺)" required/><button type="submit">KAYDET</button></form></details>}</section>
  {isFounder&&<section className="q4-section"><div className="q4-sectionhead"><h2><em>05</em> ÜYELİK ONAYI</h2><span>YETKİLİ İŞLEMİ</span></div>{(candidates??[]).length?(candidates??[]).map((c:{id:string;handle:string|null})=><div className="q4-line" key={c.id}><b>{c.handle??"Aday"}</b><form action={admit}><input type="hidden" name="candidate" value={c.id}/><button type="submit">KABUL ET</button></form></div>):<p className="q4-muted">Bekleyen aday yok.</p>}</section>}
  <footer className="q4-foot">Q-GANG <span>4.0</span></footer>
 </div></main>;
}