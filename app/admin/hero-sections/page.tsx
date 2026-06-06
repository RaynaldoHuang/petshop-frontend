/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { getStorageUrl } from "@/lib/storage";

const API = process.env.NEXT_PUBLIC_API_URL;

type Hero = {
    id: number;
    image: string | null;
    link: string | null;
    is_active: boolean | number;
    sort_order: number;
};

const emptyForm = {
    link: "",
    is_active: true,
    sort_order: "0",
};

export default function AdminHeroSectionsPage() {
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [form, setForm] = useState(emptyForm);
    const [image, setImage] = useState<File | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function fetchHeroes() {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API}/hero-sections`, {
                cache: "no-store",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!res.ok) {
                throw new Error("Gagal mengambil data hero carousel");
            }

            const data: Hero[] = await res.json();

            setHeroes(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchHeroes();
    }, []);

    function resetForm() {
        setEditingId(null);
        setForm(emptyForm);
        setImage(null);
        setError("");
    }

    function handleEdit(hero: Hero) {
        setEditingId(hero.id);

        setForm({
            link: hero.link ?? "",
            is_active: Boolean(hero.is_active),
            sort_order: String(hero.sort_order ?? 0),
        });

        setImage(null);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const formData = new FormData();

            formData.append("link", form.link);
            formData.append(
                "is_active",
                form.is_active ? "1" : "0"
            );
            formData.append(
                "sort_order",
                form.sort_order || "0"
            );

            if (image) {
                formData.append("image", image);
            }

            const url = editingId
                ? `${API}/hero-sections/${editingId}`
                : `${API}/hero-sections`;

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();

                console.log("HERO ERROR:");
                console.log(text);

                throw new Error(
                    "Gagal menyimpan hero carousel"
                );
            }

            resetForm();

            await fetchHeroes();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan"
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        const confirmed = window.confirm(
            "Yakin ingin menghapus slide ini?"
        );

        if (!confirmed) return;

        try {
            setError("");

            const res = await fetch(
                `${API}/hero-sections/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error(
                    "Gagal menghapus slide"
                );
            }

            setHeroes((prev) =>
                prev.filter((hero) => hero.id !== id)
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan"
            );
        }
    }

    function imageUrl(path: string | null) {
        if (!path || path.trim() === "") {
            return "/pet-placeholder.jpg";
        }

        if (path.startsWith("http")) {
            return path;
        }

        return getStorageUrl(path);
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Hero Carousel
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Kelola gambar carousel utama
                        homepage.
                    </p>
                </div>

                {error ? (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                ) : null}

                <form
                    onSubmit={handleSubmit}
                    className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {editingId
                                ? "Edit Slide"
                                : "Tambah Slide"}
                        </h2>

                        {editingId ? (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Batal Edit
                            </button>
                        ) : null}
                    </div>

                    <div className="grid gap-5">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                                Banner Image
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setImage(
                                        e.target.files?.[0] ||
                                        null
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
                            />

                            <p className="mt-2 text-xs text-gray-500">
                                Rekomendasi ukuran:
                                1920 x 1080 px
                            </p>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                                Banner Link
                            </span>

                            <input
                                type="text"
                                value={form.link}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        link: e.target.value,
                                    })
                                }
                                placeholder="/products"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                            />
                        </label>

                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-gray-700">
                                    Sort Order
                                </span>

                                <input
                                    type="number"
                                    value={form.sort_order}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            sort_order:
                                                e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                                />
                            </label>

                            <label className="flex items-center gap-3 pt-8">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            is_active:
                                                e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4"
                                />

                                <span className="text-sm font-medium text-gray-700">
                                    Slide aktif
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-fit rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {saving
                                ? "Menyimpan..."
                                : editingId
                                    ? "Update Slide"
                                    : "Simpan Slide"}
                        </button>
                    </div>
                </form>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold text-gray-900">
                        List Slides
                    </h2>

                    {loading ? (
                        <p className="text-sm text-gray-500">
                            Memuat data slide...
                        </p>
                    ) : heroes.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            Belum ada slide.
                        </p>
                    ) : (
                        <div className="grid gap-4">
                            {heroes.map((hero) => (
                                <div
                                    key={hero.id}
                                    className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-24 w-40 overflow-hidden rounded-xl bg-gray-100">
                                            <Image
                                                src={imageUrl(
                                                    hero.image
                                                )}
                                                alt="Hero"
                                                width={240}
                                                height={140}
                                                className="h-full w-full object-cover"
                                                unoptimized
                                            />
                                        </div>

                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {hero.link ||
                                                    "Tidak ada link"}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Sort:{" "}
                                                {
                                                    hero.sort_order
                                                }{" "}
                                                •{" "}
                                                {hero.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEdit(
                                                    hero
                                                )
                                            }
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    hero.id
                                                )
                                            }
                                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
