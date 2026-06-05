"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  image: string | null;
};

type ProductSearchProps = {
  autoFocus?: boolean;
  className?: string;
  dropdownClassName?: string;
  inputClassName?: string;
  usePlaceholderLabel?: boolean;
  onResultClick?: () => void;
};

function getImageUrl(image: string | null) {
  if (!image || image.trim() === "" || image.trim() === "0") {
    return "/pet-placeholder.jpg";
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `http://localhost:8000/storage/${image}`;
}

export default function ProductSearch({
  autoFocus = false,
  className = "relative hidden lg:block",
  dropdownClassName = "absolute right-0 top-[calc(100%+14px)] z-50 w-105 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)]",
  inputClassName = "h-13 w-82 rounded-xl",
  usePlaceholderLabel = false,
  onResultClick,
}: ProductSearchProps) {
  const [keyword, setKeyword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const wrapperRef =
    useRef<HTMLDivElement | null>(null);

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  /*
  =========================================
  CLICK OUTSIDE
  =========================================
  */
  useEffect(() => {
    function handleClickOutside(
      e: MouseEvent
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          e.target as Node
        )
      ) {
        setOpen(false);

        if (!keyword) {
          setFocused(false);
        }
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, [keyword]);

  /*
  =========================================
  SEARCH PRODUCT
  =========================================
  */
  useEffect(() => {
    const timeout = setTimeout(async () => {
      /*
      EMPTY KEYWORD
      */
      if (keyword.trim().length < 1) {
        setProducts([]);
        setOpen(false);
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/search?q=${encodeURIComponent(
            keyword
          )}`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          setProducts([]);
          return;
        }

        const data: Product[] =
          await res.json();

        setProducts(data);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [keyword]);

  return (
    <div
      ref={wrapperRef}
      className={className}
    >
      {/* SEARCH INPUT */}
      <div
        className={`flex items-center gap-3 border bg-gray-100 px-4 text-[#19398A] transition-all duration-300 ${inputClassName} ${focused
          ? "border-orange-300 bg-white shadow-[0_0_0_1px_rgba(251,146,60,0.15)]"
          : "border-transparent hover:border-gray-200"
          }`}
      >
        {/* ICON */}
        <Search
          size={20}
          className={`shrink-0 transition duration-300 ${focused
              ? "scale-105 text-orange-500"
              : "text-blue-300"
            }`}
        />

        {/* INPUT WRAPPER */}
        <div className="relative flex h-full flex-1 items-center">
          {/* FLOAT LABEL */}
          {!usePlaceholderLabel ? (
            <span
              className={`pointer-events-none absolute left-0 transition-all duration-200 ${focused || keyword
                ? "top-2 text-[11px] font-semibold text-orange-500"
                : "top-1/2 -translate-y-1/2 text-sm font-medium text-[#19398A]/70"
                }`}
            >
              Cari produkmu disini ...
            </span>
          ) : null}

          {/* INPUT */}
          <input
            ref={inputRef}
            value={keyword}
            onChange={(e) =>
              setKeyword(e.target.value)
            }
            onFocus={() => {
              setFocused(true);

              if (products.length > 0) {
                setOpen(true);
              }
            }}
            onBlur={() => {
              if (!keyword) {
                setFocused(false);
              }
            }}
            placeholder={
              usePlaceholderLabel
                ? "Cari produkmu disini ..."
                : ""
            }
            className={`w-full bg-transparent font-semibold text-[#19398A] outline-none transition-all placeholder:text-[#19398A]/50 ${usePlaceholderLabel
              ? "pt-0 text-sm opacity-100"
              : focused || keyword
              ? "pt-5 text-sm opacity-100"
              : "pt-0 text-lg opacity-0"
              }`}
          />
        </div>
      </div>

      {/* DROPDOWN */}
      {open ? (
        <div className={dropdownClassName}>
          {/* HEADER */}
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-bold uppercase text-[#19398A]">
              Produk Lucky
            </h3>
          </div>

          {/* CONTENT */}
          <div className="max-h-105 overflow-y-auto p-3">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                  Mencari produk...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                  Produk tidak ditemukan.
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      setKeyword("");
                      setProducts([]);
                      setOpen(false);
                      setFocused(false);
                      onResultClick?.();
                    }}
                    className="flex w-full items-center gap-4 overflow-hidden rounded-lg p-3 transition hover:bg-orange-50"
                  >
                    {/* IMAGE */}
                    <div className="h-18 w-18 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={getImageUrl(
                          product.image
                        )}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1 overflow-hidden">

                      {/* TITLE */}
                      <p className="block w-full truncate text-sm font-semibold text-[#19398A]">
                        {product.name}
                      </p>

                      {/* PRICE */}
                      <p className="mt-1 text-base font-bold text-orange-500">
                        Rp{" "}
                        {Number(product.price).toLocaleString("id-ID")}
                      </p>

                      {/* STOCK */}
                      <p className="mt-1 text-xs text-gray-400">
                        Stock tersedia: {product.stock}
                      </p>

                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="border-t border-gray-100 px-5 py-4">
            <Link
              href={`/products?search=${encodeURIComponent(
                keyword
              )}`}
              onClick={() => {
                setKeyword("");
                setProducts([]);
                setOpen(false);
                setFocused(false);
                onResultClick?.();
              }}
              className="text-sm font-medium text-[#19398A] underline underline-offset-4 transition hover:text-orange-500"
            >
              Lihat semua hasil
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
