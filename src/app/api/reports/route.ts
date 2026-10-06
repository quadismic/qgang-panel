import {POST as report} from "@/app/api/moderation/report/route";
export async function POST(req:Request){const f=await req.formData();if(!f.get("target_id"))f.set("target_id",String(f.get("reported_user_id")||""));const headers=new Headers(req.headers);headers.delete("content-type");headers.delete("content-length");return report(new Request(req.url,{method:"POST",headers,body:f}));}
