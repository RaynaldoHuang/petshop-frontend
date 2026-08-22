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
  MessageCircle,
  Upload,
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

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    if (!paymentData?.id || paymentData.payment_mode === "manual") return;

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

  async function submitProof() {
    if (!paymentData?.id || !proofFile) return;

    try {
      setUploadingProof(true);
      setError("");
      const body = new FormData();
      body.append("proof", proofFile);
      const res = await apiFetch(`/payments/${paymentData.id}/proof`, {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (!res.ok) {
        const validationMessage = data.errors
          ? Object.values(data.errors).flat().join(" ")
          : null;
        throw new Error(validationMessage || data.message || "Gagal mengunggah bukti pembayaran.");
      }

      setPaymentData((current: any) => ({
        ...current,
        status: data.status,
        proof_submitted_at: data.proof_submitted_at,
        proof_original_name: proofFile.name,
        whatsapp_url: data.whatsapp_url,
      }));
      setProofFile(null);

      if (data.whatsapp_url) {
        window.location.href = data.whatsapp_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setUploadingProof(false);
    }
  }

  const isQris =
    paymentData?.type === "qris";

  const isManual = paymentData?.payment_mode === "manual";
  const qrisIsPdf = /\.pdf(?:$|\?)/i.test(paymentData?.qr_url || "");

  const paymentMethodLabel =
    isQris
      ? "QRIS"
      : "Virtual Account";

  const paymentStatusLabel =
    checkingStatus
      ? "Mengecek Pembayaran..."
      : paymentData?.status === "paid"
        ? "Pembayaran Berhasil"
        : paymentData?.status === "awaiting_confirmation"
          ? "Menunggu Konfirmasi Admin"
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
                {isManual
                  ? "Scan QRIS, unggah bukti pembayaran, lalu konfirmasikan melalui WhatsApp."
                  : "Bayar sesuai metode yang dipilih agar pesanan bisa diproses otomatis."}
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

                  {paymentData?.qr_url && qrisIsPdf ? (
                    <div className="text-center">
                      <object
                        data={`${paymentData.qr_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        type="application/pdf"
                        aria-label="QRIS pembayaran"
                        className="mx-auto h-[440px] w-full max-w-2xl rounded-xl bg-white lg:h-[560px]"
                      >
                        <p className="p-6 text-sm text-gray-500">
                          Browser tidak dapat menampilkan preview QRIS PDF.
                        </p>
                      </object>
                      <a
                        href={paymentData.qr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex text-sm font-bold text-[#19398A] hover:underline"
                      >
                        Buka QRIS ukuran penuh
                      </a>
                    </div>
                  ) : paymentData?.qr_url ? (
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

                {!isManual ? <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 lg:px-5 lg:py-4">
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
                </div> : null}

                {isManual ? (
                  <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4 lg:p-5">
                    <h3 className="font-bold text-[#19398A]">Unggah bukti pembayaran</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      PDF, JPEG, PNG, atau WebP maksimal 5 MB. Setelah dikirim, WhatsApp akan terbuka untuk konfirmasi.
                    </p>

                    {paymentData?.proof_submitted_at ? (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-sm font-bold text-emerald-700">Bukti pembayaran sudah terkirim.</p>
                        <p className="mt-1 text-xs text-emerald-600">{paymentData.proof_original_name}</p>
                        {paymentData.whatsapp_url ? (
                          <a
                            href={paymentData.whatsapp_url}
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"
                          >
                            <MessageCircle size={17} /> Konfirmasi via WhatsApp
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <input
                          type="file"
                          accept="application/pdf,image/jpeg,image/png,image/webp"
                          onChange={(event) => setProofFile(event.target.files?.[0] || null)}
                          className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2.5 file:font-bold file:text-[#19398A]"
                        />
                        <button
                          type="button"
                          onClick={submitProof}
                          disabled={!proofFile || uploadingProof}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                        >
                          <Upload size={17} />
                          {uploadingProof ? "Mengunggah..." : "Kirim Bukti & Konfirmasi WhatsApp"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}

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
                      {isManual ? "Verifikasi Manual" : "Pembayaran Otomatis"}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-green-600 lg:leading-7">
                      {isManual
                        ? "Admin akan memeriksa bukti pembayaran sebelum pesanan diproses."
                        : "Status pesanan otomatis berubah setelah pembayaran terverifikasi."}
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
