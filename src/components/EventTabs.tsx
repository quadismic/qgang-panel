"use client";
import Link,{useLinkStatus} from "next/link";
function TabLabel({children}:{children:React.ReactNode}){const {pending}=useLinkStatus();return <><span>{children}</span>{pending&&<span className="eventTabPending" role="status">Yükleniyor…</span>}</>;}
export function EventTabs({archive}:{archive:boolean}){return <nav className="eventTabs" aria-label="Etkinlik görünümleri"><Link className="qgButton qgButton-tertiary" href="/etkinlikler" aria-current={!archive?"page":undefined}><TabLabel>Yaklaşan Etkinlikler</TabLabel></Link><Link className="qgButton qgButton-tertiary" href="/etkinlikler?view=archive" aria-current={archive?"page":undefined}><TabLabel>Etkinlik Arşivi</TabLabel></Link></nav>;}
