import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {hasPermission} from "@/lib/access";
import {canModerate} from "@/lib/roles";
const scopes=new Set(["report","discipline","accounts","badges","active","captains","legacy","management"]);
export async function GET(req:Request){
 const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return reply({error:"unauthorized"},401);
 const url=new URL(req.url),scope=url.searchParams.get("scope")||"",q=(url.searchParams.get("q")||"").trim().replace(/^@/,"");
 if(!scopes.has(scope)||q.length>80)return reply({error:"validation"},400);
 const {data:actor}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(scope==="report"?(!actor||actor.role==="guest"):scope==="discipline"?(!canModerate(actor?.role)||!await hasPermission(user.id,"discipline.issue")):!await hasPermission(user.id,scope==="management"?"members.view":"members.manage"))return reply({error:"forbidden"},403);
 if(["badges","active","captains"].includes(scope)&&!["founder","admin"].includes(actor?.role||""))return reply({error:"forbidden"},403);
 if(q.length<2)return reply({items:[]});
 if(scope==="legacy"){
  const {data,error}=await s.rpc("list_unclaimed_legacy_members");if(error)return reply({error:"search_failed"},500);
  const needle=q.toLocaleLowerCase("tr-TR");return reply({items:(data??[]).filter((p:{nickname:string})=>p.nickname.toLocaleLowerCase("tr-TR").includes(needle)).slice(0,8).map((p:{id:number;nickname:string;joined_at:string})=>({id:String(p.id),display_name:p.nickname,handle:"",role:"",avatar_url:null,detail:p.joined_at}))});
 }
 // Remove PostgREST filter syntax and wildcard operators from user input.
 const term=q.replace(/[%_*,()."\\]/g," ").trim();if(term.length<2)return reply({items:[]});
 const fields=scope==="active"?"id,display_name,handle,role,avatar_url,membership:community_memberships!community_memberships_user_id_fkey!inner(status)":"id,display_name,handle,role,avatar_url";
 let search=s.from("profiles").select(fields).or(`display_name.ilike.%${term}%,handle.ilike.%${term}%`).order("display_name").order("id").limit(8);
 if(scope==="report")search=search.neq("id",user.id);
 if(scope==="discipline")search=search.neq("id",user.id).neq("role","founder");
 if(scope==="accounts")search=search.neq("role","founder");
 if(scope==="captains")search=search.eq("role","moderator");
 if(scope==="active")search=search.eq("membership.status","active");
 const {data,error}=await search;if(error)return reply({error:"search_failed"},500);
 return reply({items:data??[]});
}
