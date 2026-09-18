import {redirect} from "next/navigation";
import {AppShell} from "@/components/AppShell";
import {DesignEditor} from "@/components/DesignEditor";
import {createClient} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";
export const dynamic="force-dynamic";
export default async function DesignPage(){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login?next=/control/design");
 const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();if(!p||!["founder","admin"].includes(p.role))redirect("/");
 const {data}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();
 return <AppShell right={false}><DesignEditor initial={normalizeDesign(data?.settings??defaultDesign)}/></AppShell>
}
