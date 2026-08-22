"use client";

import { apiFetch } from "@/lib/api";
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, MapPin, Package, RefreshCw, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type OrderItem = { id: number; product_name: string; price: string; quantity: number; subtotal: string };
type Payment = { id: number; payment_method: string; type: string; status: string; gross_amount: number; created_at: string };
type Order = { id: number; customer_name: string; customer_phone: string; shipping_address: string; shipping_city?: string | null; shipping_district?: string | null; shipping_subdistrict?: string | null; shipping_zip_code?: string | null; shipping_courier?: string | null; shipping_service?: string | null; shipping_cost?: number | string | null; total_price: string; payment_status: string; order_status: string; created_at: string; items: OrderItem[]; payments: Payment[] };

const currency = (value: number | string | null | undefined) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
const paymentLabels: Record<string, string> = { paid: "Lunas", pending: "Menunggu pembayaran", awaiting_confirmation: "Menunggu konfirmasi", expired: "Kedaluwarsa", failed: "Gagal" };
const orderLabels: Record<string, string> = { new: "Pesanan baru", processed: "Diproses", shipped: "Dikirim", completed: "Selesai", cancelled: "Dibatalkan" };

function paymentClass(status: string) {
    if (status === "paid") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (status === "awaiting_confirmation") return "border-blue-200 bg-blue-50 text-blue-700";
    if (["expired", "failed"].includes(status)) return "border-red-200 bg-red-50 text-red-700";
    return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function OrderDetailPage() {
    const params = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadOrder() {
            try {
                const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/orders/${params.id}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Pesanan tidak ditemukan.");
                setOrder(data);
            } catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat pesanan."); }
            finally { setLoading(false); }
        }
        loadOrder();
    }, [params.id]);

    async function retryPayment() {
        if (!order) return;
        try {
            setRetrying(true); setError("");
            const response = await apiFetch(`/payments/retry/${order.id}`, { method: "POST" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Gagal membuat pembayaran baru.");
            window.location.href = `/checkout/payment/${order.id}?payment=${data.payment_id}`;
        } catch (err) { setError(err instanceof Error ? err.message : "Gagal membuat pembayaran baru."); setRetrying(false); }
    }

    if (loading) return <main className="grid min-h-[60vh] place-items-center bg-[#F7F9FC] px-4 text-sm text-gray-500">Memuat detail pesanan...</main>;
    if (!order) return <main className="grid min-h-[60vh] place-items-center bg-[#F7F9FC] px-4"><div className="text-center"><p className="text-lg font-bold text-[#19398A]">{error || "Order tidak ditemukan"}</p><Link href="/orders" className="mt-4 inline-flex text-sm font-semibold text-orange-500">Kembali ke pesanan</Link></div></main>;

    const latestPayment = order.payments?.at(-1);

    return <main className="min-h-screen bg-[#F7F9FC] px-4 py-7 sm:px-6 lg:px-8 lg:py-10"><div className="mx-auto max-w-6xl"><Link href="/orders" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#19398A]"><ArrowLeft size={17} />Kembali ke Pesanan</Link>
        <header className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">Detail pesanan</p><h1 className="mt-2 text-2xl font-bold text-[#19398A] sm:text-3xl">Pesanan #{order.id}</h1><p className="mt-2 text-sm text-gray-500">Dibuat {new Date(order.created_at).toLocaleString("id-ID")}</p></div><div className="flex flex-wrap gap-2"><span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${paymentClass(order.payment_status)}`}>{paymentLabels[order.payment_status] || order.payment_status}</span><span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#19398A]">{orderLabels[order.order_status] || order.order_status}</span></div></div></header>
        {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-5">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"><SectionTitle icon={<Package size={19} />} title="Produk dipesan" /><div className="mt-5 divide-y divide-gray-100">{order.items.map((item) => <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#19398A]"><Package size={19} /></div><div className="min-w-0 flex-1"><p className="font-bold text-[#19398A]">{item.product_name}</p><p className="mt-1 text-sm text-gray-500">{item.quantity} × {currency(item.price)}</p></div><p className="whitespace-nowrap text-sm font-bold text-orange-500">{currency(item.subtotal)}</p></div>)}</div></section>
            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"><SectionTitle icon={<MapPin size={19} />} title="Pengiriman" /><div className="mt-5 rounded-xl bg-gray-50 p-4"><p className="font-bold text-gray-800">{order.customer_name}</p><p className="mt-1 text-sm text-gray-500">{order.customer_phone}</p><p className="mt-4 text-sm leading-6 text-gray-600">{order.shipping_address}</p><p className="mt-2 text-xs leading-5 text-gray-500">{[order.shipping_subdistrict, order.shipping_district, order.shipping_city, order.shipping_zip_code].filter(Boolean).join(", ")}</p></div>{order.shipping_courier ? <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm"><span className="font-semibold text-gray-700">{order.shipping_courier} · {order.shipping_service}</span><span className="font-bold text-orange-600">{currency(order.shipping_cost)}</span></div> : null}</section>
            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"><SectionTitle icon={<UserRound size={19} />} title="Informasi penerima" /><div className="mt-5 grid gap-3 sm:grid-cols-2"><Info label="Nama" value={order.customer_name} /><Info label="Nomor telepon" value={order.customer_phone} /></div></section>
            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"><SectionTitle icon={<Clock3 size={19} />} title="Riwayat pembayaran" /><div className="mt-5 space-y-3">{order.payments.length ? order.payments.map((payment) => <div key={payment.id} className="rounded-xl border border-gray-100 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"><div className="min-w-0"><div className="flex items-center gap-2"><p className="font-bold capitalize text-[#19398A]">{payment.payment_method}</p><span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">{payment.type}</span></div><p className="mt-2 text-xs leading-5 text-gray-500">{new Date(payment.created_at).toLocaleString("id-ID")}</p><p className="mt-1 text-sm font-bold text-gray-700">{currency(payment.gross_amount)}</p></div><span className={`mt-3 inline-flex max-w-full rounded-full border px-3 py-1.5 text-xs font-bold sm:mt-0 ${paymentClass(payment.status)}`}>{paymentLabels[payment.status] || payment.status}</span></div>) : <p className="text-sm text-gray-500">Belum ada pembayaran.</p>}</div></section>
        </div><aside className="lg:sticky lg:top-5 lg:h-fit"><section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"><SectionTitle icon={<CreditCard size={19} />} title="Ringkasan pembayaran" /><div className="mt-5 rounded-xl bg-orange-50 p-4"><p className="text-sm text-gray-500">Total pesanan</p><p className="mt-1 text-2xl font-bold text-orange-500 sm:text-3xl">{currency(order.total_price)}</p></div>{latestPayment ? <div className="mt-5 space-y-3"><Link href={`/checkout/payment/${order.id}?payment=${latestPayment.id}`} className="flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600">Detail Pembayaran</Link>{latestPayment.status === "pending" ? <Link href={`/checkout/payment/${order.id}?payment=${latestPayment.id}`} className="flex h-12 w-full items-center justify-center rounded-xl border border-[#19398A] text-sm font-bold text-[#19398A] transition hover:bg-blue-50">Lanjutkan Pembayaran</Link> : null}{latestPayment.status === "paid" ? <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700"><CheckCircle2 size={17} />Pembayaran berhasil</div> : null}{["expired", "failed"].includes(latestPayment.status) ? <button onClick={retryPayment} disabled={retrying} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#19398A] text-sm font-bold text-white transition hover:bg-[#142d70] disabled:opacity-60"><RefreshCw size={17} />{retrying ? "Menyiapkan..." : "Bayar Ulang"}</button> : null}</div> : <p className="mt-5 text-sm text-gray-500">Pembayaran belum dibuat.</p>}</section></aside></div>
    </div></main>;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-[#19398A]">{icon}</div><h2 className="text-lg font-bold text-[#19398A]">{title}</h2></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 text-sm font-semibold text-gray-700">{value}</p></div>; }
