import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {hasPermission} from "@/lib/access";

export async function GET(req:Request) {
  const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return reply({error:"unauthorized"},401);
  if(!await hasPermission(user.id,"members.view"))return reply({error:"forbidden"},403);
  const params=new URL(req.url).searchParams;
  const q=(params.get("q")||"").trim().replace(/^@/,"");
  const role=params.get("role")||"all",status=params.get("status")||"all",suspended=params.get("suspended")||"all";
  const page=Number(params.get("page")||1);
  if(q.length>80||!Number.isInteger(page)||page<1||page>10000||!["all","founder","admin","moderator","creator","member","guest"].includes(role)||!["all","active","inactive","none"].includes(status)||!["all","yes","no"].includes(suspended))return reply({error:"validation"},400);
  const {data,error}=await s.rpc("list_community_directory",{search_term:q,role_filter:role,membership_filter:status,suspended_filter:suspended,page_number:page});
  if(error)return reply({error:"directory_failed"},500);
  return reply({items:(data??[]).slice(0,20),hasNext:(data??[]).length>20});
}
