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
 return <header className="qgTopbar">
  <Link href="/" className="qgTopbarBrand" aria-label="Q-GANG ana sayfa">
   <img src={brandTheme.mark} alt="" width={46} height={46}/>
   <span><strong>Q-GANG</strong><small>Oyun Topluluğu</small></span>
  </Link>
  <nav aria-label="Ana menü" className="qgTopbarNav">
   {primary.map(([href,icon,label])=>{const active=lobbyNavActive(path,href);return <Link key={href} href={href} className={active?"active":""} aria-current={active?"page":undefined}><QGIcon name={icon}/><span>{label}</span></Link>})}
  </nav>
  <div className="qgTopbarActions">
   {identity?<details className="qgAccountMenu" key={path+":account"}>
    <summary aria-label="Hesap menüsü"><span className="qgAccountAvatar">{identity.role&&<RankInsignia role={identity.role} size="sm"/>}</span><span className="qgAccountCopy"><strong>{identity.display_name||identity.handle||"Hesap"}</strong><small>{roleLabel(identity.role)}</small></span><QGIcon name="chevron"/></summary>
    <div className="qgAccountPanel"><Link href="/profil">Profilim</Link>{management.map(([href,,label])=><Link href={href} key={href}>{label}</Link>)}<form action="/api/logout" method="post"><button type="submit">Çıkış yap</button></form></div>
   </details>:<Link className="qgLoginLink" href="/login"><QGIcon name="identity"/><span>Giriş Yap</span></Link>}
  </div>
 </header>;
}
