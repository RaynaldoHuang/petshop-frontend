"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
const STORAGE_URL = "http://localhost:8000/storage/";

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
    if (!image || image.trim() === "") return "/pet-placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `${STORAGE_URL}${image}`;
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
        <section className="pt-8 pb-20">
            <div className="mx-auto max-w-7xl">
                <div className="mb-14">
                    <div>
                        <p className="text-sm font-bold uppercase text-orange-500">
                            Lucky Education
                        </p>

                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="mt-2 text-3xl font-bold text-[#19398A]">
                                    Product reviews and helpful tips
                                </h2>

                                <p className="mx-auto mt-2 text-gray-500">
                                    Baca tips perawatan, review produk, dan panduan terbaik
                                </p>
                            </div>

                            <div>
                                <Link
                                    href="/education"
                                    className="right-0 top-8 text-sm font-semibold text-orange-500 underline underline-offset-4 hover:text-orange-600"
                                >
                                    Lihat Semua
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/blog/${article.slug}`}
                            className="group block"
                        >
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
                                {formatDate(article.published_at || article.created_at)}
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

                <div className="mt-10 text-center md:hidden">
                    <Link
                        href="/blog"
                        className="text-sm font-bold text-orange-500 underline underline-offset-4"
                    >
                        See all
                    </Link>
                </div>
            </div>
        </section>
    );
}