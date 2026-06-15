/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type Announcement = {
  id: number;
  text: string;
  link_text: string | null;
  link_href: string | null;
  bg_color: string;
  text_color: string;
  border_color: string | null;
  is_active: boolean;
  sort_order: number;
};

const COLOR_PRESETS = [
  {
    label: "Biru",
    bg: "bg-blue-100",
    text: "text-blue-900",
    border: "border-blue-900",
    swatch: "bg-blue-500",
  },
  {
    label: "Oranye",
    bg: "bg-orange-100",
    text: "text-orange-900",
    border: "border-orange-700",
    swatch: "bg-orange-500",
  },
  {
    label: "Hijau",
    bg: "bg-green-100",
    text: "text-green-900",
    border: "border-green-700",
    swatch: "bg-green-500",
  },
  {
    label: "Merah Muda",
    bg: "bg-pink-100",
    text: "text-pink-900",
    border: "border-pink-700",
    swatch: "bg-pink-500",
  },
  {
    label: "Kuning",
    bg: "bg-yellow-100",
    text: "text-yellow-900",
    border: "border-yellow-700",
    swatch: "bg-yellow-500",
  },
];

const emptyForm = {
  text: "",
  link_text: "",
  link_href: "",
  bg_color: "bg-blue-100",
  text_color: "text-blue-900",
  border_color: "border-blue-900",
  is_active: true,
  sort_order: "1",
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] =
    useState<Announcement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/admin/announcements", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data pengumuman.");
      }

      setAnnouncements(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return announcements.filter(
      (item) =>
        !keyword ||
        item.text.toLowerCase().includes(keyword) ||
        item.link_text?.toLowerCase().includes(keyword) ||
        item.link_href?.toLowerCase().includes(keyword),
    );
  }, [announcements, query]);

  const summary = useMemo(
    () => ({
      total: announcements.length,
      active: announcements.filter((item) => item.is_active).length,
      inactive: announcements.filter((item) => !item.is_active).length,
    }),
    [announcements],
  );

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function openCreateForm() {
    setError("");
    resetForm();
    setFormOpen(true);
  }

  function openEditForm(item: Announcement) {
    setError("");
    setEditingId(item.id);
    setForm({
      text: item.text,
      link_text: item.link_text ?? "",
      link_href: item.link_href ?? "",
      bg_color: item.bg_color,
      text_color: item.text_color,
      border_color: item.border_color ?? "",
      is_active: Boolean(item.is_active),
      sort_order: String(item.sort_order ?? 0),
    });
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setError("");
    resetForm();
  }

  function applyPreset(index: number) {
    const preset = COLOR_PRESETS[index];
    setForm({
      ...form,
      bg_color: preset.bg,
      text_color: preset.text,
      border_color: preset.border,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if ((form.link_text && !form.link_href) || (!form.link_text && form.link_href)) {
      setError("Teks link dan URL tujuan harus diisi bersamaan.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await apiFetch(
        editingId
          ? `/admin/announcements/${editingId}`
          : "/admin/announcements",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: form.text,
            link_text: form.link_text || null,
            link_href: form.link_href || null,
            bg_color: form.bg_color,
            text_color: form.text_color,
            border_color: form.border_color || null,
            is_active: form.is_active,
            sort_order: Number(form.sort_order || 0),
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : null;
        throw new Error(
          validationMessage || data.message || "Gagal menyimpan pengumuman.",
        );
      }

      const wasEditing = Boolean(editingId);
      setFormOpen(false);
      resetForm();
      await fetchAnnouncements();
      window.dispatchEvent(new Event("announcement-updated"));
      toast.success(
        wasEditing
          ? "Pengumuman berhasil diperbarui."
          : "Pengumuman berhasil ditambahkan.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!announcementToDelete) return;

    try {
      setDeleting(true);
      setError("");
      const response = await apiFetch(
        `/admin/announcements/${announcementToDelete.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menghapus pengumuman.");
      }

      setAnnouncements((current) =>
        current.filter((item) => item.id !== announcementToDelete.id),
      );
      setAnnouncementToDelete(null);
      window.dispatchEvent(new Event("announcement-updated"));
      toast.success("Pengumuman berhasil dihapus.");
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
              Store communication
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
              Pengumuman
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola bar informasi dan promo yang tampil di atas navigasi toko.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600"
          >
            <Plus size={18} />
            Tambah Pengumuman
          </button>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Total Pengumuman" value={summary.total} />
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
              <h3 className="font-bold text-slate-900">Daftar pengumuman</h3>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan {filteredAnnouncements.length} dari{" "}
                {announcements.length} pengumuman
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
                placeholder="Cari teks atau link"
                className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[#315b9f]"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Pengumuman</th>
                  <th className="px-4 py-3">Link</th>
                  <th className="px-4 py-3">Urutan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      Memuat pengumuman...
                    </td>
                  </tr>
                ) : filteredAnnouncements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <Megaphone size={28} className="mx-auto text-slate-300" />
                      <p className="mt-3 font-semibold text-slate-700">
                        Pengumuman tidak ditemukan
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tambahkan pengumuman baru atau ubah pencarian.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAnnouncements.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <div
                          className={`max-w-xl rounded-md border px-3 py-2.5 text-center ${item.bg_color} ${item.text_color} ${
                            item.border_color || "border-slate-200"
                          }`}
                        >
                          <span className="text-xs font-semibold">{item.text}</span>
                          {item.link_text ? (
                            <span className="ml-2 text-xs font-bold underline underline-offset-2">
                              {item.link_text}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {item.link_href ? (
                          <div className="flex max-w-52 items-center gap-2 text-slate-600">
                            <span className="truncate">{item.link_href}</span>
                            <ExternalLink size={14} className="shrink-0 text-slate-400" />
                          </div>
                        ) : (
                          <span className="text-slate-400">Tanpa link</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex min-w-10 justify-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {item.sort_order}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
                            item.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-bold text-[#17376f] hover:bg-blue-50"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setAnnouncementToDelete(item)}
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
            aria-labelledby="announcement-form-title"
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  {editingId ? "Edit informasi" : "Informasi baru"}
                </p>
                <h3
                  id="announcement-form-title"
                  className="mt-1 text-lg font-bold text-[#17376f]"
                >
                  {editingId ? "Edit Pengumuman" : "Tambah Pengumuman"}
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

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Teks pengumuman
                  </span>
                  <input
                    value={form.text}
                    onChange={(event) =>
                      setForm({ ...form, text: event.target.value })
                    }
                    maxLength={255}
                    required
                    placeholder="Gratis ongkir untuk pembelian hari ini!"
                    className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#315b9f]"
                  />
                  <span className="mt-1 block text-right text-xs text-slate-400">
                    {form.text.length}/255
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Teks link"
                    value={form.link_text}
                    onChange={(value) => setForm({ ...form, link_text: value })}
                    placeholder="Belanja sekarang"
                  />
                  <Field
                    label="URL tujuan"
                    value={form.link_href}
                    onChange={(value) => setForm({ ...form, link_href: value })}
                    placeholder="/products"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold text-slate-700">
                    Pilihan warna
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset, index) => {
                      const selected =
                        form.bg_color === preset.bg &&
                        form.text_color === preset.text;

                      return (
                        <button
                          type="button"
                          key={preset.label}
                          onClick={() => applyPreset(index)}
                          className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-bold transition ${
                            selected
                              ? "border-[#315b9f] bg-blue-50 text-[#17376f]"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`h-4 w-4 rounded-sm ${preset.swatch}`} />
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <details className="rounded-md border border-slate-200 bg-slate-50">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-700">
                    Pengaturan warna lanjutan
                  </summary>
                  <div className="grid gap-4 border-t border-slate-200 p-4 sm:grid-cols-3">
                    <Field
                      label="Background"
                      value={form.bg_color}
                      onChange={(value) => setForm({ ...form, bg_color: value })}
                    />
                    <Field
                      label="Teks"
                      value={form.text_color}
                      onChange={(value) => setForm({ ...form, text_color: value })}
                    />
                    <Field
                      label="Border"
                      value={form.border_color}
                      onChange={(value) =>
                        setForm({ ...form, border_color: value })
                      }
                    />
                  </div>
                </details>

                <div>
                  <p className="mb-2 text-sm font-bold text-slate-700">
                    Preview
                  </p>
                  <div
                    className={`rounded-md border px-4 py-3 text-center ${form.bg_color} ${form.text_color} ${
                      form.border_color || "border-slate-200"
                    }`}
                  >
                    <span className="text-sm font-semibold">
                      {form.text || "Preview pengumuman"}
                    </span>
                    {form.link_text ? (
                      <span className="ml-3 text-sm font-bold underline underline-offset-4">
                        {form.link_text}
                      </span>
                    ) : null}
                  </div>
                </div>

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
                        Pengumuman aktif
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Tampilkan di bagian atas toko.
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
                  <Megaphone size={16} />
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Pengumuman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {announcementToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => !deleting && setAnnouncementToDelete(null)}
            aria-label="Tutup konfirmasi"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white"
          >
            <div className="p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Hapus pengumuman?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pengumuman{" "}
                <strong className="text-slate-700">
                  “{announcementToDelete.text}”
                </strong>{" "}
                akan dihapus permanen.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setAnnouncementToDelete(null)}
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

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#315b9f]"
      />
    </label>
  );
}
