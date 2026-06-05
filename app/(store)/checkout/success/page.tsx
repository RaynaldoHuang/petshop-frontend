"use client";

import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Home,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  clearCart,
} from "@/lib/cart";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 lg:px-0 lg:py-14">

      <div className="mx-auto max-w-5xl">

        <div className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-100 lg:grid-cols-[0.9fr_1.1fr] lg:rounded-xl">

          {/* HERO */}
          <section className="relative overflow-hidden bg-[#19398A] px-6 py-10 text-white lg:px-9 lg:py-12">

            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 left-6 h-60 w-60 rounded-full bg-orange-400/20 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col justify-between gap-10">

              <div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md lg:h-20 lg:w-20">
                  <CheckCircle2 className="h-10 w-10 text-green-300 lg:h-12 lg:w-12" />
                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                  Payment Success
                </p>

                <h1 className="mt-3 text-3xl font-bold leading-tight lg:text-5xl">
                  Pembayaran Berhasil
                </h1>

                <p className="mt-4 max-w-md text-sm leading-7 text-white/75 lg:text-base lg:leading-8">
                  Terima kasih. Pesanan kamu sudah masuk dan akan segera diproses oleh tim kami.
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-300" />

                  <p className="text-sm leading-6 text-white/80">
                    Status pembayaran sudah diterima. Kamu bisa melihat detail pesanan dari halaman pesanan.
                  </p>
                </div>
              </div>

            </div>

          </section>

          {/* CONTENT */}
          <section className="p-5 lg:p-9">

            <div className="rounded-2xl border border-green-100 bg-green-50 p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
                  <CheckCircle2 size={22} />
                </div>

                <div>
                  <p className="text-sm text-green-600">
                    Status Pembayaran
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-green-700">
                    Sudah Dibayar
                  </h2>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4 lg:p-5">
              <h3 className="text-lg font-bold text-[#19398A]">
                Pesanan Sedang Diproses
              </h3>

              <p className="mt-2 text-sm leading-7 text-gray-500">
                Kami akan menyiapkan pesananmu. Pastikan nomor telepon tetap aktif untuk konfirmasi dan informasi pengiriman.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <Link
                href="/orders"
                className="flex h-13 min-h-13 items-center justify-center gap-2 rounded-xl border border-[#19398A] bg-white px-4 text-sm font-semibold text-[#19398A] transition hover:bg-[#19398A] hover:text-white"
              >
                <ReceiptText size={19} />
                Lihat Pesanan
              </Link>

              <Link
                href="/products"
                className="flex h-13 min-h-13 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                <ShoppingBag size={19} />
                Kembali Belanja
                <ArrowRight size={17} />
              </Link>

            </div>

            <Link
              href="/"
              className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-[#19398A]"
            >
              <Home size={18} />
              Kembali ke Beranda
            </Link>

          </section>

        </div>

      </div>

    </main>
  );
}
