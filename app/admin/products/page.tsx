/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getStorageUrl } from "@/lib/storage";
import { apiFetch } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  discount_price: string | null;
  stock: number;
  sold_count: number;
  image: string | null;
  is_active: boolean;
  category: {
    id: number;
    name: string;
  } | null;
};

const ITEMS_PER_PAGE = 8;

function getImageUrl(image: string | null) {
  if (!image || image.trim() === "" || image.trim() === "0") {
    return "/image/pet-placeholder.jpg";
  }

  if (image.startsWith("http")) return image;

  return getStorageUrl(image);
}

function formatCurrency(value: string | number) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/admin/products", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data produk.");
      }

      setProducts(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const summary = useMemo(
    () => ({
      total: products.length,
      active: products.filter((product) => product.is_active).length,
      lowStock: products.filter((product) => product.stock <= 10).length,
      inactive: products.filter((product) => !product.is_active).length,
    }),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.slug.toLowerCase().includes(keyword) ||
        product.category?.name.toLowerCase().includes(keyword);
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && product.is_active) ||
        (filter === "inactive" && !product.is_active) ||
        (filter === "low_stock" && product.stock <= 10);

      return matchesQuery && matchesFilter;
    });
  }, [filter, products, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  async function handleDelete() {
    if (!productToDelete) return;

    try {
      setDeletingId(productToDelete.id);
      setError("");

      const response = await apiFetch(`/admin/products/${productToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus produk.");
      }

      setProducts((current) =>
        current.filter((product) => product.id !== productToDelete.id),
      );
      toast.success(`Produk ${productToDelete.name} berhasil dihapus.`);
      setProductToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeletingId(null);
    }
  }

  const summaryCards = [
    {
      label: "Total Produk",
      value: summary.total,
      icon: Box,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Produk Aktif",
      value: summary.active,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Stok Menipis",
      value: summary.lowStock,
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Nonaktif",
      value: summary.inactive,
      icon: XCircle,
      color: "bg-slate-100 text-slate-600",
    },
  ];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-500">Catalog management</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
              Daftar Produk
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Kelola katalog, harga, stok, dan status produk toko.
            </p>
          </div>

          <Link
            href="/admin/products/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            <Plus size={18} />
            Tambah Produk
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
                  </div>
                  <div className={`rounded-md p-3 ${card.color}`}>
                    <Icon size={21} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Semua produk</h3>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan {filteredProducts.length} dari {products.length} produk
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
                  placeholder="Cari nama, slug, atau kategori"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm"
                />
              </label>

              <label className="relative block sm:w-44">
                <select
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#315b9f]"
                >
                  <option value="all">Semua produk</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                  <option value="low_stock">Stok menipis</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Memuat data produk...
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="font-semibold text-slate-700">Produk tidak ditemukan</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Coba ubah kata pencarian atau filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                            <Image
                              src={getImageUrl(product.image)}
                              alt={product.name}
                              width={72}
                              height={72}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-64 truncate font-bold text-slate-800">
                              {product.name}
                            </p>
                            <p className="mt-1 max-w-64 truncate text-xs text-slate-500">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {product.category?.name || "Tanpa kategori"}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900">
                          {formatCurrency(product.discount_price || product.price)}
                        </p>
                        {product.discount_price ? (
                          <p className="mt-1 text-xs text-slate-400 line-through">
                            {formatCurrency(product.price)}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex min-w-12 justify-center rounded-md border px-2.5 py-1 text-xs font-bold ${
                            product.stock <= 10
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
                            product.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {product.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-bold text-[#17376f] transition hover:border-[#315b9f] hover:bg-blue-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            disabled={deletingId === product.id}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            {deletingId === product.id ? "Menghapus" : "Hapus"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredProducts.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">
                  {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredProducts.length)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700">
                  {filteredProducts.length}
                </span>{" "}
                produk
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - safeCurrentPage) <= 1,
                  )
                  .map((page, index, visiblePages) => (
                    <div key={page} className="flex items-center gap-1">
                      {index > 0 && page - visiblePages[index - 1] > 1 ? (
                        <span className="px-1 text-xs text-slate-400">...</span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 min-w-8 rounded-md border px-2 text-xs font-bold ${
                          page === safeCurrentPage
                            ? "border-[#17376f] bg-[#17376f] text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {productToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => !deletingId && setProductToDelete(null)}
            aria-label="Tutup konfirmasi"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 bg-white"
          >
            <div className="p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>
              <h3
                id="delete-product-title"
                className="text-lg font-bold text-slate-900"
              >
                Hapus produk?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Produk{" "}
                <strong className="text-slate-700">
                  {productToDelete.name}
                </strong>{" "}
                akan dihapus permanen dan tidak dapat dipulihkan.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={Boolean(deletingId)}
                className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                <Trash2 size={16} />
                {deletingId ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
