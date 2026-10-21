import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {sameOrigin} from "@/lib/privacy";
export async function POST(req:Request){
 if(!sameOrigin(req))return new NextResponse("Forbidden",{status:403});
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return new NextResponse("Unauthorized",{status:401});
 const definitions=[
 ["profile","profiles","id","id,handle,display_name,bio,avatar_url,banner_url,banner_motion,comments_enabled,role,qgang_era,qgang_seal,created_at"],
 ["memberships","community_memberships","user_id","status,member_no,joined_at,ended_at,era,seal"],
 ["membership_periods","membership_periods","user_id","started_at,ended_at,source"],
 ["connected_accounts","connected_accounts","user_id","provider,provider_handle,profile_url,created_at"],
 ["publications","publications","author_id","id,title,slug,excerpt,body,status,created_at,published_at"],
 ["profile_comments","profile_comments","author_id","id,profile_id,body,created_at"],
 ["publication_comments","publication_comments","author_id","id,publication_id,body,created_at"],
 ["badges","profile_badges","user_id","id,badge_id,granted_at,revoked_at,source"],
 ["privacy_requests","privacy_requests","user_id","id,kind,detail,status,response,created_at,updated_at"],
 ["aster_conversations","ai_conversations","user_id","id,title,created_at,updated_at"]
 ] as const;
 const entries:Record<string,unknown>={};
 // Page every selected collection; never return another user's records or silently truncate.
 for(const [name,table,owner,columns] of definitions){const rows:unknown[]=[];for(let offset=0;;offset+=200){const {data,error}=await s.from(table).select(columns).eq(owner,user.id).order(table==="membership_periods"?"started_at":table==="community_memberships"?"joined_at":table==="profile_badges"?"granted_at":"created_at").order(table==="community_memberships"||table==="connected_accounts"?"user_id":"id").range(offset,offset+199);if(error)return NextResponse.json({error:"export_failed"},{status:503,headers:{"Cache-Control":"no-store"}});rows.push(...(data??[]));if((data?.length??0)<200)break;if(rows.length>=10000)return NextResponse.json({error:"export_requires_review"},{status:413,headers:{"Cache-Control":"no-store"}});}entries[name]=rows;}
 const {data:eventData,error:eventError}=await s.rpc("export_own_event_data");if(eventError)return NextResponse.json({error:"export_failed"},{status:503,headers:{"Cache-Control":"no-store"}});entries.events=eventData;
 const {data:birthday,error}=await s.rpc("get_profile_birthday",{target_user:user.id}).maybeSingle();if(error)return NextResponse.json({error:"export_failed"},{status:503,headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({generated_at:new Date().toISOString(),scope:"Kendi hesabınızın temel verileri. Deliller, üçüncü kişilerin bilgileri, yönetim gerekçeleri, sağlayıcı günlükleri ve Aster mesajları için erişim başvurusu oluşturun.",account:{id:user.id,email:user.email},birthday,...entries},{headers:{"Cache-Control":"private, no-store","Content-Disposition":"attachment; filename=qgang-verilerim.json","X-Content-Type-Options":"nosniff"}});
}
