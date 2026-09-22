import {redirect} from "next/navigation";
import {AppShell} from "@/components/AppShell";
import {DesignEditor} from "@/components/DesignEditor";
import {createClient,getCurrentUser} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";
export const dynamic="force-dynamic";
export default async function DesignPage(){
 const s=await createClient();const user=await getCurrentUser();if(!user)redirect("/login?next=/control/design");
 const {data:p}=await s.from("profiles").select("role").eq("id",user.id).maybeSingle();if(!p||!["founder","admin"].includes(p.role))redirect("/");
 const [{data},{data:history}]=await Promise.all([s.from("design_settings").select("settings").eq("key","active").maybeSingle(),s.from("design_history").select("id,created_at").order("created_at",{ascending:false}).limit(12)]);
 return <AppShell right={false}><DesignEditor initial={normalizeDesign(data?.settings??defaultDesign)} history={history??[]}/></AppShell>
}
