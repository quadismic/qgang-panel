import {hasPermission} from "@/lib/access";
import {normalizeRich,validRich} from "@/lib/rich-text";
import {CodexWorkspace} from "@/components/CodexWorkspace";
import {revalidatePath} from "next/cache";
import {brandTheme} from "@/config/brand-theme";
import {redirect} from "next/navigation";
import {AppShell} from "@/components/AppShell";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {pageMeta} from "@/lib/design";
import {canEditRule,isEffective,type CodexRule} from "@/lib/codex";
export const dynamic="force-dynamic";
export const metadata=pageMeta.rules;
const SECTIONS=[["01","TEMEL KURALLAR"],["02","TOPLULUK DÜZENİ"],["03","YÖNETİM VE ORGANİZASYON"],["04","YAYIM VE İÇERİK DÜZENİ"],["05","DİSİPLİN DÜZENİ"],["06","HAZİNE VE MALİ DÜZEN"],["07","KODEKS'İN DEĞİŞTİRİLMESİ VE YÜRÜRLÜĞÜ"]].map(([number,title])=>({number,title}));
async function saveRule(formData:FormData){
 "use server";
 const s=await createClient(),user=await getCurrentUser();if(!user)redirect("/login");
 const {data:me}=await s.from("profiles").select("role").eq("id",user.id).single();
 if(!["founder","admin","moderator"].includes(me?.role||""))redirect("/kodeks?error=permission");
 const id=String(formData.get("id")||""),kind=String(formData.get("kind")||""),title=String(formData.get("title")||"").trim(),body=normalizeRich(String(formData.get("body")||"")),number=String(formData.get("number")||"").trim(),section=String(formData.get("section_number")||""),reason=String(formData.get("reason")||"").trim(),scope=String(formData.get("application_scope")||"").trim(),basisId=String(formData.get("basis_rule_id")||"");
 if(!title||title.length>200||!number||number.length>40||!SECTIONS.some(x=>x.number===section)||!validRich(body,50000,1)||!reason||reason.length>2000||scope.length>500||!["KURAL","İLKE","YÖNERGE","KARAR"].includes(kind))redirect("/kodeks?error=validation");
 if(me?.role!=="founder"&&!["YÖNERGE","KARAR"].includes(kind))redirect("/kodeks?error=permission");
 if(kind==="KARAR"&&!await hasPermission(user.id,"announcements.publish"))redirect("/kodeks?error=permission");
 if(["YÖNERGE","KARAR"].includes(kind)&&!scope)redirect("/kodeks?error=validation");
 let existing:CodexRule|null=null;
 if(id){const {data}=await s.from("regulations").select("*").eq("id",id).maybeSingle();existing=data;
   let issuerRole:string|null=null;if(existing?.created_by){const {data:issuer}=await s.from("profiles").select("role").eq("id",existing.created_by).maybeSingle();issuerRole=issuer?.role||null;}
   if(!existing||existing.kind!==kind||!canEditRule(me?.role,user.id,existing,issuerRole))redirect("/kodeks?error=permission");
   if(existing.revision!==Number(formData.get("revision")))redirect("/kodeks?error=conflict");
 }
 const status=String(formData.get("status")||"yururlukte");if(!["taslak","yururlukte","yururlukten_kaldirildi"].includes(status))redirect("/kodeks?error=validation");
 if(kind==="YÖNERGE"||kind==="KARAR"){
   const {data:basis}=await s.from("regulations").select("id,kind,status,effective_at,revision,basis_rule_id,basis_revision").eq("id",basisId).maybeSingle();
   if(basis?.kind==="YÖNERGE"){
     const {data:parent}=await s.from("regulations").select("status,effective_at,revision").eq("id",basis.basis_rule_id).maybeSingle();
     if(!parent||!isEffective(parent)||parent.revision!==basis.basis_revision)redirect("/kodeks?error=basis");
   }
   if(basis&&basis.revision!==Number(formData.get("basis_revision")))redirect("/kodeks?error=conflict");
   if(!basis||!(kind==="KARAR"?["KURAL","YÖNERGE"].includes(basis.kind):basis.kind==="KURAL")||(status!=="yururlukten_kaldirildi"&&!isEffective(basis)))redirect("/kodeks?error=basis");
 }
 const mode=String(formData.get("effective_mode")||"now");
 let effectiveAt=mode==="keep"&&existing?existing.effective_at:new Date().toISOString();
 if(mode==="scheduled"){const date=new Date(String(formData.get("effective_at")||""));if(Number.isNaN(date.getTime())||date.getTime()<=Date.now())redirect("/kodeks?error=validation");effectiveAt=date.toISOString();}
 // Scheduling a replacement would hide the currently effective text. Use a separate new publication for future changes.
 if(existing&&mode==="scheduled")redirect("/kodeks?error=schedule");

 if(existing?.legacy_announcement_id&&!existing.basis_rule_id)effectiveAt=new Date().toISOString();
 const priority=String(formData.get("decision_priority")||"normal");if(!["normal","important","critical"].includes(priority))redirect("/kodeks?error=validation");
 const publishedAt=status==="taslak"?null:existing?.published_at||new Date().toISOString();
 const payload={title,body,number,section_number:section,kind,status,effective_at:effectiveAt,change_reason:reason,published_at:publishedAt,decision_priority:priority,decision_pinned:formData.get("decision_pinned")==="on",basis_rule_id:["YÖNERGE","KARAR"].includes(kind)?basisId:null,basis_revision:["YÖNERGE","KARAR"].includes(kind)?Number(formData.get("basis_revision")):null,application_scope:scope||null};
 const result=id?await s.from("regulations").update(payload).eq("id",id).eq("revision",existing!.revision).select("id").maybeSingle():await s.from("regulations").insert({...payload,created_by:user.id}).select("id").single();
 if(result.error||!result.data)redirect("/kodeks?error=save");
 for(const path of ["/rules","/kodeks","/penalties","/disiplin","/announcements","/duyurular","/"])revalidatePath(path);
 redirect(`/kodeks?rule=${result.data.id}&section=${section}`);
}
export default async function Rules({searchParams}:{searchParams:Promise<{rule?:string;section?:string;tab?:string;error?:string}>}){
 const q=await searchParams,s=await createClient(),user=await getCurrentUser();
 const [{data:rules,error},{data:me},{data:issuers},{data:history}]=await Promise.all([
 s.from("regulations").select("id,title,body,kind,number,section_number,status,published_at,effective_at,revision,updated_at,created_by,basis_rule_id,basis_revision,change_reason,application_scope,decision_priority,decision_pinned,legacy_announcement_id").order("number").limit(1000),
 user?s.from("profiles").select("role").eq("id",user.id).single():Promise.resolve({data:null}),
 s.from("profiles").select("id,role"),
 s.from("regulation_revisions").select("id,regulation_id,revision,title,body,change_reason,changed_at").order("revision",{ascending:false}).limit(1000)]);
 const canPublishDecision=["founder","admin","moderator"].includes(me?.role||"")&&await hasPermission(user?.id,"announcements.publish");
 const messages:Record<string,string>={conflict:"Bu hüküm başka bir oturumda değişti. Sayfayı yenileyip yeniden düzenle.",basis:"Yürürlükte bir dayanak kural seç.",schedule:"Mevcut hükmün düzenlemesi derhal uygulanır. İleri tarih için yeni bir hüküm yayımla.",permission:"Bu hükmü düzenleme yetkin yok."};
 return <AppShell right={false}><main className="codexV3">{(q.error||error)&&<p className="notice" role="alert">{error?"Kodeks yüklenemedi. Tekrar dene.":messages[q.error||""]||"Hüküm kaydedilemedi. Alanları kontrol edip tekrar dene."}</p>}<CodexWorkspace rules={rules??[]} sections={SECTIONS} initialRule={q.rule} initialSection={q.section} heroImage={brandTheme.rooms.codex} actorRole={me?.role} actorId={user?.id} issuers={issuers??[]} revisions={history??[]} action={saveRule} initialTab={q.tab} canPublishDecision={canPublishDecision}/></main></AppShell>;
}
