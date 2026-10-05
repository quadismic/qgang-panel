import {NextResponse} from "next/server";import {createClient} from "@/lib/supabase/server";import {sameOrigin} from "@/lib/privacy";import {normalizeRich,validRich} from "@/lib/rich-text";import {privacyReviewFields,retentionFields} from "@/lib/privacy-governance";
export async function POST(req:Request){if(!sameOrigin(req))return new NextResponse("Forbidden",{status:403});const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return new NextResponse("Unauthorized",{status:401});const f=await req.formData();let error:unknown;
 switch(f.get("action")){
 case "hold":{const [category,id]=String(f.get("record")||"").split(":");({error}=await s.rpc("set_privacy_retention_hold",{hold_category:category,hold_record:id,hold_reason:String(f.get("reason")||""),hold_until:String(f.get("until")||"")}));break;}
 case "erase":({error}=await s.rpc("execute_privacy_retention",{confirmation:String(f.get("confirmation")||"")}));break;
 case "document":{const body=normalizeRich(String(f.get("body")||""));if(!validRich(body,40000))return NextResponse.redirect(new URL("/gizlilik/yonetim/metinler?error=validation",req.url),303);const review=Object.fromEntries(Object.keys(privacyReviewFields).map(key=>[key,f.get(key)==="on"]));({error}=await s.rpc("save_privacy_document",{document_slug:String(f.get("slug")||""),document_title:String(f.get("title")||""),document_body:body,expected_revision:Number(f.get("revision")),publish:f.get("intent")==="publish",change_reason:String(f.get("reason")||""),review_checks:review}));break;}
 case "delegate":({error}=await s.rpc("set_privacy_delegate",{target_user:String(f.get("target_id")||""),can_requests:f.get("requests")==="on",can_documents:f.get("documents")==="on",is_active:f.get("active")==="on"}));break;
 case "settings":{const emails=String(f.get("emails")||"").split(/[,;\n]/).map(v=>v.trim()).filter(Boolean);const rules=Object.fromEntries(Object.keys(retentionFields).map(key=>[key,Number(f.get(key))]));({error}=await s.rpc("save_privacy_settings",{emails,rules,reason:String(f.get("reason")||"")}));break;}
 default:error=true;
 }
 return NextResponse.redirect(new URL(error?"/gizlilik/yonetim/metinler?error=save":"/gizlilik/yonetim/metinler?saved=1",req.url),303);
}
