"use client";

import Link from "next/link";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import { Eye, EyeOff } from "lucide-react";

import img5 from "@/public/image/img5.webp";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] = useState(false);

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        try {
            setLoading(true);

            setError("");

            if (
                form.password !==
                form.password_confirmation
            ) {
                throw new Error(
                    "Konfirmasi password tidak sama"
                );
            }

            if (form.password.length < 6) {
                throw new Error(
                    "Password minimal 6 karakter"
                );
            }
            const res = await fetch(
                `${API}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",
                    },

                    body: JSON.stringify(form),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    "Register gagal"
                );
            }

            login(data.token, data.user);

            toast.success(
                "Register berhasil"
            );

            router.push("/");
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

    return (
        <main className="bg-white">
            <div className="grid min-h-screen lg:h-screen lg:grid-cols-2">
                {/* LEFT */}
                <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:min-h-0 lg:px-32 lg:py-0">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 p-5 lg:rounded-none lg:border-0 lg:p-0">
                        <div className="mb-7 lg:mb-8">
                            <div className="mb-5 lg:mb-4">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-sm text-[#19398A] transition hover:text-orange-500"
                                >
                                    ← Kembali ke Homepage
                                </Link>
                            </div>

                            <p className="text-2xl font-semibold leading-tight text-[#19398A] lg:text-3xl lg:text-black">
                                Buat Akun Baru
                            </p>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                Mulai perjalanan bersama kami dan berikan yang terbaik untuk sahabat berbulu Anda.
                            </p>
                        </div>

                        {error ? (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 lg:rounded-2xl">
                                {error}
                            </div>
                        ) : null}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="space-y-5">
                                {/* NAME */}
                                <div>
                                    <label className="mb-2 block text-sm text-[#19398A]">
                                        <p>
                                            Nama{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </p>
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.name
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    name:
                                                        e
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                        placeholder="Masukkan nama lengkap"
                                        className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-orange-500"
                                    />
                                </div>

                                {/* PHONE */}
                                <div>
                                    <label className="mb-2 block text-sm text-[#19398A]">
                                        <p>
                                            Nomor
                                            Telepon{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </p>
                                    </label>

                                    <input
                                        type="number"
                                        value={
                                            form.phone
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    phone:
                                                        e
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                        placeholder="08xxxxxxxxxx"
                                        className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>

                                {/* PASSWORD */}
                                <div>
                                    <label className="mb-2 block text-sm text-[#19398A]">
                                        <p>
                                            Password{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </p>
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                form.password
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        password:
                                                            e
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                            placeholder="••••••••"
                                            className="h-12 w-full rounded-xl border border-gray-300 px-4 pr-12 text-sm outline-none transition focus:border-orange-500"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#19398A]"
                                        >
                                            {showPassword ? (
                                                <EyeOff
                                                    size={
                                                        20
                                                    }
                                                />
                                            ) : (
                                                <Eye
                                                    size={
                                                        20
                                                    }
                                                />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* CONFIRM PASSWORD */}
                                <div>
                                    <label className="mb-2 block text-sm text-[#19398A]">
                                        <p>
                                            Konfirmasi
                                            Password{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </p>
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                form.password_confirmation
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        password_confirmation:
                                                            e
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                            placeholder="••••••••"
                                            className="h-12 w-full rounded-xl border border-gray-300 px-4 pr-12 text-sm outline-none transition focus:border-orange-500"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#19398A]"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff
                                                    size={
                                                        20
                                                    }
                                                />
                                            ) : (
                                                <Eye
                                                    size={
                                                        20
                                                    }
                                                />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* BUTTON */}
                            <button
                                type="submit"
                                disabled={
                                    loading
                                }
                                className="mt-7 h-12 w-full cursor-pointer rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 lg:mt-8"
                            >
                                {loading
                                    ? "Loading..."
                                    : "Daftar"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm">
                                Sudah punya akun?{" "}
                                <span className="text-[#19398A] underline">
                                    <Link href="/login">
                                        Login
                                        disini
                                    </Link>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="hidden lg:block">
                    <Image
                        alt="img registerpage"
                        src={img5}
                        className="h-screen w-full object-cover"
                    />
                </div>
            </div>
        </main>
    );
}
