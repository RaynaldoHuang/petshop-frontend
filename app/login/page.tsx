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

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [form, setForm] = useState({
        phone: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [rememberMe, setRememberMe] =
        useState(false);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const res = await fetch(
                `${API}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",
                    },

                    body: JSON.stringify({
                        phone: form.phone,
                        password: form.password,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    "Nomor telepon atau password salah"
                );
            }

            login(data.token, data.user);

            toast.success(
                "Login berhasil"
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
        <main>
            <div className="grid h-screen grid-cols-2">
                {/* LEFT */}
                <div className="flex items-center justify-center px-32">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <div className="mb-4">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-sm text-[#19398A] transition hover:text-orange-500"
                                >
                                    ← Kembali ke Homepage
                                </Link>
                            </div>

                            <p className="text-3xl font-semibold">
                                Selamat Datang
                                Kembali!
                            </p>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                Lanjutkan belanja
                                kebutuhan terbaik
                                untuk sahabat
                                berbulu Anda
                                dengan mudah dan
                                cepat.
                            </p>
                        </div>

                        {error ? (
                            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                                {error}
                            </div>
                        ) : null}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            {/* PHONE */}
                            <div className="space-y-5">
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
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-orange-500"
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
                            </div>

                            {/* REMEMBER + FORGOT */}
                            <div className="flex items-center justify-between mt-5 mb-8">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={
                                            rememberMe
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setRememberMe(
                                                e
                                                    .target
                                                    .checked
                                            )
                                        }
                                        className="h-4 w-4 accent-[#19398A]"
                                    />

                                    <span className="text-sm">
                                        Remember me
                                    </span>
                                </label>

                                <Link
                                    href="/forgot-password"
                                    className="text-sm  text-blue-600 transition hover:underline"
                                >
                                    Forgot your password?
                                </Link>
                            </div>

                            {/* BUTTON */}
                            <button
                                type="submit"
                                disabled={
                                    loading
                                }
                                className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                            >
                                {loading
                                    ? "Loading..."
                                    : "Login"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm">Belum punya akun? <span className="text-[#19398A] underline"><Link href={"/register"}>Daftar disini</Link></span></p>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div>
                    <Image
                        alt="img loginpage"
                        src={img5}
                        className="h-screen object-cover"
                    />
                </div>
            </div>
        </main>
    );
}