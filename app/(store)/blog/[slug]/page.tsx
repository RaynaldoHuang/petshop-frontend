import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3 } from "lucide-react";
import { getStorageUrl } from "@/lib/storage";

const API = process.env.NEXT_PUBLIC_API_URL;

type Article = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    thumbnail: string | null;
    category: string | null;
    tags: string | null;
    reading_time: number;
    published_at: string | null;
    meta_title: string | null;
    meta_description: string | null;
};

type RelatedArticle = {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
};

function getImageUrl(image: string | null) {
    if (!image || image.trim() === "") return "/pet-placeholder.jpg";

    if (image.startsWith("http")) return image;

    return getStorageUrl(image);
}

function decodeArticleContent(content: string) {
    return content
        .replace(/\\u003C/g, "<")
        .replace(/\\u003E/g, ">")
        .replace(/\\"/g, '"')
        .replace(/\\\//g, "/");
}

function formatDate(date: string | null) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

async function getArticle(slug: string): Promise<Article> {
    const res = await fetch(`${API}/articles/${slug}`, {
        cache: "no-store",
    });
    if (!res.ok) {
        throw new Error("Failed to fetch article");
    }

    return res.json();
}

async function getRelatedArticles(
    slug: string
): Promise<RelatedArticle[]> {
    const res = await fetch(`${API}/articles/${slug}/related`, {
        cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
}

function generateTOC(content: string) {
    const matches = content.match(/^##\s(.+)$/gm);
    if (!matches) return [];
    return matches.map((item) => item.replace(/^##\s/, ""));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const article = await getArticle(slug);

    return {
        title: article.meta_title || article.title,
        description:
            article.meta_description ||
            article.excerpt ||
            "Petshop blog article",
    };
}

export default async function BlogDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const article = await getArticle(slug);

    const relatedArticles = await getRelatedArticles(slug);

    const toc = generateTOC(article.content);

    return (
        <main className="bg-white pb-20">
            <section className="relative overflow-hidden bg-[#F5F9FF] py-20">
                <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
                    {article.category ? (
                        <p className="mb-5 text-sm font-bold uppercase tracking-wide text-orange-500">
                            {article.category}
                        </p>
                    ) : null}

                    <h1 className="text-4xl font-extrabold leading-tight text-[#19398A] md:text-6xl">
                        {article.title}
                    </h1>

                    {article.excerpt ? (
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-500">
                            {article.excerpt}
                        </p>
                    ) : null}

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-500">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={18} />
                            {formatDate(article.published_at)}
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock3 size={18} />
                            {article.reading_time} min read
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto mt-14 grid max-w-7xl gap-14 px-4 lg:grid-cols-[260px_1fr] lg:px-8">
                {/* TOC */}
                <aside className="hidden lg:block">
                    {toc.length > 0 ? (
                        <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6">
                            <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-[#19398A]">
                                Table of content
                            </p>

                            <div className="space-y-3">
                                {toc.map((item) => (
                                    <a
                                        key={item}
                                        href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                        className="block text-sm text-gray-600 transition hover:text-orange-500"
                                    >
                                        {item}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </aside>

                {/* ARTICLE */}
                <article>
                    <div className="relative aspect-16/8 overflow-hidden rounded-4xl bg-gray-100">
                        <Image
                            src={getImageUrl(article.thumbnail)}
                            alt={article.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>

                    <div
                        className="blog-content mt-10 text-gray-600"
                        dangerouslySetInnerHTML={{
                            __html: decodeArticleContent(article.content),
                        }}
                    />

                    {/* TAGS */}
                    {article.tags ? (
                        <div className="mt-12 flex flex-wrap gap-3">
                            {article.tags.split(",").map((tag) => (
                                <div
                                    key={tag}
                                    className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600"
                                >
                                    #{tag.trim()}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {/* RELATED */}
                    {relatedArticles.length > 0 ? (
                        <div className="mt-20">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-wide text-orange-500">
                                        Related Articles
                                    </p>

                                    <h2 className="mt-2 text-3xl font-extrabold text-[#19398A]">
                                        Continue Reading
                                    </h2>
                                </div>

                                <Link
                                    href="/blog"
                                    className="text-sm font-bold text-orange-500 underline underline-offset-4"
                                >
                                    View all
                                </Link>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                {relatedArticles.map((related) => (
                                    <Link
                                        key={related.id}
                                        href={`/blog/${related.slug}`}
                                        className="group block"
                                    >
                                        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-gray-100">
                                            <Image
                                                src={getImageUrl(related.thumbnail)}
                                                alt={related.title}
                                                fill
                                                className="object-cover transition duration-500 group-hover:scale-105"
                                                unoptimized
                                            />
                                        </div>

                                        <h3 className="mt-4 text-xl font-bold leading-snug text-[#19398A] transition group-hover:text-orange-500">
                                            {related.title}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </article>
            </section>
        </main>
    );
}
