"use client";
import {Select,Input,Button} from "@/components/ui/Primitives";

import {MemberPicker,type MemberChoice} from "@/components/MemberPicker";
import {DisciplineBasisPicker} from "@/components/DisciplineBasisPicker";
import type {CodexRule} from "@/lib/codex";
import {RichTextEditor} from "@/components/RichTextEditor";


import { useState } from "react";

export function DisciplineComposer({allowEscalation,rules}:{rules:CodexRule[];allowEscalation:boolean}) {
 const [selected,setSelected]=useState<MemberChoice|null>(null);
  return (
    <form
      className="disciplineComposer"
      action="/api/moderation/sanction"
      method="post"
    >
      <MemberPicker name="target_id" label="Kararın uygulanacağı kişi" scope="discipline" onChange={setSelected}/>
      <label>
        Yaptırım
        <Select name="action" defaultValue="warning">
          <option value="warning">Uyarı</option>
          <option value="restriction">Kısıtlama</option>
          <option value="mute">Susturma</option>
          {allowEscalation && (
            <option value="suspension">Geçici uzaklaştırma</option>
          )}
          {allowEscalation && <option value="ban">Uzaklaştırma</option>}
        </Select>
      </label>
      <label>
        Süre (saat)
        <Input
          type="number"
          name="hours"
          min="0"
          placeholder="Süresiz için 0"
        />
      </label>
      <DisciplineBasisPicker rules={rules}/>
      <label>
        Gerekçe
        <RichTextEditor name="reason" maxLength={500} minLength={5} required rows={5} />
      </label>
      <label>
        Delil / kayıt
        <RichTextEditor
          name="evidence" maxLength={2000}
          rows={4}
          placeholder="Bağlantı, ekran kaydı veya olay notu"
        />
      </label>
      {selected&&<p className="disciplineTargetConfirm">Karar: <strong>{selected.display_name} · @{selected.handle}</strong> için kaydedilecek.</p>}
      <Button level="secondary" type="submit" disabled={!selected}>KARARI KAYDET</Button>
    </form>
  );
}
