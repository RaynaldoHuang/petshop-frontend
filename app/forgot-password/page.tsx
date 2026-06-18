"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import img5 from "@/public/image/img5.webp";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function requestOtp(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API}/forgot-password/request-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ phone }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal meminta OTP");
            }

            setOtpToken(data.otp_token);
            toast.success(data.message || "Masukkan kode OTP yang dikirim");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    async function resetPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            if (password !== passwordConfirmation) {
                throw new Error("Konfirmasi password tidak sama");
            }

            const res = await fetch(`${API}/forgot-password/reset`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    otp_token: otpToken,
                    otp_code: otpCode,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal mengganti password");
            }

            toast.success("Password berhasil diubah");
            router.push("/login");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="bg-white">
            <div className="grid min-h-screen lg:h-screen lg:grid-cols-2">
                <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:min-h-0 lg:px-32 lg:py-0">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 p-5 lg:rounded-none lg:border-0 lg:p-0">
                        <div className="mb-7 lg:mb-8">
                            <div className="mb-5 lg:mb-4">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-sm text-[#19398A] transition hover:text-orange-500"
                                >
                                    ← Kembali ke Login
                                </Link>
                            </div>

                            <p className="text-2xl font-semibold leading-tight text-[#19398A] lg:text-3xl lg:text-black">
                                Atur Ulang Password
                            </p>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                Verifikasi nomor telepon dengan OTP, lalu buat password baru.
                            </p>
                        </div>

                        {error ? (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500 lg:rounded-2xl">
                                {error}
                            </div>
                        ) : null}

                        {!otpToken ? (
                            <form onSubmit={requestOtp}>
                                <label className="mb-2 block text-sm text-[#19398A]">
                                    Nomor Telepon
                                </label>
                                <input
                                    type="number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                    className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-7 h-12 w-full cursor-pointer rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 lg:mt-8"
                                >
                                    {loading ? "Mengirim..." : "Kirim OTP"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={resetPassword} className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm text-[#19398A]">
                                        Kode OTP
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        placeholder="Masukkan kode OTP"
                                        className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-orange-500"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Cek kode OTP yang dikirim ke nomor telepon Anda.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-[#19398A]">
                                        Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-12 w-full rounded-xl border border-gray-300 px-4 pr-12 text-sm outline-none transition focus:border-orange-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#19398A]"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-[#19398A]">
                                        Konfirmasi Password Baru
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-12 w-full rounded-xl border border-gray-300 px-4 pr-12 text-sm outline-none transition focus:border-orange-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#19398A]"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="h-12 w-full cursor-pointer rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {loading ? "Menyimpan..." : "Simpan Password Baru"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="hidden lg:block">
                    <Image
                        alt="forgot password"
                        src={img5}
                        className="h-screen w-full object-cover"
                    />
                </div>
            </div>
        </main>
    );
}
