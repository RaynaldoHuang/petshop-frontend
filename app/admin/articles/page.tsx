"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import { FileText, ImagePlus, Pencil, Save, Trash2 } from "lucide-react";
import { getStorageUrl } from "@/lib/storage";

const ArticleRichTextEditor = dynamic(
    () => import("@/components/admin/ArticleRichTextEditor"),
    {
        ssr: false,
    }
) as React.ComponentType<{
    value: string;
    onChange: (html: string) => void;
}>;

const API = process.env.NEXT_PUBLIC_API_URL;

type Article = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    thumbnail: string | null;
    is_published: boolean | number;
    meta_title: string | null;
    meta_description: string | null;
    category: string | null;
    tags: string | null;
    reading_time: number;
    published_at: string | null;
};

const emptyForm = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    meta_title: "",
    meta_description: "",
    category: "",
    tags: "",
    is_published: true,
};

function imageUrl(path: string | null) {
    if (!path || path.trim() === "" || path.trim() === "0") return "/pet-placeholder.jpg";
    if (path.startsWith("http")) return path;
    return getStorageUrl(path);
}

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);

    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    async function fetchArticles() {
        try {
            setLoading(true);
            const res = await fetch(`${API}/admin/articles`, { cache: "no-store" });
            if (res.ok) setArticles(await res.json());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchArticles();
    }, []);

    function resetForm() {
        setEditingId(null);
        setForm(emptyForm);
        setThumbnail(null);
        setPreview("");
        setCurrentThumbnail(null);
    }

    function handleEdit(article: Article) {
        setEditingId(article.id);
        setForm({
            title: article.title ?? "",
            slug: article.slug ?? "",
            excerpt: article.excerpt ?? "",
            content: article.content ?? "",
            meta_title: article.meta_title ?? "",
            meta_description: article.meta_description ?? "",
            category: article.category ?? "",
            tags: article.tags ?? "",
            is_published: Boolean(article.is_published),
        });
        setThumbnail(null);
        setPreview("");
        setCurrentThumbnail(article.thumbnail);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleThumbnail(file: File | null) {
        setThumbnail(file);
        setPreview(file ? URL.createObjectURL(file) : "");
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("slug", form.slug);
            formData.append("excerpt", form.excerpt);
            formData.append("content", form.content);
            formData.append("meta_title", form.meta_title);
            formData.append("meta_description", form.meta_description);
            formData.append("category", form.category);
            formData.append("tags", form.tags);
            formData.append("is_published", form.is_published ? "1" : "0");

            if (thumbnail) formData.append("thumbnail", thumbnail);

            const url = editingId
                ? `${API}/admin/articles/${editingId}`
                : `${API}/admin/articles`;

            await fetch(url, {
                method: "POST",
                body: formData,
            });

            resetForm();
            fetchArticles();
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Yakin ingin hapus artikel ini?")) return;

        await fetch(`${API}/admin/articles/${id}`, {
            method: "DELETE",
        });

        setArticles((prev) => prev.filter((item) => item.id !== id));
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Kelola blog artikel untuk SEO dan edukasi customer.
                        </p>
                    </div>

                    <div className="hidden rounded-2xl bg-orange-100 p-4 text-orange-600 md:block">
                        <FileText size={32} />
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mb-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
                >
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingId ? "Edit Article" : "Tambah Article"}
                            </h2>

                            {editingId ? (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    Batal Edit
                                </button>
                            ) : null}
                        </div>

                        <div className="grid gap-5">
                            <Input
                                label="Title"
                                value={form.title}
                                onChange={(value) => setForm({ ...form, title: value })}
                                placeholder="Cara Merawat Anak Kucing"
                                required
                            />

                            <Input
                                label="Slug"
                                value={form.slug}
                                onChange={(value) => setForm({ ...form, slug: value })}
                                placeholder="Kosongkan jika ingin otomatis"
                            />

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-gray-700">
                                    Excerpt
                                </span>
                                <textarea
                                    value={form.excerpt}
                                    onChange={(e) =>
                                        setForm({ ...form, excerpt: e.target.value })
                                    }
                                    rows={3}
                                    placeholder="Ringkasan singkat artikel..."
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                                />
                            </label>

                            <div>
                                <span className="mb-2 block text-sm font-medium text-gray-700">
                                    Content
                                </span>

                                <ArticleRichTextEditor
                                    value={form.content}
                                    onChange={(html) => setForm({ ...form, content: html })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-xl font-semibold text-gray-900">
                                Thumbnail
                            </h2>

                            <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-orange-400 hover:bg-orange-50">
                                {preview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="h-56 w-full rounded-xl object-cover"
                                    />
                                ) : currentThumbnail ? (
                                    <Image
                                        src={imageUrl(currentThumbnail)}
                                        alt="Article thumbnail"
                                        width={500}
                                        height={300}
                                        className="h-56 w-full rounded-xl object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <>
                                        <ImagePlus className="mb-4 text-gray-400" size={44} />
                                        <p className="text-sm font-semibold text-gray-700">
                                            Upload thumbnail
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            JPG, PNG, WEBP maksimal 2MB
                                        </p>
                                    </>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        handleThumbnail(e.target.files?.[0] || null)
                                    }
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-xl font-semibold text-gray-900">
                                SEO & Publish
                            </h2>

                            <div className="grid gap-5">
                                <Input
                                    label="Meta Title"
                                    value={form.meta_title}
                                    onChange={(value) =>
                                        setForm({ ...form, meta_title: value })
                                    }
                                    placeholder="Akan pakai title jika kosong"
                                />

                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-gray-700">
                                        Meta Description
                                    </span>
                                    <textarea
                                        value={form.meta_description}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                meta_description: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        placeholder="Deskripsi SEO..."
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                                    />
                                </label>

                                <Input
                                    label="Category"
                                    value={form.category}
                                    onChange={(value) => setForm({ ...form, category: value })}
                                    placeholder="Pet Care"
                                />

                                <Input
                                    label="Tags"
                                    value={form.tags}
                                    onChange={(value) => setForm({ ...form, tags: value })}
                                    placeholder="kucing, makanan, tips"
                                />

                                <label className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            Publish Article
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Artikel akan tampil di website customer.
                                        </p>
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={form.is_published}
                                        onChange={(e) =>
                                            setForm({ ...form, is_published: e.target.checked })
                                        }
                                        className="h-5 w-5"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    <Save size={18} />
                                    {saving
                                        ? "Menyimpan..."
                                        : editingId
                                            ? "Update Article"
                                            : "Simpan Article"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold text-gray-900">
                        List Articles
                    </h2>

                    {loading ? (
                        <p className="text-sm text-gray-500">Memuat artikel...</p>
                    ) : articles.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                            Belum ada artikel.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {articles.map((article) => (
                                <div
                                    key={article.id}
                                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-24 w-32 overflow-hidden rounded-xl bg-gray-100">
                                            <Image
                                                src={imageUrl(article.thumbnail)}
                                                alt={article.title}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>

                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {article.title}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {article.category || "No category"} •{" "}
                                                {article.reading_time} min read
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                /blog/{article.slug}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold ${article.is_published
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-200 text-gray-600"
                                                }`}
                                        >
                                            {article.is_published ? "Published" : "Draft"}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleEdit(article)}
                                            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(article.id)}
                                            className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

function Input({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
                {label}
            </span>
            <input
                type={type}
                value={value}
                required={required}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
            />
        </label>
    );
}
