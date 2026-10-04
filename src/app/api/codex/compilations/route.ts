import {NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {hasPermission} from "@/lib/access";
import {renderCodex,type Compilation} from "@/lib/documents/codex-pdf";
export const runtime="nodejs";export const maxDuration=60;
export async function GET(req:Request){const s=await createClient(),user=await getCurrentUser();if(!user)return NextResponse.json({error:"Giriş yapmalısın."},{status:401});const decisions=new URL(req.url).searchParams.get("decisions")==="true";const {data,error}=await s.rpc("current_codex_document",{p_decisions:decisions});if(error)return NextResponse.json({error:"Derleme bilgisi alınamadı."},{status:503});if(!data)return NextResponse.json({error:"Henüz derleme oluşturulmadı."},{status:404});const signed=await s.storage.from("qgang-documents").createSignedUrl(data.storage_path,60);if(signed.error)return NextResponse.json({error:"Belge indirilemiyor."},{status:503});return NextResponse.json({url:signed.data.signedUrl,current:data.current,created_at:data.created_at,id:data.id});}
export async function POST(req:Request){
 const s=await createClient(),user=await getCurrentUser();if(!user||!await hasPermission(user.id,"members.manage"))return NextResponse.json({error:"Derleme yetkin yok."},{status:403});
 const f=await req.formData();if(f.get("confirmation")!=="KODEKSİ DERLE")return NextResponse.json({error:"Onay ifadesini kontrol et."},{status:400});
 const decisions=f.get("decisions")==="true";
 const {data:current}=await s.rpc("current_codex_document",{p_decisions:decisions});
 if(current?.current){const signed=await s.storage.from("qgang-documents").createSignedUrl(current.storage_path,60);if(!signed.error)return NextResponse.json({url:signed.data.signedUrl,cached:true});}
 const {data,error}=await s.rpc("begin_codex_compilation",{p_decisions:decisions});if(error||!data)return NextResponse.json({error:"Derleme başlatılamadı. Yetkini kontrol et veya bir dakika sonra tekrar dene."},{status:400});
 const compilation=data as Compilation;let finalized=false;
 try{if(JSON.stringify(compilation.snapshot).length>5000000)throw new Error("size");const pdf=await renderCodex(compilation);if(pdf.length>20971520)throw new Error("size");const path=user.id+"/"+compilation.id+".pdf";const upload=await s.storage.from("qgang-documents").upload(path,pdf,{contentType:"application/pdf",upsert:false});if(upload.error)throw upload.error;
 const finished=await s.rpc("finish_codex_compilation",{p_id:compilation.id,p_source_hash:createHash("sha256").update(JSON.stringify(compilation.snapshot)).digest("hex"),p_artifact_hash:createHash("sha256").update(pdf).digest("hex"),p_path:path,p_failed:false});if(finished.error)throw finished.error;finalized=true;const signed=await s.storage.from("qgang-documents").createSignedUrl(path,60);if(signed.error)throw signed.error;return NextResponse.json({url:signed.data.signedUrl,id:compilation.id});
 }catch{if(!finalized)await s.rpc("finish_codex_compilation",{p_id:compilation.id,p_source_hash:null,p_artifact_hash:null,p_path:null,p_failed:true});return NextResponse.json({error:"PDF işlemi tamamlanamadı. Kaydedilmiş derlemeyi yeniden açabilirsin."},{status:500});}
}
