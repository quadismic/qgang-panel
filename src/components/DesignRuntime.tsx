import {getActiveDesign} from "@/lib/design-server";

import {ThemeCampaign} from "@/components/ThemeCampaign";
import {campaignExpiry,defaultTheme,themeVariables} from "@/lib/theme";

export async function DesignRuntime(){
 const d=await getActiveDesign(),theme=d.theme??defaultTheme;
 const safe=(x:string)=>'url("'+x.replace(/[\\\"\n\r]/g,"")+'")';
 const vars={...themeVariables({...theme,campaign:null}),"--qg-primary":d.primary,"--qg-bone":d.bone,"--qg-bronze":d.bronze,"--qg-sidebar-width":d.sidebarWidth+"px","--qg-sidebar-emblem":d.sidebarEmblem+"px","--qg-hero-overlay":d.heroOverlay/100,"--qg-quad-scale":d.quadScale/100,"--qg-quad-y":d.quadY,"--qg-home-hero-image":safe(d.homeHeroImage),"--qg-login-width":d.loginPanelWidth+"px","--qg-login-emblem":d.loginEmblem+"px","--qg-login-overlay":d.loginOverlay/100,"--qg-login-bg":safe(d.loginBackground),"--qg-room-codex":safe(d.roomCodex),"--qg-room-registry":safe(d.roomRegistry),"--qg-room-decrees":safe(d.roomDecrees),"--qg-room-tribunal":safe(d.roomTribunal),"--qg-room-treasury":safe(d.roomTreasury),"--qg-room-events":safe(d.roomEvents)};
 const css=(values:Record<string,string|number>)=>`:root{${Object.entries(values).map(([k,v])=>k+":"+v).join(";")}}`.replace(/</g,"\\3c ");
 const expiresAt=campaignExpiry(theme.campaign?.endsOn);
 return <><style dangerouslySetInnerHTML={{__html:css(vars)}}/>{theme.campaign&&expiresAt!==null&&<ThemeCampaign css={css(themeVariables({...theme,palette:theme.campaign.palette,campaign:null}))} expiresAt={expiresAt} initialActive={Date.now()<expiresAt}/>}</>;
}
