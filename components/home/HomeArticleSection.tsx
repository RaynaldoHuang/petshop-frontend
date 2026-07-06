"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStorageUrl } from "@/lib/storage";

const API = process.env.NEXT_PUBLIC_API_URL;

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
    if (!image || image.trim() === "" || image.trim() === "0") return "/image/pet-placeholder.jpg";
    if (image.startsWith("http")) return image;
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

export default function HomeArticleSection() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchArticles() {
            try {
                const res = await fetch(`${API}/articles`, {
                    cache: "no-store",
                });

                if (!res.ok) return;

                const data: Article[] = await res.json();
                setArticles(data.slice(0, 4));
            } finally {
                setLoading(false);
            }
        }

        fetchArticles();
    }, []);

    if (loading) return null;
    if (articles.length === 0) return null;

    return (
        <section className="px-4 pt-6 pb-14 sm:px-6 sm:pt-8 sm:pb-20">
            <div className="mx-auto max-w-7xl">
                <div className="mb-7 sm:mb-14">
                    <div>
                        <p className="text-sm font-bold uppercase text-orange-500">
                            Lucky Education
                        </p>

                        <div className="mt-2 flex items-end justify-between gap-4">
                            <div className="min-w-0">
                                <h2 className="text-2xl font-bold leading-tight text-[#19398A] sm:text-3xl">
                                    Product reviews and helpful tips
                                </h2>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                                    Baca tips perawatan, review produk, dan panduan terbaik
                                </p>
                            </div>

                            <Link
                                href="/education"
                                className="hidden shrink-0 text-sm font-semibold text-orange-500 underline underline-offset-4 hover:text-orange-600 sm:inline"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/blog/${article.slug}`}
                            className="group grid grid-cols-[108px_minmax(0,1fr)] gap-3 rounded-md border border-slate-100 bg-white p-2 sm:block sm:border-0 sm:p-0"
                        >
                            <div className="relative aspect-video overflow-hidden rounded-md bg-gray-100 sm:rounded-lg">
                                <Image
                                    src={getImageUrl(article.thumbnail)}
                                    alt={article.title}
                                    fill
                                    className="object-cover transition duration-500 group-hover:scale-105"
                                    unoptimized
                                />
                            </div>

                            <div className="min-w-0 py-1 sm:py-0">
                                <p className="text-xs font-medium text-[#19398A] sm:mt-4 sm:text-sm">
                                    {formatDate(article.published_at || article.created_at)}
                                </p>

                                <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-[#19398A] transition group-hover:text-orange-500 sm:mt-2 sm:text-xl">
                                    {article.title}
                                </h3>

                                {article.excerpt ? (
                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 sm:mt-2 sm:text-sm sm:leading-6">
                                        {article.excerpt}
                                    </p>
                                ) : null}
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-7 text-center sm:hidden">
                    <Link
                        href="/education"
                        className="text-sm font-bold text-orange-500 underline underline-offset-4"
                    >
                        Lihat Semua
                    </Link>
                </div>
            </div>
        </section>
    );
}
