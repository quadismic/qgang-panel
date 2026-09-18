import {createClient} from "@/lib/supabase/server";
import {defaultDesign,normalizeDesign} from "@/lib/design";
export async function DesignRuntime(){
 const s=await createClient();const {data}=await s.from("design_settings").select("settings").eq("key","active").maybeSingle();const d=normalizeDesign(data?.settings??defaultDesign);
 const safe=(x:string)=>'url("'+x.replace(/[\\\"\n\r]/g,"")+'")';
 const vars:any={"--qg-primary":d.primary,"--qg-bone":d.bone,"--qg-bronze":d.bronze,"--qg-sidebar-width":d.sidebarWidth+"px","--qg-sidebar-emblem":d.sidebarEmblem+"px","--qg-hero-overlay":d.heroOverlay/100,"--qg-quad-scale":d.quadScale/100,"--qg-quad-y":d.quadY,"--qg-login-width":d.loginPanelWidth+"px","--qg-login-emblem":d.loginEmblem+"px","--qg-login-overlay":d.loginOverlay/100,"--qg-login-bg":safe(d.loginBackground),"--qg-room-codex":safe(d.roomCodex),"--qg-room-registry":safe(d.roomRegistry),"--qg-room-decrees":safe(d.roomDecrees),"--qg-room-tribunal":safe(d.roomTribunal),"--qg-room-treasury":safe(d.roomTreasury)};
 return <style dangerouslySetInnerHTML={{__html:`:root{${Object.entries(vars).map(([k,v])=>k+":"+v).join(";")}}`}}/>;
}