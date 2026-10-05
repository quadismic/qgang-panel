import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {sameOrigin,privacyKinds} from "@/lib/privacy";
export async function POST(req:Request){
 if(!sameOrigin(req))return new NextResponse("Forbidden",{status:403});
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return new NextResponse("Unauthorized",{status:401});
 const f=await req.formData(),kind=String(f.get("kind")||""),detail=String(f.get("detail")||"").trim();
 if(!(kind in privacyKinds)||detail.length<10||detail.length>3000)return NextResponse.redirect(new URL("/gizlilik/verilerim?error=validation",req.url),303);
 const {error}=await s.rpc("submit_privacy_request",{request_kind:kind,request_detail:detail});
 return NextResponse.redirect(new URL(error?"/gizlilik/verilerim?error=request":"/gizlilik/verilerim?saved=1",req.url),303);
}
