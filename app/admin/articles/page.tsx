/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { getStorageUrl } from "@/lib/storage";

const ArticleRichTextEditor = dynamic(
  () => import("@/components/admin/ArticleRichTextEditor"),
  { ssr: false },
) as React.ComponentType<{
  value: string;
  onChange: (html: string) => void;
}>;

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
  created_at?: string;
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

const ITEMS_PER_PAGE = 8;

function imageUrl(path: string | null) {
  if (!path || path.trim() === "" || path.trim() === "0") {
    return "/image/pet-placeholder.jpg";
  }
  return path.startsWith("http") ? path : getStorageUrl(path);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Belum dipublikasikan";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function fetchArticles() {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/admin/articles", { cache: "no-store" });

      if (!response.ok) throw new Error("Gagal mengambil data artikel.");
      setArticles(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const filteredArticles = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesQuery =
        !keyword ||
        article.title.toLowerCase().includes(keyword) ||
        article.slug.toLowerCase().includes(keyword) ||
        article.category?.toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && Boolean(article.is_published)) ||
        (statusFilter === "draft" && !Boolean(article.is_published));

      return matchesQuery && matchesStatus;
    });
  }, [articles, query, statusFilter]);

  const summary = useMemo(
    () => ({
      total: articles.length,
      published: articles.filter((article) => Boolean(article.is_published))
        .length,
      draft: articles.filter((article) => !Boolean(article.is_published)).length,
    }),
    [articles],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredArticles.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedArticles = filteredArticles.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setThumbnail(null);
    setPreview("");
    setCurrentThumbnail(null);
  }

  function openCreateForm() {
    setError("");
    resetForm();
    setEditorOpen(true);
  }

  function openEditForm(article: Article) {
    setError("");
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
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving) return;
    setEditorOpen(false);
    resetForm();
    setError("");
  }

  function handleThumbnail(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setThumbnail(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.content || form.content === "<p></p>") {
      setError("Konten artikel wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === "boolean" ? (value ? "1" : "0") : value,
        );
      });
      if (thumbnail) formData.append("thumbnail", thumbnail);

      const response = await apiFetch(
        editingId ? `/admin/articles/${editingId}` : "/admin/articles",
        { method: "POST", body: formData },
      );
      const data = await response.json();

      if (!response.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : null;
        throw new Error(
          validationMessage || data.message || "Gagal menyimpan artikel.",
        );
      }

      const wasEditing = Boolean(editingId);
      setEditorOpen(false);
      resetForm();
      await fetchArticles();
      toast.success(
        wasEditing
          ? "Artikel berhasil diperbarui."
          : "Artikel berhasil ditambahkan.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!articleToDelete) return;

    try {
      setDeleting(true);
      setError("");
      const response = await apiFetch(
        `/admin/articles/${articleToDelete.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menghapus artikel.");
      }

      setArticles((current) =>
        current.filter((article) => article.id !== articleToDelete.id),
      );
      setArticleToDelete(null);
      toast.success("Artikel berhasil dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              Content management
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
              Artikel
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola konten edukasi pelanggan dan optimasi SEO website.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600"
          >
            <Plus size={18} />
            Tambah Artikel
          </button>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Total Artikel" value={summary.total} />
          <SummaryCard
            label="Dipublikasikan"
            value={summary.published}
            color="emerald"
          />
          <SummaryCard label="Draft" value={summary.draft} color="slate" />
        </section>

        {error && !editorOpen ? (
          <div className="mb-4 flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Tutup pesan">
              <X size={17} />
            </button>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Daftar artikel</h3>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan {filteredArticles.length} dari {articles.length} artikel
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:w-72">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari judul, slug, atau kategori"
                  className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[#315b9f]"
                />
              </label>
              <label className="relative block sm:w-44">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-[#315b9f]"
                >
                  <option value="all">Semua status</option>
                  <option value="published">Dipublikasikan</option>
                  <option value="draft">Draft</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Artikel</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Waktu Baca</th>
                  <th className="px-4 py-3">Publikasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Memuat artikel...
                    </td>
                  </tr>
                ) : paginatedArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <FileText size={28} className="mx-auto text-slate-300" />
                      <p className="mt-3 font-semibold text-slate-700">
                        Artikel tidak ditemukan
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tambahkan artikel atau ubah pencarian dan filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                            <Image
                              src={imageUrl(article.thumbnail)}
                              alt={article.title}
                              width={96}
                              height={72}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-72 truncate font-bold text-slate-800">
                              {article.title}
                            </p>
                            <p className="mt-1 max-w-72 truncate text-xs text-slate-500">
                              /blog/{article.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {article.category || "Tanpa kategori"}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {article.reading_time} menit
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(article.published_at || article.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
                            article.is_published
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {article.is_published ? "Dipublikasikan" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {article.is_published ? (
                            <Link
                              href={`/blog/${article.slug}`}
                              target="_blank"
                              className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                              aria-label={`Lihat ${article.title}`}
                              title="Lihat artikel"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => openEditForm(article)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-bold text-[#17376f] hover:border-[#315b9f] hover:bg-blue-50"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setArticleToDelete(article)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredArticles.length > 0 ? (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-500">
                Halaman {safeCurrentPage} dari {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((current) => Math.max(1, current - 1))
                  }
                  disabled={safeCurrentPage === 1}
                  className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="min-w-9 rounded-md bg-[#17376f] px-3 py-2 text-center text-xs font-bold text-white">
                  {safeCurrentPage}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((current) =>
                      Math.min(totalPages, current + 1),
                    )
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55"
            onClick={closeEditor}
            aria-label="Tutup editor"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-editor-title"
            className="relative z-10 flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  {editingId ? "Edit konten" : "Konten baru"}
                </p>
                <h3
                  id="article-editor-title"
                  className="mt-1 text-xl font-bold text-[#17376f]"
                >
                  {editingId ? "Edit Artikel" : "Tambah Artikel"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup editor"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {error ? (
                  <div className="mb-5 flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{error}</span>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      aria-label="Tutup pesan"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : null}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
                  <div className="grid content-start gap-5">
                    <Field
                      label="Judul artikel"
                      value={form.title}
                      onChange={(value) => setForm({ ...form, title: value })}
                      placeholder="Contoh: Cara Merawat Anak Kucing"
                      required
                    />
                    <Field
                      label="Slug"
                      value={form.slug}
                      onChange={(value) => setForm({ ...form, slug: value })}
                      placeholder="Kosongkan untuk dibuat otomatis"
                      hint="Alamat artikel, contoh: cara-merawat-anak-kucing"
                    />
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-bold text-slate-700">
                        Ringkasan
                      </span>
                      <textarea
                        value={form.excerpt}
                        onChange={(event) =>
                          setForm({ ...form, excerpt: event.target.value })
                        }
                        rows={3}
                        placeholder="Ringkasan singkat artikel..."
                        className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#315b9f]"
                      />
                    </label>
                    <div>
                      <span className="mb-1.5 block text-sm font-bold text-slate-700">
                        Konten artikel
                      </span>
                      <ArticleRichTextEditor
                        value={form.content}
                        onChange={(content) => setForm({ ...form, content })}
                      />
                    </div>
                  </div>

                  <div className="grid content-start gap-5">
                    <div>
                      <p className="mb-1.5 text-sm font-bold text-slate-700">
                        Thumbnail
                      </p>
                      <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-center hover:border-orange-400 hover:bg-orange-50">
                        {preview || currentThumbnail ? (
                          <Image
                            src={preview || imageUrl(currentThumbnail)}
                            alt="Preview thumbnail"
                            width={520}
                            height={300}
                            className="h-48 w-full rounded-md object-cover"
                            unoptimized
                          />
                        ) : (
                          <>
                            <ImagePlus size={30} className="text-slate-400" />
                            <p className="mt-3 text-sm font-bold text-slate-700">
                              Pilih thumbnail
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              JPG, PNG, atau WEBP, maksimal 2 MB
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) =>
                            handleThumbnail(event.target.files?.[0] || null)
                          }
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                      <Field
                        label="Kategori"
                        value={form.category}
                        onChange={(value) => setForm({ ...form, category: value })}
                        placeholder="Contoh: Pet Care"
                      />
                      <Field
                        label="Tags"
                        value={form.tags}
                        onChange={(value) => setForm({ ...form, tags: value })}
                        placeholder="kucing, makanan, tips"
                      />
                    </div>

                    <div className="grid gap-4 rounded-md border border-slate-200 p-4">
                      <p className="text-sm font-bold text-slate-900">Pengaturan SEO</p>
                      <Field
                        label="Meta title"
                        value={form.meta_title}
                        onChange={(value) =>
                          setForm({ ...form, meta_title: value })
                        }
                        placeholder="Menggunakan judul jika kosong"
                      />
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-bold text-slate-700">
                          Meta description
                        </span>
                        <textarea
                          value={form.meta_description}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              meta_description: event.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Deskripsi untuk mesin pencari"
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#315b9f]"
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Publikasikan artikel
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Tampilkan pada website pelanggan.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={form.is_published}
                        onClick={() =>
                          setForm({
                            ...form,
                            is_published: !form.is_published,
                          })
                        }
                        className={`relative h-6 w-11 rounded-full transition ${
                          form.is_published ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                            form.is_published ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  <FileText size={16} />
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Artikel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {articleToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => !deleting && setArticleToDelete(null)}
            aria-label="Tutup konfirmasi"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-article-title"
            className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white"
          >
            <div className="p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>
              <h3
                id="delete-article-title"
                className="text-lg font-bold text-slate-900"
              >
                Hapus artikel?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Artikel{" "}
                <strong className="text-slate-700">
                  {articleToDelete.title}
                </strong>{" "}
                akan dihapus permanen dan tidak dapat dipulihkan.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                disabled={deleting}
                className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                <Trash2 size={16} />
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: number;
  color?: "blue" | "emerald" | "slate";
}) {
  const colors = {
    blue: "border-slate-200 bg-white text-slate-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    slate: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return (
    <article className={`rounded-lg border p-4 ${colors[color]}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <input
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#315b9f]"
      />
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}
