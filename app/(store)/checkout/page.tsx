/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  getCart,
} from "@/lib/cart";

import { CartItem } from "@/types/cart";

type PaymentMethod = {
  id: number;
  name: string;
  code: string;
  type: string;
  fee: number;
};

function getImageUrl(
  image: string | null
) {

  if (!image || image.trim() === "" || image.trim() === "0") {
    return "/pet-placeholder.jpg";
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `http://localhost:8000/storage/${image}`;
}

export default function CheckoutPage() {

  const router = useRouter();

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [shippingAddress, setShippingAddress] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>([]);

  const [selectedPayment, setSelectedPayment] =
    useState<PaymentMethod | null>(null);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  useEffect(() => {

    async function fetchPaymentMethods() {

      try {

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payment-methods`
        );

        const data = await res.json();

        setPaymentMethods(data);

        if (data.length > 0) {
          setSelectedPayment(data[0]);
        }

      } catch (error) {
        console.error(error);
      }
    }

    fetchPaymentMethods();

  }, []);

  const subtotalPrice = useMemo(() => {

    return cartItems.reduce(
      (total, item) => {

        return (
          total +
          item.price * item.quantity
        );
      },
      0
    );
  }, [cartItems]);

  const adminFee =
    selectedPayment?.fee || 0;

  const totalPrice =
    subtotalPrice + adminFee;

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    if (cartItems.length === 0) {

      setError(
        "Keranjang masih kosong."
      );

      return;
    }

    try {

      setLoading(true);
      setError("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({
            customer_name:
              customerName,

            customer_phone:
              customerPhone,

            shipping_address:
              shippingAddress,

            payment_method:
              selectedPayment?.code,

            items: cartItems.map(
              (item) => ({
                id: item.id,
                quantity:
                  item.quantity,
              })
            ),
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {

        throw new Error(
          data.message ||
          "Gagal membuat order"
        );
      }

      const orderId =
        data.data.id;

      /*
      =========================================
      CREATE PAYMENT
      =========================================
      */
      const paymentRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body: JSON.stringify({
            order_id: orderId,

            payment_method:
              selectedPayment?.code,
          }),
        }
      );

      const paymentData =
        await paymentRes.json();

      if (!paymentRes.ok) {

        throw new Error(
          paymentData.message ||
          "Gagal membuat pembayaran"
        );
      }

      /*
      =========================================
      REDIRECT PAYMENT PAGE
      =========================================
      */
      console.log("PAYMENT RESPONSE:", paymentData);

      router.push(
        `/checkout/payment/${orderId}?payment=${paymentData.payment_id}`
      )

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan"
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <main className="pb-12 pt-6 lg:pb-16 lg:pt-10">

      <div className="mx-auto max-w-7xl px-4 lg:px-0">

        {/* BREADCRUMB */}
        <div className="mb-5 flex flex-wrap items-center gap-1.5 text-xs lg:mb-8 lg:gap-2 lg:text-sm">

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
            href="/cart"
            className="text-gray-400 transition hover:text-[#19398A]"
          >
            Keranjang
          </Link>

          <ChevronRight
            size={18}
            className="text-gray-300"
          />

          <span className="font-medium text-black">
            Checkout
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center lg:py-24">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 lg:h-28 lg:w-28">

              <ShoppingBag
                size={48}
                className="text-orange-500"
              />

            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#19398A] lg:mt-8 lg:text-3xl">
              Keranjang masih kosong
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-gray-500 lg:mt-4 lg:text-base">
              Tambahkan produk terlebih dahulu sebelum melanjutkan checkout.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex h-14 items-center justify-center rounded-2xl bg-orange-500 px-8 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Mulai Belanja
            </Link>

          </div>

        ) : (

          /*
          =========================================
          CONTENT
          =========================================
          */
          <div className="grid gap-5 lg:grid-cols-3 lg:gap-4">
            {/* LEFT */}
            <form
              onSubmit={handleSubmit}
              className="order-2 h-fit rounded-lg border border-gray-200 bg-white p-4 lg:order-1 lg:col-span-2 lg:p-6"
            >

              {/* HEADER */}
              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-semibold text-[#19398A] lg:text-2xl">
                    Data Pengiriman
                  </h2>

                  <p className="mt-1.5 text-sm text-gray-500 lg:mt-2">
                    Pastikan data penerima sudah benar.
                  </p>
                </div>
              </div>

              {/* FORM */}
              <div className="mt-6 grid gap-5 lg:mt-8 lg:gap-6">

                {/* NAME */}
                <div>

                  <label className="mb-2 block text-sm text-[#19398A]">
                    Nama Lengkap
                  </label>

                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(
                        e.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-[#19398A] outline-none transition focus:border-orange-500 focus:bg-white lg:h-14 lg:px-5"
                    placeholder="Masukkan nama lengkap"
                    required
                  />

                </div>

                {/* PHONE */}
                <div>

                  <label className="mb-2 block text-sm text-[#19398A]">
                    Nomor HP
                  </label>

                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(
                        e.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-[#19398A] outline-none transition focus:border-orange-500 focus:bg-white lg:h-14 lg:px-5"
                    placeholder="08xxxxxxxxxx"
                    required
                  />

                </div>

                {/* ADDRESS */}
                <div>

                  <label className="mb-2 block text-sm text-[#19398A]">
                    Alamat Pengiriman
                  </label>

                  <textarea
                    value={shippingAddress}
                    onChange={(e) =>
                      setShippingAddress(
                        e.target.value
                      )
                    }
                    rows={5}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#19398A] outline-none transition focus:border-orange-500 focus:bg-white lg:px-5 lg:py-4"
                    placeholder="Masukkan alamat lengkap"
                    required
                  />

                </div>

                {/* PAYMENT METHODS */}
                <div>

                  <label className="mb-3 block text-sm text-[#19398A]">
                    Metode Pembayaran
                  </label>

                  <div className="grid gap-3">

                    {paymentMethods.map((method) => {

                      const active =
                        selectedPayment?.id === method.id;

                      return (
                        <button
                          type="button"
                          key={method.id}
                          onClick={() =>
                            setSelectedPayment(method)
                          }
                          className={`flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${active
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-200"
                            }`}
                        >

                          <div>

                            <p className="text-sm font-semibold text-[#19398A] lg:text-base">
                              {method.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500 lg:text-sm">
                              Biaya admin Rp{" "}
                              {method.fee.toLocaleString("id-ID")}
                            </p>

                          </div>

                          <div
                            className={`h-5 w-5 rounded-full border-2 ${active
                              ? "border-orange-500 bg-orange-500"
                              : "border-gray-300"
                              }`}
                          />

                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ERROR */}
                {error ? (

                  <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-500">
                    {error}
                  </div>

                ) : null}

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 lg:mt-2 lg:h-15"
                >
                  {loading
                    ? "Memproses Order..."
                    : "Lanjut ke Pembayaran"}
                </button>

              </div>
            </form>

            {/* RIGHT */}
            <div className="order-1 h-fit self-start rounded-lg border border-gray-200 bg-white p-4 lg:order-2 lg:sticky lg:top-8 lg:p-6">

              {/* TITLE */}
              <h2 className="text-lg font-semibold text-[#19398A] lg:text-xl">
                Ringkasan Pesanan
              </h2>

              {/* ITEMS */}
              <div className="mt-4 space-y-3 lg:mt-6 lg:space-y-4">
                {cartItems.map((item) => (

                  <div
                    key={`${item.id}-${item.variantName || "default"}`}
                    className="flex gap-3 rounded-lg border border-gray-100 p-3 lg:gap-4 lg:p-4"
                  >

                    {/* IMAGE */}
                    <div className="h-18 w-18 shrink-0 overflow-hidden rounded-lg bg-gray-100 lg:h-22 lg:w-22 lg:rounded-xl">

                      <Image
                        src={getImageUrl(
                          item.image
                        )}
                        alt={item.name}
                        width={120}
                        height={120}
                        className="h-full w-full object-cover"
                        unoptimized
                      />

                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">

                      <h3 className="line-clamp-2 text-sm leading-5 text-[#19398A] lg:truncate lg:leading-normal">
                        {item.name}
                      </h3>

                      {/* VARIANT */}
                      {item.variantName ? (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">
                            {item.variantName}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-3 flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">

                        <p className="text-xs text-gray-400">
                          {item.quantity} x Rp{" "}
                          {item.price.toLocaleString(
                            "id-ID"
                          )}
                        </p>

                        <p className="text-sm font-semibold text-orange-500 lg:text-right">
                          Rp{" "}
                          {(
                            item.price *
                            item.quantity
                          ).toLocaleString(
                            "id-ID"
                          )}
                        </p>

                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-dashed border-gray-200 pt-5 lg:mt-8 lg:space-y-4 lg:pt-6">

                <div className="flex items-center justify-between text-sm text-gray-500">

                  <span>Subtotal</span>

                  <span>
                    Rp{" "}
                    {subtotalPrice.toLocaleString("id-ID")}
                  </span>

                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">

                  <span>Biaya Admin</span>

                  <span>
                    Rp{" "}
                    {adminFee.toLocaleString("id-ID")}
                  </span>

                </div>

              </div>

              {/* TOTAL */}
              <div className="mt-6 border-t border-dashed border-gray-200 pt-5 lg:mt-8 lg:pt-6">

                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between lg:gap-4">

                  <div>

                    <p className="text-sm text-gray-500">
                      Total Pembayaran
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-[#19398A] lg:text-2xl">
                      Total
                    </h3>

                  </div>

                  <span className="break-words text-2xl font-bold text-orange-500 lg:text-3xl">
                    Rp{" "}
                    {totalPrice.toLocaleString(
                      "id-ID"
                    )}
                  </span>

                </div>

              </div>

              {/* NOTE */}
              <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4 lg:mt-6 lg:p-5">

                <p className="text-sm leading-6 text-orange-600">
                  Pastikan alamat dan nomor telepon aktif untuk mempermudah proses pengiriman pesanan.
                </p>

              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}
