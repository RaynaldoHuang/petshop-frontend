/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";

import {
  BadgeCheck,
  Building2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";

export default function PaymentPage() {
  const [error, setError] =
    useState("");

  const [paymentData, setPaymentData] =
    useState<any>(null);

  const [checkingStatus, setCheckingStatus] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState("");

  useEffect(() => {
    if (!paymentData?.id) return;

    const interval = setInterval(
      async () => {
        try {
          setCheckingStatus(true);

          const res = await apiFetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/check-status/${paymentData.id}`
          );

          const data =
            await res.json();

          if (!res.ok) {
            throw new Error(
              data.message ||
              "Gagal memeriksa status pembayaran"
            );
          }

          setPaymentData((current: any) => ({
            ...current,
            status: data.status,
          }));

          if (data.status === "paid") {
            clearInterval(interval);

            window.location.href =
              `/checkout/success?order=${window.location.pathname.split("/").pop()}`;
          }

          if (
            data.status === "expired" ||
            data.status === "failed"
          ) {
            clearInterval(interval);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setCheckingStatus(false);
        }
      },
      5000
    );

    return () =>
      clearInterval(interval);
  }, [paymentData]);

  useEffect(() => {
    if (!paymentData?.expires_at)
      return;

    const interval = setInterval(() => {
      const expiry =
        new Date(
          paymentData.expires_at
        ).getTime();

      const now =
        new Date().getTime();

      const distance =
        expiry - now;

      if (distance <= 0) {
        setTimeLeft(
          "Kadaluarsa"
        );

        clearInterval(interval);

        return;
      }

      const minutes =
        Math.floor(
          (distance %
            (1000 * 60 * 60))
          / (1000 * 60)
        );

      const seconds =
        Math.floor(
          (distance %
            (1000 * 60))
          / 1000
        );

      setTimeLeft(
        `${minutes}m ${seconds}s`
      );
    }, 1000);

    return () =>
      clearInterval(interval);
  }, [paymentData]);

  useEffect(() => {
    async function loadPayment() {
      try {
        const urlParams =
          new URLSearchParams(window.location.search);

        const transactionId =
          urlParams.get("payment");

        if (!transactionId) {
          throw new Error(
            "Transaction tidak ditemukan"
          );
        }

        const res = await apiFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/${transactionId}`
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
            "Gagal memuat pembayaran"
          );
        }

        setPaymentData(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan"
        );
      }
    }

    loadPayment();
  }, []);

  function copyText(text?: string) {
    if (!text) return;

    navigator.clipboard.writeText(text);
  }

  const isQris =
    paymentData?.type === "qris";

  const paymentMethodLabel =
    isQris
      ? "QRIS"
      : "Virtual Account";

  const paymentStatusLabel =
    checkingStatus
      ? "Mengecek Pembayaran..."
      : paymentData?.status === "paid"
        ? "Pembayaran Berhasil"
        : paymentData?.status === "expired"
          ? "Pembayaran Kedaluwarsa"
          : paymentData?.status === "failed"
            ? "Pembayaran Gagal"
        : "Menunggu Pembayaran";

  const subtotal =
    Number(paymentData?.gross_amount || 0) -
    Number(paymentData?.admin_fee_amount || 0) -
    Number(paymentData?.admin_fee_tax || 0);

  const statusClass =
    paymentData?.status === "paid"
      ? "border-green-200 bg-green-50 text-green-600"
      : paymentData?.status === "expired" ||
          paymentData?.status === "failed"
        ? "border-red-200 bg-red-50 text-red-600"
        : "border-orange-200 bg-orange-50 text-orange-500";

  return (
    <main className="bg-[#F8FAFC] pb-12 pt-5 lg:pb-16 lg:pt-8">

      <div className="mx-auto max-w-7xl px-4 lg:px-0">

        {/* BREADCRUMB */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs lg:mb-6 lg:gap-2 lg:text-sm">

          <Link
            href="/"
            className="text-gray-400 transition hover:text-[#19398A]"
          >
            Beranda
          </Link>

          <ChevronRight
            size={18}
            className="text-gray-300"
          />

          <Link
            href="/checkout"
            className="text-gray-400 transition hover:text-[#19398A]"
          >
            Checkout
          </Link>

          <ChevronRight
            size={18}
            className="text-gray-300"
          />

          <span className="font-medium text-black">
            Pembayaran
          </span>

        </div>

        {/* HEADER */}
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5  shadow-gray-100 lg:mb-6 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:rounded-xl lg:p-7">
          <div className="flex items-start gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                Secure Payment
              </p>

              <h1 className="mt-2 text-2xl font-bold leading-tight text-[#19398A] lg:text-4xl">
                Selesaikan Pembayaran
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 lg:text-base lg:leading-7">
                Bayar sesuai metode yang dipilih agar pesanan bisa diproses otomatis.
              </p>
            </div>
          </div>

          <div className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold lg:mt-0 ${statusClass}`}>
            <Clock3 size={16} />
            {paymentStatusLabel}
          </div>

        </div>

        {/* CONTENT */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">

          {/* PAYMENT */}
          <div className="order-1 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4  shadow-gray-100 lg:rounded-xl lg:p-7">

            {error ? (

              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 lg:gap-4 lg:p-5">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white lg:h-11 lg:w-11">
                  <CircleAlert size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-red-500">
                    Pembayaran Gagal
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-red-400">
                    {error}
                  </p>
                </div>

              </div>

            ) : null}

            {isQris ? (

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 lg:rounded-xl lg:p-6">

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 lg:rounded-xl lg:p-8">

                  {paymentData?.qr_url ? (
                    <Image
                      src={paymentData.qr_url}
                      alt="QRIS"
                      width={360}
                      height={360}
                      className="mx-auto w-full max-w-[260px] lg:max-w-[340px]"
                      unoptimized
                    />
                  ) : (
                    <div className="flex min-h-[260px] items-center justify-center text-sm text-gray-400">
                      Memuat QRIS...
                    </div>
                  )}

                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 lg:px-5 lg:py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-red-400">
                      Batas Pembayaran
                    </p>

                    <p className="mt-1 text-lg font-bold text-red-500">
                      {timeLeft || "-"}
                    </p>
                  </div>
                </div>

              </div>

            ) : (

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 lg:rounded-xl lg:p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white lg:h-12 lg:w-12">
                    <Building2 size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#19398A] lg:text-xl">
                      Virtual Account
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Transfer sesuai nomor virtual account berikut.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-orange-200 bg-white p-4 lg:mt-6 lg:rounded-xl lg:p-6">

                  <p className="text-sm text-gray-400">
                    Nomor Virtual Account
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">

                    <h3 className="min-w-0 break-all text-2xl font-bold tracking-wide text-[#19398A] lg:text-3xl">
                      {paymentData?.va_number || "-"}
                    </h3>

                    <button
                      onClick={() =>
                        copyText(paymentData?.va_number)
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#19398A] transition hover:bg-gray-100 lg:h-12 lg:w-12"
                      aria-label="Salin nomor virtual account"
                    >
                      <Copy size={18} />
                    </button>

                  </div>

                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 lg:px-5 lg:py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-red-400">
                      Batas Pembayaran
                    </p>

                    <p className="mt-1 text-lg font-bold text-red-500">
                      {timeLeft || "-"}
                    </p>
                  </div>
                </div>

              </div>

            )}

          </div>

          {/* SUMMARY */}
          <div className="order-2 h-fit rounded-2xl border border-gray-200 bg-white p-5  shadow-gray-100 lg:sticky lg:top-6 lg:rounded-xl lg:p-7">

            <h2 className="text-xl font-bold text-[#19398A] lg:text-2xl">
              Informasi Pembayaran
            </h2>

            <div className="mt-5 space-y-4 lg:mt-8 lg:space-y-5">

              <div className="rounded-2xl border border-gray-100 p-4 lg:p-5">
                <p className="text-sm text-gray-400">
                  Metode Pembayaran
                </p>

                <p className="mt-2 text-base font-semibold text-[#19398A] lg:text-lg">
                  {paymentMethodLabel}
                </p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 lg:p-5">
                <div className="space-y-2 border-b border-orange-100 pb-4 text-sm">
                  <div className="flex justify-between gap-4 text-gray-500">
                    <span>Subtotal + ongkir</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-gray-500">
                    <span>Biaya admin</span>
                    <span>Rp {Number(paymentData?.admin_fee_amount || 0).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-gray-500">
                    <span>PPN biaya admin (11%)</span>
                    <span>Rp {Number(paymentData?.admin_fee_tax || 0).toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-400">
                  Total Pembayaran
                </p>

                <p className="mt-2 break-words text-2xl font-bold text-orange-500 lg:text-3xl">
                  Rp {Number(paymentData?.gross_amount || 0).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4 lg:p-5">
                <p className="text-sm text-gray-400">
                  Status
                </p>

                <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                  <Clock3 size={14} />
                  {paymentStatusLabel}
                </div>
              </div>

              <div className="rounded-2xl border border-green-100 bg-green-50 p-4 lg:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white lg:h-11 lg:w-11">
                    <BadgeCheck size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-green-700">
                      Pembayaran Otomatis
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-green-600 lg:leading-7">
                      Status pesanan otomatis berubah setelah pembayaran terverifikasi.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
