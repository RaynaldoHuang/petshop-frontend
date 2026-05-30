/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

type Category = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean | number;
};

export default function AdminCategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function fetchCategories() {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API}/categories`, {
                cache: "no-store",
            });

            if (!res.ok) {
                throw new Error("Gagal mengambil data kategori");
            }

            const data: Category[] = await res.json();
            setCategories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    function resetForm() {
        setName("");
        setIsActive(true);
        setEditingId(null);
    }

    function handleEdit(category: Category) {
        setEditingId(category.id);
        setName(category.name);
        setIsActive(Boolean(category.is_active));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const formData = new FormData();
            formData.append("name", name);
            formData.append("is_active", isActive ? "1" : "0");

            const url = editingId
                ? `${API}/categories/${editingId}`
                : `${API}/categories`;

            const res = await fetch(url, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Gagal menyimpan kategori");
            }

            resetForm();
            fetchCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        const confirmed = window.confirm("Yakin ingin menghapus kategori ini?");
        if (!confirmed) return;

        try {
            setError("");

            const res = await fetch(`${API}/categories/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Gagal menghapus kategori");
            }

            setCategories((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Kelola kategori produk untuk filter homepage dan halaman produk.
                    </p>
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
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingId ? "Edit Category" : "Tambah Category"}
                            </h2>

                            {editingId ? (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    Batal
                                </button>
                            ) : null}
                        </div>

                        <div className="grid gap-5">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-gray-700">
                                    Nama Kategori
                                </span>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Cat Food"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
                                    required
                                />
                            </label>

                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Kategori aktif
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <Plus size={18} />
                                {saving
                                    ? "Menyimpan..."
                                    : editingId
                                        ? "Update Category"
                                        : "Simpan Category"}
                            </button>
                        </div>
                    </form>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-semibold text-gray-900">
                            List Categories
                        </h2>

                        {loading ? (
                            <p className="text-sm text-gray-500">Memuat kategori...</p>
                        ) : categories.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
                                <p className="text-sm font-medium text-gray-600">
                                    Belum ada kategori.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Name</th>
                                            <th className="px-4 py-3 font-semibold">Slug</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category) => (
                                            <tr
                                                key={category.id}
                                                className="border-t border-gray-100"
                                            >
                                                <td className="px-4 py-4 font-semibold text-gray-900">
                                                    {category.name}
                                                </td>
                                                <td className="px-4 py-4 text-gray-500">
                                                    {category.slug}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold ${category.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-200 text-gray-600"
                                                            }`}
                                                    >
                                                        {category.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(category)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <Pencil size={14} />
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(category.id)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}