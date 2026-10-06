import { Node } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
export const Footnote = Node.create({
  name: "footnote", group: "inline", inline: true, atom: true,
  addAttributes() { return {
    note: { default: "", parseHTML: el => el.getAttribute("data-note"), renderHTML: a => ({ "data-note": a.note }) },
    source: { default: "", parseHTML: el => el.getAttribute("data-source"), renderHTML: a => ({ "data-source": a.source }) },
    number: { default: 1, parseHTML: el => Number(el.textContent) || 1, renderHTML: () => ({}) },
  }; },
  parseHTML() { return [{ tag: "sup[data-footnote]" }]; },
  renderHTML({ node, HTMLAttributes }) { return ["sup", { ...HTMLAttributes, "data-footnote": "true" }, String(node.attrs.number)]; },
  addProseMirrorPlugins() { return [new Plugin({
    appendTransaction(transactions, _old, state) {
      if (!transactions.some(t => t.docChanged)) return null;
      let number = 0; const tr = state.tr;
      state.doc.descendants((node, pos) => {
        if (node.type.name === "footnote" && node.attrs.number !== ++number) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, number });
        }
      });
      return tr.docChanged ? tr : null;
    },
  })]; },
});
