"use client";

import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import {
    ShoppingCart,
    Zap,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";

type FlashSale = {
    id: number;
    discount_price: string;
    start_at: string;
    end_at: string;
    is_active: boolean | number;
    product: {
        id: number;
        name: string;
        slug: string;
        price: string;
        stock: number;
        image: string | null;
    };
};

const API = process.env.NEXT_PUBLIC_API_URL;
const STORAGE_URL = "http://localhost:8000/storage/";

function getImageUrl(image: string | null) {
    if (!image || image.trim() === "") return "/pet-placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `${STORAGE_URL}${image}`;
}

function formatPrice(value: string | number) {
    return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

function getTimeLeft(endAt: string) {
    const end = new Date(endAt).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, end - now);

    return {
        total: diff,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

export default function FlashSaleSection() {
    const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({
        total: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    async function fetchFlashSales() {
        try {
            const res = await fetch(`${API}/flash-sales`, {
                cache: "no-store",
            });

            if (!res.ok) return;

            const data: FlashSale[] = await res.json();
            setFlashSales(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchFlashSales();
    }, []);

    const sale = flashSales[activeIndex];

    useEffect(() => {
        if (!sale) return;

        const timer = setInterval(() => {
            const left = getTimeLeft(sale.end_at);
            setTimeLeft(left);

            if (left.total <= 0) {
                setFlashSales((prev) => {
                    const filtered = prev.filter((item) => item.id !== sale.id);
                    setActiveIndex(0);
                    return filtered;
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [sale]);

    // useEffect(() => {
    //     if (flashSales.length <= 1) return;

    //     const slider = setInterval(() => {
    //         setActiveIndex((prev) => (prev + 1) % flashSales.length);
    //         setQty(1);
    //     }, 10000);

    //     return () => clearInterval(slider);
    // }, [flashSales.length]);

    if (loading) return null;
    if (flashSales.length === 0 || !sale || !sale.product) return null;

    const product = sale.product;

    const discountPercent = Math.round(
        ((Number(product.price) - Number(sale.discount_price)) /
            Number(product.price)) *
        100
    );

    function nextSlide() {
        setActiveIndex((prev) => (prev + 1) % flashSales.length);
        setQty(1);
    }

    function prevSlide() {
        setActiveIndex((prev) => (prev - 1 + flashSales.length) % flashSales.length);
        setQty(1);
    }

    return (
        <section className="pt-16 pb-4">
            <div className="bg-[#DFF1FF] py-3">
                <Marquee speed={55} gradient={false}>
                    {[...Array(10)].map((_, index) => (
                        <p
                            key={index}
                            className="mx-10 text-sm font-semibold uppercase text-[#19398A]"
                        >
                            DEAL OF THE WEEK!
                        </p>
                    ))}
                </Marquee>
            </div>

            <div className="relative mx-auto max-w-7xl py-12">
                {/* SLIDE 1 PRODUCT FULL CONTENT */}
                <div
                    key={sale.id}
                    className="grid animate-flash-slide gap-10 lg:grid-cols-2"
                >
                    {/* IMAGE */}
                    <div className="relative min-h-140 overflow-hidden rounded-2xl bg-[#F5F7FB]">
                        <Image
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            fill
                            className="object-contain p-10"
                            unoptimized
                        />
                    </div>

                    {/* CONTENT */}
                    <div className="flex flex-col justify-center">
                        <span className="mb-5 w-fit rounded bg-red-600 px-3 py-1 text-sm font-bold text-white">
                            Flash Sale
                        </span>

                        <div className="mb-5 flex items-center gap-2 text-[#19398A]">
                            <Zap size={22} />
                            <h2 className="text-2xl font-extrabold">
                                Hurry up! Sale end in
                            </h2>
                        </div>

                        <div className="mb-8 flex flex-wrap items-center gap-3 text-[#19398A]">
                            {[
                                String(timeLeft.days).padStart(2, "0"),
                                String(timeLeft.hours).padStart(2, "0"),
                                String(timeLeft.minutes).padStart(2, "0"),
                                String(timeLeft.seconds).padStart(2, "0"),
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="rounded-lg border border-[#19398A]/30 bg-white px-4 py-3 text-3xl font-extrabold">
                                        {item}
                                    </div>
                                    {index < 3 ? (
                                        <span className="text-2xl font-bold">:</span>
                                    ) : null}
                                </div>
                            ))}
                        </div>

                        <h3 className="text-4xl font-extrabold text-[#19398A]">
                            {product.name}
                        </h3>

                        <div className="mt-6">
                            <p className="text-sm font-medium text-gray-400 line-through">
                                {formatPrice(product.price)}
                            </p>

                            <p className="text-3xl font-extrabold text-red-600">
                                {formatPrice(sale.discount_price)}
                            </p>

                            {discountPercent > 0 ? (
                                <p className="mt-2 w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                                    Hemat {discountPercent}%
                                </p>
                            ) : null}
                        </div>

                        <div className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-600">
                            <CheckCircle size={18} />
                            {product.stock > 0 ? "In stock!" : "Out of stock"}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <div className="flex h-14 w-36 items-center justify-between rounded-xl bg-gray-100 px-5">
                                <button
                                    type="button"
                                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                                    className="text-2xl text-[#19398A]/50"
                                >
                                    -
                                </button>

                                <span className="font-bold text-[#19398A]">{qty}</span>

                                <button
                                    type="button"
                                    onClick={() => setQty((prev) => prev + 1)}
                                    className="text-2xl text-[#19398A]/50"
                                >
                                    +
                                </button>
                            </div>

                            <Link
                                href={`/products/${product.slug}`}
                                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-700"
                            >
                                <ShoppingCart size={20} />
                                View product
                            </Link>
                        </div>
                    </div>
                </div>

                {/* CONTROLS UNTUK GESER 1 PRODUCT FULL */}
                {flashSales.length > 1 ? (
                    <>
                        <button
                            type="button"
                            onClick={prevSlide}
                            className="absolute -left-6 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm"
                        >
                            <ChevronLeft className="text-[#19398A]" />
                        </button>

                        <button
                            type="button"
                            onClick={nextSlide}
                            className="absolute -right-6 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm"
                        >
                            <ChevronRight className="text-[#19398A]" />
                        </button>

                        <div className="mt-8 flex justify-center gap-2">
                            {flashSales.map((item, index) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveIndex(index);
                                        setQty(1);
                                    }}
                                    className={`h-3 rounded-full transition ${activeIndex === index
                                        ? "w-8 bg-[#19398A]"
                                        : "w-3 bg-[#19398A]/30"
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                ) : null}
            </div>

            <div className="bg-[#DFF1FF] py-3">
                <Marquee speed={55} direction="right" gradient={false}>
                    {[...Array(10)].map((_, index) => (
                        <p
                            key={index}
                            className="mx-10 text-sm font-semibold uppercase text-[#19398A]"
                        >
                            DEAL OF THE WEEK!
                        </p>
                    ))}
                </Marquee>
            </div>
        </section>
    );
}