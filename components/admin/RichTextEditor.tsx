"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-neutral max-w-none focus:outline-none min-h-48",
      },
    },
  });

  // Sync external resets (e.g. when initial value loads after mount).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-md border border-neutral-300 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 p-2 text-xs">
        <Btn on={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</Btn>
        <Btn on={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</Btn>
        <Btn on={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
        <Btn on={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
        <Btn on={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>•</Btn>
        <Btn on={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</Btn>
        <Btn on={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>“”</Btn>
        <Btn
          on={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt("URL");
            if (!url) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          link
        </Btn>
      </div>
      <EditorContent editor={editor} className="px-4 py-3" />
    </div>
  );
}

function Btn({ children, onClick, on }: { children: React.ReactNode; onClick: () => void; on?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded hover:bg-neutral-100 font-medium",
        on && "bg-neutral-900 text-white hover:bg-neutral-900",
      )}
    >
      {children}
    </button>
  );
}
