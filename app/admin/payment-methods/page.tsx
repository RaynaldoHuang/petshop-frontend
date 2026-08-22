/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  CreditCard,
  Pencil,
  Plus,
  QrCode,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type PaymentMethod = {
  id: number;
  name: string;
  code: string;
  type: "qris" | "bank_transfer";
  fee: number;
  fee_percentage: number;
  is_active: boolean;
  sort_order: number;
};

type PaymentSettings = {
  mode: "manual" | "realtime";
  whatsapp_number: string | null;
  manual_qris_url: string | null;
  manual_qris_mime: string | null;
};

const methodOptions = [
  { code: "qris", name: "QRIS" },
  { code: "bca", name: "BCA Virtual Account" },
  { code: "bni", name: "BNI Virtual Account" },
  { code: "bri", name: "BRI Virtual Account" },
  { code: "mandiri", name: "Mandiri Virtual Account" },
  { code: "permata", name: "Permata Virtual Account" },
];

const emptyForm = {
  name: "QRIS",
  code: "qris",
  fee: "0",
  fee_percentage: "0",
  sort_order: "1",
  is_active: true,
};

function currency(value: number | string) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [settingsMode, setSettingsMode] = useState<"manual" | "realtime">("realtime");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  async function loadMethods() {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/admin/payment-methods", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Gagal memuat metode pembayaran.");
      setMethods(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMethods();
    apiFetch("/admin/payment-settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Gagal memuat pengaturan pembayaran.");
        const data: PaymentSettings = await response.json();
        setSettings(data);
        setSettingsMode(data.mode);
        setWhatsappNumber(data.whatsapp_number || "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Terjadi kesalahan."));
  }, []);

  async function savePaymentSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSavingSettings(true);
      setError("");
      const body = new FormData();
      body.append("mode", settingsMode);
      body.append("whatsapp_number", whatsappNumber);
      if (qrisFile) body.append("manual_qris", qrisFile);

      const response = await apiFetch("/admin/payment-settings", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : null;
        throw new Error(validationMessage || data.message || "Gagal menyimpan pengaturan.");
      }

      setSettings(data.data);
      setQrisFile(null);
      toast.success(data.message);
      await loadMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSavingSettings(false);
    }
  }

  const summary = useMemo(
    () => ({
      total: methods.length,
      active: methods.filter((method) => method.is_active).length,
      percentage: methods.filter(
        (method) => Number(method.fee_percentage) > 0,
      ).length,
    }),
    [methods],
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

  function openEditForm(method: PaymentMethod) {
    setError("");
    setEditingId(method.id);
    setForm({
      name: method.name,
      code: method.code,
      fee: String(method.fee),
      fee_percentage: String(method.fee_percentage),
      sort_order: String(method.sort_order),
      is_active: Boolean(method.is_active),
    });
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setError("");
    resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const response = await apiFetch(
        editingId
          ? `/admin/payment-methods/${editingId}`
          : "/admin/payment-methods",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            fee: Number(form.fee),
            fee_percentage: Number(form.fee_percentage),
            sort_order: Number(form.sort_order),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : null;
        throw new Error(
          validationMessage || data.message || "Gagal menyimpan metode.",
        );
      }

      const wasEditing = Boolean(editingId);
      setFormOpen(false);
      resetForm();
      await loadMethods();
      toast.success(
        wasEditing
          ? "Metode pembayaran berhasil diperbarui."
          : "Metode pembayaran berhasil ditambahkan.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMethod() {
    if (!methodToDelete) return;
    try {
      setDeleting(true);
      setError("");
      const response = await apiFetch(
        `/admin/payment-methods/${methodToDelete.id}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal menghapus metode.");
      setMethods((current) =>
        current.filter((item) => item.id !== methodToDelete.id),
      );
      setMethodToDelete(null);
      toast.success(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeleting(false);
    }
  }

  const sampleSubtotal = 100000;
  const sampleAdminFee =
    Number(form.fee || 0) +
    Math.round(sampleSubtotal * (Number(form.fee_percentage || 0) / 100));
  const sampleTax = Math.round(sampleAdminFee * 0.11);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              Midtrans configuration
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
              Metode Pembayaran
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola channel pembayaran dan komponen biaya pada checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600"
          >
            <Plus size={18} />
            Tambah Metode
          </button>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <Summary label="Total Metode" value={summary.total} />
          <Summary label="Metode Aktif" value={summary.active} color="emerald" />
          <Summary
            label="Memakai Persentase"
            value={summary.percentage}
            color="orange"
          />
        </section>

        <form
          onSubmit={savePaymentSettings}
          className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-200 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
              Mode transaksi
            </p>
            <h3 className="mt-1 text-lg font-bold text-[#17376f]">
              Manual atau realtime
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Realtime memakai Midtrans. Manual menampilkan QRIS toko dan meminta pelanggan mengunggah bukti bayar.
            </p>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              {(["realtime", "manual"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSettingsMode(mode)}
                  className={`rounded-lg border p-4 text-left transition ${
                    settingsMode === mode
                      ? "border-[#315b9f] bg-blue-50 text-[#17376f]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-sm font-bold capitalize">{mode}</span>
                  <span className="mt-1 block text-xs leading-5 opacity-75">
                    {mode === "realtime" ? "Verifikasi otomatis Midtrans" : "QRIS dan verifikasi bukti"}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Nomor WhatsApp konfirmasi
                </span>
                <input
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  placeholder="Contoh: 6281234567890"
                  required={settingsMode === "manual"}
                  className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#315b9f]"
                />
              </label>

              <label className="block rounded-lg border border-dashed border-slate-300 p-4">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Upload size={17} /> Unggah QRIS manual
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  PDF, JPEG, PNG, atau WebP. Maksimal 5 MB.
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(event) => setQrisFile(event.target.files?.[0] || null)}
                  className="mt-3 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-bold file:text-[#17376f]"
                />
                {settings?.manual_qris_url ? (
                  <a
                    href={settings.manual_qris_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-xs font-bold text-[#315b9f] hover:underline"
                  >
                    Lihat QRIS yang sedang aktif
                  </a>
                ) : null}
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs text-slate-500">
              Mode aktif: <strong className="capitalize text-slate-700">{settings?.mode || "-"}</strong>
            </p>
            <button
              type="submit"
              disabled={savingSettings}
              className="h-10 rounded-md bg-[#17376f] px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {savingSettings ? "Menyimpan..." : "Simpan Mode Pembayaran"}
            </button>
          </div>
        </form>

        {error && !formOpen ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h3 className="font-bold text-slate-900">Daftar metode pembayaran</h3>
            <p className="mt-1 text-xs text-slate-500">
              PPN sebesar 11% dihitung dari total biaya admin.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3">Nominal</th>
                  <th className="px-4 py-3">Persentase</th>
                  <th className="px-4 py-3">PPN</th>
                  <th className="px-4 py-3">Urutan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      Memuat metode pembayaran...
                    </td>
                  </tr>
                ) : methods.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      Belum ada metode pembayaran.
                    </td>
                  </tr>
                ) : (
                  methods.map((method) => (
                    <tr key={method.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-md bg-[#eef3fb] text-[#183a78]">
                            {method.type === "qris" ? (
                              <QrCode size={20} />
                            ) : (
                              <CreditCard size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{method.name}</p>
                            <p className="mt-1 text-xs uppercase text-slate-500">
                              {method.code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {currency(method.fee)}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {Number(method.fee_percentage).toLocaleString("id-ID", {
                          maximumFractionDigits: 4,
                        })}
                        %
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-slate-600">
                        11% dari biaya admin
                      </td>
                      <td className="px-4 py-4">{method.sort_order}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
                            method.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {method.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(method)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-bold text-[#17376f] hover:bg-blue-50"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setMethodToDelete(method)}
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
          <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Midtrans channel
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#17376f]">
                  {editingId ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}
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
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Channel
                  </span>
                  <div className="relative">
                    <select
                      value={form.code}
                      onChange={(event) => {
                        const selected = methodOptions.find(
                          (item) => item.code === event.target.value,
                        );
                        setForm({
                          ...form,
                          code: event.target.value,
                          name: selected?.name || form.name,
                        });
                      }}
                      className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-10 text-sm font-semibold text-slate-700 outline-none focus:border-[#315b9f]"
                    >
                      {methodOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </label>
                <Field
                  label="Nama tampilan"
                  value={form.name}
                  onChange={(value) => setForm({ ...form, name: value })}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    label="Biaya admin nominal"
                    prefix="Rp"
                    value={form.fee}
                    onChange={(value) => setForm({ ...form, fee: value })}
                  />
                  <NumberField
                    label="Biaya admin persentase"
                    suffix="%"
                    step="0.0001"
                    max="100"
                    value={form.fee_percentage}
                    onChange={(value) =>
                      setForm({ ...form, fee_percentage: value })
                    }
                  />
                </div>
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-bold text-blue-900">
                    Simulasi subtotal {currency(sampleSubtotal)}
                  </p>
                  <div className="mt-3 grid gap-2 text-xs text-blue-800 sm:grid-cols-3">
                    <span>Admin: <strong>{currency(sampleAdminFee)}</strong></span>
                    <span>PPN 11%: <strong>{currency(sampleTax)}</strong></span>
                    <span>Total biaya: <strong>{currency(sampleAdminFee + sampleTax)}</strong></span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    label="Urutan tampil"
                    value={form.sort_order}
                    onChange={(value) => setForm({ ...form, sort_order: value })}
                  />
                  <div className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Metode aktif</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Tampilkan pada checkout.
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
                  className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  <Plus size={16} />
                  {saving ? "Menyimpan..." : "Simpan Metode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {methodToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => !deleting && setMethodToDelete(null)}
            aria-label="Tutup konfirmasi"
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white">
            <div className="p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Hapus metode pembayaran?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Metode <strong className="text-slate-700">{methodToDelete.name}</strong>{" "}
                akan dihapus dari pilihan checkout.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setMethodToDelete(null)}
                disabled={deleting}
                className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={removeMethod}
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

function Summary({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: number;
  color?: "blue" | "emerald" | "orange";
}) {
  const colors = {
    blue: "border-slate-200 bg-white text-slate-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    orange: "border-orange-200 bg-orange-50 text-orange-800",
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      <input
        value={value}
        required
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#315b9f]"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = "1",
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  step?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      <div className="flex h-11 overflow-hidden rounded-md border border-slate-200 focus-within:border-[#315b9f]">
        {prefix ? (
          <span className="grid place-items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500">
            {prefix}
          </span>
        ) : null}
        <input
          type="number"
          min="0"
          max={max}
          step={step}
          value={value}
          required
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-3 text-sm outline-none"
        />
        {suffix ? (
          <span className="grid place-items-center border-l border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}
