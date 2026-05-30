/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  BadgePercent,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { CartItem } from "@/types/cart";

import {
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "@/lib/cart";

function getImageUrl(
  image: string | null
) {
  if (!image || image.trim() === "") {
    return "/pet-placeholder.jpg";
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `http://localhost:8000/storage/${image}`;
}

export default function CartPage() {
  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  function handleQuantityChange(
    id: number,
    quantity: number,
    variantName?: string
  ) {

    updateCartQuantity(
      id,
      quantity,
      variantName
    );

    setCartItems(getCart());
  }

  function handleRemove(
    id: number,
    variantName?: string
  ) {

    removeFromCart(
      id,
      variantName
    );

    setCartItems(getCart());
  }

  const totalPrice = useMemo(() => {
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

  return (
    <main className="pb-16 pt-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/"
            className="font-normal text-gray-400 transition hover:text-[#19398A]"
          >
            Beranda
          </Link>

          <ChevronRight
            size={18}
            className="text-gray-300"
          />

          <span className="font-medium text-[#1B1B1B]">
            Keranjang
          </span>
        </div>

        {cartItems.length === 0 ? (
          /*
          =========================================
          EMPTY CART
          =========================================
          */
          <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-24 text-center ">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-orange-50">
              <ShoppingBag
                size={56}
                className="text-orange-500"
              />
            </div>

            <h2 className="mt-8 text-4xl font-bold text-[#19398A]">
              Keranjang masih kosong
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-gray-500">
              Yuk temukan berbagai kebutuhan terbaik untuk hewan peliharaanmu sekarang juga.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-orange-500 px-8 text-sm font-semibold text-white transition hover:bg-orange-600"
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
          <div className="grid gap-4 lg:grid-cols-3">
            {/* LEFT */}
            <div className="space-y-4 col-span-2">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.variantName || "default"}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white p-5"
                >

                  <div className="flex gap-4">

                    {/* IMAGE */}
                    <div className="relative h-34 w-34 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        width={160}
                        height={160}
                        className="h-full w-full object-cover"
                        unoptimized
                      />

                    </div>

                    {/* CONTENT */}
                    <div className="flex min-w-0 flex-1 flex-col">

                      {/* TOP */}
                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0 flex-1">

                          {/* TITLE */}
                          <h3 className="truncate text-base font-semibold text-[#19398A]">
                            {item.name}
                          </h3>

                          {/* VARIANT */}
                          {item.variantName ? (
                            <div className="mt-2 flex items-center gap-2">

                              <span className="text-xs text-gray-400">
                                Variant:
                              </span>

                              <div className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-500">
                                {item.variantName}
                              </div>

                            </div>
                          ) : null}
                        </div>

                        {/* REMOVE */}
                        <button
                          onClick={() =>
                            handleRemove(
                              item.id,
                              item.variantName
                            )
                          }
                          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                      {/* BOTTOM */}
                      <div className="mt-5 flex items-center justify-between gap-4">

                        {/* SUBTOTAL */}
                        <div className="rounded-xl">
                          <p className="text-sm text-gray-400">
                            Subtotal
                          </p>

                          <p className="text-xl font-semibold text-orange-500">
                            Rp{" "}
                            {(
                              item.price *
                              item.quantity
                            ).toLocaleString("id-ID")}
                          </p>
                        </div>

                        {/* QUANTITY */}
                        <div>
                          <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 ">

                            {/* MINUS */}
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  item.quantity - 1,
                                  item.variantName
                                )
                              }
                              className="flex h-10 w-10 cursor-pointer items-center justify-center text-[#19398A] transition hover:bg-gray-100"
                            >
                              <Minus size={16} />
                            </button>

                            {/* VALUE */}
                            <div className="flex h-10 min-w-14 items-center justify-center border-x border-gray-200 bg-white text-sm font-bold text-[#19398A]">
                              {item.quantity}
                            </div>

                            {/* PLUS */}
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.id,
                                  item.quantity + 1,
                                  item.variantName
                                )
                              }
                              className="flex h-10 w-10 cursor-pointer items-center justify-center text-[#19398A] transition hover:bg-gray-100"
                            >
                              <Plus size={16} />
                            </button>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT */}
            <div className="h-fit rounded-lg border border-gray-200 bg-white p-7 lg:sticky lg:top-8">

              {/* TITLE */}
              <h2 className="text-xl font-semibold text-[#19398A]">
                Ringkasan Belanja
              </h2>

              {/* BENEFIT */}
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-orange-50 p-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white">
                  <BadgePercent size={22} />
                </div>

                <div>
                  <p className="font-semibold text-[#19398A]">
                    Gratis biaya admin
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Nikmati checkout lebih hemat hari ini.
                  </p>
                </div>

              </div>

              {/* SUMMARY */}
              <div className="mt-8 space-y-5">

                <div className="flex items-center justify-between text-sm text-gray-500">

                  <span>Total Item</span>

                  <span className="font-semibold text-[#19398A]">
                    {cartItems.reduce(
                      (a, b) =>
                        a + b.quantity,
                      0
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">

                  <span>Biaya Admin</span>

                  <span className="font-semibold text-[#19398A]">
                    Gratis
                  </span>

                </div>

                <div className="border-t border-dashed border-gray-200 pt-5">

                  <div className="flex items-end justify-between gap-4">

                    <div>
                      <p className="text-sm text-gray-500">
                        Total Pembayaran
                      </p>

                      <h3 className="mt-1 text-2xl font-bold text-[#19398A]">
                        Total
                      </h3>
                    </div>

                    <span className="text-2xl font-bold text-orange-500">
                      Rp{" "}
                      {totalPrice.toLocaleString(
                        "id-ID"
                      )}
                    </span>

                  </div>

                </div>
              </div>

              {/* BUTTON */}
              <Link
                href="/checkout"
                className="mt-8 flex h-15 w-full items-center justify-center gap-3 rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Lanjut Checkout

                <ArrowRight size={18} />
              </Link>

              {/* SHOPPING */}
              <Link
                href="/products"
                className="mt-4 flex h-15 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-[#19398A] transition hover:bg-gray-50"
              >
                Lanjut Belanja
              </Link>

              {/* NOTE */}
              <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-4">
                <p className="text-sm text-orange-600">
                  Pastikan produk dan jumlah pesanan sudah sesuai sebelum melanjutkan checkout.
                </p>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}