"use client";

import Link from "next/link";
import {useState} from "react";
import type {ProfileActivityEntry} from "@/lib/profile-activity";

const labels = {publication: "Bir yayın yayımladı", comment: "Bir yayına yorum yaptı", badge: "Bir rozet kazandı"};
const symbols = {publication: "▤", comment: "◇", badge: "✦"};

export function ProfileActivityList({entries}: {entries: ProfileActivityEntry[]}) {
  const [visible, setVisible] = useState(5);
  if (!entries.length) return <div className="profileV2FutureState compact"><b>Henüz faaliyet yok</b><span>Yayımlanan eserler, yayın yorumları ve rozet kazanımları burada görünür.</span></div>;
  return <><ol className="qgProfileActivity">{entries.slice(0, visible).map(entry =>
    <li key={entry.id}><span className="qgActivityMark" aria-hidden="true">{symbols[entry.kind]}</span><div>
      <small>{labels[entry.kind]}</small><Link href={entry.href}>{entry.title}</Link>
      <time dateTime={entry.date}>{new Date(entry.date).toLocaleDateString("tr-TR", {day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Istanbul"})}</time>
    </div></li>)}</ol>{visible < entries.length && <button type="button" className="qgAction qgActivityMore" onClick={() => setVisible(value => value + 5)}>Daha fazla</button>}
    {entries.length === 20 && visible >= 20 && <p className="qgActivityLimit">Son 20 faaliyet gösteriliyor.</p>}
  </>;
}
