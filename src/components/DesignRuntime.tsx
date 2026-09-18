import {createClient} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";
export async function DesignRuntime(){
 const s=await createClient();
 const {data}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();
 const d=normalizeDesign(data?.settings??defaultDesign);
 const vars:any={
  "--qg-primary":d.primary,"--qg-bone":d.bone,"--qg-bronze":d.bronze,
  "--qg-sidebar-width":d.sidebarWidth+"px","--qg-sidebar-emblem":d.sidebarEmblem+"px",
  "--qg-hero-overlay":String(d.heroOverlay/100),"--qg-quad-width":d.quadWidth+"px","--qg-quad-top":d.quadTop+"px",
  "--qg-login-width":d.loginPanelWidth+"px","--qg-login-emblem":d.loginEmblem+"px","--qg-login-overlay":String(d.loginOverlay/100)
 };
 return <style dangerouslySetInnerHTML={{__html:`:root{${Object.entries(vars).map(([k,v])=>k+":"+v).join(";")}}`}}/>;
}
