/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBag,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type Customer = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  orders_count: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
};

const ITEMS_PER_PAGE = 10;

function formatDate(value: string | null) {
  if (!value) return "Belum ada";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function fetchCustomers() {
    try {
      setLoading(true);
      setError("");
      const response = await apiFetch("/admin/customers", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data pelanggan.");
      }

      setCustomers(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Hapus pelanggan ${customer.name}? Aksi ini tidak bisa dibatalkan.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(customer.id);
      setError("");

      const response = await apiFetch(`/admin/customers/${customer.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus pelanggan.");
      }

      setCustomers((current) =>
        current.filter((item) => item.id !== customer.id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeletingId(null);
    }
  }

  const summary = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter((customer) => customer.is_active).length,
      buyers: customers.filter((customer) => customer.orders_count > 0).length,
    }),
    [customers],
  );

  const filteredCustomers = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesQuery =
        !keyword ||
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone?.toLowerCase().includes(keyword) ||
        customer.email?.toLowerCase().includes(keyword);
      const matchesFilter =
        filter === "all" ||
        (filter === "buyers" && customer.orders_count > 0) ||
        (filter === "no_orders" && customer.orders_count === 0) ||
        (filter === "inactive" && !customer.is_active);

      return matchesQuery && matchesFilter;
    });
  }, [customers, filter, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCustomers = filteredCustomers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6">
          <p className="text-sm font-semibold text-orange-500">
            Customer management
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
            Pelanggan
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Pantau data kontak dan aktivitas transaksi pelanggan toko.
          </p>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Total Pelanggan"
            value={summary.total}
            icon={Users}
          />
          <SummaryCard
            label="Akun Aktif"
            value={summary.active}
            icon={UserCheck}
            color="emerald"
          />
          <SummaryCard
            label="Pernah Belanja"
            value={summary.buyers}
            icon={ShoppingBag}
            color="orange"
          />
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
              <h3 className="font-bold text-slate-900">Daftar pelanggan</h3>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
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
                  placeholder="Cari nama, telepon, atau email"
                  className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[#315b9f]"
                />
              </label>

              <label className="relative block sm:w-44">
                <select
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none focus:border-[#315b9f] focus:ring-2 focus:ring-[#315b9f]/10"
                >
                  <option value="all">Semua pelanggan</option>
                  <option value="buyers">Pernah belanja</option>
                  <option value="no_orders">Belum belanja</option>
                  <option value="inactive">Akun nonaktif</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3">Kontak</th>
                  <th className="px-4 py-3">Pesanan</th>
                  <th className="px-4 py-3">Total Transaksi</th>
                  <th className="px-4 py-3">Aktivitas Terakhir</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      Memuat data pelanggan...
                    </td>
                  </tr>
                ) : paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Users size={28} className="mx-auto text-slate-300" />
                      <p className="mt-3 font-semibold text-slate-700">
                        Pelanggan tidak ditemukan
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Coba ubah pencarian atau filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#eaf0fb] font-bold text-[#183a78]">
                            {customer.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{customer.name}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Bergabung {formatDate(customer.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-700">
                          {customer.phone || "Nomor belum tersedia"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {customer.email || "Email belum tersedia"}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {customer.orders_count} pesanan
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-800">
                        {formatCurrency(customer.total_spent)}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-700">
                          {customer.last_order_at
                            ? formatDate(customer.last_order_at)
                            : "Belum pernah belanja"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Pesanan terakhir
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${
                            customer.is_active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          {customer.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => deleteCustomer(customer)}
                          disabled={deletingId === customer.id}
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                        >
                          <Trash2 size={15} />
                          {deletingId === customer.id ? "Menghapus" : "Hapus"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredCustomers.length > 0 ? (
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
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color = "blue",
}: {
  label: string;
  value: number;
  icon: typeof Users;
  color?: "blue" | "emerald" | "orange";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-md p-3 ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
}
