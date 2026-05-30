"use client";

import Link from "next/link";
import { clearCart } from "@/lib/cart";

import {
  CheckCircle2,
  ShoppingBag,
  ReceiptText,
  ArrowRight,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

export default function CheckoutSuccessPage() {

  const params =
    useParams<{ id: string }>();

  const [paymentStatus, setPaymentStatus] =
    useState("paid");

  /*
  =========================================
  CLEAR CART
  =========================================
  */
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-12">

      <div className="mx-auto max-w-3xl">

        {/* SUCCESS CARD */}
        <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm">

          {/* TOP */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#19398A] to-[#102766] px-8 py-14 text-center text-white">

            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">

                <CheckCircle2
                  size={54}
                  className="text-green-300"
                />

              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-orange-300">
                Payment Success
              </p>

              <h1 className="mt-4 text-4xl font-bold">
                Pembayaran Berhasil
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/70">
                Terima kasih, pesanan kamu berhasil diproses dan pembayaran telah diterima.
              </p>

            </div>
          </div>

          {/* CONTENT */}
          <div className="p-8">

            {/* ORDER INFO */}
            <div className="grid gap-5 md:grid-cols-2">

              {/* ORDER ID */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">

                <p className="text-sm text-gray-400">
                  Nomor Order
                </p>

                <h3 className="mt-3 text-2xl font-bold text-[#19398A]">
                  #{params.id}
                </h3>

              </div>

              {/* STATUS */}
              <div className="rounded-2xl border border-green-100 bg-green-50 p-6">

                <p className="text-sm text-green-600">
                  Status Pembayaran
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white">

                  <CheckCircle2 size={18} />

                  {paymentStatus === "paid"
                    ? "Sudah Dibayar"
                    : "Pending"}

                </div>

              </div>

            </div>

            {/* NOTE */}
            <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50 p-6">

              <h3 className="font-semibold text-orange-600">
                Informasi Pesanan
              </h3>

              <p className="mt-3 text-sm leading-7 text-orange-500">
                Tim kami akan segera memproses pesananmu. Pastikan nomor telepon tetap aktif untuk proses konfirmasi dan pengiriman.
              </p>

            </div>

            {/* BUTTONS */}
            <div className="mt-10 grid gap-4 md:grid-cols-2">

              {/* ORDER */}
              <Link
                href="/orders"
                className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-[#19398A] bg-white text-sm font-semibold text-[#19398A] transition hover:bg-[#19398A] hover:text-white"
              >

                <ReceiptText size={20} />

                Lihat Pesanan

              </Link>

              {/* SHOPPING */}
              <Link
                href="/products"
                className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600"
              >

                <ShoppingBag size={20} />

                Kembali Belanja

                <ArrowRight size={18} />

              </Link>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}