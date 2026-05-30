"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Category = {
    id: number;
    name: string;
    slug: string;
};

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
    category_id: number | null;

    category?: Category | null;

    flash_sale?: {
        id: number;
        discount_price: string;
        end_at: string;
    } | null;
};

function getImageUrl(image: string | null) {
    if (!image || image.trim() === "") return "/pet-placeholder.jpg";

    if (image.startsWith("http")) return image;

    return `http://localhost:8000/storage/${image}`;
}

export default function HomeProductSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | "all">("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                        cache: "no-store",
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
                        cache: "no-store",
                    }),
                ]);

                if (productsRes.ok) {
                    const productData: Product[] = await productsRes.json();
                    setProducts(productData);
                }

                if (categoriesRes.ok) {
                    const categoryData: Category[] = await categoriesRes.json();
                    setCategories(categoryData);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const filteredProducts = useMemo(() => {
        return products
            .filter((product) => {
                if (activeCategory === "all") return true;

                return product.category_id === activeCategory;
            })
            .slice(0, 10);
    }, [products, activeCategory]);

    return (
        <section className="py-20">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-orange-500">
                            Our Products
                        </p>

                        <h2 className="mt-2 text-4xl font-bold text-[#19398A]">
                            Popular Pet Essentials
                        </h2>

                        <p className="mt-3 max-w-xl text-gray-500">
                            Pilih kebutuhan terbaik untuk hewan kesayangan kamu.
                        </p>
                    </div>
                </div>

                <div className="mb-10 flex items-center justify-between">
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setActiveCategory("all")}
                            className={`rounded-full px-5 py-3 text-sm font-medium transition cursor-pointer ${activeCategory === "all"
                                ? "bg-[#19398A] text-white"
                                : "bg-gray-100 text-[#19398A] hover:bg-orange-100"
                                }`}
                        >
                            All Products
                        </button>

                        {categories.map((category) => (
                            <button
                                type="button"
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`rounded-full px-5 py-3 text-sm font-medium transition cursor-pointer ${activeCategory === category.id
                                    ? "bg-[#19398A] text-white"
                                    : "bg-gray-100 text-[#19398A] hover:bg-orange-100"
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    <Link
                        href="/products"
                        className="text-sm font-semibold text-[#19398A] underline underline-offset-4 hover:text-orange-500"
                    >
                        Lihat Semua Produk
                    </Link>
                </div>

                {loading ? (
                    <p className="text-gray-500">Loading products...</p>
                ) : filteredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                        <p className="font-semibold text-gray-700">
                            Produk kategori ini belum tersedia.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
                        {filteredProducts.map((product) => {
                            const flashPrice =
                                product.flash_sale &&
                                    Number(product.flash_sale.discount_price) > 0 &&
                                    Number(product.flash_sale.discount_price) < Number(product.price)
                                    ? product.flash_sale.discount_price
                                    : null;
                            const normalDiscount =
                                product.discount_price &&
                                    Number(product.discount_price) > 0 &&
                                    Number(product.discount_price) < Number(product.price)
                                    ? product.discount_price
                                    : null;
                            const finalPrice =
                                flashPrice || normalDiscount || product.price;
                            const isFlashSale = !!flashPrice;
                            const isNormalSale = !!normalDiscount && !isFlashSale;
                            const hasDiscount =
                                Number(finalPrice) > 0 &&
                                Number(finalPrice) < Number(product.price);
                            return (
                                <div
                                    key={product.id}
                                    className="group overflow-hidden rounded-t-2xl bg-white transition duration-300 hover:-translate-y-1"
                                >
                                    <Link href={`/products/${product.slug}`}>
                                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">

                                            {/* BADGE */}
                                            {isFlashSale ? (
                                                <div className="absolute left-3 top-3 z-20 rounded-full bg-red-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                                                    Flash Sale
                                                </div>
                                            ) : isNormalSale ? (
                                                <div className="absolute left-3 top-3 z-20 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                                                    Sale
                                                </div>
                                            ) : null}
                                            <Image
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition duration-500 group-hover:scale-105"
                                                unoptimized
                                            />
                                        </div>
                                    </Link>

                                    <div className="pt-4">
                                        {/* TITLE */}
                                        <h3 className="line-clamp-2 font-medium text-[#19398A] truncate">
                                            {product.name}
                                        </h3>

                                        {/* PRICE */}
                                        <div className="mt-3">
                                            {hasDiscount ? (
                                                <>
                                                    <p className="text-sm font-medium text-gray-400 line-through">
                                                        Rp{" "}
                                                        {Number(product.price).toLocaleString("id-ID")}
                                                    </p>

                                                    <p
                                                        className={`text-lg font-bold ${isFlashSale
                                                            ? "text-red-600"
                                                            : "text-orange-500"
                                                            }`}
                                                    >
                                                        Rp{" "}
                                                        {Number(finalPrice).toLocaleString("id-ID")}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-lg font-bold text-orange-500">
                                                    Rp{" "}
                                                    {Number(product.price).toLocaleString("id-ID")}
                                                </p>
                                            )}
                                        </div>

                                        {/* SOLD */}
                                        <p className="mt-1 text-xs font-normal text-gray-500">
                                            {product.sold_count ?? 0} terjual
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}