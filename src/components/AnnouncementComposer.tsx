"use client";
import {Select,Input,Button} from "@/components/ui/Primitives";

import {RichTextEditor} from "@/components/RichTextEditor";




export function AnnouncementComposer({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {


  return (
    <aside className="decreeEditor">

      <h2>Duyuru yayımla</h2>
      <form action={action}>
        <input type="hidden" name="category" value="DUYURU" />
        <p className="decreeDecisionLink">İcra kararları <a href="/kodeks?tab=decisions" className="qgAction">Kodeks'ten yayımlanır</a> ve burada otomatik görünür.</p>
        {(
          <label>
            Önem
            <Select name="priority" defaultValue="normal">
              <option value="normal">Normal</option>
              <option value="important">Önemli</option>
              <option value="critical">Kritik</option>
            </Select>
          </label>
        )}
        <label>
          Başlık
          <Input name="title" required />
        </label>
        <label>
          Metin
          <RichTextEditor name="body" required rows={8} />
        </label>
        <label className="decreeCheck">
          <input type="checkbox" name="pinned" /> Sabitle
        </label>
        <Button type="submit" level="secondary">YAYIMLA →</Button>
      </form>
    </aside>
  );
}
