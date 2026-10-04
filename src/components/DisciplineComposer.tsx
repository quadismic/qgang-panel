"use client";
import {DisciplineBasisPicker} from "@/components/DisciplineBasisPicker";
import type {CodexRule} from "@/lib/codex";
import {RichTextEditor} from "@/components/RichTextEditor";


import { useMemo, useState } from "react";

type Person = {
  id: string;
  display_name: string;
  handle: string;
  role: string;
};

export function DisciplineComposer({
  people,
  allowEscalation,
  rules,
}: {
  people: Person[];
  rules: CodexRule[];
  allowEscalation: boolean;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Person | null>(null);
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr-TR");
    if (!needle) return people.slice(0, 6);
    return people
      .filter((person) =>
        `${person.display_name} ${person.handle}`
          .toLocaleLowerCase("tr-TR")
          .includes(needle),
      )
      .slice(0, 6);
  }, [people, query]);
  return (
    <form
      className="disciplineComposer"
      action="/api/moderation/sanction"
      method="post"
    >
      <input type="hidden" name="target_id" value={selected?.id ?? ""} />
      <label>
        Kişi ara
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
          }}
          placeholder="İsim veya @kullanıcı adı"
          autoComplete="off"
          required={!selected}
        />
      </label>
      <div className="disciplineSuggestions" aria-live="polite">
        {selected ? (
          <div className="disciplineSelected">
            <span>
              {selected.display_name} · @{selected.handle}
            </span>
            <button type="button" onClick={() => setSelected(null)}>
              Değiştir
            </button>
          </div>
        ) : results.length ? (
          results.map((person) => (
            <button
              type="button"
              key={person.id}
              onClick={() => {
                setSelected(person);
                setQuery(person.display_name);
              }}
            >
              <b>{person.display_name}</b>
              <span>@{person.handle}</span>
            </button>
          ))
        ) : (
          <span className="disciplineNoResult">Eşleşen üye yok.</span>
        )}
      </div>
      <label>
        Yaptırım
        <select name="action" defaultValue="warning">
          <option value="warning">Uyarı</option>
          <option value="restriction">Kısıtlama</option>
          <option value="mute">Susturma</option>
          {allowEscalation && (
            <option value="suspension">Geçici uzaklaştırma</option>
          )}
          {allowEscalation && <option value="ban">Uzaklaştırma</option>}
        </select>
      </label>
      <label>
        Süre (saat)
        <input
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
      <button type="submit">KARARI KAYDET →</button>
    </form>
  );
}
