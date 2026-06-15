"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type DashboardData = {
  stats: {
    revenue: number;
    orders: number;
    pending_orders: number;
    products: number;
    customers: number;
    active_payment_methods: number;
  };
  recent_orders: Array<{
    id: number;
    customer_name: string;
    total_price: string;
    payment_status: string;
    order_status: string;
    created_at: string;
  }>;
  low_stock_products: Array<{
    id: number;
    name: string;
    stock: number;
  }>;
};

function rupiah(value: number | string) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/dashboard", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Gagal memuat ringkasan dashboard.");
        setData(await response.json());
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Terjadi kesalahan"));
  }, []);

  const cards = [
    {
      label: "Total Pendapatan",
      value: data ? rupiah(data.stats.revenue) : "...",
      note: "Dari transaksi yang telah dibayar",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Total Pesanan",
      value: data?.stats.orders ?? "...",
      note: `${data?.stats.pending_orders ?? 0} perlu diproses`,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Produk",
      value: data?.stats.products ?? "...",
      note: "Produk dalam katalog",
      icon: Package,
      color: "bg-orange-50 text-orange-700",
    },
    {
      label: "Pelanggan",
      value: data?.stats.customers ?? "...",
      note: "Akun customer terdaftar",
      icon: Users,
      color: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="mb-6 overflow-hidden rounded-lg bg-[#17376f] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-300">Business overview</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Pantau operasional toko dari satu tempat.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                Ringkasan penjualan, pesanan, stok, pelanggan, dan pembayaran Lucky Pet Market.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/products/create"
                className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Tambah produk <ArrowUpRight size={17} />
              </Link>
              <Link
                href="/admin/orders"
                className="rounded-md border border-white/30 bg-transparent px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Lihat pesanan
              </Link>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.label}
                className="rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      {card.value}
                    </p>
                  </div>
                  <div className={`rounded-md p-3 ${card.color}`}>
                    <Icon size={21} />
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-500">{card.note}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
          <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">Pesanan terbaru</h3>
                <p className="mt-1 text-xs text-slate-500">Aktivitas transaksi paling baru</p>
              </div>
              <Link href="/admin/orders" className="text-sm font-semibold text-[#315b9f]">
                Lihat semua
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Pesanan</th>
                    <th className="px-5 py-3">Pelanggan</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recent_orders.map((order) => (
                    <tr key={order.id} className="border-t border-slate-100">
                      <td className="px-5 py-4 font-semibold text-slate-800">#{order.id}</td>
                      <td className="px-5 py-4 text-slate-600">{order.customer_name}</td>
                      <td className="px-5 py-4 font-medium">{rupiah(order.total_price)}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                          {order.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data && data.recent_orders.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-500">Belum ada pesanan.</p>
              ) : null}
            </div>
          </article>

          <div className="space-y-6">
            <article className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Stok menipis</h3>
                  <p className="mt-1 text-xs text-slate-500">Produk dengan stok 10 atau kurang</p>
                </div>
                <div className="rounded-md bg-amber-50 p-2.5 text-amber-700">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {data?.low_stock_products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-3 transition hover:border-orange-300 hover:bg-orange-50/50"
                  >
                    <span className="truncate pr-3 text-sm font-medium text-slate-700">
                      {product.name}
                    </span>
                    <span className="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600">
                      {product.stock}
                    </span>
                  </Link>
                ))}
                {data && data.low_stock_products.length === 0 ? (
                  <p className="py-5 text-center text-sm text-slate-500">Stok produk aman.</p>
                ) : null}
              </div>
            </article>

            <Link
              href="/admin/payment-methods"
              className="flex items-center gap-4 rounded-lg bg-orange-500 p-5 text-white transition hover:bg-orange-600"
            >
              <div className="rounded-md border border-white/30 bg-white/10 p-3">
                <CreditCard size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold">Metode pembayaran</p>
                <p className="mt-1 text-xs text-orange-50">
                  {data?.stats.active_payment_methods ?? 0} metode Midtrans aktif
                </p>
              </div>
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
