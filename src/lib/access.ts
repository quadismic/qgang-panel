import {cache} from "react";
import {createClient} from "@/lib/supabase/server";
import type {Permission} from "@/lib/roles";
const getRole=cache(async(userId:string)=>{const s=await createClient();const {data}=await s.from("profiles").select("role").eq("id",userId).maybeSingle();return data?.role;});
const getRolePermissions=cache(async(role:string)=>{const s=await createClient();const {data}=await s.from("role_permissions").select("permission").eq("role",role).eq("enabled",true);return new Set<string>((data??[]).map(item=>item.permission));});
export const hasPermission=cache(async(userId:string|undefined|null,permission:Permission)=>{if(!userId)return false;const role=await getRole(userId);if(!role)return false;if(role==="founder")return true;return (await getRolePermissions(role)).has(permission);});
