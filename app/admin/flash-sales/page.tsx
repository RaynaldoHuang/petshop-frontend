/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { getStorageUrl } from "@/lib/storage";

type Product = {
  id: number;
  name: string;
  price: string;
  image: string | null;
};

type FlashSale = {
  id: number;
  product_id: number;
  discount_price: string;
  start_at: string;
  end_at: string;
  is_active: boolean | number;
  product: Product | null;
};

type SaleStatus = "ongoing" | "scheduled" | "ended" | "inactive";

function imageUrl(image: string | null) {
  if (!image || image.trim() === "" || image.trim() === "0") {
    return "/image/pet-placeholder.jpg";
  }

  return image.startsWith("http") ? image : getStorageUrl(image);
}

function formatCurrency(value: string | number) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getSaleStatus(sale: FlashSale): SaleStatus {
  if (!Boolean(sale.is_active)) return "inactive";

  const now = Date.now();
  if (new Date(sale.start_at).getTime() > now) return "scheduled";
  if (new Date(sale.end_at).getTime() < now) return "ended";
  return "ongoing";
}

const statusConfig: Record<
  SaleStatus,
  { label: string; className: string }
> = {
  ongoing: {
    label: "Berlangsung",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  scheduled: {
    label: "Terjadwal",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  ended: {
    label: "Berakhir",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  inactive: {
    label: "Nonaktif",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

export default function AdminFlashSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [productId, setProductId] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<FlashSale | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<FlashSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, salesResponse] = await Promise.all([
        apiFetch("/products", { cache: "no-store" }),
        apiFetch("/admin/flash-sales", { cache: "no-store" }),
      ]);

      if (!productsResponse.ok || !salesResponse.ok) {
        throw new Error("Gagal mengambil data flash sale.");
      }

      const [productsData, salesData] = await Promise.all([
        productsResponse.json(),
        salesResponse.json(),
      ]);

      setProducts(productsData);
      setSales(salesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSales = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return sales.filter((sale) => {
      const status = getSaleStatus(sale);
      const matchesQuery =
        !keyword || sale.product?.name.toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, sales, statusFilter]);

  const summary = useMemo(
    () => ({
      total: sales.length,
      ongoing: sales.filter((sale) => getSaleStatus(sale) === "ongoing").length,
      scheduled: sales.filter((sale) => getSaleStatus(sale) === "scheduled")
        .length,
    }),
    [sales],
  );

  function resetForm() {
    setProductId("");
    setDiscountPrice("");
    setStartAt("");
    setEndAt("");
    setIsActive(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedProduct = products.find(
      (product) => product.id === Number(productId),
    );

    if (
      selectedProduct &&
      Number(discountPrice) >= Number(selectedProduct.price)
    ) {
      setError("Harga flash sale harus lebih rendah dari harga normal produk.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await apiFetch("/admin/flash-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          discount_price: discountPrice,
          start_at: startAt,
          end_at: endAt,
          is_active: isActive,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan flash sale.");
      }

      setSales((current) => [data, ...current]);
      setFormOpen(false);
      resetForm();
      toast.success("Flash sale berhasil ditambahkan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!saleToDelete) return;

    try {
      setDeleting(true);
      setError("");

      const response = await apiFetch(
        `/admin/flash-sales/${saleToDelete.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal menghapus flash sale.");
      }

      setSales((current) =>
        current.filter((sale) => sale.id !== saleToDelete.id),
      );
      setSaleToDelete(null);
      toast.success("Flash sale berhasil dihapus.");
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
              Promotion management
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
              Flash Sale
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Atur produk promo, harga khusus, dan periode penayangannya.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setFormOpen(true);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            <Plus size={18} />
            Tambah Flash Sale
          </button>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Promo
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.total}</p>
          </article>
          <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Sedang Berlangsung
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {summary.ongoing}
            </p>
          </article>
          <article className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Terjadwal
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-800">
              {summary.scheduled}
            </p>
          </article>
        </section>

        {error ? (
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
              <h3 className="font-bold text-slate-900">Daftar flash sale</h3>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan {filteredSales.length} dari {sales.length} promo
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:w-64">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari produk"
                  className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[#315b9f]"
                />
              </label>

              <label className="relative block sm:w-44">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-[#315b9f]"
                >
                  <option value="all">Semua status</option>
                  <option value="ongoing">Berlangsung</option>
                  <option value="scheduled">Terjadwal</option>
                  <option value="ended">Berakhir</option>
                  <option value="inactive">Nonaktif</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Harga Normal</th>
                  <th className="px-4 py-3">Harga Flash Sale</th>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Memuat data flash sale...
                    </td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Zap size={28} className="mx-auto text-slate-300" />
                      <p className="mt-3 font-semibold text-slate-700">
                        Flash sale tidak ditemukan
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tambahkan promo baru atau ubah pencarian dan filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => {
                    const status = statusConfig[getSaleStatus(sale)];

                    return (
                      <tr key={sale.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                              <Image
                                src={imageUrl(sale.product?.image || null)}
                                alt={sale.product?.name || "Produk"}
                                width={72}
                                height={72}
                                className="h-full w-full object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <p className="max-w-56 truncate font-bold text-slate-800">
                                {sale.product?.name || "Produk tidak ditemukan"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                ID #{sale.product_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-600">
                          {sale.product
                            ? formatCurrency(sale.product.price)
                            : "-"}
                        </td>
                        <td className="px-4 py-4 font-bold text-orange-600">
                          {formatCurrency(sale.discount_price)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-2 text-xs text-slate-600">
                            <CalendarClock
                              size={16}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />
                            <div>
                              <p>{formatDate(sale.start_at)}</p>
                              <p className="mt-1 text-slate-400">
                                sampai {formatDate(sale.end_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSale(sale)}
                              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-bold text-[#17376f] transition hover:border-[#315b9f] hover:bg-blue-50"
                            >
                              <Eye size={15} />
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => setSaleToDelete(sale)}
                              className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
            aria-labelledby="flash-sale-form-title"
            className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h3
                  id="flash-sale-form-title"
                  className="text-lg font-bold text-[#17376f]"
                >
                  Tambah Flash Sale
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pilih produk dan tentukan harga serta periode promo.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
                    <button
                      type="button"
                      onClick={() => setError("")}
                      aria-label="Tutup pesan"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : null}

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Produk
                  </span>
                  <div className="relative">
                    <select
                      value={productId}
                      onChange={(event) => setProductId(event.target.value)}
                      required
                      className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-10 text-sm outline-none focus:border-[#315b9f]"
                    >
                      <option value="">Pilih produk</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Harga Flash Sale
                  </span>
                  <div className="flex h-11 overflow-hidden rounded-md border border-slate-200 focus-within:border-[#315b9f]">
                    <span className="grid place-items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={discountPrice}
                      onChange={(event) => setDiscountPrice(event.target.value)}
                      required
                      placeholder="75000"
                      className="min-w-0 flex-1 px-3 text-sm outline-none"
                    />
                  </div>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-slate-700">
                      Mulai
                    </span>
                    <input
                      type="datetime-local"
                      value={startAt}
                      onChange={(event) => setStartAt(event.target.value)}
                      required
                      className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#315b9f]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-slate-700">
                      Berakhir
                    </span>
                    <input
                      type="datetime-local"
                      min={startAt || undefined}
                      value={endAt}
                      onChange={(event) => setEndAt(event.target.value)}
                      required
                      className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[#315b9f]"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Aktifkan flash sale
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Promo akan tampil sesuai periode yang ditentukan.
                    </p>
                  </div>
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
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
                >
                  <Plus size={16} />
                  {saving ? "Menyimpan..." : "Simpan Flash Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedSale ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setSelectedSale(null)}
            aria-label="Tutup detail"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="flash-sale-detail-title"
            className="relative z-10 w-full max-w-xl rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Detail Promo
                </p>
                <h3
                  id="flash-sale-detail-title"
                  className="mt-1 text-lg font-bold text-[#17376f]"
                >
                  Flash Sale #{selectedSale.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup detail"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                  <Image
                    src={imageUrl(selectedSale.product?.image || null)}
                    alt={selectedSale.product?.name || "Produk"}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-slate-900">
                    {selectedSale.product?.name || "Produk tidak ditemukan"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Produk ID #{selectedSale.product_id}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 py-5 sm:grid-cols-3">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">
                    Harga Normal
                  </p>
                  <p className="mt-1 font-bold text-slate-800">
                    {selectedSale.product
                      ? formatCurrency(selectedSale.product.price)
                      : "-"}
                  </p>
                </div>
                <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
                  <p className="text-xs font-semibold text-orange-600">
                    Harga Promo
                  </p>
                  <p className="mt-1 font-bold text-orange-700">
                    {formatCurrency(selectedSale.discount_price)}
                  </p>
                </div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-semibold text-emerald-600">
                    Potongan
                  </p>
                  <p className="mt-1 font-bold text-emerald-700">
                    {selectedSale.product
                      ? `${Math.max(
                          0,
                          Math.round(
                            (1 -
                              Number(selectedSale.discount_price) /
                                Number(selectedSale.product.price)) *
                              100,
                          ),
                        )}%`
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Mulai
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-700">
                    {formatDate(selectedSale.start_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Berakhir
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-700">
                    {formatDate(selectedSale.end_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
                      statusConfig[getSaleStatus(selectedSale)].className
                    }`}
                  >
                    {statusConfig[getSaleStatus(selectedSale)].label}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Penayangan
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-700">
                    {Boolean(selectedSale.is_active) ? "Diaktifkan" : "Dinonaktifkan"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="h-10 rounded-md bg-[#17376f] px-4 text-sm font-bold text-white hover:bg-[#102e63]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {saleToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => !deleting && setSaleToDelete(null)}
            aria-label="Tutup konfirmasi"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-flash-sale-title"
            className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white"
          >
            <div className="p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>
              <h3
                id="delete-flash-sale-title"
                className="text-lg font-bold text-slate-900"
              >
                Hapus flash sale?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Promo untuk{" "}
                <strong className="text-slate-700">
                  {saleToDelete.product?.name || "produk ini"}
                </strong>{" "}
                akan dihapus permanen dan tidak dapat dipulihkan.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                disabled={deleting}
                className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
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
