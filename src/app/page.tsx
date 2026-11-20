import {SignOutButton} from "@/components/SignOutButton";
import {setRank,admit,award,addFund,changeAccess,recordEvent} from "./qgang4-actions";
import {redirect} from "next/navigation";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import "./qgang-4.css";
export const dynamic="force-dynamic";
export const metadata={title:"Q-GANG | Klan Sicili",description:"Q-GANG üyelik ve hiyerarşi sicili"};
type Person={id:string;handle:string|null;role:string|null;birthday_month:number|null;birthday_day:number|null;birthday_visibility:string|null;joined_at:string|null};
type Ledger={user_id:string;exp_delta:number;reason:string|null;source_type:string;awarded_at:string};
const order=["founder","admin","moderator","creator","member"];
const names:Record<string,string>={founder:"LİDER",admin:"VEKİLHARÇ",moderator:"KAPTAN",creator:"TEĞMEN",member:"ÜYE"};
const rankColor:Record<string,string>={founder:"#111111",admin:"#dc4e60",moderator:"#438fe5",creator:"#36b978",member:"#f0c84e"};
const expTiers=[{name:"ÇAYLAK",min:0,max:499,color:"#9099a6"},{name:"MÜDAVİM",min:500,max:1499,color:"#74ad89"},{name:"KIDEMLİ",min:1500,max:2999,color:"#5a9fe6"},{name:"EMEKTAR",min:3000,max:4999,color:"#b28bdf"},{name:"EFSANE",min:5000,max:null,color:"#e5bd66"}] as const;
const expTier=(exp:number)=>[...expTiers].reverse().find(t=>exp>=t.min)??expTiers[0];
const fmt=(n:number)=>new Intl.NumberFormat("tr-TR").format(n);
const day=(s:string)=>new Date(s).toLocaleDateString("tr-TR",{timeZone:"Europe/Istanbul",day:"2-digit",month:"short",year:"numeric"});
export default async function Home(){
 const db=await createClient();const user=await getCurrentUser();
 if(!user)redirect("/login?next=/");
 const {data:self}=await db.from("profiles").select("onboarding_completed_at,is_suspended,role,handle").eq("id",user.id).maybeSingle();
 if(!self?.onboarding_completed_at)redirect("/onboarding?next=/");
 const {data:membership}=await db.from("community_memberships").select("status").eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!membership||self.is_suspended)redirect("/qgang-3/basvuru");
 const [{data:roster,error:rosterError},{data:permissions},{data:fund},{data:expRows}]=await Promise.all([
  db.rpc("qgang4_roster"),
  db.from("role_permissions").select("role,permission,enabled").eq("enabled",true),
  db.from("fund_transactions").select("id,kind,amount,title,created_at,reversed_at").is("reversed_at",null).order("created_at",{ascending:false}).limit(1000),
  db.rpc("qgang_member_exp_history",{p_limit:500})
 ]);
 if(rosterError)throw new Error("Üye listesi yüklenemedi: "+rosterError.message);
 const people=(roster??[]) as Person[];
 const personById=new Map(people.map(p=>[p.id,p]));
 const joinById=new Map(people.map(p=>[p.id,p.joined_at]));
 const {data:progress,error:progressError}=await db.rpc("qgang_member_exp_totals");
 if(progressError)throw new Error("EXP toplamları yüklenemedi: "+progressError.message);
 const expById=new Map(((progress??[]) as {user_id:string;total_exp:number}[]).map(p=>[p.user_id,Number(p.total_exp??0)]));
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
 const isFounder=self.role==="founder";
 const can=(permission:string)=>isFounder||(permissionsByRole.get(self.role??"")??[]).includes(permission);
 const canManage=can("budget.manage");
 const canEvent=can("events.manage")&&can("events.attendance");
 const panelPermissions=[["events.manage","ETKİNLİK KAYDI"],["events.attendance","KATILIM ONAYI"],["budget.view","BÜTÇE GÖRÜNTÜLEME"],["budget.manage","BÜTÇE YÖNETİMİ"],["members.manage","ÜYE YÖNETİMİ"]] as const;
 const {data:recentEvents}=await db.from("community_events").select("id,title,type_id,starts_at,status").order("starts_at",{ascending:false}).limit(8);
 const {data:candidates}=isFounder?await db.rpc("qgang_pending_membership_candidates"):{data:[]};
 return <main className="q4"><div className="q4-wrap">
  <header className="q4-head"><div><h1>Q-GANG<span className="q4-dot">.</span></h1><p>KLÂN SİCİLİ <span>/</span> 4.0</p></div><div className="q4-headtools"><span className="q4-online"><i/> AKTİF SİSTEM</span><SignOutButton/></div></header>
  <section className="q4-welcome"><span>HOŞ GELDİN,</span><h2>{self.handle??"ÜYE"}</h2></section>
  <section className="q4-section" id="hiyerarsi"><div className="q4-sectionhead"><h2><em>01</em> HİYERARŞİ</h2><span>{people.length} ÜYE · 5 RÜTBE</span></div>
   {order.map((role,i)=>{const group=people.filter(p=>p.role===role).sort((a,b)=>(a.handle??"").localeCompare(b.handle??"","tr"));return <details className="q4-rank" key={role} open={i===0?true:undefined}><summary><span className="q4-rankmark" style={{background:rankColor[role]}}/><b style={{color:role==="founder"?"#e8e9ec":rankColor[role]}}>{names[role]}</b><span>{group.length} ÜYE</span><span className="q4-expand">+</span></summary><div className="q4-rankbody">{group.length?group.map(p=><details className="q4-person" key={p.id} style={{borderLeft:`3px solid ${rankColor[role]}`}}><summary><div className="q4-memberid"><b>{p.handle??"Üye"}</b><small><span style={{color:rankColor[role]}}>{names[role]}</span><i> · </i><span style={{color:expTier(expById.get(p.id)??0).color}}>{expTier(expById.get(p.id)??0).name}</span></small></div><span className="q4-memberexp">{fmt(expById.get(p.id)??0)} EXP</span><span className="q4-expand">+</span></summary><div className="q4-personbody"><p>ÜYELİK: {joinById.get(p.id)?day(joinById.get(p.id)!):"—"}</p><p>RÜTBE: {names[role]}</p><p>SIFAT: {expTier(expById.get(p.id)??0).name}</p><p>EXP: {fmt(expById.get(p.id)??0)}</p><p>KAZANIM GEÇMİŞİ</p>{ledger.filter(e=>e.user_id===p.id).slice(0,30).map((e,i)=><div className="q4-ledger" key={i}><span>{e.reason??e.source_type} · {day(e.awarded_at)}</span><b>{e.exp_delta>0?"+":""}{e.exp_delta}</b></div>)}{!ledger.some(e=>e.user_id===p.id)&&<p>Gösterilecek EXP hareketi yok.</p>}{isFounder&&p.role!=="founder"&&<details className="q4-edit"><summary>RÜTBE DÜZENLE</summary><form action={setRank}><input type="hidden" name="member" value={p.id}/><select name="role" defaultValue={p.role??"member"}>{order.filter(r=>r!=="founder").map(r=><option key={r} value={r}>{names[r]}</option>)}</select><button type="submit">KAYDET</button></form></details>}</div></details>):<p className="q4-muted">Bu rütbede aktif üye yok.</p>}</div></details>})}
  </section>
  <section className="q4-section" id="dogum-gunleri"><div className="q4-sectionhead"><h2><em>02</em> DOĞUM GÜNLERİ</h2><span>ÖNÜMÜZDEKİ 30 GÜN</span></div>{birthdays.length?birthdays.map(p=><div className="q4-line" key={p.id}><b>{p.handle??"Üye"}</b><span>{String(p.dd).padStart(2,"0")}.{String(p.mm).padStart(2,"0")} · {p.days===0?"BUGÜN":p.days+" GÜN KALDI"}</span></div>):<p className="q4-muted">Önümüzdeki 30 günde paylaşımı açık doğum günü bulunmuyor.</p>}</section>
  <section className="q4-section" id="exp"><div className="q4-sectionhead"><h2><em>03</em> EXP SİCİLİ</h2><span>KAZANIM KAYITLARI</span></div>{[...people].sort((a,b)=>(expById.get(b.id)??0)-(expById.get(a.id)??0)).map(p=><details className="q4-person q4-exprow" key={p.id}><summary><div className="q4-memberid"><b>{p.handle??"Üye"}</b><small><span style={{color:rankColor[p.role??"member"]}}>{names[p.role??"member"]??"ÜYE"}</span><i> · </i><span style={{color:expTier(expById.get(p.id)??0).color}}>{expTier(expById.get(p.id)??0).name}</span></small></div><span className="q4-memberexp">{fmt(expById.get(p.id)??0)} EXP</span><span className="q4-expand">+</span></summary><div className="q4-personbody">{ledger.filter(e=>e.user_id===p.id).slice(0,50).map((e,i)=><div className="q4-ledger" key={i}><span>{e.reason??e.source_type} · {day(e.awarded_at)}</span><b>{e.exp_delta>0?"+":""}{e.exp_delta}</b></div>)}{!ledger.some(e=>e.user_id===p.id)&&<p>Gösterilecek hareket bulunmuyor.</p>}</div></details>)}{isFounder&&<details className="q4-edit"><summary>ÖZEL GÖREV EXP VER</summary><form action={award}><select name="member" required>{people.map(p=><option key={p.id} value={p.id}>{p.handle??"Üye"}</option>)}</select><input name="title" placeholder="Görev başlığı (en az 5 karakter)" minLength={5} maxLength={160} required/><textarea name="reason" placeholder="Gerekçe (en az 15 karakter)" minLength={15} maxLength={2000} required/><input name="exp" type="number" min={25} max={100} defaultValue={25} required/><button type="submit">EXP KAYDET</button></form></details>}</section>
  <section className="q4-section" id="sifatlar"><div className="q4-sectionhead"><h2><em>04</em> EXP SIFATLARI</h2><span>5 KADEME</span></div><p className="q4-muted">Sıfatlar kazanılan EXP'ye göre otomatik belirlenir. Rütbe ve yönetim yetkilerini değiştirmez.</p><div className="q4-tierlist">{expTiers.map((tier,i)=><div className="q4-tier" key={tier.name}><span className="q4-tiermark" style={{background:tier.color}}/><div className="q4-tierdesc"><b>{tier.name}</b><small>{fmt(tier.min)}{tier.max===null?"+":"–"+fmt(tier.max)} EXP</small></div><span className="q4-tierindex">{i+1}. KADEME</span></div>)}</div></section>
  <section className="q4-section" id="butce"><div className="q4-sectionhead"><h2><em>05</em> BÜTÇE</h2><span>GÜNCEL DURUM</span></div>{fundVisible?<><div className="q4-budget"><div><small>GELİR</small><strong>{fmt(income)} ₺</strong></div><div><small>GİDER</small><strong>{fmt(expense)} ₺</strong></div><div><small>BAKİYE</small><strong>{fmt(income-expense)} ₺</strong></div></div><details className="q4-person"><summary><b>İŞLEM GEÇMİŞİ</b><span>{fund?.length??0} KAYIT</span><span className="q4-expand">+</span></summary><div className="q4-personbody">{fund?.map(f=><div className="q4-ledger" key={f.id}><span>{f.title} · {day(f.created_at)}</span><b>{f.kind==="support"?"+":"−"}{fmt(Number(f.amount))} ₺</b></div>)}</div></details></>:<p className="q4-muted">Bütçe kayıtları için görüntüleme yetkiniz bulunmuyor.</p>}{canManage&&<details className="q4-edit"><summary>GELİR / GİDER EKLE</summary><form action={addFund}><select name="kind"><option value="support">GELİR</option><option value="expense">GİDER</option></select><input name="title" placeholder="İşlem açıklaması" required minLength={3}/><input name="amount" type="number" min="0.01" step="0.01" placeholder="Tutar (₺)" required/><button type="submit">KAYDET</button></form></details>}</section>
  {isFounder&&<section className="q4-section"><div className="q4-sectionhead"><h2><em>06</em> ÜYELİK ONAYI</h2><span>YETKİLİ İŞLEMİ</span></div>{(candidates??[]).length?(candidates??[]).map((c:{id:string;handle:string|null})=><div className="q4-line" key={c.id}><b>{c.handle??"Aday"}</b><form action={admit}><input type="hidden" name="candidate" value={c.id}/><button type="submit">KABUL ET</button></form></div>):<p className="q4-muted">Bekleyen aday yok.</p>}</section>}
<section className="q4-section" id="etkinlik"><div className="q4-sectionhead"><h2><em>07</em> ETKİNLİKLER</h2><span>SON KAYITLAR</span></div>
  {(recentEvents??[]).map(e=><div className="q4-line" key={e.id}><b>{e.title}</b><span>{day(e.starts_at)} · {e.status==="completed"?"TAMAMLANDI":e.status==="published"?"YAYINDA":e.status}</span></div>)}
  {canEvent&&<details className="q4-edit"><summary>ETKİNLİK VE KATILIM KAYDET</summary><form action={recordEvent}><select name="type" required><option value="op-night">OP-NIGHT</option><option value="gang-up">GANG-UP</option><option value="bbq-gang">BBQ-GANG</option><option value="q-nity">Q-NITY</option></select><input name="date" type="date" required/><p className="q4-muted">Başlık, etkinlik türü ve tarihine göre otomatik oluşturulur. Katılımı onaylanan üyeler EXP kazanır.</p><div className="q4-attendees"><b>KATILAN ÜYELER</b>{people.map(p=><label key={p.id}><input type="checkbox" name="attendees" value={p.id}/>{p.handle??"Üye"}</label>)}</div><button type="submit">ETKİNLİĞİ KAYDET</button></form></details>}
 </section>
 {isFounder&&<section className="q4-section" id="erisim"><div className="q4-sectionhead"><h2><em>08</em> ERİŞİM YETKİLERİ</h2><span>YALNIZCA LİDER</span></div><p className="q4-muted">Rütbelere tanımlı yönetim izinleri. Liderin yetkileri sabittir.</p>{(["admin","moderator","creator","member"] as const).map(role=><details className="q4-rank" key={role}><summary><span className="q4-rankmark" style={{background:rankColor[role]}}/><b>{names[role]}</b><span>YETKİLER</span><span className="q4-expand">+</span></summary><div className="q4-rankbody">{panelPermissions.map(([permission,label])=>{const enabled=(permissionsByRole.get(role)??[]).includes(permission);return <div className="q4-line" key={permission}><b>{label}</b><form action={changeAccess}><input type="hidden" name="role" value={role}/><input type="hidden" name="permission" value={permission}/><input type="hidden" name="enabled" value={String(!enabled)}/><button type="submit">{enabled?"AÇIK · KAPAT":"KAPALI · AÇ"}</button></form></div>})}</div></details>)}</section>}
   <footer className="q4-foot">Q-GANG <span>4.0</span></footer>
 </div></main>;
}