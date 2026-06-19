/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { MapPin, Pencil, Plus, Search, Settings, Trash2, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type RajaOngkirSetting = {
  origin_destination_id: string | null;
  origin_province: string | null;
  origin_city: string | null;
  origin_district: string | null;
  origin_subdistrict: string | null;
  origin_zip_code: string | null;
  default_item_weight: number;
  is_active: boolean;
};

type Courier = {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  sort_order: number;
};

type Destination = {
  destination_id: string;
  label: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  zip_code: string;
};

const emptyCourier = {
  code: "",
  name: "",
  sort_order: "0",
  is_active: true,
};

export default function RajaOngkirAdminPage() {
  const [setting, setSetting] = useState<RajaOngkirSetting | null>(null);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [destinationSearch, setDestinationSearch] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [defaultWeight, setDefaultWeight] = useState("1000");
  const [settingActive, setSettingActive] = useState(true);
  const [courierForm, setCourierForm] = useState(emptyCourier);
  const [editingCourierId, setEditingCourierId] = useState<number | null>(null);
  const [courierToDelete, setCourierToDelete] = useState<Courier | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSetting, setSavingSetting] = useState(false);
  const [savingCourier, setSavingCourier] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/admin/rajaongkir", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memuat setting RajaOngkir.");
      }

      setSetting(data.setting);
      setCouriers(data.couriers);
      setDefaultWeight(String(data.setting?.default_item_weight || 1000));
      setSettingActive(Boolean(data.setting?.is_active));

      if (data.setting?.origin_destination_id) {
        setSelectedDestination({
          destination_id: data.setting.origin_destination_id,
          label: [
            data.setting.origin_subdistrict,
            data.setting.origin_district,
            data.setting.origin_city,
            data.setting.origin_province,
            data.setting.origin_zip_code,
          ]
            .filter(Boolean)
            .join(", "),
          province: data.setting.origin_province || "",
          city: data.setting.origin_city || "",
          district: data.setting.origin_district || "",
          subdistrict: data.setting.origin_subdistrict || "",
          zip_code: data.setting.origin_zip_code || "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (destinationSearch.trim().length < 2) {
        setDestinations([]);
        return;
      }

      try {
        setSearching(true);
        const response = await apiFetch(
          `/admin/rajaongkir/destinations?search=${encodeURIComponent(
            destinationSearch,
          )}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mencari lokasi.");
        }

        setDestinations(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal mencari lokasi.");
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [destinationSearch]);

  const summary = useMemo(
    () => ({
      total: couriers.length,
      active: couriers.filter((courier) => courier.is_active).length,
      inactive: couriers.filter((courier) => !courier.is_active).length,
    }),
    [couriers],
  );

  async function saveSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedDestination) {
      toast.error("Pilih asal pengiriman terlebih dahulu.");
      return;
    }

    try {
      setSavingSetting(true);
      const response = await apiFetch("/admin/rajaongkir/setting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_destination_id: selectedDestination.destination_id,
          origin_province: selectedDestination.province,
          origin_city: selectedDestination.city,
          origin_district: selectedDestination.district,
          origin_subdistrict: selectedDestination.subdistrict,
          origin_zip_code: selectedDestination.zip_code,
          default_item_weight: Number(defaultWeight || 1000),
          is_active: settingActive,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan setting.");
      }

      toast.success(data.message);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSavingSetting(false);
    }
  }

  function editCourier(courier: Courier) {
    setEditingCourierId(courier.id);
    setCourierForm({
      code: courier.code,
      name: courier.name,
      sort_order: String(courier.sort_order),
      is_active: courier.is_active,
    });
  }

  function resetCourierForm() {
    setEditingCourierId(null);
    setCourierForm(emptyCourier);
  }

  async function saveCourier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSavingCourier(true);
      const response = await apiFetch(
        editingCourierId
          ? `/admin/rajaongkir/couriers/${editingCourierId}`
          : "/admin/rajaongkir/couriers",
        {
          method: editingCourierId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...courierForm,
            sort_order: Number(courierForm.sort_order || 0),
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : null;
        throw new Error(validationMessage || data.message || "Gagal menyimpan kurir.");
      }

      toast.success(
        editingCourierId
          ? "Kurir berhasil diperbarui."
          : "Kurir berhasil ditambahkan.",
      );
      resetCourierForm();
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSavingCourier(false);
    }
  }

  async function deleteCourier() {
    if (!courierToDelete) return;

    try {
      setDeleting(true);
      const response = await apiFetch(
        `/admin/rajaongkir/couriers/${courierToDelete.id}`,
        { method: "DELETE" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus kurir.");
      }

      toast.success(data.message);
      setCourierToDelete(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
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
              Shipping integration
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
              RajaOngkir
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola asal pengiriman, berat default, dan kurir checkout.
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

        <section className="mb-6 overflow-visible rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-orange-500" />
              <h3 className="font-bold text-slate-900">Asal Pengiriman</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Lokasi origin dipakai untuk menghitung ongkir.
            </p>
          </div>

          <form onSubmit={saveSetting} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_220px_190px_auto] lg:items-end">
            <label className="relative block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Cari origin
              </span>
              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
                <Search size={16} className="text-slate-400" />
                <input
                  value={destinationSearch}
                  onChange={(event) => setDestinationSearch(event.target.value)}
                  className="h-full min-w-0 flex-1 text-sm text-slate-800 outline-none"
                  placeholder="Jakarta, Mataram, Grogol"
                />
              </div>

              {destinationSearch.trim().length >= 2 ? (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-72 overflow-auto rounded-md border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
                  {searching ? (
                    <div className="p-4 text-sm text-slate-500">Mencari lokasi...</div>
                  ) : destinations.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {destinations.map((destination) => (
                        <button
                          type="button"
                          key={destination.destination_id}
                          onClick={() => {
                            setSelectedDestination(destination);
                            setDestinationSearch("");
                            setDestinations([]);
                          }}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                        >
                          <p className="font-bold text-slate-800">
                            {destination.subdistrict}, {destination.district}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {destination.city}, {destination.province} - {destination.zip_code}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-slate-500">
                      Lokasi tidak ditemukan.
                    </div>
                  )}
                </div>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Berat Default / Item
              </span>
              <div className="flex h-10 overflow-hidden rounded-md border border-slate-200 bg-white focus-within:border-[#315b9f] focus-within:ring-2 focus-within:ring-[#315b9f]/10">
                <input
                  type="number"
                  min={1}
                  value={defaultWeight}
                  onChange={(event) => setDefaultWeight(event.target.value)}
                  className="h-full min-w-0 flex-1 px-3 text-sm outline-none"
                  placeholder="1000"
                />
                <span className="flex h-full items-center border-l border-slate-200 bg-slate-50 px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  gram
                </span>
              </div>
            </label>

            <div className="flex h-10 items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-3">
              <span className="text-sm font-semibold text-slate-700">
                {settingActive ? "Aktif" : "Nonaktif"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={settingActive}
                onClick={() => setSettingActive((current) => !current)}
                className={`relative h-6 w-11 rounded-full transition ${
                  settingActive ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    settingActive ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={savingSetting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
            >
              <Settings size={16} />
              {savingSetting ? "Menyimpan" : "Simpan"}
            </button>
          </form>

          <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Origin aktif
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {selectedDestination
                ? `${selectedDestination.subdistrict}, ${selectedDestination.district}, ${selectedDestination.city}, ${selectedDestination.province} - ${selectedDestination.zip_code}`
                : "Belum dipilih"}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <form
            onSubmit={saveCourier}
            className="border-b border-slate-200 bg-slate-50/70 p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <label className="block lg:w-36">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Kode
                </span>
                <input
                  value={courierForm.code}
                  onChange={(event) =>
                    setCourierForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  placeholder="jne"
                  required
                />
              </label>

              <label className="block flex-1">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nama kurir
                </span>
                <input
                  value={courierForm.name}
                  onChange={(event) =>
                    setCourierForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  placeholder="JNE"
                  required
                />
              </label>

              <label className="block lg:w-28">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Urutan
                </span>
                <input
                  type="number"
                  value={courierForm.sort_order}
                  onChange={(event) =>
                    setCourierForm((current) => ({
                      ...current,
                      sort_order: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                />
              </label>

              <div className="flex h-10 items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-3 lg:w-44">
                <span className="text-sm font-semibold text-slate-700">
                  {courierForm.is_active ? "Aktif" : "Nonaktif"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={courierForm.is_active}
                  onClick={() =>
                    setCourierForm((current) => ({
                      ...current,
                      is_active: !current.is_active,
                    }))
                  }
                  className={`relative h-6 w-11 rounded-full transition ${
                    courierForm.is_active ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      courierForm.is_active ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingCourier}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
                >
                  <Plus size={16} />
                  {savingCourier
                    ? "Menyimpan"
                    : editingCourierId
                      ? "Simpan"
                      : "Tambah"}
                </button>
                {editingCourierId ? (
                  <button
                    type="button"
                    onClick={resetCourierForm}
                    className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                ) : null}
              </div>
            </div>
          </form>

          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-orange-500" />
              <h3 className="font-bold text-slate-900">Daftar kurir</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Kurir aktif akan dipanggil dan ditampilkan pada checkout.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Kurir</th>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Urutan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      Memuat kurir...
                    </td>
                  </tr>
                ) : couriers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      Belum ada kurir.
                    </td>
                  </tr>
                ) : (
                  couriers.map((courier) => (
                    <tr key={courier.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4 font-bold text-slate-800">
                        {courier.name}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold uppercase text-slate-700">
                          {courier.code}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{courier.sort_order}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
                            courier.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {courier.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editCourier(courier)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-bold text-[#17376f] hover:border-[#315b9f] hover:bg-blue-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setCourierToDelete(courier)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
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

      {courierToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => !deleting && setCourierToDelete(null)}
            aria-label="Tutup konfirmasi"
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white">
            <div className="p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hapus kurir?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Kurir <strong className="text-slate-700">{courierToDelete.name}</strong>{" "}
                akan dihapus dari konfigurasi checkout.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setCourierToDelete(null)}
                disabled={deleting}
                className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={deleteCourier}
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
