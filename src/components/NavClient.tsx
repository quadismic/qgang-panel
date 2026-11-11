"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {QGIcon} from "@/components/QGIcon";
import {lobbyNavigation,lobbyNavActive,type LobbyNavAccess} from "@/lib/lobby-navigation";
import {thumbnail} from "@/lib/presentation-image";

export type LobbyIdentity={display_name:string|null;handle:string|null;role:string|null;avatar_url?:string|null};
export function NavClient({identity,...access}:LobbyNavAccess&{identity?:LobbyIdentity|null}){
 const path=usePathname(),{primary,management}=lobbyNavigation(access);
 return <header className="qgTopbar">
  <nav aria-label="Ana menü" className="qgTopbarNav">
   {primary.map(([href,,label])=>{const active=lobbyNavActive(path,href);return <Link key={href} href={href} className={active?"active":""} aria-current={active?"page":undefined}>{label}</Link>})}
  </nav>
  <div className="qgTopbarActions">
   {identity?<details className="qgAccountMenu" key={path+":account"}>
    <summary aria-label="Profil ve hesap menüsü"><span className="qgAccountAvatar">{identity.avatar_url?<img src={thumbnail(identity.avatar_url,128)} alt="" width={36} height={36}/>:<QGIcon name="identity"/>}</span></summary>
    <div className="qgAccountPanel"><Link href="/profil">Profilim</Link>{management.map(([href,,label])=><Link href={href} key={href}>{label}</Link>)}<form action="/api/logout" method="post"><button type="submit">Çıkış yap</button></form></div>
   </details>:<Link className="qgLoginLink" href="/login"><QGIcon name="identity"/><span>Giriş Yap</span></Link>}
  </div>
 </header>;
}
