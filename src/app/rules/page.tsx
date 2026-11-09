import Link from "next/link";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {AppShell} from "@/components/AppShell";
import {NormativeCodex,type NormativeTab} from "@/components/NormativeCodex";
import {hasPermission} from "@/lib/access";
import {pageMeta} from "@/lib/design";
import {getViewerProfile} from "@/lib/viewer";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {normalizeRich,richPlain,validRich} from "@/lib/rich-text";
import {canEditRule,type CodexRule} from "@/lib/codex";
import "./normative-codex.css";

export const dynamic="force-dynamic";
export const metadata=pageMeta.rules;
const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const staffRoles=["founder","admin","moderator"];

async function saveDocument(form:FormData){
 "use server";
 const s=await createClient(),user=await getCurrentUser(),actor=user?await getViewerProfile(user.id):null;
 if(!user||!actor||!staffRoles.includes(actor.role))redirect("/kodeks");
 const val=(name:string)=>String(form.get(name)??"").trim();
 const id=val("id"),kind=val("kind"),status=val("status"),title=val("title"),body=normalizeRich(val("body")),scope=val("scope");
 const isDecision=kind==="KARAR",back=`/kodeks?manage=1&tab=${isDecision?"decisions":"directives"}`;
 if(!["YÖNERGE","KARAR"].includes(kind)||!["taslak","yururlukte","yururlukten_kaldirildi"].includes(status)||!title||title.length>200||!validRich(body,50000,1)||scope.length>500||(actor.role==="moderator"&&!scope))redirect(back+"&error=validation");
 if(isDecision&&!await hasPermission(user.id,"announcements.publish"))redirect(back+"&error=permission");
 let existing:CodexRule|null=null;
 if(id){
  if(!uuid.test(id))redirect(back+"&error=validation");
  const {data}=await s.from("regulations").select("*").eq("id",id).eq("normative_edition",true).or("decision_category.is.null,decision_category.eq.administrative").maybeSingle();
  existing=data as CodexRule|null;
  const {data:issuer}=existing?.created_by?await s.from("profiles").select("role").eq("id",existing.created_by).maybeSingle():{data:null};
  if(!existing||existing.kind!==kind||!canEditRule(actor.role,user.id,existing,issuer?.role))redirect(back+"&error=permission");
  if(existing.revision!==Number(val("revision")))redirect(back+"&error=conflict");
 }
 if((existing?.published_at&&status==="taslak")||(!existing?.published_at&&status==="yururlukten_kaldirildi"))redirect(back+"&error=validation");
 const now=new Date().toISOString();
 const payload={title,body,kind,status,decision_category:isDecision?"administrative":null,application_scope:scope||null,change_reason:val("reason").slice(0,2000)||"Belge kaydı",effective_at:existing?.published_at?existing.effective_at||now:now,published_at:status==="taslak"?null:existing?.published_at||now};
 const result=existing?await s.from("regulations").update(payload).eq("id",id).eq("revision",existing.revision).select("id").maybeSingle():await s.from("regulations").insert({...payload,section_number:"01",number:"",normative_edition:true,created_by:user.id}).select("id").single();
 if(result.error||!result.data)redirect(back+"&error=save");
 for(const path of ["/kodeks","/rules","/duyurular","/announcements","/"])revalidatePath(path);
 redirect(back+"&rule="+result.data.id);
}

function DocumentForm({kind,record,scopeRequired}:{kind:string;record?:CodexRule;scopeRequired:boolean}){
 return <form action={saveDocument} className="normativeForm">
  <input type="hidden" name="kind" value={kind}/>{record&&<><input type="hidden" name="id" value={record.id}/><input type="hidden" name="revision" value={record.revision??""}/></>}
  <label>Başlık<input name="title" defaultValue={record?.title} maxLength={200} required/></label>
  <label>Metin<textarea name="body" defaultValue={richPlain(record?.body??"")} maxLength={50000} required/></label>
  {scopeRequired&&<label>Uygulama kapsamı<input name="scope" defaultValue={record?.application_scope??""} maxLength={500} required/></label>}
  <label>Yayın ve yürürlük<select name="status" defaultValue={record?.status??"taslak"}>{!record?.published_at&&<option value="taslak">Taslak</option>}<option value="yururlukte">Yayımla / Yürürlükte</option>{record?.published_at&&<option value="yururlukten_kaldirildi">Yürürlükte değil</option>}</select></label>
  {record&&<label>Değişiklik gerekçesi<input name="reason" maxLength={2000} required/></label>}
  <button className="qgAction">Kaydet</button>
 </form>;
}
export default async function Rules({searchParams}:{searchParams:Promise<{rule?:string;tab?:string;error?:string;manage?:string}>}){
 const q=await searchParams,s=await createClient(),user=await getCurrentUser();
 const me=user?await getViewerProfile(user.id):null;
 const canManage=staffRoles.includes(me?.role||"");
 const validId=q.rule&&uuid.test(q.rule)?q.rule:null;
 if(q.manage==="1"&&canManage&&user&&me){
  const decisions=q.tab==="decisions",kind=decisions?"KARAR":"YÖNERGE";
  const [{data,error},canPublish]=await Promise.all([
   s.from("regulations").select("*").eq("normative_edition",true).eq("kind",kind).or("decision_category.is.null,decision_category.eq.administrative").order("updated_at",{ascending:false}).limit(100),
   decisions?hasPermission(user.id,"announcements.publish"):Promise.resolve(true),
  ]);
  const records=(data??[]) as CodexRule[];
  const record=records.find(item=>item.id===validId);
  const {data:issuer}=record?.created_by?await s.from("profiles").select("role").eq("id",record.created_by).maybeSingle():{data:null};
  const base=`/kodeks?manage=1&tab=${decisions?"decisions":"directives"}`;
  return <AppShell right={false}><section className="normativeReader">
   <Link className="normativeBack" href="/kodeks">← Kodeks’e dön</Link><h1>Belge yönetimi</h1>
   <nav aria-label="Belge türü" className="normativeManagementLinks"><Link href="/kodeks?manage=1&tab=directives">Yönergeler</Link><Link href="/kodeks?manage=1&tab=decisions">İcra Kararları</Link></nav>
   {(error||q.error)&&<p role="alert">İşlem tamamlanamadı. Belgeyi ve erişim yetkini kontrol et.</p>}
   {!records.length&&<p>Henüz belge yok.</p>}
   <ul className="normativeDocuments">{records.map(item=><li key={item.id}><Link className="normativeDocumentLink" href={base+"&rule="+item.id}>{item.title}{!item.published_at?" · Taslak":""}</Link></li>)}</ul>
   {record&&canPublish&&canEditRule(me.role,user.id,record,issuer?.role)&&<DocumentForm kind={kind} record={record} scopeRequired={me.role==="moderator"}/>}
   {!record&&canPublish&&<details><summary>{decisions?"Yeni İcra Kararı":"Yeni Yönerge"}</summary><DocumentForm kind={kind} scopeRequired={me.role==="moderator"}/></details>}
  </section></AppShell>;
 }
 const now=new Date().toISOString();
 const published=()=>s.from("regulations").select("id,title,body,number,kind,status,published_at,effective_at,decision_category")
   .eq("normative_edition",true).in("kind",["YÖNERGE","KARAR"]).or("decision_category.is.null,decision_category.eq.administrative").neq("status","taslak").lte("published_at",now);
 const detail=validId?await published().eq("id",validId).maybeSingle():null;
 const tab:NormativeTab=q.tab==="decisions"||q.tab==="directives"?q.tab:detail?.data?.kind==="KARAR"?"decisions":detail?.data?.kind==="YÖNERGE"?"directives":"primary";
 const kind=tab==="decisions"?"KARAR":"YÖNERGE";
 const selected=detail?.data?.kind===kind?detail.data:undefined;
 const list=tab==="primary"||selected?null:await published().eq("kind",kind).order("published_at",{ascending:false}).order("id").limit(1000);
 return <AppShell right={false}><NormativeCodex tab={tab} documents={list?.data??[]} selected={selected} error={!!(list?.error||detail?.error)} canManage={canManage}/></AppShell>;
}
