"use client";
import {LoadingState} from "./ui/Primitives";
import dynamic from "next/dynamic";
import type { RichTextEditorProps } from "./RichTextEditorImpl";
const Editor = dynamic(
  () => import("./RichTextEditorImpl").then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => <LoadingState className="qgEditorLoading" label="Yazı alanı hazırlanıyor…"/>,
  },
);
export function RichTextEditor(props: RichTextEditorProps) {
  return <Editor {...props} />;
}
