/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";

import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
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

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function getImageUrl(
  image: string | null
) {

  if (
    !image ||
    image.trim() === "" ||
    image.trim() === "0"
  ) {
    return "/pet-placeholder.jpg";
  }

  if (
    image.startsWith("http")
  ) {
    return image;
  }

  return getStorageUrl(image);
}

export default function CartDrawer({
  open,
  onClose,
}: CartDrawerProps) {

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  useEffect(() => {
    if (open) {
      setCartItems(getCart());
    }
  }, [open]);

  useEffect(() => {

    if (open) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "auto";
    }
    return () => {
      document.body.style.overflow =
        "auto";
    };

  }, [open]);

  const totalPrice =
    useMemo(() => {

      return cartItems.reduce(
        (
          total,
          item
        ) =>
          total +
          item.price *
          item.quantity,
        0
      );

    }, [cartItems]);

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

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-90 bg-black/40 backdrop-blur-xs transition-all duration-300 ${open
          ? "opacity-100"
          : "pointer-events-none opacity-0"
          }`}
      />

      {/* DRAWER */}
      <aside
        className={`fixed right-0 top-0 z-100 h-dvh w-full overflow-hidden bg-white shadow-2xl transition-transform duration-300 sm:max-w-xl ${open
          ? "translate-x-0"
          : "translate-x-full"
          }`}
      >

        <div className="flex h-full flex-col">

          {/* HEADER */}
          <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#19398A] sm:text-2xl">
                  Keranjang Belanja
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {
                    cartItems.reduce(
                      (
                        a,
                        b
                      ) =>
                        a +
                        b.quantity,
                      0
                    )
                  }{" "}
                  item di keranjang
                </p>

              </div>

              {/* CLOSE */}
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#19398A] transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500 sm:h-11 sm:w-11"
              >
                <X size={22} />
              </button>

            </div>
          </div>

          {/* EMPTY */}
          {cartItems.length ===
            0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center sm:px-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 sm:h-28 sm:w-28">
                <ShoppingCart
                  size={48}
                  className="text-orange-500"
                />

              </div>

              <h2 className="mt-6 text-2xl font-bold text-[#19398A] sm:mt-8 sm:text-3xl">
                Keranjang Masih Kosong
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-7 text-gray-500">
                Yuk mulai belanja kebutuhan terbaik untuk hewan kesayangan kamu.
              </p>

              <Link
                href="/products"
                onClick={onClose}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 sm:mt-8 sm:px-8 sm:py-4"
              >
                Belanja Sekarang
                <ArrowRight size={18} />
              </Link>

            </div>

          ) : (
            <>
              {/* ITEMS */}
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                {cartItems.map(
                  (
                    item
                  ) => (
                    <div
                      key={`${item.id}-${item.variantName || "default"}`}
                      className="rounded-lg border border-gray-100 bg-white p-3 transition sm:p-4"
                    >

                      <div className="flex gap-3 sm:gap-4">

                        {/* IMAGE */}
                        <div className="h-22 w-22 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-28 sm:w-28">

                          <Image
                            src={getImageUrl(
                              item.image
                            )}
                            alt={item.name}
                            width={140}
                            height={140}
                            className="h-full w-full object-cover"
                            unoptimized
                          />

                        </div>

                        {/* CONTENT */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#19398A] sm:truncate sm:text-base sm:leading-normal">
                                {item.name}
                              </h3>

                              {item.variantName ? (
                                <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
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
                              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 sm:h-9 sm:w-9"
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>

                          {/* BOTTOM */}
                          <div className="mt-auto flex flex-col gap-3 pt-3 sm:flex-row sm:items-end sm:justify-between">

                            {/* QTY */}
                            <div className="flex w-fit items-center overflow-hidden rounded-md border border-gray-200">

                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1,
                                    item.variantName
                                  )
                                }
                                className="flex h-8 w-8 cursor-pointer items-center justify-center text-[#19398A] transition hover:bg-gray-100"
                              >
                                <Minus size={16} />
                              </button>

                              <div className="flex h-8 min-w-12 items-center justify-center border-x border-gray-200 text-sm font-semibold text-[#19398A]">
                                {
                                  item.quantity
                                }
                              </div>

                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1,
                                    item.variantName
                                  )
                                }
                                className="flex cursor-pointer h-8 w-8 items-center justify-center text-[#19398A] transition hover:bg-gray-100"
                              >
                                <Plus size={16} />
                              </button>

                            </div>

                            {/* TOTAL */}
                            <div className="text-left sm:text-right">

                              <p className="text-xs text-gray-400">
                                Subtotal
                              </p>

                              <p className="text-base font-bold text-orange-500 sm:text-lg">
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
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* FOOTER */}
              <div className="border-t border-gray-100 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">

                {/* TOTAL */}
                <div className="mb-4 rounded-lg bg-orange-50 p-4 sm:mb-5 sm:p-5">

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm font-medium text-gray-500">
                      Total Pembayaran
                    </span>

                    <span className="text-xl font-bold text-orange-500 sm:text-2xl">
                      Rp{" "}
                      {totalPrice.toLocaleString(
                        "id-ID"
                      )}
                    </span>

                  </div>
                </div>

                {/* BUTTON */}
                <div className="grid gap-3 sm:flex sm:justify-between sm:space-x-2">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="flex h-12 w-full items-center justify-center rounded-xl border border-orange-500 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 sm:h-14 sm:text-base"
                  >
                    Lihat Keranjang
                  </Link>

                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 sm:h-14 sm:text-base"
                  >
                    Checkout Sekarang
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
