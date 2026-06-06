"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getStorageUrl } from "@/lib/storage";

const API = process.env.NEXT_PUBLIC_API_URL;

const ITEMS_PER_PAGE = 10;

type Article = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    published_at: string | null;
    created_at: string;
};

function getImageUrl(image: string | null) {
    if (!image || image.trim() === "" || image.trim() === "0") {
        return "/pet-placeholder.jpg";
    }

    if (image.startsWith("http")) {
        return image;
    }

    return getStorageUrl(image);
}

function formatDate(date: string | null) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function fetchArticles() {
            try {
                const res = await fetch(`${API}/articles`, {
                    cache: "no-store",
                });

                if (!res.ok) return;

                const data: Article[] = await res.json();

                setArticles(data);
            } finally {
                setLoading(false);
            }
        }

        fetchArticles();
    }, []);

    const totalPages = Math.ceil(
        articles.length / ITEMS_PER_PAGE
    );

    const paginatedArticles = useMemo(() => {
        const start =
            (currentPage - 1) * ITEMS_PER_PAGE;

        const end = start + ITEMS_PER_PAGE;

        return articles.slice(start, end);
    }, [articles, currentPage]);

    function handlePageChange(page: number) {
        setCurrentPage(page);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    return (
        <main className="bg-white">
            {/* HERO */}
            {/* <section className="border-b border-gray-100 bg-[#F8FAFF]">
                <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-8">
                    <p className="text-sm font-bold uppercase text-orange-500">
                        Lucky Education
                    </p>

                    <h1 className="mt-4 text-4xl font-bold leading-tight text-[#19398A] md:text-6xl">
                        Artikel & Edukasi Hewan
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-500">
                        Temukan berbagai tips, panduan, dan informasi terbaik
                        untuk merawat hewan kesayangan Anda.
                    </p>
                </div>
            </section> */}

            {/* ARTICLES */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl">
                    {loading ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[...Array(8)].map((_, index) => (
                                <div key={index}>
                                    <div className="aspect-4/3 animate-pulse rounded-lg bg-gray-200" />

                                    <div className="mt-4 h-4 w-32 animate-pulse rounded bg-gray-200" />

                                    <div className="mt-3 h-6 w-full animate-pulse rounded bg-gray-200" />

                                    <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200" />
                                </div>
                            ))}
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center">
                            <h2 className="text-2xl font-bold text-[#19398A]">
                                Belum ada artikel
                            </h2>

                            <p className="mt-3 text-gray-500">
                                Artikel akan muncul setelah ditambahkan dari admin.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* GRID */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {paginatedArticles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={`/blog/${article.slug}`}
                                        className="group block"
                                    >
                                        {/* CARD */}
                                        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-gray-100">
                                            <Image
                                                src={getImageUrl(article.thumbnail)}
                                                alt={article.title}
                                                fill
                                                className="object-cover transition duration-500 group-hover:scale-105"
                                                unoptimized
                                            />
                                        </div>

                                        <p className="mt-4 text-sm font-medium text-[#19398A]">
                                            {formatDate(
                                                article.published_at ||
                                                article.created_at
                                            )}
                                        </p>

                                        <h3 className="mt-2 line-clamp-2 text-xl font-semibold text-[#19398A] transition group-hover:text-orange-500">
                                            {article.title}
                                        </h3>

                                        {article.excerpt ? (
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                                                {article.excerpt}
                                            </p>
                                        ) : null}
                                    </Link>
                                ))}
                            </div>

                            {/* PAGINATION */}
                            {totalPages > 1 ? (
                                <div className="mt-16 flex items-center justify-center gap-3">
                                    {Array.from(
                                        { length: totalPages },
                                        (_, index) => index + 1
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                handlePageChange(page)
                                            }
                                            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold transition ${currentPage === page
                                                ? "bg-[#19398A] text-white shadow-lg"
                                                : "bg-gray-100 text-[#19398A] hover:bg-orange-100"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
