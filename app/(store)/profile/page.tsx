"use client";

import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [form, setForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
        otp_code: "",
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpToken, setOtpToken] = useState("");
    const [error, setError] = useState("");

    async function changePassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            if (form.password !== form.password_confirmation) {
                throw new Error("Konfirmasi password baru tidak sama.");
            }

            const response = await apiFetch("/password/change", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    otp_token: otpToken || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal mengganti password.");
            }

            setForm({
                current_password: "",
                password: "",
                password_confirmation: "",
                otp_code: "",
            });
            setOtpToken("");
            toast.success("Password berhasil diperbarui");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    }

    async function requestOtp() {
        try {
            setOtpLoading(true);
            setError("");

            const response = await apiFetch("/password/request-change-otp", {
                method: "POST",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal mengirim OTP.");
            }

            setOtpToken(data.otp_token);
            toast.success(data.message || "Kode OTP sudah dikirim");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
        } finally {
            setOtpLoading(false);
        }
    }

    return (
        <AuthGuard>
            <main className="min-h-screen bg-[#F5F9FF] px-4 py-16">
                <div className="mx-auto max-w-3xl space-y-6">
                    <section className="rounded-3xl bg-white p-8 shadow-sm">
                        <div className="flex items-center gap-5">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-4xl">
                                👤
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-[#19398A]">
                                    {user?.name}
                                </h1>

                                <p className="mt-2 text-gray-500">
                                    {user?.phone}
                                </p>
                            </div>
                        </div>

                        <div className="mt-10">
                            <button
                                onClick={logout}
                                className="rounded-2xl bg-red-500 px-6 py-4 text-sm font-bold text-white transition hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    </section>

                    <section className="rounded-3xl bg-white p-8 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold text-[#19398A]">
                                Ganti Password
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Masukkan password lama, password baru, dan kode OTP yang dikirim.
                            </p>
                        </div>

                        {error ? (
                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                                {error}
                            </div>
                        ) : null}

                        <form onSubmit={changePassword} className="mt-6 space-y-5">
                            <PasswordInput
                                label="Password Lama"
                                value={form.current_password}
                                show={showCurrentPassword}
                                onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                                onChange={(current_password) =>
                                    setForm({ ...form, current_password })
                                }
                            />

                            <PasswordInput
                                label="Password Baru"
                                value={form.password}
                                show={showPassword}
                                onToggle={() => setShowPassword(!showPassword)}
                                onChange={(password) => setForm({ ...form, password })}
                            />

                            <PasswordInput
                                label="Konfirmasi Password Baru"
                                value={form.password_confirmation}
                                show={showConfirmPassword}
                                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                                onChange={(password_confirmation) =>
                                    setForm({ ...form, password_confirmation })
                                }
                            />

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-[#19398A]">
                                    Kode OTP
                                </label>
                                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={form.otp_code}
                                        onChange={(e) =>
                                            setForm({ ...form, otp_code: e.target.value })
                                        }
                                        placeholder="Masukkan kode OTP"
                                        className="h-12 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-orange-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={requestOtp}
                                        disabled={otpLoading}
                                        className="h-12 rounded-xl border border-[#19398A] px-5 text-sm font-bold text-[#19398A] transition hover:bg-[#19398A] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {otpLoading ? "Mengirim..." : "Kirim OTP"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="h-12 w-full rounded-xl bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? "Menyimpan..." : "Simpan Password"}
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </AuthGuard>
    );
}

function PasswordInput({
    label,
    value,
    show,
    onToggle,
    onChange,
}: {
    label: string;
    value: string;
    show: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[#19398A]">
                {label}
            </label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-gray-300 px-4 pr-12 text-sm outline-none transition focus:border-orange-500"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#19398A]"
                >
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </div>
    );
}
