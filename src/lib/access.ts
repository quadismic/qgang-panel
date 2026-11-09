import {cache} from "react";
import {getViewerProfile,getRolePermissions} from "@/lib/viewer";
import type {Permission} from "@/lib/roles";
export const hasPermission=cache(async(userId:string|undefined|null,permission:Permission)=>{
 if(!userId)return false;
 const profile=await getViewerProfile(userId);
 if(!profile?.role||profile.is_suspended)return false;
 if(profile.role==="founder")return true;
 return (await getRolePermissions(profile.role)).has(permission);
});
