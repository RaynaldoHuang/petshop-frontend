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
        <section className="py-12 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 lg:px-0">
                <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between lg:mb-10 lg:gap-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-orange-500 lg:text-sm">
                            Our Products
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-[#19398A] lg:text-4xl">
                            Popular Pet Essentials
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 lg:mt-3 lg:text-base lg:leading-normal">
                            Pilih kebutuhan terbaik untuk hewan kesayangan kamu.
                        </p>
                    </div>
                </div>

                <div className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-center lg:justify-between">
                    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0">
                        <button
                            type="button"
                            onClick={() => setActiveCategory("all")}
                            className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-medium transition cursor-pointer lg:px-5 lg:py-3 lg:text-sm ${activeCategory === "all"
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
                                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-medium transition cursor-pointer lg:px-5 lg:py-3 lg:text-sm ${activeCategory === category.id
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
                        className="hidden text-sm font-semibold text-[#19398A] underline underline-offset-4 hover:text-orange-500 lg:block"
                    >
                        Lihat Semua Produk
                    </Link>
                </div>

                {loading ? (
                    <p className="py-8 text-sm text-gray-500 lg:text-base">Loading products...</p>
                ) : filteredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center lg:p-10">
                        <p className="text-sm font-semibold text-gray-700 lg:text-base">
                            Produk kategori ini belum tersedia.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-7 lg:grid-cols-5 lg:gap-x-4 lg:gap-y-8">
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
                                        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 lg:rounded-2xl">

                                            {/* BADGE */}
                                            {isFlashSale ? (
                                                <div className="absolute left-2 top-2 z-20 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white lg:left-3 lg:top-3 lg:px-3 lg:text-[11px]">
                                                    Flash Sale
                                                </div>
                                            ) : isNormalSale ? (
                                                <div className="absolute left-2 top-2 z-20 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white lg:left-3 lg:top-3 lg:px-3 lg:text-[11px]">
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

                                    <div className="pt-3 lg:pt-4">
                                        {/* TITLE */}
                                        <h3 className="line-clamp-2 text-sm font-medium leading-5 text-[#19398A] lg:truncate lg:text-base lg:leading-normal">
                                            {product.name}
                                        </h3>

                                        {/* PRICE */}
                                        <div className="mt-1.5 lg:mt-3">
                                            {hasDiscount ? (
                                                <>
                                                    <p className="text-xs font-medium text-gray-400 line-through lg:text-sm">
                                                        Rp{" "}
                                                        {Number(product.price).toLocaleString("id-ID")}
                                                    </p>

                                                    <p
                                                        className={`text-base font-bold lg:text-lg ${isFlashSale
                                                            ? "text-red-600"
                                                            : "text-orange-500"
                                                            }`}
                                                    >
                                                        Rp{" "}
                                                        {Number(finalPrice).toLocaleString("id-ID")}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-base font-bold text-orange-500 lg:text-lg">
                                                    Rp{" "}
                                                    {Number(product.price).toLocaleString("id-ID")}
                                                </p>
                                            )}
                                        </div>

                                        {/* SOLD */}
                                        <p className="mt-1 text-[11px] font-normal text-gray-500 lg:text-xs">
                                            {product.sold_count ?? 0} terjual
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Link
                    href="/products"
                    className="mx-auto mt-8 flex w-fit text-sm font-semibold text-[#19398A] underline underline-offset-4 transition active:text-orange-500 lg:hidden"
                >
                    Lihat Semua Produk
                </Link>
            </div>
        </section>
    );
}
