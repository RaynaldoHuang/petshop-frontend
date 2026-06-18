"use client";

import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  PackageCheck,
  ReceiptText,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";

type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  price: string;
  quantity: number;
  subtotal: string;
};

type LatestPayment = {
  id: number;
  type: string;
  status: string;
  qr_url?: string | null;
  va_number?: string | null;
  bank?: string | null;
};

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_courier?: string | null;
  shipping_service?: string | null;
  shipping_cost?: string | number | null;
  total_price: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items: OrderItem[];
  latest_payment: LatestPayment | null;
};

const tabs = [
  {
    key: "all",
    label: "Semua",
  },
  {
    key: "pending",
    label: "Menunggu",
  },
  {
    key: "paid",
    label: "Dibayar",
  },
  {
    key: "completed",
    label: "Selesai",
  },
  {
    key: "expired",
    label: "Gagal",
  },
];

function formatCurrency(value: string) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getPaymentStatus(order: Order) {
  return order.latest_payment?.status ||
    order.payment_status;
}

function getPaymentBadgeClass(paymentStatus: string) {
  switch (paymentStatus) {
    case "paid":
    case "settlement":
      return "border-green-100 bg-green-50 text-green-700";
    case "pending":
      return "border-orange-100 bg-orange-50 text-orange-600";
    case "failed":
    case "deny":
    case "cancelled":
    case "expire":
    case "expired":
      return "border-red-100 bg-red-50 text-red-600";
    default:
      return "border-gray-100 bg-gray-50 text-gray-600";
  }
}

function getOrderBadgeClass(orderStatus: string) {
  switch (orderStatus) {
    case "processed":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "shipped":
      return "border-indigo-100 bg-indigo-50 text-indigo-700";
    case "completed":
      return "border-green-100 bg-green-50 text-green-700";
    case "cancelled":
      return "border-red-100 bg-red-50 text-red-600";
    default:
      return "border-gray-100 bg-gray-50 text-gray-600";
  }
}

function getPaymentLabel(paymentStatus: string) {
  switch (paymentStatus) {
    case "paid":
    case "settlement":
      return "Sudah Dibayar";
    case "pending":
      return "Menunggu Pembayaran";
    case "expired":
    case "expire":
      return "Kadaluarsa";
    case "failed":
    case "deny":
      return "Gagal";
    case "cancelled":
      return "Dibatalkan";
    default:
      return paymentStatus || "-";
  }
}

function getOrderLabel(orderStatus: string) {
  switch (orderStatus) {
    case "new":
      return "Pesanan Baru";
    case "processed":
      return "Diproses";
    case "shipped":
      return "Dikirim";
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    default:
      return orderStatus || "-";
  }
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [activeTab, setActiveTab] =
    useState("all");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError("");

        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/customer/orders`
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
            "Gagal memuat riwayat pesanan"
          );
        }

        if (!Array.isArray(data)) {
          throw new Error(
            "Format data pesanan tidak valid"
          );
        }

        setOrders(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat riwayat pesanan"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();

    function refreshOrders() {
      fetchOrders();
    }

    window.addEventListener("focus", refreshOrders);
    window.addEventListener("order-updated", refreshOrders);

    return () => {
      window.removeEventListener("focus", refreshOrders);
      window.removeEventListener("order-updated", refreshOrders);
    };
  }, []);

  const filteredOrders =
    orders.filter((order) => {
      const paymentStatus =
        getPaymentStatus(order);

      if (activeTab === "all")
        return true;

      if (activeTab === "pending")
        return paymentStatus === "pending";

      if (activeTab === "paid")
        return [
          "paid",
          "settlement",
        ].includes(paymentStatus);

      if (activeTab === "expired")
        return [
          "expired",
          "expire",
          "failed",
          "deny",
          "cancelled",
        ].includes(paymentStatus);

      if (activeTab === "completed")
        return order.order_status ===
          "completed";

      return true;
    });

  return (
    <AuthGuard>
      <main className="min-h-screen px-4 py-8 lg:px-0 lg:py-12">

        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5  lg:mb-6 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:rounded-xl lg:p-7">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                My Orders
              </p>

              <h1 className="mt-2 text-3xl font-bold leading-tight text-[#19398A] lg:text-4xl">
                Pesanan Saya
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 lg:text-base lg:leading-7">
                Pantau pembayaran dan proses pengiriman pesananmu di satu tempat.
              </p>
            </div>
          </div>

          {/* FILTER */}
          <div className="mb-5 overflow-x-auto pb-1 lg:mb-6">
            <div className="flex min-w-max gap-2">
              {tabs.map((tab) => {
                const active =
                  activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() =>
                      setActiveTab(tab.key)
                    }
                    className={`h-11 rounded-full border px-5 text-sm font-semibold transition ${active
                      ? "border-[#19398A] bg-[#19398A] text-white"
                      : "border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-[#19398A]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (

            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
              {error}
            </div>

          ) : loading ? (

            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm shadow-gray-100 lg:rounded-xl">
              Memuat pesanan...
            </div>

          ) : filteredOrders.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-12 text-center shadow-sm shadow-gray-100 lg:rounded-xl lg:px-12">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <ReceiptText size={30} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#19398A]">
                Belum Ada Pesanan
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Pesanan yang kamu buat akan muncul di sini.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Mulai Belanja
                <ArrowRight size={17} />
              </Link>

            </div>

          ) : (

            <div className="space-y-4 lg:space-y-5">

              {filteredOrders.map((order) => {
                const paymentStatus =
                  getPaymentStatus(order);

                const firstItem =
                  order.items[0];

                const remainingItems =
                  Math.max(
                    order.items.length - 1,
                    0
                  );

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-100 lg:rounded-xl"
                  >

                    <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center lg:p-6">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold text-[#19398A]">
                            Order #{order.id}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentBadgeClass(paymentStatus)}`}
                          >
                            {getPaymentLabel(paymentStatus)}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getOrderBadgeClass(order.order_status)}`}
                          >
                            {getOrderLabel(order.order_status)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={16} />
                            {formatDate(order.created_at)}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <PackageCheck size={16} />
                            {order.items.length} produk
                          </span>
                        </div>

                        {firstItem ? (
                          <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h3 className="truncate font-semibold text-[#19398A]">
                                  {firstItem.product_name}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                  {firstItem.quantity} x {formatCurrency(firstItem.price)}
                                  {remainingItems > 0
                                    ? ` + ${remainingItems} produk lainnya`
                                    : ""}
                                </p>
                              </div>

                              <p className="shrink-0 text-sm font-semibold text-orange-500">
                                {formatCurrency(firstItem.subtotal)}
                              </p>
                            </div>
                          </div>
                        ) : null}

                      </div>

                      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 lg:p-5">
                        <p className="flex items-center gap-2 text-sm text-orange-600">
                          <CreditCard size={16} />
                          Total Pembayaran
                        </p>

                        <h3 className="mt-2 text-2xl font-bold text-orange-500">
                          {formatCurrency(order.total_price)}
                        </h3>

                        {order.shipping_courier ? (
                          <p className="mt-1 text-xs text-orange-600">
                            Termasuk ongkir {order.shipping_courier} {order.shipping_service} Rp{" "}
                            {Number(order.shipping_cost || 0).toLocaleString("id-ID")}
                          </p>
                        ) : null}

                        <div className="mt-4 grid gap-2">
                          {order.latest_payment?.status === "pending" ? (
                            <Link
                              href={`/checkout/payment/${order.id}?payment=${order.latest_payment.id}`}
                              className="flex h-11 items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
                            >
                              Lanjutkan Pembayaran
                            </Link>
                          ) : null}

                          <Link
                            href={`/orders/${order.id}`}
                            className="flex h-11 items-center justify-center rounded-xl border border-orange-200 bg-white px-4 text-sm font-semibold text-[#19398A] transition hover:border-[#19398A]"
                          >
                            Detail Pesanan
                          </Link>
                        </div>
                      </div>

                    </div>

                  </article>
                );
              })}

            </div>

          )}

        </div>

      </main>
    </AuthGuard>
  );
}
