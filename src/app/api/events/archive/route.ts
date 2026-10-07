import {sameOrigin} from "@/lib/privacy";
import {NextResponse} from "next/server";
import {getCurrentUser,createClient} from "@/lib/supabase/server";
import {hasPermission} from "@/lib/access";
import {previewEventImport,type LegacyEvent} from "@/lib/event-import";
export async function POST(req:Request) {
 if(!sameOrigin(req))return NextResponse.json({error:"Geçersiz istek kaynağı."},{status:403});
 const user=await getCurrentUser();if(!user||!await hasPermission(user.id,"events.archive"))return NextResponse.json({error:"Arşiv aktarımı yetkisi gerekli."},{status:403});
 const text=await req.text();if(text.length>200000)return NextResponse.json({error:"Aktarım dosyası çok büyük."},{status:413});
 let body:{events:LegacyEvent[];confirm?:boolean};try{body=JSON.parse(text)}catch{return NextResponse.json({error:"Geçerli JSON gerekli."},{status:400})}
 if(!body||!Array.isArray(body.events)||body.events.length>100||body.events.some(e=>!e||typeof e.id!=="string"||typeof e.type!=="string"||typeof e.date!=="string"||(e.names!==undefined&&typeof e.names!=="string")||(e.attendance!=null&&typeof e.attendance!=="string")))return NextResponse.json({error:"Etkinlik dosyası biçimi geçersiz."},{status:400});
 const s=await createClient();const {data,error}=await s.rpc("event_import_candidates");if(error)return NextResponse.json({error:"Eşleştirme verileri yüklenemedi."},{status:400});
 const rows=previewEventImport(body.events,data.profiles??[],data.links??[]);
 if(body.confirm!==true)return NextResponse.json({rows,profiles:data.profiles??[]},{headers:{"Cache-Control":"private, no-store"}});
 const {data:count,error:failed}=await s.rpc("import_event_archive",{p_rows:rows.filter(r=>r.eligible),p_confirm:true});
 if(failed)return NextResponse.json({error:"Aktarım kaydedilemedi. Önizlemeyi yeniden yükle ve kayıtları kontrol et."},{status:400});
 return NextResponse.json({count},{headers:{"Cache-Control":"private, no-store"}});
}
