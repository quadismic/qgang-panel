import {NextResponse} from 'next/server';
import {createClient,getCurrentUser} from '@/lib/supabase/server';
import {sameOrigin} from '@/lib/privacy';
import {reviewError} from '@/lib/membership-reviews/model';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers={'Cache-Control':'private, no-store'};
export async function GET(req:Request){
 if(!await getCurrentUser())return NextResponse.json({error:'Oturum gerekli.'},{status:401,headers});
 const q=new URL(req.url).searchParams,id=q.get('period');if(id&&!uuid.test(id))return NextResponse.json({error:'Geçersiz dönem.'},{status:400,headers});
 const s=await createClient();const {data,error}=await s.rpc('membership_review_snapshot',{p_period:id,p_search:q.get('search')||'',p_role:q.get('role')||'member',p_page:Math.max(0,Number(q.get('page'))||0)});
 if(error)return NextResponse.json({error:reviewError(error.message)},{status:403,headers});return NextResponse.json(data,{headers});
}
export async function POST(req:Request){
 if(!sameOrigin(req))return NextResponse.json({error:'İşlem kaynağı doğrulanamadı.'},{status:403,headers});
 if(!await getCurrentUser())return NextResponse.json({error:'Oturum gerekli.'},{status:401,headers});
 const text=await req.text();if(text.length>2000000)return NextResponse.json({error:'İşlem boyutu çok büyük.'},{status:413,headers});
 let body;try{body=JSON.parse(text);}catch{return NextResponse.json({error:'Geçersiz işlem.'},{status:400,headers});}
 if(!body||typeof body.action!=='string'||(body.period&&!uuid.test(body.period))||!body.data||typeof body.data!=='object'||Array.isArray(body.data))return NextResponse.json({error:'Geçersiz işlem.'},{status:400,headers});
 const s=await createClient();const {data,error}=await s.rpc('membership_review_command',{p_action:body.action,p_period:body.period||null,p_data:body.data});
 if(error)return NextResponse.json({error:reviewError(error.message)},{status:error.message==='review_conflict'?409:400,headers});return NextResponse.json(data,{headers});
}
