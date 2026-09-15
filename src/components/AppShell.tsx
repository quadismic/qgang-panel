import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { MobileNav } from "./MobileNav";
export function AppShell({children,right=true}:{children:ReactNode;right?:boolean}){
 return <div className="appShell"><Nav/><main className="content">{children}</main>{right&&<aside className="rail"><div className="railCard"><b>🔥 Campfires</b><p>Oyunu seç. Ateşe katıl. İnsanları bul.</p></div><div className="railCard"><b>Q-GANG Alpha</b><p>Play · Create · Connect</p></div></aside>}<MobileNav/></div>
}
