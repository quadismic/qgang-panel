"use client";
import {RichTextEditor} from "@/components/RichTextEditor";


import { useState } from "react";

export function AnnouncementComposer({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [category, setCategory] = useState<"DUYURU" | "KARAR">("DUYURU");

  return (
    <aside className="decreeEditor">
      <span>YÖNETİM // YENİ YAYIN</span>
      <h2>Duyuru yayımla</h2>
      <form action={action}>
        <label>
          Tür
          <select
            name="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as "DUYURU" | "KARAR")
            }
          >
            <option value="DUYURU">Duyuru</option>
            <option value="KARAR">Karar</option>
          </select>
        </label>
        {category === "DUYURU" ? (
          <label>
            Önem
            <select name="priority" defaultValue="normal">
              <option value="normal">Normal</option>
              <option value="important">Önemli</option>
              <option value="critical">Kritik</option>
            </select>
          </label>
        ) : (
          <input type="hidden" name="priority" value="normal" />
        )}
        <label>
          Başlık
          <input name="title" required />
        </label>
        <label>
          Metin
          <RichTextEditor name="body" required rows={8} />
        </label>
        <label className="decreeCheck">
          <input type="checkbox" name="pinned" /> Sabitle
        </label>
        <button>YAYIMLA →</button>
      </form>
    </aside>
  );
}
