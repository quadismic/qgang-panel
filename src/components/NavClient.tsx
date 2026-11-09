"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {brandTheme} from "@/config/brand-theme";
import {QGIcon} from "@/components/QGIcon";
import {RankInsignia} from "@/components/RankInsignia";
import {roleLabel} from "@/lib/roles";
import {lobbyNavigation,lobbyNavActive,type LobbyNavAccess} from "@/lib/lobby-navigation";

export type LobbyIdentity={display_name:string|null;handle:string|null;role:string|null};
export function NavClient({identity,...access}:LobbyNavAccess&{identity?:LobbyIdentity|null}){
 const path=usePathname(),{primary,management}=lobbyNavigation(access);
 return <aside className="nav commandRail lobbyRail">
  <Link href="/" className="commandBrand" aria-label="Q-GANG Lobi"><span className="qgBrandArtwork" aria-hidden="true"><img src={brandTheme.emblem} alt=""/></span></Link>
  <nav aria-label="Ana menü" className="lobbyPrimaryNav"><div className="commandNavGroup">{primary.map(([href,icon,label])=><Link key={href} href={href} title={label} aria-label={label} className={lobbyNavActive(path,href)?"active":""} aria-current={lobbyNavActive(path,href)?"page":undefined}><i><QGIcon name={icon}/></i><span>{label}</span></Link>)}</div></nav>
  <div className="navBottom">
   {!!management.length&&<details className="lobbyRailMenu" key={path+":management"}><summary title="Yönetim"><QGIcon name="control"/><span>Yönetim</span></summary><div>{management.map(([href,icon,label])=><Link href={href} key={href}><QGIcon name={icon}/>{label}</Link>)}</div></details>}
   {identity?<details className="lobbyRailMenu lobbyAccount" key={path+":account"}><summary className="identityPlate" title="Hesap"><span className="identityPlateInsignia">{identity.role&&<RankInsignia role={identity.role} size="lg"/>}</span><span className="identityPlateCopy"><strong>{identity.display_name||identity.handle||"Hesap"}</strong><small>{roleLabel(identity.role)}</small></span></summary><div><Link href="/profil">Profilim</Link>{access.canViewDiscipline&&<Link href="/disiplin">Disiplin dosyalarım</Link>}<form action="/api/logout" method="post"><button type="submit">Çıkış yap</button></form></div></details>:<Link className="identityPlate identityPlateGuest" href="/login"><QGIcon name="identity"/><span className="identityPlateCopy"><strong>Giriş yap</strong></span></Link>}
  </div>
 </aside>;
}
