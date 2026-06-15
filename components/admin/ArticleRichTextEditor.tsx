"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { apiFetch } from "@/lib/api";

type Props = {
    value: string;
    onChange: (html: string) => void;
};

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ArticleRichTextEditor({ value, onChange }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                },
                orderedList: {
                    keepMarks: true,
                },
            }),
            ImageExtension.configure({
                inline: false,
                allowBase64: false,
            }),
        ],
        content: value || "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    "article-editor min-h-[320px] rounded-b-md border-x border-b border-slate-200 bg-white px-5 py-5 text-sm leading-7 outline-none",
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;

        const currentHtml = editor.getHTML();

        if ((value || "") !== currentHtml) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    if (!editor) return null;

    async function uploadImage(file: File) {
        if (!API) {
            alert("NEXT_PUBLIC_API_URL belum terbaca");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        const res = await apiFetch(`${API}/admin/editor/upload-image`, {
            method: "POST",
            body: formData,
            headers: {
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(text);
            alert("Upload image gagal. Cek route Laravel /api/editor/upload-image");
            return;
        }

        const data: { url?: string } = await res.json();
        if (data.url && editor) {
            editor.chain().focus().setImage({ src: data.url }).run();
        }
    }

    function handleImageSelect(file: File | null) {
        if (!file) return;
        uploadImage(file);
    }

    const buttonClass = (active = false) =>
        `rounded-md border px-3 py-2 text-sm font-semibold transition ${active
            ? "border-orange-500 bg-orange-500 text-white"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
        }`;

    return (
        <div className="overflow-hidden rounded-md">
            <div className="flex flex-wrap gap-2 rounded-t-md border border-slate-200 bg-slate-50 p-3">
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={buttonClass(editor.isActive("bold"))}
                >
                    Bold
                </button>

                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={buttonClass(editor.isActive("italic"))}
                >
                    Italic
                </button>

                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={buttonClass(editor.isActive("heading", { level: 2 }))}
                >
                    H2
                </button>

                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    className={buttonClass(editor.isActive("heading", { level: 3 }))}
                >
                    H3
                </button>

                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={buttonClass(editor.isActive("bulletList"))}
                >
                    Bullet List
                </button>

                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={buttonClass(editor.isActive("orderedList"))}
                >
                    Number List
                </button>

                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className={buttonClass()}
                >
                    Image
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                        handleImageSelect(e.target.files?.[0] || null);
                        e.target.value = "";
                    }}
                />
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
