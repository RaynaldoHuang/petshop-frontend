"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
    ArrowLeft,
    Package,
    CreditCard,
    MapPin,
    User,
    Clock,
} from "lucide-react";

import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type OrderItem = {
    id: number;
    product_name: string;
    price: string;
    quantity: number;
    subtotal: string;
};

type Payment = {
    id: number;
    payment_method: string;
    type: string;
    status: string;
    gross_amount: number;
    qr_url?: string | null;
    va_number?: string | null;
    bank?: string | null;
    created_at: string;
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
    payments: Payment[];
};

function getPaymentStatusClass(status: string) {

    switch (status) {

        case "paid":
            return "bg-green-100 text-green-700";

        case "pending":
            return "bg-yellow-100 text-yellow-700";

        case "expired":
            return "bg-red-100 text-red-700";

        case "failed":
            return "bg-red-100 text-red-700";

        default:
            return "bg-gray-100 text-gray-700";
    }
}

export default function OrderDetailPage() {

    const params =
        useParams<{ id: string }>();

    const [order, setOrder] =
        useState<Order | null>(null);

    const [loading, setLoading] =
        useState(true);

    async function retryPayment() {

        if (!order) return;

        try {

            const token =
                localStorage.getItem(
                    "token"
                );

            const res = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_URL}/payments/retry/${order.id}`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await res.json();

            if (!res.ok) {

                throw new Error(
                    data.message ||
                    "Gagal membuat pembayaran baru"
                );
            }

            window.location.href =
                `/checkout/payment/${order.id}?payment=${data.payment_id}`;

        } catch (error) {

            console.error(error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Gagal membuat pembayaran baru"
            );
        }
    }

    useEffect(() => {

        async function loadOrder() {

            try {

                const token =
                    localStorage.getItem("token");

                const res = await apiFetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/customer/orders/${params.id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                            Accept:
                                "application/json",
                        },
                    }
                );

                const data =
                    await res.json();

                setOrder(data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);
            }
        }

        loadOrder();

    }, [params.id]);

    if (loading) {
        return (
            <div className="p-10">
                Loading...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-10">
                Order tidak ditemukan
            </div>
        );
    }

    const latestPayment =
        order.payments?.length
            ? order.payments[
            order.payments.length - 1
            ]
            : null;

    return (
        <main className="bg-gray-50 py-10">

            <div className="mx-auto max-w-7xl px-4">

                {/* BACK */}
                <Link
                    href="/orders"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-[#19398A]"
                >
                    <ArrowLeft size={18} />
                    Kembali ke Pesanan
                </Link>

                <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">

                    {/* LEFT */}
                    <div className="space-y-6">

                        {/* ORDER HEADER */}
                        <div className="rounded-3xl bg-white p-8 shadow-sm">

                            <h1 className="text-3xl font-bold text-[#19398A]">
                                Order #{order.id}
                            </h1>

                            <p className="mt-2 text-gray-500">
                                Dibuat pada{" "}
                                {new Date(
                                    order.created_at
                                ).toLocaleString("id-ID")}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">

                                <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
                                    {order.payment_status}
                                </span>

                                <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-600">
                                    {order.order_status}
                                </span>

                            </div>

                        </div>

                        {/* CUSTOMER */}
                        <div className="rounded-3xl bg-white p-8 shadow-sm">

                            <div className="mb-6 flex items-center gap-3">

                                <User
                                    size={22}
                                    className="text-[#19398A]"
                                />

                                <h2 className="text-xl font-bold text-[#19398A]">
                                    Informasi Customer
                                </h2>

                            </div>

                            <div className="space-y-3">

                                <p>
                                    <strong>Nama:</strong>{" "}
                                    {order.customer_name}
                                </p>

                                <p>
                                    <strong>Telepon:</strong>{" "}
                                    {order.customer_phone}
                                </p>

                            </div>

                        </div>

                        {/* ADDRESS */}
                        <div className="rounded-3xl bg-white p-8 shadow-sm">

                            <div className="mb-6 flex items-center gap-3">

                                <MapPin
                                    size={22}
                                    className="text-[#19398A]"
                                />

                                <h2 className="text-xl font-bold text-[#19398A]">
                                    Alamat Pengiriman
                                </h2>

                            </div>

                            <p className="text-gray-600">
                                {order.shipping_address}
                            </p>

                        </div>

                        {/* ITEMS */}
                        <div className="rounded-3xl bg-white p-8 shadow-sm">

                            <div className="mb-6 flex items-center gap-3">

                                <Package
                                    size={22}
                                    className="text-[#19398A]"
                                />

                                <h2 className="text-xl font-bold text-[#19398A]">
                                    Produk
                                </h2>

                            </div>

                            <div className="space-y-4">

                                {order.items.map(
                                    (item) => (

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

                                    )
                                )}

                            </div>

                        </div>

                        {/* PAYMENT HISTORY */}
                        <div className="rounded-3xl bg-white p-8 shadow-sm">

                            <div className="mb-6 flex items-center gap-3">

                                <Clock
                                    size={22}
                                    className="text-[#19398A]"
                                />

                                <h2 className="text-xl font-bold text-[#19398A]">
                                    Riwayat Pembayaran
                                </h2>

                            </div>

                            <div className="space-y-4">

                                {order.payments.map(
                                    (payment) => (

                                        <div
                                            key={payment.id}
                                            className="rounded-2xl border border-gray-100 p-5"
                                        >

                                            <div className="flex items-center justify-between">

                                                <div>

                                                    <h3 className="font-semibold text-[#19398A]">
                                                        {payment.payment_method}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {payment.type}
                                                    </p>

                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClass(
                                                        payment.status
                                                    )}`}
                                                >
                                                    {payment.status}
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div>

                        <div className="sticky top-6 rounded-3xl bg-white p-8 shadow-sm">

                            <div className="flex items-center gap-3">

                                <CreditCard
                                    size={22}
                                    className="text-[#19398A]"
                                />

                                <h2 className="text-xl font-bold text-[#19398A]">
                                    Pembayaran
                                </h2>

                            </div>

                            <div className="mt-6">

                                <p className="text-sm text-gray-500">
                                    Total Pembayaran
                                </p>

                                <h3 className="mt-2 text-4xl font-bold text-orange-500">

                                    Rp{" "}
                                    {Number(
                                        order.total_price
                                    ).toLocaleString("id-ID")}

                                </h3>

                            </div>

                            {latestPayment && (

                                <div className="mt-8 space-y-3">

                                    {/* DETAIL PAYMENT */}
                                    <Link
                                        href={`/checkout/payment/${order.id}?payment=${latestPayment.id}`}
                                        className="flex h-14 w-full items-center justify-center rounded-2xl bg-orange-500 font-semibold text-white transition hover:bg-orange-600"
                                    >
                                        Detail Pembayaran
                                    </Link>

                                    {/* PENDING */}
                                    {latestPayment.status === "pending" && (

                                        <Link
                                            href={`/checkout/payment/${order.id}?payment=${latestPayment.id}`}
                                            className="flex h-14 w-full items-center justify-center rounded-2xl border border-gray-300 font-semibold text-gray-700 transition hover:bg-gray-50"
                                        >
                                            Lanjutkan Pembayaran
                                        </Link>

                                    )}

                                    {/* PAID */}
                                    {latestPayment.status === "paid" && (

                                        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-sm font-semibold text-green-700">
                                            Pembayaran Berhasil
                                        </div>

                                    )}

                                    {/* EXPIRED */}
                                    {latestPayment.status === "expired" && (

                                        <button
                                            onClick={retryPayment}
                                            className="flex h-14 w-full items-center justify-center rounded-2xl bg-red-500 font-semibold text-white transition hover:bg-red-600"
                                        >
                                            Bayar Ulang
                                        </button>

                                    )}

                                    {/* FAILED */}
                                    {latestPayment.status === "failed" && (

                                        <button
                                            onClick={retryPayment}
                                            className="flex h-14 w-full items-center justify-center rounded-2xl bg-red-500 font-semibold text-white transition hover:bg-red-600"
                                        >
                                            Coba Bayar Lagi
                                        </button>

                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}
