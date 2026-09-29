"use client";
import dynamic from "next/dynamic";
import type { RichTextEditorProps } from "./RichTextEditorImpl";
const Editor = dynamic(
  () => import("./RichTextEditorImpl").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => <p className="qgEditorLoading">Yazı alanı hazırlanıyor…</p>,
  },
);
export function RichTextEditor(props: RichTextEditorProps) {
  return <Editor {...props} />;
}
