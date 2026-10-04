import {NextResponse} from "next/server";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {hasPermission} from "@/lib/access";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(req:Request){
 const s=await createClient(),user=await getCurrentUser();
 if(!user||!await hasPermission(user.id,"members.manage"))return NextResponse.json({error:"Yetkisiz"},{status:403});
 const f=await req.formData(),action=String(f.get("action")||""),target=String(f.get("target_id")||""),badge=String(f.get("badge_id")||""),award=String(f.get("award_id")||""),reason=String(f.get("reason")||"").trim(),evidence=String(f.get("evidence")||"").trim(),proposer=String(f.get("proposer_id")||"");
 if(!["award","recognize","revoke","correct"].includes(action)||!uuid.test(target)||reason.length<3||reason.length>2000||evidence.length>2000||(badge&&!uuid.test(badge))||(award&&!uuid.test(award))||(proposer&&!uuid.test(proposer)))return NextResponse.json({error:"Üye, işlem ve gerekçeyi kontrol et."},{status:400});
 const {error}=await s.rpc("manage_badge",{p_action:action,p_user:target,p_badge:badge||null,p_award:award||null,p_reason:reason,p_evidence:evidence||null,p_proposer:proposer||null});
 if(error)return NextResponse.json({error:"Rozet işlemi tamamlanamadı. Yetki, kazanım koşulları veya kayıt durumunu kontrol et."},{status:400});
 return NextResponse.redirect(new URL("/yonetim/uyelik",req.url),303);
}
