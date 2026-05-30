"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  total_price: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  items: OrderItem[];
};

const ORDER_STATUS_OPTIONS = [
  "new",
  "processed",
  "shipped",
  "completed",
  "cancelled",
];

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Gagal mengambil data order");
        }

        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  async function handleStatusChange(id: number, orderStatus: string) {
    try {
      setUpdatingId(id);
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            order_status: orderStatus,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui status order");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? { ...order, order_status: data.data.order_status }
            : order,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Orders</h1>
            <p className="mt-2 text-sm text-gray-600">
              Lihat dan kelola status pesanan customer.
            </p>
          </div>

          <Link
            href="/admin/products"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Kelola Produk
          </Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Memuat data order...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Belum ada order
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Order customer akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Order #{order.id}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.customer_name} • {order.customer_phone}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      {order.shipping_address}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getPaymentBadgeClass(
                        order.payment_status,
                      )}`}
                    >
                      Payment: {order.payment_status}
                    </span>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getOrderBadgeClass(
                        order.order_status,
                      )}`}
                    >
                      Order: {order.order_status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x Rp{" "}
                          {Number(item.price).toLocaleString("id-ID")}
                        </p>
                      </div>

                      <p className="font-semibold text-orange-600">
                        Rp {Number(item.subtotal).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-2 md:items-end">
                  <div>
                    <span className="text-sm text-gray-500">Total Order</span>
                    <p className="text-lg font-bold text-gray-900">
                      Rp {Number(order.total_price).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Update Status Order
                    </label>
                    <select
                      value={order.order_status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      disabled={updatingId === order.id}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {updatingId === order.id ? (
                  <p className="mt-3 text-sm text-gray-500">
                    Memperbarui status...
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
