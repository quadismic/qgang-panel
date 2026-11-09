"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {QGIcon} from "@/components/QGIcon";
import {lobbyNavigation,lobbyNavActive,type LobbyNavAccess} from "@/lib/lobby-navigation";
export function MobileNavClient({user=false,...access}:LobbyNavAccess&{user?:boolean}){
 const path=usePathname(),{primary,management}=lobbyNavigation(access);
 return <nav className="mobileNav hubMobile lobbyMobileNav" aria-label="Q-GANG mobil menü" style={{"--lobby-nav-columns":primary.length+1} as React.CSSProperties}>
  {primary.map(([href,icon,label])=><Link key={href} href={href} className={lobbyNavActive(path,href)?"active":""} aria-current={lobbyNavActive(path,href)?"page":undefined}><i><QGIcon name={icon}/></i><span>{label}</span></Link>)}
  {user?<details className="lobbyMobileAccount" key={path} onKeyDown={e=>{if(e.key==="Escape"&&e.currentTarget.open){e.currentTarget.open=false;e.currentTarget.querySelector("summary")?.focus();}}}><summary><QGIcon name="identity"/><span>Hesap</span></summary><div className="lobbyMobilePanel"><Link href="/profil">Profilim</Link>{access.canViewDiscipline&&<Link href="/disiplin">Disiplin dosyalarım</Link>}{!!management.length&&<><strong>Yönetim</strong>{management.map(([href,,label])=><Link key={href} href={href}>{label}</Link>)}</>}<form action="/api/logout" method="post"><button type="submit">Çıkış yap</button></form></div></details>:<Link href="/login"><i><QGIcon name="identity"/></i><span>Giriş</span></Link>}
 </nav>;
}
