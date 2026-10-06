"use client";
import { useEffect, useId, useRef, useState, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import {createClient} from "@/lib/supabase/client";
import {ContentFigure,ContentVideo,ContentCallout,ContentDivider} from "./ContentBlocks";
import {mediaUrl,videoEmbed} from "@/lib/rich-text";
import {Footnote} from "./Footnote";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import { RICH_PREFIX, richHtml, richPlain, safeHref } from "@/lib/rich-text";
import { RichText } from "./RichText";
export type RichTextEditorProps = {
  compact?: boolean;
  footnotes?: boolean;
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
  compact = false,
  footnotes = false,
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
  const [uploading,setUploading]=useState(false), [previewSize,setPreviewSize]=useState("desktop"), [imageWidth,setImageWidth]=useState("text");
  const [blockOpen,setBlockOpen]=useState(false), [blockType,setBlockType]=useState("divider"), [blockUrl,setBlockUrl]=useState(""), [blockText,setBlockText]=useState(""), [blockAlt,setBlockAlt]=useState(""), [blockError,setBlockError]=useState("");
  const [noteOpen,setNoteOpen]=useState(false), [noteText,setNoteText]=useState(""), [noteSource,setNoteSource]=useState(""), [noteError,setNoteError]=useState("");
  const notePosition=useRef<number|null>(null);
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
      Footnote, TableKit, ContentFigure, ContentVideo, ContentCallout, ContentDivider,
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
      handleClickOn: (_view, pos, node) => {
        if (!footnotes || node.type.name !== "footnote") return false;
        notePosition.current=pos; setNoteText(node.attrs.note); setNoteSource(node.attrs.source); setNoteError(""); setNoteOpen(true); return true;
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
  async function uploadImage(file:File){
    setBlockError("");if(file.size>8388608||!["image/png","image/jpeg","image/webp"].includes(file.type)){setBlockError("PNG, JPEG veya WebP seç; en fazla 8 MB.");return;}
    setUploading(true);
    try{const bitmap=await createImageBitmap(file);bitmap.close();const client=createClient();const {data:{user}}=await client.auth.getUser();if(!user)throw new Error("Görsel yüklemek için giriş yapmalısın.");
      const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg",path=`${user.id}/content-${crypto.randomUUID()}.${ext}`;
      const {error}=await client.storage.from("qgang-publications").upload(path,file,{contentType:file.type,upsert:false});if(error)throw new Error("Görsel yüklenemedi; tekrar dene.");
      setBlockUrl(client.storage.from("qgang-publications").getPublicUrl(path).data.publicUrl);
    }catch(error){setBlockError(error instanceof Error?error.message:"Görsel okunamadı.");}finally{setUploading(false);}
  }
  function insertBlock(){
    const text=blockText.trim(); let block;
    if(blockType==="image") {const src=mediaUrl(blockUrl);if(!src||!blockAlt.trim()){setBlockError("HTTPS görsel adresi ve alternatif metin gerekli.");return;}block={type:"contentFigure",attrs:{src,alt:blockAlt.trim(),width:imageWidth},content:text?[{type:"text",text}]:[]};}
    else if(blockType==="video"){const src=videoEmbed(blockUrl);if(!src){setBlockError("Geçerli bir YouTube bağlantısı gir.");return;}block={type:"contentVideo",attrs:{src,title:text||"Video"}};}
    else if(blockType==="divider") block=text?{type:"contentDivider",content:[{type:"text",text}]}:{type:"horizontalRule"};
    else if(blockType==="quote") block={type:"blockquote",content:[{type:"paragraph",content:[{type:"text",text:text||"Alıntı metni"}]}]};
    else block={type:"contentCallout",attrs:{tone:blockType},content:[{type:"paragraph",content:[{type:"text",text:text||"Açıklama"}]}]};
    editor?.chain().focus().insertContent([block,{type:"paragraph"}]).run();setBlockOpen(false);setBlockError("");setBlockUrl("");setBlockText("");setBlockAlt("");
  }
  function saveNote() {
    if(!noteText.trim()){setNoteError("Dipnot açıklamasını veya kaynak künyesini yaz.");return;}
    const source=noteSource.trim()?safeHref(noteSource):"";
    if(noteSource.trim()&&!source){setNoteError("Geçerli bir kaynak bağlantısı gir.");return;}
    if(!editor)return;
    const attrs={note:noteText.trim(),source};
    const pos=notePosition.current;
    if(pos!==null&&editor.state.doc.nodeAt(pos)?.type.name==="footnote") editor.view.dispatch(editor.state.tr.setNodeMarkup(pos,undefined,attrs));
    else editor.chain().focus().insertContent({type:"footnote",attrs}).run();
    setNoteOpen(false); editor.commands.focus();
  }
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
        {footnotes&&button("Dipnot", "Dipnot ekle",()=>{const selected=editor?.state.doc.nodeAt(editor.state.selection.from);const editing=selected?.type.name==="footnote";notePosition.current=editing?editor!.state.selection.from:null;setNoteText(editing?selected.attrs.note:"");setNoteSource(editing?selected.attrs.source:"");setNoteError("");setNoteOpen(true);})}
        {!compact&&button("+ İçerik", "İçerik bloğu ekle",()=>setBlockOpen(!blockOpen))}
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
      {noteOpen&&<div className="qgBlockComposer qgNoteComposer" role="group" aria-label="Dipnot düzenle">
        <label>Açıklama / kaynak künyesi<textarea autoFocus maxLength={4000} rows={4} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Yazar, eser, yıl, sayfa veya açıklayıcı not…"/></label>
        <label>Kaynak bağlantısı (isteğe bağlı)<input value={noteSource} onChange={e=>setNoteSource(e.target.value)} placeholder="https://…"/></label>
        <button type="button" onClick={saveNote}>Dipnotu kaydet</button>
        <button type="button" onClick={()=>setNoteOpen(false)}>Vazgeç</button>
        {notePosition.current!==null&&<button type="button" onClick={()=>{const pos=notePosition.current;if(editor&&pos!==null&&editor.state.doc.nodeAt(pos)?.type.name==="footnote")editor.view.dispatch(editor.state.tr.delete(pos,pos+1));setNoteOpen(false);}}>Dipnotu sil</button>}
        {noteError&&<p role="alert">{noteError}</p>}
      </div>}
      {blockOpen && <div className="qgBlockComposer" role="group" aria-label="İçerik bloğu ekle">
        <label>İçerik türü<select value={blockType} onChange={e=>{setBlockType(e.target.value);setBlockError("");}}>{[["divider","Ayırıcı şerit"],["info","Bilgi alanı"],["warning","Uyarı alanı"],["important","Önemli açıklama"],["image","Görsel"],["video","YouTube videosu"],["quote","Alıntı"]].map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
        {["image","video"].includes(blockType)&&<label>HTTPS adresi<input value={blockUrl} onChange={e=>setBlockUrl(e.target.value)} placeholder="https://…"/></label>}
        {blockType==="image"&&<label>Görsel yükle (en fazla 8 MB)<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={e=>{const file=e.target.files?.[0];if(file)void uploadImage(file);e.target.value="";}}/>{uploading&&<span role="status">Yükleniyor…</span>}</label>}
        {blockType==="image"&&<label>Görsel genişliği<select value={imageWidth} onChange={e=>setImageWidth(e.target.value)}><option value="text">Metin genişliği</option><option value="full">Tam genişlik</option></select></label>}
        {blockType==="image"&&<label>Alternatif metin<input value={blockAlt} onChange={e=>setBlockAlt(e.target.value)}/></label>}
        <label>{blockType==="image"?"Görsel açıklaması":blockType==="video"?"Video başlığı":"Metin / başlık"}<input value={blockText} onChange={e=>setBlockText(e.target.value)}/></label>
        <button type="button" disabled={uploading} onClick={insertBlock}>Ekle</button><button type="button" onClick={()=>setBlockOpen(false)}>Vazgeç</button>{blockError&&<p role="alert">{blockError}</p>}
      </div>}
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
      {preview && <><div className="qgPreviewTools"><button type="button" aria-pressed={previewSize==="desktop"} onClick={()=>setPreviewSize("desktop")}>Masaüstü</button><button type="button" aria-pressed={previewSize==="mobile"} onClick={()=>setPreviewSize("mobile")}>Mobil</button></div><div className={previewSize==="mobile"?"qgMobilePreview":""}><RichText value={html} /></div></>}
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
