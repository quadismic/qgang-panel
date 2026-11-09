"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {QGIcon} from "@/components/QGIcon";
import {lobbyNavigation,lobbyNavActive,type LobbyNavAccess} from "@/lib/lobby-navigation";
export function MobileNavClient({user:_user,...access}:LobbyNavAccess&{user?:boolean}){
 const path=usePathname(),{primary}=lobbyNavigation(access);
 return <nav className="mobileNav hubMobile lobbyMobileNav" aria-label="Q-GANG mobil menü">
  {primary.map(([href,icon,label])=>{const active=lobbyNavActive(path,href);return <Link key={href} href={href} className={active?"active":""} aria-current={active?"page":undefined}><i><QGIcon name={icon}/></i><span>{label}</span></Link>})}
 </nav>;
}
