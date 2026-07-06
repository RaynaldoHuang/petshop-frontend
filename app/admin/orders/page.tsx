"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  PackageCheck,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  price: string;
  quantity: number;
  subtotal: string;
};

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city?: string | null;
  shipping_district?: string | null;
  shipping_subdistrict?: string | null;
  shipping_zip_code?: string | null;
  shipping_courier?: string | null;
  shipping_service?: string | null;
  shipping_cost?: string | number | null;
  shipping_etd?: string | null;
  shipping_weight?: number | null;
  total_price: string;
  payment_status?: string;
  order_status: string;
  created_at: string;
  items: OrderItem[];
};

const ORDER_STATUS_OPTIONS = [
  { value: "new", label: "Baru" },
  { value: "processed", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const ITEMS_PER_PAGE = 8;

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

function paymentLabel(status: string | undefined) {
  const labels: Record<string, string> = {
    paid: "Lunas",
    settlement: "Lunas",
    pending: "Menunggu",
    failed: "Gagal",
    deny: "Ditolak",
    cancelled: "Dibatalkan",
    cancel: "Dibatalkan",
    expire: "Kedaluwarsa",
    expired: "Kedaluwarsa",
  };

  return status ? labels[status] || status : "-";
}

function paymentBadge(status: string | undefined) {
  if (status && ["paid", "settlement"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function orderBadge(status: string) {
  const classes: Record<string, string> = {
    new: "border-slate-200 bg-slate-50 text-slate-700",
    processed: "border-blue-200 bg-blue-50 text-blue-700",
    shipped: "border-violet-200 bg-violet-50 text-violet-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
  };

  return classes[status] || classes.new;
}

function orderLabel(status: string) {
  return ORDER_STATUS_OPTIONS.find((item) => item.value === status)?.label || status;
}

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const showPaymentInfo = user?.role === "super_admin";

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch("/admin/orders", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data pesanan.");
        }

        setOrders(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.order_status === statusFilter;
      const matchesQuery =
        !keyword ||
        String(order.id).includes(keyword) ||
        order.customer_name.toLowerCase().includes(keyword) ||
        order.customer_phone.toLowerCase().includes(keyword) ||
        order.items.some((item) => item.product_name.toLowerCase().includes(keyword));

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  const summary = useMemo(
    () => ({
      total: orders.length,
      waiting: orders.filter((order) => order.order_status === "new").length,
      processing: orders.filter((order) =>
        ["processed", "shipped"].includes(order.order_status),
      ).length,
      completed: orders.filter((order) => order.order_status === "completed").length,
    }),
    [orders],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  async function handleStatusChange(id: number, orderStatus: string) {
    try {
      setUpdatingId(id);
      setError("");

      const response = await apiFetch(`/admin/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_status: orderStatus,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui status pesanan.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === id
            ? { ...order, order_status: data.data.order_status }
            : order,
        ),
      );
      toast.success(`Pesanan #${id} diperbarui menjadi ${orderLabel(orderStatus)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setUpdatingId(null);
    }
  }

  const summaryCards = [
    {
      label: "Total Pesanan",
      value: summary.total,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Pesanan Baru",
      value: summary.waiting,
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Dalam Proses",
      value: summary.processing,
      icon: PackageCheck,
      color: "bg-violet-50 text-violet-700",
    },
    {
      label: "Selesai",
      value: summary.completed,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6">
          <p className="text-sm font-semibold text-orange-500">Order management</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
            Daftar Pesanan
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Terima dan perbarui proses pesanan pelanggan.
          </p>
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
              <h3 className="font-bold text-slate-900">Semua pesanan</h3>
              <p className="mt-1 text-xs text-slate-500">
                Menampilkan {filteredOrders.length} dari {orders.length} pesanan
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
                  placeholder="Cari ID, pelanggan, atau produk"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm"
                />
              </label>

              <label className="relative block sm:w-44">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#315b9f]"
                >
                  <option value="all">Semua status</option>
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Pesanan</th>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3">Total</th>
                  {showPaymentInfo ? (
                    <th className="px-4 py-3">Pembayaran</th>
                  ) : null}
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={showPaymentInfo ? 6 : 5} className="px-4 py-12 text-center text-slate-500">
                      Memuat data pesanan...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={showPaymentInfo ? 6 : 5} className="px-4 py-12 text-center">
                      <p className="font-semibold text-slate-700">Pesanan tidak ditemukan</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Coba ubah kata pencarian atau filter status.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const totalQuantity = order.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    );

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-4">
                          <p className="font-bold text-[#17376f]">#{order.id}</p>
                          <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                            {formatDate(order.created_at)}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800">
                            {order.customer_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {order.customer_phone}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900">
                          {formatCurrency(order.total_price)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {totalQuantity} item
                          </p>
                        </td>

                        {showPaymentInfo ? (
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${paymentBadge(
                                order.payment_status,
                              )}`}
                            >
                              {paymentLabel(order.payment_status)}
                            </span>
                          </td>
                        ) : null}

                        <td className="px-4 py-4">
                          <label className="relative block w-36">
                            <select
                              value={order.order_status}
                              onChange={(event) =>
                                handleStatusChange(order.id, event.target.value)
                              }
                              disabled={updatingId === order.id}
                              aria-label={`Update status pesanan ${order.id}`}
                              className={`h-9 w-full appearance-none rounded-md border py-0 pl-2.5 pr-8 text-xs font-bold outline-none transition disabled:cursor-wait disabled:opacity-60 ${orderBadge(
                                order.order_status,
                              )}`}
                            >
                              {ORDER_STATUS_OPTIONS.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={14}
                              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-60"
                            />
                          </label>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-[#17376f] transition hover:border-[#315b9f] hover:bg-blue-50"
                          >
                            <Eye size={15} />
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredOrders.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">
                  {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredOrders.length)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700">
                  {filteredOrders.length}
                </span>{" "}
                pesanan
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                        className={`h-8 min-w-8 rounded-md border px-2 text-xs font-bold transition ${
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
                  className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setSelectedOrder(null)}
            aria-label="Tutup detail pesanan"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-title"
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Detail pesanan
                </p>
                <h3
                  id="order-detail-title"
                  className="mt-1 text-xl font-bold text-[#17376f]"
                >
                  Pesanan #{selectedOrder.id}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Pelanggan
                  </p>
                  <p className="mt-2 font-bold text-slate-800">
                    {selectedOrder.customer_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedOrder.customer_phone}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {showPaymentInfo ? (
                      <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-bold ${paymentBadge(
                          selectedOrder.payment_status,
                        )}`}
                      >
                        {paymentLabel(selectedOrder.payment_status)}
                      </span>
                    ) : null}
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-bold ${orderBadge(
                        selectedOrder.order_status,
                      )}`}
                    >
                      {orderLabel(selectedOrder.order_status)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Alamat pengiriman
                </p>
                <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                  {selectedOrder.shipping_address}
                  {selectedOrder.shipping_subdistrict ||
                  selectedOrder.shipping_district ||
                  selectedOrder.shipping_zip_code ? (
                    <span className="mt-2 block text-xs font-semibold text-slate-500">
                      {[
                        selectedOrder.shipping_subdistrict,
                        selectedOrder.shipping_district,
                        selectedOrder.shipping_city,
                        selectedOrder.shipping_zip_code,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  ) : null}
                </p>
              </div>

              {selectedOrder.shipping_courier ? (
                <div className="rounded-md border border-orange-100 bg-orange-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                    Ongkir
                  </p>
                  <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <p>
                      {selectedOrder.shipping_courier} {selectedOrder.shipping_service}
                      {selectedOrder.shipping_district
                        ? ` ke ${selectedOrder.shipping_district}`
                        : selectedOrder.shipping_city
                          ? ` ke ${selectedOrder.shipping_city}`
                          : ""}
                    </p>
                    <p className="font-bold sm:text-right">
                      {formatCurrency(selectedOrder.shipping_cost || 0)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Estimasi {selectedOrder.shipping_etd || "-"} hari
                    </p>
                    <p className="text-xs text-slate-500 sm:text-right">
                      Berat {Number(selectedOrder.shipping_weight || 0).toLocaleString("id-ID")} gram
                    </p>
                  </div>
                </div>
              ) : null}

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Produk
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {selectedOrder.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}{" "}
                    item
                  </p>
                </div>
                <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 p-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.product_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="whitespace-nowrap text-sm font-bold text-slate-800">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="font-semibold text-slate-600">Total pesanan</p>
                <p className="text-xl font-bold text-[#17376f]">
                  {formatCurrency(selectedOrder.total_price)}
                </p>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
