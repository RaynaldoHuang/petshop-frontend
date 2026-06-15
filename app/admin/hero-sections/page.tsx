/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Eye,
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

type Hero = {
  id: number;
  image: string | null;
  link: string | null;
  is_active: boolean | number;
  sort_order: number;
};

const emptyForm = {
  link: "",
  is_active: true,
  sort_order: "0",
};

function imageUrl(path: string | null) {
  if (!path || path.trim() === "" || path.trim() === "0") {
    return "/image/pet-placeholder.jpg";
  }
  return path.startsWith("http") ? path : getStorageUrl(path);
}

export default function AdminHeroSectionsPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [heroToDelete, setHeroToDelete] = useState<Hero | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function fetchHeroes() {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/admin/hero-sections", {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Gagal mengambil data hero banner.");
      setHeroes(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHeroes();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const filteredHeroes = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return heroes.filter(
      (hero) =>
        !keyword ||
        hero.link?.toLowerCase().includes(keyword) ||
        String(hero.sort_order).includes(keyword),
    );
  }, [heroes, query]);

  const summary = useMemo(
    () => ({
      total: heroes.length,
      active: heroes.filter((hero) => Boolean(hero.is_active)).length,
      inactive: heroes.filter((hero) => !Boolean(hero.is_active)).length,
    }),
    [heroes],
  );

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setImage(null);
    setPreview("");
    setCurrentImage(null);
  }

  function openCreateForm() {
    setError("");
    resetForm();
    setFormOpen(true);
  }

  function openEditForm(hero: Hero) {
    setError("");
    setEditingId(hero.id);
    setForm({
      link: hero.link ?? "",
      is_active: Boolean(hero.is_active),
      sort_order: String(hero.sort_order ?? 0),
    });
    setImage(null);
    setPreview("");
    setCurrentImage(hero.image);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    resetForm();
    setError("");
  }

  function handleImage(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId && !image) {
      setError("Gambar banner wajib dipilih.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();
      formData.append("link", form.link);
      formData.append("is_active", form.is_active ? "1" : "0");
      formData.append("sort_order", form.sort_order || "0");
      if (image) formData.append("image", image);

      const response = await apiFetch(
        editingId
          ? `/admin/hero-sections/${editingId}`
          : "/admin/hero-sections",
        { method: "POST", body: formData },
      );
      const data = await response.json();

      if (!response.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : null;
        throw new Error(
          validationMessage || data.message || "Gagal menyimpan hero banner.",
        );
      }

      const wasEditing = Boolean(editingId);
      setFormOpen(false);
      resetForm();
      await fetchHeroes();
      toast.success(
        wasEditing
          ? "Hero banner berhasil diperbarui."
          : "Hero banner berhasil ditambahkan.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!heroToDelete) return;

    try {
      setDeleting(true);
      setError("");
      const response = await apiFetch(
        `/admin/hero-sections/${heroToDelete.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menghapus hero banner.");
      }

      setHeroes((current) =>
        current.filter((hero) => hero.id !== heroToDelete.id),
      );
      setHeroToDelete(null);
      toast.success("Hero banner berhasil dihapus.");
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
              Homepage management
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
              Hero Banner
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola banner carousel utama, tautan tujuan, dan urutan tampil.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600"
          >
            <Plus size={18} />
            Tambah Banner
          </button>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Total Banner" value={summary.total} />
          <SummaryCard label="Aktif" value={summary.active} color="emerald" />
          <SummaryCard label="Nonaktif" value={summary.inactive} color="slate" />
        </section>

        {error && !formOpen ? (
          <div className="mb-4 flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Tutup pesan">
              <X size={17} />
            </button>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Daftar hero banner</h3>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan {filteredHeroes.length} dari {heroes.length} banner
              </p>
            </div>
            <label className="relative block sm:w-72">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari link atau urutan"
                className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[#315b9f]"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Banner</th>
                  <th className="px-4 py-3">Link Tujuan</th>
                  <th className="px-4 py-3">Urutan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      Memuat hero banner...
                    </td>
                  </tr>
                ) : filteredHeroes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <ImagePlus size={28} className="mx-auto text-slate-300" />
                      <p className="mt-3 font-semibold text-slate-700">
                        Hero banner tidak ditemukan
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tambahkan banner baru atau ubah pencarian.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredHeroes.map((hero) => (
                    <tr key={hero.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-24 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                            <Image
                              src={imageUrl(hero.image)}
                              alt={`Hero banner ${hero.id}`}
                              width={192}
                              height={112}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              Banner #{hero.id}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Carousel homepage
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {hero.link ? (
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="max-w-64 truncate">{hero.link}</span>
                            <ExternalLink size={14} className="shrink-0 text-slate-400" />
                          </div>
                        ) : (
                          <span className="text-slate-400">Tanpa link</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex min-w-10 justify-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {hero.sort_order}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
                            hero.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {hero.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedHero(hero)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-bold text-[#17376f] hover:bg-blue-50"
                          >
                            <Eye size={15} />
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditForm(hero)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-bold text-[#17376f] hover:bg-blue-50"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeroToDelete(hero)}
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
        </section>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={closeForm}
            aria-label="Tutup dialog"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hero-form-title"
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  {editingId ? "Edit banner" : "Banner baru"}
                </p>
                <h3
                  id="hero-form-title"
                  className="mt-1 text-lg font-bold text-[#17376f]"
                >
                  {editingId ? "Edit Hero Banner" : "Tambah Hero Banner"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Tutup dialog"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 p-5">
                {error ? (
                  <div className="flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")}>
                      <X size={17} />
                    </button>
                  </div>
                ) : null}

                <div>
                  <p className="mb-1.5 text-sm font-bold text-slate-700">
                    Gambar banner
                  </p>
                  <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-center hover:border-orange-400 hover:bg-orange-50">
                    {preview || currentImage ? (
                      <Image
                        src={preview || imageUrl(currentImage)}
                        alt="Preview hero banner"
                        width={960}
                        height={540}
                        className="h-64 w-full rounded-md object-cover"
                        unoptimized
                      />
                    ) : (
                      <>
                        <ImagePlus size={34} className="text-slate-400" />
                        <p className="mt-3 text-sm font-bold text-slate-700">
                          Pilih gambar banner
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          JPG, PNG, atau WEBP. Rekomendasi 1920 x 1080 px.
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        handleImage(event.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Link tujuan
                  </span>
                  <input
                    value={form.link}
                    onChange={(event) =>
                      setForm({ ...form, link: event.target.value })
                    }
                    placeholder="/products atau https://example.com"
                    className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#315b9f]"
                  />
                  <span className="mt-1 block text-xs text-slate-400">
                    Jika kosong, banner akan menuju halaman produk.
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-slate-700">
                      Urutan tampil
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={form.sort_order}
                      onChange={(event) =>
                        setForm({ ...form, sort_order: event.target.value })
                      }
                      className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#315b9f]"
                    />
                  </label>
                  <div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Banner aktif
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Tampilkan di homepage.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.is_active}
                      onClick={() =>
                        setForm({ ...form, is_active: !form.is_active })
                      }
                      className={`relative h-6 w-11 rounded-full transition ${
                        form.is_active ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          form.is_active ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  onClick={closeForm}
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
                  <ImagePlus size={16} />
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedHero ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setSelectedHero(null)}
            aria-label="Tutup detail"
          />
          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Preview Banner
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#17376f]">
                  Hero Banner #{selectedHero.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHero(null)}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Tutup detail"
              >
                <X size={19} />
              </button>
            </div>
            <div className="p-5">
              <div className="aspect-video overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                <Image
                  src={imageUrl(selectedHero.image)}
                  alt={`Hero banner ${selectedHero.id}`}
                  width={1280}
                  height={720}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <DetailItem label="Link" value={selectedHero.link || "/products"} />
                <DetailItem label="Urutan" value={String(selectedHero.sort_order)} />
                <DetailItem
                  label="Status"
                  value={selectedHero.is_active ? "Aktif" : "Nonaktif"}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {heroToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => !deleting && setHeroToDelete(null)}
            aria-label="Tutup konfirmasi"
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white">
            <div className="p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Hapus hero banner?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Banner #{heroToDelete.id} akan dihapus permanen dari carousel
                homepage.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setHeroToDelete(null)}
                disabled={deleting}
                className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"
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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
