"use client";
import {RichTextEditor} from "@/components/RichTextEditor";




export function AnnouncementComposer({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {


  return (
    <aside className="decreeEditor">
      <span>YÖNETİM // YENİ YAYIN</span>
      <h2>Duyuru yayımla</h2>
      <form action={action}>
        <input type="hidden" name="category" value="DUYURU" />
        <p className="decreeDecisionLink">İcra kararları <a href="/kodeks?tab=decisions">Kodeks'ten yayımlanır</a> ve burada otomatik görünür.</p>
        {(
          <label>
            Önem
            <select name="priority" defaultValue="normal">
              <option value="normal">Normal</option>
              <option value="important">Önemli</option>
              <option value="critical">Kritik</option>
            </select>
          </label>
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
