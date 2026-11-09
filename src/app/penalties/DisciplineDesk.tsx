import Link from "next/link";
import {redirect} from "next/navigation";
import {AppShell} from "@/components/AppShell";
import {MemberPicker} from "@/components/MemberPicker";
import {RichText} from "@/components/RichText";
import {hasPermission} from "@/lib/access";
import {canModerate} from "@/lib/roles";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {getViewerProfile} from "@/lib/viewer";
import "./discipline.css";

const stageLabel:Record<string,string>={reported:"Bildirim",review:"İncelemede",closed:"Sonuçlandı"};
const outcomes:Record<string,string>={none:"Yaptırım uygulanmadı",warning:"Uyarı",suspension:"Geçici uzaklaştırma",ban:"Üyelikten çıkarma",restriction:"Kısıtlama (eski kayıt)",mute:"Susturma (eski kayıt)"};
const displayDate=(value:string)=>new Intl.DateTimeFormat("tr-TR",{dateStyle:"short",timeZone:"Europe/Istanbul"}).format(new Date(value));
const identifier=(value:number)=>`D-${String(value).padStart(3,"0")}`;
type Case={id:string;case_number:number;stage:string;created_at:string;member_notice:string|null;member_statement:string|null};
type Order={case_id:string;regulation_id:string;outcome:string;regulations:{number:string|null;body:string|null;published_at:string|null}|null;decided_at:string;ends_at:string|null;reconsideration:string|null;reconsideration_result:string|null;revoked_at:string|null};
async function act(form:FormData){
 "use server";
 if(!await getCurrentUser())redirect("/login?next=/disiplin");
 const s=await createClient();
 const val=(key:string)=>String(form.get(key)??"").trim();
 const back=val("manage")==="1"?"/yonetim/moderasyon":"/disiplin";
 const end=val("ends");
 const ends=end&&/^\d{4}-\d{2}-\d{2}$/.test(end)?`${end}T23:59:59+03:00`:null;
 if(end&&!ends)redirect(back+"?error=1");
 const {error}=await s.rpc("discipline_case_action",{p_action:val("action"),p_case:val("case")||null,p_subject:val("subject")||null,p_text:val("text"),p_evidence:val("evidence")||null,p_outcome:val("outcome")||null,p_ends:val("outcome")==="suspension"?ends:null,p_heard:val("heard")==="on"});
 redirect(back+(error?"?error=1":"?saved=1"));
}
function Hidden({action,id,manage=false}:{action:string;id?:string;manage?:boolean}){return <>{manage&&<input type="hidden" name="manage" value="1"/>}<input type="hidden" name="action" value={action}/>{id&&<input type="hidden" name="case" value={id}/>}</>;}
function Decision({order}:{order:Order}){
 return <div><p className="disciplineMeta">İcra Kararı · {order.regulations?.number??"—"} · Disiplin kararı · {displayDate(order.regulations?.published_at??order.decided_at)}</p><h3>{outcomes[order.outcome]}{order.revoked_at?" · Kaldırıldı":""}</h3><p className="disciplineText">{order.regulations?.body}</p>{order.ends_at&&<p>Bitiş: {displayDate(order.ends_at)}</p>}{order.reconsideration_result&&<p className="disciplineText">Yeniden değerlendirme: {order.reconsideration_result}</p>}</div>;
}
export type DisciplineQuery={target?:string;error?:string;saved?:string;reported?:string;report_error?:string};
export async function DisciplineDesk({searchParams,manage=false}:{searchParams:Promise<DisciplineQuery>;manage?:boolean}){
 const q=await searchParams,user=await getCurrentUser();
 if(!user)redirect("/login?next=/disiplin");
 const me=await getViewerProfile(user.id);
 if(!me)redirect("/");
 const s=await createClient();
 const canManage=canModerate(me.role)&&await hasPermission(user.id,"discipline.view");
 if(manage&&!canManage)redirect("/disiplin");
 const staff=manage&&canManage;
 const [issue,review]=staff?await Promise.all([hasPermission(user.id,"discipline.issue"),hasPermission(user.id,"discipline.review")]):[false,false];
 const [{data:rawCases,error:casesError},{data:rawOrders,error:ordersError},{data:people},open,closed,{data:target}]=await Promise.all([
  staff?s.from("discipline_cases").select("id,case_number,stage,created_at,member_notice,member_statement,subject_id,incident,evidence").order("case_number",{ascending:false}).limit(100):s.rpc("my_discipline_cases"),
  s.from("discipline_orders").select("case_id,regulation_id,outcome,decided_at,ends_at,reconsideration,reconsideration_result,revoked_at,regulations(number,body,published_at)").match(staff?{}:{subject_id:user.id}).order("decided_at",{ascending:false}),
  staff?s.from("profiles").select("id,display_name,role").neq("role","guest").order("display_name"):Promise.resolve({data:[]}),
  staff?s.from("discipline_cases").select("id",{count:"exact",head:true}).neq("stage","closed"):Promise.resolve({count:null}),
  staff?s.from("discipline_cases").select("id",{count:"exact",head:true}).eq("stage","closed"):Promise.resolve({count:null}),
  q.target&&/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(q.target)?s.from("profiles").select("id,display_name,handle,role,avatar_url").eq("id",q.target).maybeSingle():Promise.resolve({data:null}),
 ]);
 const cases=(rawCases??[]) as (Case&{subject_id?:string;incident?:string;evidence?:string;is_subject?:boolean})[];
 const orders=new Map(((rawOrders??[]) as unknown as Order[]).map((order)=>[order.case_id,order]));
 const canReview=issue||review;
 return <AppShell right={false}><div className="disciplineDesk">
  <header><h1>Disiplin</h1><p>{staff?"Topluluk düzenine ilişkin kayıtlar":"Kendi bildirimlerin ve kararların"}</p>
   {canManage&&<Link href={staff?"/disiplin":"/yonetim/moderasyon"}>{staff?"Kendi dosyalarıma dön":"Disiplin yönetimini aç"}</Link>}{staff&&<dl className="disciplineStats">{[["İncelemede",open.count],["Sonuçlandı",closed.count],["Toplam",open.count==null||closed.count==null?null:open.count+closed.count]].map(([label,count])=><div key={label}><dt>{label}</dt><dd>{count??"—"}</dd></div>)}</dl>}
  </header>
  {(q.error||q.report_error||casesError||ordersError)&&<p role="alert">İşlem tamamlanamadı. Bilgileri ve erişim yetkini kontrol et.</p>}{(q.saved||q.reported)&&<p role="status">İşlem kaydedildi.</p>}
  <section><h2>{staff?"Olay kayıtları":"Dosyalarım"}</h2>{!cases.length&&<p>Henüz kayıt yok.</p>}
   {cases.map(record=>{
    const order=orders.get(record.id) as Order|undefined;
    return <details key={record.id}><summary><strong>{identifier(record.case_number)}{staff&&` · ${people?.find(person=>person.id===record.subject_id)?.display_name||"Üye"}`}</strong> · {displayDate(record.created_at)} · {order?outcomes[order.outcome]:stageLabel[record.stage]}</summary>
     {staff&&record.incident&&<RichText value={record.incident}/>}
     {staff&&record.evidence&&<p className="disciplineText">Delil: {record.evidence}</p>}
     {record.member_notice&&<p className="disciplineText">Üyeye iletilen konu: {record.member_notice}</p>}
     {record.member_statement&&<p className="disciplineText">Üyenin açıklaması: {record.member_statement}</p>}
     {staff&&canReview&&record.stage!=="closed"&&!record.member_notice&&<form action={act}><Hidden action="review" id={record.id} manage/><label>Üyeye iletilecek olay özeti<textarea name="text" maxLength={4000} required/></label><label>Delil veya bağlantı (isteğe bağlı)<textarea name="evidence" maxLength={4000}/></label><button className="qgAction">İncelemeyi başlat</button></form>}
     {staff&&issue&&record.stage==="review"&&record.member_notice&&<form action={act}><Hidden action="decide" id={record.id} manage/><label>Sonuç<select name="outcome"><option value="none">Yaptırım uygulanmadı</option><option value="warning">Uyarı</option>{me.role!=="moderator"&&<option value="suspension">Geçici uzaklaştırma</option>}{me.role==="founder"&&<option value="ban">Üyelikten çıkarma</option>}</select></label>{me.role!=="moderator"&&<label>Geçici uzaklaştırma için bitiş tarihi<input type="date" name="ends"/></label>}<label>Kısa gerekçe<textarea name="text" minLength={3} maxLength={500} required/></label><label className="disciplineCheck"><input type="checkbox" name="heard" required/>Üyeye açıklama imkânı tanındı.</label><button className="qgAction">Kararı kaydet</button></form>}
     {!staff&&record.is_subject&&record.stage==="review"&&<form action={act}><Hidden action="statement" id={record.id}/><label>Açıklaman<textarea name="text" defaultValue={record.member_statement??""} maxLength={4000} required/></label><button className="qgAction">Açıklamayı gönder</button></form>}
     {order&&<Decision order={order}/>}
     {order&&record.is_subject&&!order.reconsideration&&<form action={act}><Hidden action="reconsider" id={record.id}/><label>Yeniden değerlendirme gerekçen<textarea name="text" maxLength={4000} required/></label><button className="qgAction">LİDER’den yeniden değerlendirme iste</button></form>}
     {order?.reconsideration&&<p className="disciplineText">Yeniden değerlendirme talebi: {order.reconsideration}</p>}
     {order?.reconsideration&&!order.reconsideration_result&&staff&&me.role==="founder"&&<form action={act}><input type="hidden" name="manage" value="1"/><input type="hidden" name="case" value={record.id}/><label>Kısa gerekçe<textarea name="text" maxLength={500} required/></label><button className="qgAction" name="action" value="uphold">Kararı koru</button><button className="qgAction" name="action" value="revoke">Kararı kaldır</button></form>}
    </details>;
   })}
  </section>
  {staff&&issue&&<details><summary>Yeni disiplin kaydı</summary><form action={act}><Hidden action="create" manage/><label>İlgili üye<select name="subject" required defaultValue=""><option value="" disabled>Üye seç</option>{people?.filter(person=>person.id!==user.id&&person.role!=="founder").map(person=><option key={person.id} value={person.id}>{person.display_name}</option>)}</select></label><label>Olay<textarea name="text" maxLength={4000} required/></label><label>Delil veya bağlantı (isteğe bağlı)<textarea name="evidence" maxLength={4000}/></label><button className="qgAction">Bildirim oluştur</button></form></details>}
  {!staff&&me.role!=="guest"&&<details id="discipline-requests" open={!!q.target}><summary>Üye bildirimi yap</summary><form action="/api/moderation/report" method="post">
   <input type="hidden" name="return_to" value="/disiplin"/>
   <MemberPicker name="target_id" scope="report" label="İlgili üye" initialMember={target}/>
   <label>Olayı açıkla<textarea name="reason" minLength={5} maxLength={500} required/></label>
   <button className="qgAction">Bildirim gönder</button>
  </form></details>}
 </div></AppShell>;
}
