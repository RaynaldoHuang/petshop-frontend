/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type Hero = {
    id: number;
    image: string | null;
    link: string | null;
    is_active?: boolean | number;
    sort_order?: number;
};

type Props = {
    heroes: Hero[];
};

const STORAGE = "http://localhost:8000/storage/";

function getImageUrl(image: string | null) {
    if (!image || image.trim() === "") {
        return "/pet-placeholder.jpg";
    }

    if (image.startsWith("http")) {
        return image;
    }

    return `${STORAGE}${image}`;
}

export default function HeroSlider({ heroes }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);

    function nextSlide() {
        setActiveIndex((prev) => (prev + 1) % heroes.length);
    }

    function prevSlide() {
        setActiveIndex((prev) => (prev - 1 + heroes.length) % heroes.length);
    }

    // 🔥 AUTO SLIDE 5 DETIK
    useEffect(() => {
        if (heroes.length <= 1) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(timer);
    }, [heroes.length]);

    if (!heroes || heroes.length === 0) {
        return null;
    }

    const activeHero = heroes[activeIndex];

    return (
        <section className="mx-auto max-w-360 mt-6 px-4 md:px-8">
            <div className="grid gap-5 lg:grid-cols-2">
                {/* ================= LEFT CAROUSEL ================= */}
                <div className="relative min-h-140 overflow-hidden rounded-xl bg-[#F4F6FB]">
                    {/* CLICKABLE IMAGE */}
                    <Link
                        href={activeHero.link || "/products"}
                        className="group block h-full w-full"
                    >
                        <div key={activeHero.id} className="absolute inset-0">
                            <Image
                                src={getImageUrl(activeHero.image)}
                                alt="Hero Banner"
                                fill
                                className="object-cover object-center transition duration-500 group-hover:scale-105"
                                priority
                                unoptimized
                            />
                        </div>
                    </Link>

                    {/* PREV NEXT */}
                    {heroes.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={prevSlide}
                                className="absolute left-6 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white cursor-pointer shadow-xs"
                            >
                                <ChevronLeft className="text-[#19398A]" />
                            </button>

                            <button
                                type="button"
                                onClick={nextSlide}
                                className="absolute right-6 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white cursor-pointer shadow-xs"
                            >
                                <ChevronRight className="text-[#19398A]" />
                            </button>
                        </>
                    )}

                    {/* DOTS */}
                    {heroes.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
                            {heroes.map((hero, index) => (
                                <button
                                    key={hero.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className={`h-3 w-3 rounded-full transition ${activeIndex === index
                                        ? "bg-[#19398A]"
                                        : "bg-white/50"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ================= RIGHT STATIC ================= */}
                <div className="grid gap-5">
                    {/* DOG SUPPLIES */}
                    <div className="relative min-h-50 overflow-hidden rounded-xl bg-[#fcebd3]">
                        <Image
                            src="/image/img1.webp"
                            alt="Dog"
                            fill
                            className="object-contain object-right"
                        />

                        <div className="relative z-10 max-w-xs p-8">
                            <h2 className="text-4xl font-bold text-[#19398A]">Perlengkapan Anjing</h2>
                            <p className="mt-3 text-[#19398A]/80">
                                Semua yang dibutuhkan sahabat berbulu untuk hidup lebih bahagia.
                            </p>
                        </div>
                    </div>

                    {/* BOTTOM GRID */}
                    <div className="grid gap-5 md:grid-cols-2">
                        {/* DRY FOOD */}
                        <div className="relative min-h-70 min-w-70 overflow-hidden rounded-xl">
                            <Image
                                src="/image/img3.jpg"
                                alt="Dry food"
                                fill
                                className="object-cover object-center"
                            />

                            <div className="relative z-10 p-8">
                                <h2 className="text-2xl font-bold text-white">Makanan Kering</h2>
                            </div>
                        </div>

                        {/* PHARMACY */}
                        <div className="relative min-h-70 min-w-70 overflow-hidden rounded-xl">
                            <Image
                                src="/image/img2.webp"
                                alt="Pharmacy"
                                fill
                                className="object-cover object-center"
                            />

                            <div className="relative z-10 p-8">
                                <h2 className="text-2xl font-bold text-[#19398A]">Produk Farmasi</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}