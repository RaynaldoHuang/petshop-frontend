"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role === "super_admin" || user?.role === "admin") {
      router.replace("/admin");
    }
  }, [router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login admin gagal.");
      }

      login(data.token, data.user);
      toast.success("Selamat datang di Admin Console");

      const redirect = new URLSearchParams(window.location.search).get("redirect");
      router.replace(redirect?.startsWith("/admin") ? redirect : "/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#071a38]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="relative flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-orange-500 text-lg font-black">
              LP
            </div>
            <div>
              <p className="text-lg font-bold">Lucky Pet Market</p>
              <p className="text-xs uppercase tracking-[0.22em] text-blue-200">
                Admin Console
              </p>
            </div>
          </div>

          <div className="relative max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-md border border-blue-300/20 bg-white/5 px-4 py-2 text-xs font-semibold text-blue-100">
              <ShieldCheck size={16} />
              Secure management workspace
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              Kendalikan bisnis dengan lebih terarah.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-blue-100">
              Kelola penjualan, katalog, pelanggan, konten, dan pembayaran dari satu ruang kerja profesional.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
              <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                <BarChart3 className="text-orange-400" size={23} />
                <p className="mt-4 text-sm font-semibold">Business overview</p>
                <p className="mt-1 text-xs text-blue-200">Data operasional dalam satu layar</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/5 p-4">
                <LockKeyhole className="text-orange-400" size={23} />
                <p className="mt-4 text-sm font-semibold">Role protected</p>
                <p className="mt-1 text-xs text-blue-200">Akses khusus admin terverifikasi</p>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-blue-300">
            Lucky Pet Market Internal System
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#17376f] font-black text-white">
                  LP
                </div>
                <div>
                  <p className="font-bold text-[#17376f]">Lucky Pet Market</p>
                  <p className="text-xs text-slate-500">Admin Console</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-9">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">
                  Authorized access
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17376f]">
                  Login Admin
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Masuk menggunakan email administrator yang telah terdaftar.
                </p>
              </div>

              {error ? (
                <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Email admin
                  </span>
                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@luckypetmarket.com"
                      autoComplete="email"
                      required
                      className="h-14 w-full rounded-md border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-[#315b9f] focus:bg-white"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </span>
                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                      required
                      className="h-14 w-full rounded-md border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm outline-none focus:border-[#315b9f] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#17376f]"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-[#17376f] text-sm font-bold text-white transition hover:bg-[#102e63] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
                  {!loading ? <ArrowRight size={18} /> : null}
                </button>
              </form>

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-[#17376f]">
                  Kembali ke website pelanggan
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
