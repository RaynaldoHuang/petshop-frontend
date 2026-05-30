"use client";

import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  total_price: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items: OrderItem[];
  latest_payment: LatestPayment | null;
};

function getPaymentBadgeClass(paymentStatus: string) {
  switch (paymentStatus) {
    case "paid":
    case "settlement":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
    case "deny":
    case "cancelled":
    case "expire":
    case "expired":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getOrderBadgeClass(orderStatus: string) {
  switch (orderStatus) {
    case "new":
      return "bg-gray-100 text-gray-700";
    case "processed":
      return "bg-blue-100 text-blue-700";
    case "shipped":
      return "bg-indigo-100 text-indigo-700";
    case "completed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] =
    useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/customer/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await res.json();

        setOrders(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const filteredOrders =
    orders.filter((order) => {

      const paymentStatus =
        order.latest_payment?.status ||
        order.payment_status;

      if (activeTab === "all")
        return true;

      if (activeTab === "pending")
        return paymentStatus === "pending";

      if (activeTab === "paid")
        return paymentStatus === "paid";

      if (activeTab === "expired")
        return [
          "expired",
          "failed",
        ].includes(paymentStatus);

      if (activeTab === "completed")
        return (
          order.order_status ===
          "completed"
        );

      return true;
    });

  return (
    <AuthGuard>
      <main className="bg-gray-50 py-10">

        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-8">

            <h1 className="text-4xl font-bold text-[#19398A]">
              Pesanan Saya
            </h1>

            <p className="mt-2 text-gray-500">
              Pantau status pesanan dan pembayaran Anda secara real-time.
            </p>

          </div>

          <div className="mb-8">

            <div className="flex flex-wrap gap-3">

              {[
                {
                  key: "all",
                  label: "Semua",
                },
                {
                  key: "pending",
                  label: "Pending",
                },
                {
                  key: "paid",
                  label: "Paid",
                },
                {
                  key: "completed",
                  label: "Completed",
                },
                {
                  key: "expired",
                  label: "Expired",
                },
              ].map((tab) => {

                const active =
                  activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() =>
                      setActiveTab(tab.key)
                    }
                    className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${active
                        ? "bg-orange-500 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-orange-200"
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

          </div>

          {loading ? (

            <div className="rounded-3xl border border-gray-200 bg-white p-8">
              Memuat pesanan...
            </div>

          ) : filteredOrders.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">

              <h2 className="text-2xl font-bold text-[#19398A]">
                Belum Ada Pesanan
              </h2>

              <p className="mt-3 text-gray-500">
                Pesanan yang Anda buat akan muncul di sini.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-xl bg-orange-500 px-6 py-3 text-white"
              >
                Mulai Belanja
              </Link>

            </div>

          ) : (

            <div className="space-y-6">

              {filteredOrders.map((order) => (

                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                >

                  {/* TOP */}
                  <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">

                    <div className="flex flex-wrap items-center justify-between gap-4">

                      <div>

                        <h2 className="text-xl font-bold text-[#19398A]">
                          Order #{order.id}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(
                            order.created_at
                          ).toLocaleString("id-ID")}
                        </p>

                      </div>

                      <div className="flex gap-2">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentBadgeClass(
                            order.latest_payment?.status ||
                            order.payment_status
                          )}`}
                        >
                          {order.latest_payment?.status ||
                            order.payment_status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getOrderBadgeClass(
                            order.order_status
                          )}`}
                        >
                          {order.order_status}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* ITEMS */}
                  <div className="space-y-3 p-6">

                    {order.items.map((item) => (

                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-gray-100 p-4"
                      >

                        <div>

                          <h3 className="font-semibold text-[#19398A]">
                            {item.product_name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {item.quantity} x Rp{" "}
                            {Number(
                              item.price
                            ).toLocaleString(
                              "id-ID"
                            )}
                          </p>

                        </div>

                        <div className="font-semibold text-orange-500">

                          Rp{" "}
                          {Number(
                            item.subtotal
                          ).toLocaleString(
                            "id-ID"
                          )}

                        </div>

                      </div>

                    ))}

                  </div>

                  {/* FOOTER */}
                  <div className="border-t border-gray-100 px-6 py-5">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div>

                        <p className="text-sm text-gray-500">
                          Total Pembayaran
                        </p>

                        <h3 className="mt-1 text-2xl font-bold text-orange-500">

                          Rp{" "}
                          {Number(
                            order.total_price
                          ).toLocaleString(
                            "id-ID"
                          )}

                        </h3>

                      </div>

                      <div className="flex flex-wrap gap-3">

                        {order.latest_payment &&
                          order.latest_payment
                            .status ===
                          "pending" && (

                            <Link
                              href={`/checkout/payment/${order.id}?payment=${order.latest_payment.id}`}
                              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                            >
                              Lanjutkan Pembayaran
                            </Link>

                          )}

                        {order.latest_payment &&
                          [
                            "expired",
                            "failed",
                          ].includes(
                            order.latest_payment
                              .status
                          ) && (

                            <button
                              className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-600"
                            >
                              Bayar Ulang
                            </button>

                          )}

                        {order.latest_payment && (

                          <Link
                            href={`/orders/${order.id}`}
                            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Detail Pembayaran
                          </Link>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>
    </AuthGuard>
  );
}
