"use client";
import { useEffect, useId, useRef, useState, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import { RICH_PREFIX, richHtml, richPlain, safeHref } from "@/lib/rich-text";
import { RichText } from "./RichText";
export type RichTextEditorProps = {
  name?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
};
export function RichTextEditor({
  name,
  defaultValue = "",
  value,
  onValueChange,
  required,
  minLength = 0,
  maxLength = 50000,
  rows = 5,
  placeholder = "Metnini yaz…",
}: RichTextEditorProps) {
  const initial = value ?? defaultValue,
    id = useId();
  const [html, setHtml] = useState(initial),
    [preview, setPreview] = useState(false),
    [linkOpen, setLinkOpen] = useState(false),
    [url, setUrl] = useState(""),
    [linkError, setLinkError] = useState("");
  const wrapper = useRef<HTMLDivElement>(null),
    validator = useRef<HTMLTextAreaElement>(null),
    dirty = useRef(false);
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, protocols: ["https", "http", "mailto"] },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableKit,
    ],
    content: richHtml(initial),
    editorProps: {
      attributes: {
        class: "qgProse qgWritingArea",
        role: "textbox",
        "aria-label": placeholder,
        "aria-multiline": "true",
        "aria-describedby": id,
        spellcheck: "true",
        lang: "tr",
      },
      handleKeyDown: (view, event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "k"
        ) {
          event.preventDefault();
          setUrl(
            view.state.selection.$from
              .marks()
              .find((mark) => mark.type.name === "link")?.attrs.href || "",
          );
          setLinkError("");
          setLinkOpen(true);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const next = editor.isEmpty ? "" : RICH_PREFIX + editor.getHTML();
      setHtml(next);
      onValueChange?.(next);
      dirty.current = true;
    },
  });
  const plain = useMemo(() => richPlain(html), [html]),
    count = plain.length;
  useEffect(() => {
    if (editor && value !== undefined && value !== html) {
      editor.commands.setContent(richHtml(value), { emitUpdate: false });
      setHtml(value);
    }
  }, [value, editor, html]);
  useEffect(() => {
    validator.current?.setCustomValidity(
      html.length > 250000
        ? "Biçimlendirme sınırı aşıldı; metni böl veya biçimini sadeleştir."
        : count > maxLength
          ? `En fazla ${maxLength} karakter yazabilirsin.`
          : count < (required ? Math.max(1, minLength) : plain ? minLength : 0)
            ? `En az ${Math.max(1, minLength)} karakter yazmalısın.`
            : "",
    );
  }, [count, maxLength, minLength, required, plain, html.length]);
  useEffect(() => {
    const form = wrapper.current?.closest("form");
    const submit = () => {
      dirty.current = false;
    };
    const reset = () => {
      editor?.commands.setContent(richHtml(initial));
      setHtml(initial);
      dirty.current = false;
    };
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    form?.addEventListener("submit", submit);
    form?.addEventListener("reset", reset);
    window.addEventListener("beforeunload", unload);
    return () => {
      form?.removeEventListener("submit", submit);
      form?.removeEventListener("reset", reset);
      window.removeEventListener("beforeunload", unload);
    };
  }, [editor, initial]);
  const button = (
    label: string,
    title: string,
    run: () => void,
    active = false,
  ) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
      disabled={!editor || preview}
    >
      {label}
    </button>
  );
  function applyLink() {
    const href = safeHref(url);
    if (!href) {
      setLinkError(
        "https:// ile başlayan geçerli bir adres veya /sayfa bağlantısı gir.",
      );
      return;
    }
    if (editor?.state.selection.empty && !editor.isActive("link"))
      editor
        ?.chain()
        .focus()
        .insertContent({
          type: "text",
          text: url,
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
    else
      editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkOpen(false);
    setLinkError("");
  }
  return (
    <div
      ref={wrapper}
      className="qgEditor"
      style={{ "--editor-lines": rows } as React.CSSProperties}
    >
      <input type="hidden" name={name} value={html} />
      <textarea
        ref={validator}
        className="qgEditorValidator"
        aria-label="İçerik doğrulaması"
        tabIndex={-1}
        value={plain}
        onChange={() => {}}
        onInvalid={() => {
          setPreview(false);
          editor?.commands.focus();
        }}
      />
      <div
        className="qgEditorToolbar"
        role="toolbar"
        aria-label="Metin biçimlendirme"
      >
        {button(
          "B",
          "Kalın (Ctrl/Cmd+B)",
          () => editor?.chain().focus().toggleBold().run(),
          editor?.isActive("bold"),
        )}
        {button(
          "I",
          "İtalik (Ctrl/Cmd+I)",
          () => editor?.chain().focus().toggleItalic().run(),
          editor?.isActive("italic"),
        )}
        {button(
          "U",
          "Altı çizili (Ctrl/Cmd+U)",
          () => editor?.chain().focus().toggleUnderline().run(),
          editor?.isActive("underline"),
        )}
        {button("↗", "Bağlantı (Ctrl/Cmd+K)", () => {
          setUrl(editor?.getAttributes("link").href || "");
          setLinkError("");
          setLinkOpen(true);
        })}
        {button(
          "•",
          "Madde listesi",
          () => editor?.chain().focus().toggleBulletList().run(),
          editor?.isActive("bulletList"),
        )}
        {button(
          "1.",
          "Numaralı liste",
          () => editor?.chain().focus().toggleOrderedList().run(),
          editor?.isActive("orderedList"),
        )}
        {button("↶", "Geri al (Ctrl/Cmd+Z)", () =>
          editor?.chain().focus().undo().run(),
        )}
        {button("↷", "İleri al (Ctrl/Cmd+Shift+Z)", () =>
          editor?.chain().focus().redo().run(),
        )}
        <details>
          <summary aria-label="Diğer biçimlendirme seçenekleri">Diğer</summary>
          <div className="qgEditorMore">
            {button(
              "S̶",
              "Üstü çizili",
              () => editor?.chain().focus().toggleStrike().run(),
              editor?.isActive("strike"),
            )}
            {[2, 3, 4].map((level) => (
              <button
                type="button"
                disabled={!editor || preview}
                key={level}
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleHeading({ level: level as 2 | 3 | 4 })
                    .run()
                }
              >
                Başlık {level - 1}
              </button>
            ))}
            {button("¶", "Paragraf", () =>
              editor?.chain().focus().setParagraph().run(),
            )}
            {button("❞", "Alıntı", () =>
              editor?.chain().focus().toggleBlockquote().run(),
            )}
            {(["left", "center", "right", "justify"] as const).map(
              (align, i) => (
                <button
                  type="button"
                  disabled={!editor || preview}
                  key={align}
                  aria-pressed={editor?.isActive({ textAlign: align })}
                  onClick={() =>
                    editor?.chain().focus().setTextAlign(align).run()
                  }
                >
                  {["Sol", "Orta", "Sağ", "İki yana"][i]}
                </button>
              ),
            )}
            {button("Tablo", "3 × 3 tablo ekle", () =>
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run(),
            )}
            {editor?.isActive("table") && (
              <>
                {button("+ Satır", "Satır ekle", () =>
                  editor.chain().focus().addRowAfter().run(),
                )}
                {button("+ Sütun", "Sütun ekle", () =>
                  editor.chain().focus().addColumnAfter().run(),
                )}
                {button("− Satır", "Satırı sil", () =>
                  editor.chain().focus().deleteRow().run(),
                )}
                {button("− Sütun", "Sütunu sil", () =>
                  editor.chain().focus().deleteColumn().run(),
                )}
                {button("Tabloyu sil", "Tabloyu sil", () =>
                  editor.chain().focus().deleteTable().run(),
                )}
              </>
            )}
            {button("Bağı kaldır", "Bağlantıyı kaldır", () =>
              editor?.chain().focus().unsetLink().run(),
            )}
            {button("Temizle", "Seçili metnin biçimini temizle", () =>
              editor?.chain().focus().unsetAllMarks().clearNodes().run(),
            )}
          </div>
        </details>
        <button
          type="button"
          aria-pressed={preview}
          onClick={() => setPreview(!preview)}
        >
          {preview ? "Yaz" : "Önizle"}
        </button>
      </div>
      {linkOpen && (
        <div className="qgEditorLink" role="group" aria-label="Bağlantı ekle">
          <input
            autoFocus
            aria-label="Bağlantı adresi"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https:// veya /sayfa"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
          />
          <button type="button" onClick={applyLink}>
            Uygula
          </button>
          <button type="button" onClick={() => setLinkOpen(false)}>
            Vazgeç
          </button>
          {linkError && <span role="alert">{linkError}</span>}
        </div>
      )}
      <div hidden={preview}>
        <EditorContent editor={editor} />
        {!editor && <p>Yazı alanı hazırlanıyor…</p>}
      </div>
      {preview && <RichText value={html} />}
      <footer id={id}>
        <span>
          {plain.trim() ? plain.trim().split(/\s+/).length : 0} kelime · {count}
          /{maxLength}
        </span>
        <span>
          {count > maxLength
            ? "Karakter sınırı aşıldı."
            : "Türkçe · Yazım denetimi cihazına bağlı"}
        </span>
      </footer>
    </div>
  );
}
