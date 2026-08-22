"use client";

import AuthGuard from "@/components/AuthGuard";
import OtpInput from "@/components/OtpInput";
import OtpResendButton from "@/components/OtpResendButton";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ChangePasswordPage() {
    const [form, setForm] = useState({ current_password: "", password: "", password_confirmation: "", otp_code: "" });
    const [visible, setVisible] = useState({ current: false, password: false, confirmation: false });
    const [otpToken, setOtpToken] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function requestOtp() {
        if (!form.current_password || !form.password || !form.password_confirmation) return setError("Lengkapi semua password terlebih dahulu.");
        if (form.password !== form.password_confirmation) return setError("Konfirmasi password baru tidak sama.");
        try {
            setOtpLoading(true); setError("");
            const response = await apiFetch("/password/request-change-otp", { method: "POST" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Gagal mengirim OTP.");
            setOtpToken(data.otp_token); setForm((current) => ({ ...current, otp_code: "" }));
            toast.success(data.message || "Kode OTP sudah dikirim.");
        } catch (err) { setError(err instanceof Error ? err.message : "Terjadi kesalahan."); } finally { setOtpLoading(false); }
    }

    async function changePassword(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!otpToken) return setError("Kirim OTP terlebih dahulu.");
        try {
            setSaving(true); setError("");
            const response = await apiFetch("/password/change", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, otp_token: otpToken }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Gagal mengganti password.");
            setForm({ current_password: "", password: "", password_confirmation: "", otp_code: "" }); setOtpToken("");
            toast.success("Password berhasil diperbarui.");
        } catch (err) { setError(err instanceof Error ? err.message : "Terjadi kesalahan."); } finally { setSaving(false); }
    }

    return <AuthGuard><main className="min-h-screen bg-[#F7F9FC] px-4 py-8 sm:px-6 lg:px-8 lg:py-12"><div className="mx-auto max-w-2xl"><Link href="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#19398A]"><ArrowLeft size={17} />Kembali ke Profil</Link><section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"><div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-500"><KeyRound size={20} /></div><div><h1 className="text-2xl font-bold text-[#19398A] sm:text-3xl">Ganti Password</h1><p className="mt-1 text-sm leading-6 text-gray-500">Isi password baru, kemudian verifikasi dengan OTP.</p></div></div><div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><ShieldCheck className="mt-0.5 shrink-0 text-[#19398A]" size={18} /><p className="text-xs leading-5 text-gray-600">Kode OTP dikirim ke nomor yang terdaftar dan hanya berlaku sementara.</p></div>{error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}<form onSubmit={changePassword} className="mt-6 space-y-4"><PasswordInput label="Password Lama" value={form.current_password} show={visible.current} onToggle={() => setVisible({ ...visible, current: !visible.current })} onChange={(value) => setForm({ ...form, current_password: value })} /><PasswordInput label="Password Baru" value={form.password} show={visible.password} onToggle={() => setVisible({ ...visible, password: !visible.password })} onChange={(value) => setForm({ ...form, password: value })} /><PasswordInput label="Konfirmasi Password Baru" value={form.password_confirmation} show={visible.confirmation} onToggle={() => setVisible({ ...visible, confirmation: !visible.confirmation })} onChange={(value) => setForm({ ...form, password_confirmation: value })} />{otpToken ? <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5"><label className="mb-3 block text-sm font-bold text-[#19398A]">Masukkan Kode OTP</label><OtpInput value={form.otp_code} onChange={(value) => setForm({ ...form, otp_code: value })} disabled={saving} /><OtpResendButton key={otpToken} loading={otpLoading} onResend={requestOtp} className="mt-3 h-11 w-full rounded-xl border border-[#19398A] px-5 text-sm font-bold text-[#19398A] hover:bg-[#19398A] hover:text-white disabled:opacity-70" /></div> : null}{!otpToken ? <button type="button" onClick={requestOtp} disabled={otpLoading} className="h-12 w-full rounded-xl border border-[#19398A] text-sm font-bold text-[#19398A] hover:bg-[#19398A] hover:text-white disabled:opacity-60">{otpLoading ? "Mengirim OTP..." : "Kirim OTP"}</button> : <button type="submit" disabled={saving || form.otp_code.length < 6} className="h-12 w-full rounded-xl bg-orange-500 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan Password Baru"}</button>}</form></section></div></main></AuthGuard>;
}

function PasswordInput({ label, value, show, onToggle, onChange }: { label: string; value: string; show: boolean; onToggle: () => void; onChange: (value: string) => void }) {
    return <label className="block"><span className="mb-2 block text-sm font-bold text-[#19398A]">{label}</span><span className="relative block"><input type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder="••••••••" className="h-12 w-full rounded-xl border border-gray-300 px-4 pr-12 text-sm outline-none focus:border-orange-500" required /><button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#19398A]" aria-label={show ? "Sembunyikan password" : "Tampilkan password"}>{show ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>;
}
