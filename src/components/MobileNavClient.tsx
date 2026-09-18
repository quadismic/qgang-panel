"use client";
import Link from "next/link";import {usePathname} from "next/navigation";
const items=[["/rules","§","Kurallar"],["/members","◎","Üyeler"],["/announcements","◈","Duyuru"],["/penalties","!","Cezalar"],["/fund","₺","Bütçe"]] as const;
export function MobileNavClient(_: {unread:number;moreHref:string;moreLabel:string}){const path=usePathname();return <nav className="mobileNav hubMobile" aria-label="Q-HUB mobil menü">{items.map(([href,icon,label])=><Link key={href} className={path.startsWith(href)?"active":""} href={href}><i>{icon}</i><span>{label}</span></Link>)}</nav>}