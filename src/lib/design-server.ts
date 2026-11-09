import {cache} from "react";
import {unstable_cache} from "next/cache";
import {createClient} from "@supabase/supabase-js";
import {defaultDesign,normalizeDesign} from "@/lib/design";

// Only the anonymously readable design document is shared between requests.
// No cookies, sessions, member records, access rules or maintenance state enter this cache.
const readPublicDesign=unstable_cache(async(url:string,key:string)=>{
 const s=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:"no-store",signal:AbortSignal.timeout(5000)})}});
 const {data,error}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();
 if(error)throw error;
 return normalizeDesign(data?.settings??defaultDesign);
},["qg-public-design-v2"],{revalidate:300,tags:["qg-public-design"]});
export const getActiveDesign=cache(async()=>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return normalizeDesign(defaultDesign);
 try{return await readPublicDesign(url,key)}catch{return normalizeDesign(defaultDesign)}
});
