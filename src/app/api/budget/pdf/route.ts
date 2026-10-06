import {NextResponse} from "next/server";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {hasPermission} from "@/lib/access";
import {parseBudgetScope,readBudgetRecords} from "@/lib/budget";
import {renderBudgetPdf} from "@/lib/documents/budget-pdf";
export const runtime="nodejs";export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export async function GET(req:Request){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Giriş gerekli."},{status:401,headers});
 const [view,manage]=await Promise.all([hasPermission(user.id,"budget.view"),hasPermission(user.id,"budget.manage")]);if(!view&&!manage)return NextResponse.json({error:"Bütçe erişim yetkisi gerekli."},{status:403,headers});
 let scope;try{scope=parseBudgetScope(new URL(req.url).searchParams);}catch{return NextResponse.json({error:"Kapsam veya tarih aralığı geçersiz."},{status:400,headers});}
 try{const createdAt=new Date().toISOString(),rows=await readBudgetRecords(await createClient(),scope,createdAt),pdf=await renderBudgetPdf(rows,scope,createdAt);return new Response(new Uint8Array(pdf),{headers:{...headers,"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="Q-GANG-Mali-Defter.pdf"'}});}catch{return NextResponse.json({error:"Mali defter oluşturulamadı. Tekrar deneyin."},{status:500,headers});}
}
