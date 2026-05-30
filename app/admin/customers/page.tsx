/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

type Customer = {
    id: number;
    name: string;
    phone: string;
    created_at: string;
};

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const res = await fetch(`${API}/admin/customers`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            });

            if (!res.ok) {
                throw new Error("Gagal mengambil data customer");
            }

            const data = await res.json();

            setCustomers(data);
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

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString(
            "id-ID",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-7xl">
                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Customers
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        List seluruh customer yang sudah
                        mendaftar.
                    </p>
                </div>

                {/* ERROR */}
                {error ? (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                ) : null}

                {/* TABLE */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="p-6 text-sm text-gray-500">
                            Memuat data customers...
                        </div>
                    ) : customers.length === 0 ? (
                        <div className="p-6 text-sm text-gray-500">
                            Belum ada customer.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            ID
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Nama
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Nomor Telepon
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                            Tanggal Daftar
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {customers.map(
                                        (customer) => (
                                            <tr
                                                key={
                                                    customer.id
                                                }
                                                className="border-t border-gray-100"
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    #
                                                    {
                                                        customer.id
                                                    }
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">
                                                        {
                                                            customer.name
                                                        }
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {
                                                        customer.phone
                                                    }
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {formatDate(
                                                        customer.created_at
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}