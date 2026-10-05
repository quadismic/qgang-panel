import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";import {sameOrigin} from "@/lib/privacy";
export async function POST(req:Request){
 if(!sameOrigin(req))return new NextResponse("Forbidden",{status:403});
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return new NextResponse("Unauthorized",{status:401});
 const f=await req.formData();const {error}=await s.rpc("review_privacy_request",{request_id:String(f.get("id")||""),next_status:String(f.get("status")||""),decision:String(f.get("response")||"")});
 return NextResponse.redirect(new URL(error?"/gizlilik/yonetim?error=review":"/gizlilik/yonetim?saved=1",req.url),303);
}
