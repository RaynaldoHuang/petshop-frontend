/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Trash2,
  ArrowRight,
  ShoppingBag,
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
import { getStorageUrl } from "@/lib/storage";

function getImageUrl(
  image: string | null
) {
  if (!image || image.trim() === "" || image.trim() === "0") {
    return "/pet-placeholder.jpg";
  }

  if (image.startsWith("http")) {
    return image;
  }

  return getStorageUrl(image);
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
    <main className="bg-[#F8FAFC] px-4 pb-12 pt-6 lg:px-0 lg:pb-16 lg:pt-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs lg:mb-8 lg:text-sm">
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
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-16 text-center shadow-sm shadow-gray-100 lg:rounded-3xl lg:px-6 lg:py-24">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 lg:h-32 lg:w-32">
              <ShoppingBag
                className="h-12 w-12 text-orange-500 lg:h-14 lg:w-14"
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#19398A] lg:mt-8 lg:text-4xl">
              Keranjang masih kosong
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 lg:mt-5 lg:text-base lg:leading-8">
              Yuk temukan berbagai kebutuhan terbaik untuk hewan peliharaanmu sekarang juga.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-orange-500 px-8 text-sm font-semibold text-white transition hover:bg-orange-600"
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
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* LEFT */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.variantName || "default"}`}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white p-4 lg:p-5"
                >

                  <div className="flex gap-3 lg:gap-4">

                    {/* IMAGE */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-32 sm:w-32 lg:h-[136px] lg:w-[136px]">
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
                          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-[#19398A] lg:truncate">
                            {item.name}
                          </h3>

                          {/* VARIANT */}
                          {item.variantName ? (
                            <div className="mt-2 flex items-center gap-2">

                              <span className="text-xs text-gray-400">
                                Variant:
                              </span>

                              <div className="max-w-full truncate rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-500">
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
                          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 lg:h-10 lg:w-10"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                      {/* BOTTOM */}
                      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mt-5">

                        {/* SUBTOTAL */}
                        <div className="rounded-xl">
                          <p className="text-xs text-gray-400 lg:text-sm">
                            Subtotal
                          </p>

                          <p className="text-lg font-semibold text-orange-500 lg:text-xl">
                            Rp{" "}
                            {(
                              item.price *
                              item.quantity
                            ).toLocaleString("id-ID")}
                          </p>
                        </div>

                        {/* QUANTITY */}
                        <div className="w-fit">
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
                              className="flex h-10 w-12 cursor-pointer items-center justify-center text-[#19398A] transition hover:bg-gray-100 sm:w-10"
                            >
                              <Minus size={16} />
                            </button>

                            {/* VALUE */}
                            <div className="flex h-10 w-14 items-center justify-center border-x border-gray-200 bg-white text-sm font-bold text-[#19398A]">
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
                              className="flex h-10 w-12 cursor-pointer items-center justify-center text-[#19398A] transition hover:bg-gray-100 sm:w-10"
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
            <div className="h-fit rounded-xl border border-gray-200 bg-white p-5 lg:sticky lg:top-8  lg:p-7">

              {/* TITLE */}
              <h2 className="text-xl font-semibold text-[#19398A]">
                Ringkasan Belanja
              </h2>

              {/* SUMMARY */}
              <div className="mt-6 space-y-5 lg:mt-8">

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

                <div className="border-t border-dashed border-gray-200 pt-5">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-start">

                    <div>
                      <p className="text-sm text-gray-500">
                        Total Pembayaran
                      </p>

                    </div>

                    <span className="text-3xl font-bold text-orange-500">
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
                className="mt-7 flex h-[56px] w-full items-center justify-center gap-3 rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 lg:mt-8"
              >
                Lanjut Checkout

                <ArrowRight size={18} />
              </Link>

              {/* SHOPPING */}
              <Link
                href="/products"
                className="mt-3 flex h-[52px] w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-[#19398A] transition hover:bg-gray-50 lg:mt-4 lg:h-[56px]"
              >
                Lanjut Belanja
              </Link>

              {/* NOTE */}
              <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4 lg:mt-6">
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
