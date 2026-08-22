"use client";

import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { KeyRound, LogOut, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const { user, logout } = useAuth();

    return (
        <AuthGuard>
            <main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">Akun saya</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#19398A] sm:text-4xl">Profil</h1>
                        <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">Kelola informasi akun dan keamanan Anda.</p>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                        <section className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 sm:h-20 sm:w-20"><UserRound size={34} strokeWidth={1.8} /></div>
                                <div className="min-w-0"><h2 className="truncate text-xl font-bold text-[#19398A] sm:text-2xl">{user?.name}</h2><p className="mt-1 break-all text-sm text-gray-500">{user?.phone}</p></div>
                            </div>
                            <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-[#19398A]" size={19} /><div><p className="text-sm font-bold text-[#19398A]">Akun terlindungi</p><p className="mt-1 text-xs leading-5 text-gray-500">Jaga kerahasiaan password dan kode verifikasi akun Anda.</p></div></div></div>
                            <button onClick={logout} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-bold text-red-600 transition hover:bg-red-50"><LogOut size={17} />Logout</button>
                        </section>
                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-500"><KeyRound size={19} /></div><div><h2 className="text-xl font-bold text-[#19398A] sm:text-2xl">Keamanan akun</h2><p className="mt-1 text-sm leading-6 text-gray-500">Ubah password melalui proses verifikasi yang aman.</p></div></div>
                            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5"><p className="text-sm font-bold text-gray-700">Password akun</p><p className="mt-1 text-xs leading-5 text-gray-500">OTP hanya akan diminta saat Anda memulai proses ganti password.</p><Link href="/profile/change-password" className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600">Kelola Password</Link></div>
                        </section>
                    </div>
                </div>
            </main>
        </AuthGuard>
    );
}
