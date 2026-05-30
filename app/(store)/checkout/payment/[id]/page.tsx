/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";

import {
  ShieldCheck,
  ChevronRight,
  CircleAlert,
  QrCode,
  Copy,
  BadgeCheck,
  Clock3,
  Building2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

export default function PaymentPage() {

  const params =
    useParams<{ id: string }>();

  const [error, setError] =
    useState("");

  const [paymentData, setPaymentData] =
    useState<any>(null);

  const [checkingStatus, setCheckingStatus] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState("");

  /*
=========================================
AUTO CHECK PAYMENT STATUS
=========================================
*/
  useEffect(() => {

    if (!paymentData?.id) return;

    const interval = setInterval(
      async () => {

        try {

          setCheckingStatus(true);

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/check-status/${paymentData.id}`
          );

          const data =
            await res.json();

          /*
          =========================================
          SUCCESS
          =========================================
          */
          if (
            data.status === "paid"
          ) {

            clearInterval(interval);

            window.location.href =
              "/checkout/success";
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

  /*
  =========================================
  LOAD PAYMENT DATA
  =========================================
  */
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

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/${transactionId}`
        );

        const data = await res.json();

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

  function copyText(text: string) {

    navigator.clipboard.writeText(text);
  }

  return (
    <main className="pb-16 pt-10">

      <div className="mx-auto max-w-7xl">

        {/* BREADCRUMB */}
        <div className="mb-8 flex items-center gap-2 text-sm">

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

        {/* CONTENT */}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.8fr]">

          {/* LEFT */}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">

            {/* TOP */}
            <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-[#19398A] to-[#102766] px-8 py-10 text-white">

              <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">

                  {paymentData?.type === "qris" ? (
                    <QrCode size={32} />
                  ) : (
                    <Building2 size={32} />
                  )}

                </div>

                <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-orange-300">
                  Secure Payment
                </p>

                <h1 className="mt-3 text-4xl font-bold leading-tight">
                  Selesaikan Pembayaran Pesananmu
                </h1>

                <p className="mt-5 max-w-xl leading-7 text-white/70">
                  Selesaikan pembayaran sesuai metode yang dipilih untuk memproses pesanan secara otomatis.
                </p>

              </div>
            </div>

            {/* BODY */}
            <div className="p-8">

              {/* SECURITY */}
              <div className="flex items-start gap-4 rounded-2xl border border-orange-100 bg-orange-50 p-5">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">

                  <ShieldCheck
                    size={24}
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-[#19398A]">
                    Pembayaran Aman
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    Semua transaksi dilindungi sistem keamanan Midtrans dan data pembayaran terenkripsi secara otomatis.
                  </p>

                </div>

              </div>

              {/* ERROR */}
              {error ? (

                <div className="mt-6 flex items-start gap-4 rounded-2xl border border-red-100 bg-red-50 p-5">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">

                    <CircleAlert
                      size={22}
                    />

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

              {/* PAYMENT CONTENT */}
              <div className="mt-8">

                {paymentData?.type === "qris" ? (

                  <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">

                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white">
                        <QrCode size={22} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#19398A]">
                          Scan QRIS
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Gunakan aplikasi e-wallet atau mobile banking.
                        </p>
                      </div>

                    </div>

                    <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white p-5">

                      <img
                        src={paymentData.qr_url}
                        alt="QRIS"
                        className="mx-auto w-full max-w-[320px]"
                      />

                    </div>

                  </div>

                ) : (

                  <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">

                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white">
                        <Building2 size={22} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#19398A]">
                          Virtual Account
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Transfer sesuai nomor virtual account berikut.
                        </p>
                      </div>

                    </div>

                    <div className="mt-6 rounded-3xl border border-dashed border-orange-200 bg-white p-6">

                      <p className="text-sm text-gray-400">
                        Nomor Virtual Account
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-4">

                        <h3 className="text-2xl font-bold tracking-wide text-[#19398A]">
                          {paymentData?.va_number}
                        </h3>

                        <button
                          onClick={() =>
                            copyText(paymentData?.va_number)
                          }
                          className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-[#19398A] transition hover:bg-gray-100"
                        >
                          <Copy size={18} />
                        </button>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>
          </div>

          {/* RIGHT */}
          <div className="h-fit rounded-3xl border border-gray-200 bg-white p-7 lg:sticky lg:top-6">

            {/* TITLE */}
            <h2 className="text-2xl font-bold text-[#19398A]">
              Informasi Pembayaran
            </h2>

            {/* INFO */}
            <div className="mt-8 space-y-5">

              <div className="rounded-2xl border border-gray-100 p-5">

                <p className="text-sm text-gray-400">
                  Order ID
                </p>

                <p className="mt-2 text-lg font-semibold text-[#19398A]">
                  #{params.id}
                </p>

              </div>

              <div className="rounded-2xl border border-gray-100 p-5">

                <p className="text-sm text-gray-400">
                  Payment Gateway
                </p>

                <p className="mt-2 text-lg font-semibold text-[#19398A]">
                  {paymentData?.type === "qris"
                    ? "QRIS"
                    : "Virtual Account"}
                </p>

              </div>

              <div className="rounded-2xl border border-gray-100 p-5">

                <p className="text-sm text-gray-400">
                  Total Pembayaran
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-500">
                  Rp {Number(paymentData?.gross_amount || 0).toLocaleString("id-ID")}
                </p>

              </div>

              <div className="rounded-2xl border border-gray-100 p-5">

                <p className="text-sm text-gray-400">
                  Status
                </p>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">

                  <p className="text-sm text-gray-400">
                    Batas Pembayaran
                  </p>

                  <p className="mt-2 text-xl font-bold text-red-500">
                    {timeLeft}
                  </p>

                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-500">

                  <Clock3 size={14} />

                  {checkingStatus
                    ? "Mengecek Pembayaran..."
                    : paymentData?.status === "paid"
                      ? "Pembayaran Berhasil"
                      : "Menunggu Pembayaran"}

                </div>

              </div>

              <div className="rounded-2xl border border-green-100 bg-green-50 p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
                    <BadgeCheck size={20} />
                  </div>

                  <div>

                    <h3 className="font-semibold text-green-700">
                      Pembayaran Otomatis
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-green-600">
                      Setelah pembayaran berhasil diverifikasi Midtrans, status pesanan akan otomatis berubah menjadi dibayar.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* AUTO CHECK */}
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">

                  <Clock3 size={20} />

                </div>

                <div>

                  <h3 className="font-semibold text-blue-700">
                    Auto Verifikasi Pembayaran
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-blue-600">
                    Sistem akan otomatis mengecek status pembayaran setiap beberapa detik.
                  </p>

                </div>

              </div>

            </div>

            {/* NOTE */}
            <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50 p-5">

              <p className="text-sm leading-7 text-orange-600">
                Halaman ini akan otomatis mendeteksi pembayaran setelah transaksi berhasil dilakukan.
              </p>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}