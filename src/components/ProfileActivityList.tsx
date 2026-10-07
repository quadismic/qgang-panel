"use client";

import {LoadMore} from "@/components/ui/LoadMore";
import {QGIcon,type QGIconName} from "@/components/QGIcon";
import {EmptyState} from "@/components/ui/Primitives";
import Link from "next/link";
import {useState} from "react";
import type {ProfileActivityEntry} from "@/lib/profile-activity";

const labels = {publication: "Bir yayın yayımladı", comment: "Bir yayına yorum yaptı", badge: "Bir rozet kazandı", event: "Bir etkinliğe katıldı"};
const symbols:Record<ProfileActivityEntry["kind"],QGIconName> = {publication: "document", comment: "comment", badge: "seal", event: "community"};

export function ProfileActivityList({entries}: {entries: ProfileActivityEntry[]}) {
  const [visible, setVisible] = useState(5);
  if (!entries.length) return <EmptyState title="Henüz faaliyet yok" message="Yayımlanan eserler, yayın yorumları rozet kazanımları ve doğrulanmış etkinlik katılımları burada görünür."/>;
  return <><ol className="qgProfileActivity">{entries.slice(0, visible).map(entry =>
    <li key={entry.id}><span className="qgActivityMark" aria-hidden="true"><QGIcon name={symbols[entry.kind]}/></span><div>
      <small>{labels[entry.kind]}</small><Link href={entry.href}>{entry.title}</Link>
      <time dateTime={entry.date}>{new Date(entry.date).toLocaleDateString("tr-TR", {day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Istanbul"})}</time>
    </div></li>)}</ol>{visible < entries.length && <LoadMore count={Math.min(5,entries.length-visible)} onClick={() => setVisible(value => value + 5)}/>}
    {entries.length === 20 && visible >= 20 && <p className="qgActivityLimit">Son 20 faaliyet gösteriliyor.</p>}
  </>;
}
