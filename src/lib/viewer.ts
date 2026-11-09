import {cache} from "react";
import {createClient} from "@/lib/supabase/server";

// Request-local only. Never share a viewer, membership or permissions across requests.
export const getViewerProfile=cache(async(userId:string)=>{
 const s=await createClient();
 const {data}=await s.from("profiles").select("id,role,is_suspended,display_name,handle,bio,avatar_url,qgang_era,qgang_seal").eq("id",userId).maybeSingle();
 return data;
});
export const getViewerMembership=cache(async(userId:string)=>{
 const s=await createClient();
 const {data}=await s.from("community_memberships").select("status").eq("user_id",userId).eq("status","active").maybeSingle();
 return data;
});
export const getRolePermissions=cache(async(role:string)=>{
 const s=await createClient();
 const {data}=await s.from("role_permissions").select("permission").eq("role",role).eq("enabled",true);
 return new Set<string>((data??[]).map(item=>item.permission));
});
