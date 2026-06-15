/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean | number;
  products_count: number;
};

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function fetchCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/admin/categories", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data kategori.");
      }

      setCategories(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return categories.filter(
      (category) =>
        !keyword ||
        category.name.toLowerCase().includes(keyword) ||
        category.slug.toLowerCase().includes(keyword),
    );
  }, [categories, query]);

  const summary = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((category) => Boolean(category.is_active)).length,
      inactive: categories.filter((category) => !Boolean(category.is_active)).length,
    }),
    [categories],
  );

  function resetForm() {
    setName("");
    setIsActive(true);
    setEditingId(null);
  }

  function handleEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setIsActive(Boolean(category.is_active));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("is_active", isActive ? "1" : "0");

      const response = await apiFetch(
        editingId ? `/admin/categories/${editingId}` : "/admin/categories",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan kategori.");
      }

      toast.success(
        editingId
          ? "Kategori berhasil diperbarui."
          : "Kategori berhasil ditambahkan.",
      );
      resetForm();
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    if (category.products_count > 0) {
      setError(
        `Kategori ${category.name} masih digunakan oleh ${category.products_count} produk.`,
      );
      return;
    }

    if (!window.confirm(`Hapus kategori "${category.name}"?`)) return;

    try {
      setDeletingId(category.id);
      setError("");

      const response = await apiFetch(`/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus kategori.");
      }

      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );
      toast.success("Kategori berhasil dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-500">Catalog structure</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
              Kategori Produk
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola pengelompokan produk untuk navigasi dan filter toko.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              Total <strong className="ml-1 text-slate-900">{summary.total}</strong>
            </span>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              Aktif <strong className="ml-1">{summary.active}</strong>
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              Nonaktif <strong className="ml-1">{summary.inactive}</strong>
            </span>
          </div>
        </div>

        {error ? (
          <div className="mb-4 flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Tutup error">
              <X size={17} />
            </button>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <form
            onSubmit={handleSubmit}
            className="border-b border-slate-200 bg-slate-50/70 p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <label className="block flex-1">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {editingId ? "Edit nama kategori" : "Nama kategori baru"}
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Contoh: Makanan Kucing"
                  required
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                />
              </label>

              <div className="flex h-10 items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-3 lg:w-48">
                <span className="text-sm font-semibold text-slate-700">
                  {isActive ? "Aktif" : "Nonaktif"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive((current) => !current)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    isActive ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
                >
                  <Plus size={16} />
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan"
                      : "Tambah"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                ) : null}
              </div>
            </div>
          </form>

          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Daftar kategori</h3>
              <p className="mt-1 text-xs text-slate-500">
                {filteredCategories.length} kategori ditemukan
              </p>
            </div>
            <label className="relative block sm:w-64">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari kategori"
                className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                        Memuat kategori...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <p className="font-semibold text-slate-700">
                          Kategori tidak ditemukan
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Tambahkan kategori baru atau ubah pencarian.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-4 font-bold text-slate-800">
                          {category.name}
                        </td>
                        <td className="px-4 py-4 text-slate-500">{category.slug}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex min-w-10 justify-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                            {category.products_count}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
                              category.is_active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                          >
                            {category.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(category)}
                              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-bold text-[#17376f] hover:border-[#315b9f] hover:bg-blue-50"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(category)}
                              disabled={
                                deletingId === category.id ||
                                category.products_count > 0
                              }
                              title={
                                category.products_count > 0
                                  ? "Kategori masih digunakan produk"
                                  : "Hapus kategori"
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 size={14} />
                              {deletingId === category.id ? "Menghapus" : "Hapus"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
