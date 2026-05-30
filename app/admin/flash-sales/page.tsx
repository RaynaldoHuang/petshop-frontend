/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2, Zap } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;
const STORAGE_URL = "http://localhost:8000/storage/";

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

function imageUrl(image: string | null) {
    if (!image) return "/pet-placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `${STORAGE_URL}${image}`;
}

export default function AdminFlashSalePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<FlashSale[]>([]);
    const [productId, setProductId] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function fetchData() {
        try {
            setLoading(true);
            setError("");

            const [productsRes, salesRes] = await Promise.all([
                fetch(`${API}/products`, { cache: "no-store" }),
                fetch(`${API}/flash-sales/all`, { cache: "no-store" }),
            ]);

            if (productsRes.ok) setProducts(await productsRes.json());
            if (salesRes.ok) setSales(await salesRes.json());
        } catch {
            setError("Gagal mengambil data flash sale");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const res = await fetch(`${API}/flash-sales`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    product_id: productId,
                    discount_price: discountPrice,
                    start_at: startAt,
                    end_at: endAt,
                    is_active: isActive ? 1 : 0,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Gagal menyimpan flash sale");
            }

            setProductId("");
            setDiscountPrice("");
            setStartAt("");
            setEndAt("");
            setIsActive(true);
            fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Yakin hapus flash sale ini?")) return;

        await fetch(`${API}/flash-sales/${id}`, {
            method: "DELETE",
        });

        setSales((prev) => prev.filter((sale) => sale.id !== id));
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Flash Sale</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Kelola produk promo, harga diskon, dan waktu flash sale.
                        </p>
                    </div>

                    <div className="hidden rounded-2xl bg-orange-100 p-4 text-orange-600 md:block">
                        <Zap size={32} />
                    </div>
                </div>

                {error ? (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                ) : null}

                <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <form
                        onSubmit={handleSubmit}
                        className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                        <h2 className="mb-6 text-xl font-semibold text-gray-900">
                            Tambah Flash Sale
                        </h2>

                        <div className="grid gap-5">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-gray-700">
                                    Produk
                                </span>
                                <select
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
                                >
                                    <option value="">Pilih produk</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - Rp{" "}
                                            {Number(product.price).toLocaleString("id-ID")}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-gray-700">
                                    Harga Flash Sale
                                </span>
                                <input
                                    type="number"
                                    value={discountPrice}
                                    onChange={(e) => setDiscountPrice(e.target.value)}
                                    required
                                    placeholder="Contoh: 75000"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                                />
                            </label>

                            <div className="grid gap-5 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-gray-700">
                                        Mulai
                                    </span>
                                    <input
                                        type="datetime-local"
                                        value={startAt}
                                        onChange={(e) => setStartAt(e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-gray-700">
                                        Berakhir
                                    </span>
                                    <input
                                        type="datetime-local"
                                        value={endAt}
                                        onChange={(e) => setEndAt(e.target.value)}
                                        required
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                                    />
                                </label>
                            </div>

                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Flash sale aktif
                                </span>
                            </label>

                            <button
                                disabled={saving}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-70"
                            >
                                <Plus size={18} />
                                {saving ? "Menyimpan..." : "Simpan Flash Sale"}
                            </button>
                        </div>
                    </form>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-semibold text-gray-900">
                            List Flash Sale
                        </h2>

                        {loading ? (
                            <p className="text-sm text-gray-500">Memuat data...</p>
                        ) : sales.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                                Belum ada flash sale.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {sales.map((sale) => (
                                    <div
                                        key={sale.id}
                                        className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-20 w-24 overflow-hidden rounded-xl bg-gray-100">
                                                <Image
                                                    src={imageUrl(sale.product?.image || null)}
                                                    alt={sale.product?.name || "Product"}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {sale.product?.name || "Produk tidak ditemukan"}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Flash: Rp{" "}
                                                    {Number(sale.discount_price).toLocaleString("id-ID")}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {sale.start_at} → {sale.end_at}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold ${sale.is_active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-200 text-gray-600"
                                                    }`}
                                            >
                                                {sale.is_active ? "Active" : "Inactive"}
                                            </span>

                                            <button
                                                onClick={() => handleDelete(sale.id)}
                                                className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}