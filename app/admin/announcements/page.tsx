/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useState } from "react";

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
    label: "Blue",
    bg: "bg-blue-100",
    text: "text-blue-900",
    border: "border-blue-900",
  },
  {
    label: "Orange",
    bg: "bg-orange-100",
    text: "text-orange-900",
    border: "border-orange-700",
  },
  {
    label: "Green",
    bg: "bg-green-100",
    text: "text-green-900",
    border: "border-green-700",
  },
  {
    label: "Pink",
    bg: "bg-pink-100",
    text: "text-pink-900",
    border: "border-pink-700",
  },
  {
    label: "Yellow",
    bg: "bg-yellow-100",
    text: "text-yellow-900",
    border: "border-yellow-700",
  },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [text, setText] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkHref, setLinkHref] = useState("");
  const [bgColor, setBgColor] = useState("bg-blue-100");
  const [textColor, setTextColor] = useState("text-blue-900");
  const [borderColor, setBorderColor] = useState("border-blue-900");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("1");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/announcements`,
        {
          cache: "no-store",
        },
      );

      if (!res.ok) {
        throw new Error("Gagal mengambil data announcement");
      }

      const data: Announcement[] = await res.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  function resetForm() {
    setEditingId(null);
    setText("");
    setLinkText("");
    setLinkHref("");
    setBgColor("bg-blue-100");
    setTextColor("text-blue-900");
    setBorderColor("border-blue-900");
    setIsActive(true);
    setSortOrder("1");
  }

  function applyPreset(index: number) {
    const preset = COLOR_PRESETS[index];
    setBgColor(preset.bg);
    setTextColor(preset.text);
    setBorderColor(preset.border);
  }

  function handleEdit(item: Announcement) {
    setEditingId(item.id);
    setText(item.text);
    setLinkText(item.link_text ?? "");
    setLinkHref(item.link_href ?? "");
    setBgColor(item.bg_color);
    setTextColor(item.text_color);
    setBorderColor(item.border_color ?? "");
    setIsActive(Boolean(item.is_active));
    setSortOrder(String(item.sort_order ?? 0));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        text,
        link_text: linkText || null,
        link_href: linkHref || null,
        bg_color: bgColor,
        text_color: textColor,
        border_color: borderColor || null,
        is_active: isActive,
        sort_order: Number(sortOrder || 0),
      };

      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/announcements/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/announcements`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan announcement");
      }

      resetForm();
      fetchAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Yakin ingin menghapus announcement ini?");
    if (!confirmed) return;

    try {
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/announcements/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus announcement");
      }

      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Announcement Bar
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Kelola top bar promo yang tampil di atas navbar.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.2fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              {editingId ? "Edit Announcement" : "Tambah Announcement"}
            </h2>

            <div className="grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="🐱🐶 FREE SHIPPING — no code needed!"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Link Text
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Learn more"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Link URL
                  </label>
                  <input
                    type="text"
                    value={linkHref}
                    onChange={(e) => setLinkHref(e.target.value)}
                    placeholder="/products"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Color Preset
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset, index) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => applyPreset(index)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium ${preset.bg} ${preset.text} ${preset.border}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    BG Color
                  </label>
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Text Color
                  </label>
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Border Color
                  </label>
                  <input
                    type="text"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Aktif
                </label>
              </div>

              <div
                className={`rounded-xl border px-4 py-3 text-center ${bgColor} ${textColor} ${
                  borderColor || "border-gray-200"
                }`}
              >
                <span className="text-sm font-semibold">
                  {text || "Preview announcement"}
                </span>
                {linkText ? (
                  <span className="ml-3 text-sm font-bold underline underline-offset-4">
                    {linkText}
                  </span>
                ) : null}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Menyimpan..." : editingId ? "Update" : "Simpan"}
                </button>

                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Batal Edit
                  </button>
                ) : null}
              </div>
            </div>
          </form>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
              List Announcement
            </h2>

            {loading ? (
              <p className="text-sm text-gray-500">Memuat data...</p>
            ) : announcements.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada announcement.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div
                      className={`rounded-lg border px-4 py-3 text-center ${item.bg_color} ${item.text_color} ${
                        item.border_color || "border-gray-200"
                      }`}
                    >
                      <span className="text-sm font-semibold">{item.text}</span>
                      {item.link_text ? (
                        <span className="ml-3 text-sm font-bold underline underline-offset-4">
                          {item.link_text}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="text-xs text-gray-500">
                        <p>Status: {item.is_active ? "Aktif" : "Nonaktif"}</p>
                        <p>Sort: {item.sort_order}</p>
                        <p>Link: {item.link_href || "-"}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
