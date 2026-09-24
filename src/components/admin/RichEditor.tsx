"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";

/** Editor de texto da matéria. O HTML vai para um input hidden com o `name` informado. */
export default function RichEditor({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        code: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
      Placeholder.configure({ placeholder: "Escreva o texto da matéria…" }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: "tiptap article-body px-5 py-4" },
      // Colar texto do Word/WhatsApp sem formatação estranha
      transformPastedHTML: (h) => h.replace(/ style="[^"]*"/g, "").replace(/<span[^>]*>|<\/span>/g, ""),
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-md border border-line bg-white focus-within:border-brand">
      <input type="hidden" name={name} value={html} />
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const file = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      quote: e.isActive("blockquote"),
      ul: e.isActive("bulletList"),
      ol: e.isActive("orderedList"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const b = (active: boolean) =>
    `min-w-8 rounded px-2 py-1 text-sm font-semibold transition ${active ? "bg-ink text-white" : "text-ink hover:bg-paper-2"}`;
  const chain = () => editor.chain().focus();

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço do link (deixe vazio para remover):", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  async function addImage(f?: File) {
    if (!f) return;
    setUploading(true);
    try {
      const src = await uploadImage(f, "materias/corpo");
      chain().setImage({ src, alt: "" }).run();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha no envio da imagem");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-line bg-white p-1.5">
      <button type="button" className={b(s.bold)} onClick={() => chain().toggleBold().run()} title="Negrito"><b>B</b></button>
      <button type="button" className={b(s.italic)} onClick={() => chain().toggleItalic().run()} title="Itálico"><i>I</i></button>
      <button type="button" className={b(s.underline)} onClick={() => chain().toggleUnderline().run()} title="Sublinhado"><u>U</u></button>
      <span className="mx-1 w-px bg-line" />
      <button type="button" className={b(s.h2)} onClick={() => chain().toggleHeading({ level: 2 }).run()} title="Intertítulo">Intertítulo</button>
      <button type="button" className={b(s.h3)} onClick={() => chain().toggleHeading({ level: 3 }).run()} title="Subtítulo">Sub</button>
      <button type="button" className={b(s.quote)} onClick={() => chain().toggleBlockquote().run()} title="Citação / olho">“ ”</button>
      <button type="button" className={b(s.ul)} onClick={() => chain().toggleBulletList().run()} title="Lista">• Lista</button>
      <button type="button" className={b(s.ol)} onClick={() => chain().toggleOrderedList().run()} title="Lista numerada">1. Lista</button>
      <span className="mx-1 w-px bg-line" />
      <button type="button" className={b(s.link)} onClick={setLink} title="Link">Link</button>
      <button type="button" className={b(false)} onClick={() => file.current?.click()} disabled={uploading} title="Inserir imagem">
        {uploading ? "Enviando…" : "Imagem"}
      </button>
      <button type="button" className={b(false)} onClick={() => chain().setHorizontalRule().run()} title="Linha divisória">―</button>
      <span className="flex-1" />
      <button type="button" className={b(false)} onClick={() => chain().undo().run()} disabled={!s.canUndo} title="Desfazer">↶</button>
      <button type="button" className={b(false)} onClick={() => chain().redo().run()} disabled={!s.canRedo} title="Refazer">↷</button>
      <input
        ref={file}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          addImage(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
