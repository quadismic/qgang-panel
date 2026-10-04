import {cache} from "react";
import {createClient} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";
export const getActiveDesign=cache(async()=>{const s=await createClient();const {data}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();return normalizeDesign(data?.settings??defaultDesign);});
