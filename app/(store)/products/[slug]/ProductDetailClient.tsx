"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import {
    ChevronRight,
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
} from "lucide-react";

import AddToCartButton from "@/components/AddToCartButton";

type ProductImage = {
    id: number;
    image: string;
};

type ProductVariant = {
    id: number;
    name: string;
    price: string | null;
    discount_price?: string | null;
    stock: number;
    sku?: string | null;
};

type ProductOption = {
    id: number;
    name: string;
    values: {
        id: number;
        value: string;
    }[];
};

type Product = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    discount_price?: string | null;
    stock: number;
    image: string | null;
    images: ProductImage[];
    is_active: boolean;
    variants?: ProductVariant[];
    options?: ProductOption[];
};

type RelatedProduct = {
    id: number;
    name: string;
    slug: string;
    price: string;
    discount_price?: string | null;
    image: string | null;
};

function getImageUrl(image: string | null) {

    if (!image || image.trim() === "" || image.trim() === "0") {
        return "/image/pet-placeholder.jpg";
    }

    if (image.startsWith("http")) {
        return image;
    }

    return `http://localhost:8000/storage/${image}`;
}

export default function ProductDetailClient({
    product,
    images,
    relatedProducts,
}: {
    product: Product;
    images: ProductImage[];
    relatedProducts: RelatedProduct[];
}) {

    const [activeIndex, setActiveIndex] =
        useState(0);

    const [showAuthModal, setShowAuthModal] =
        useState(false);

    const [favorite, setFavorite] =
        useState(false);

    const [quantity, setQuantity] =
        useState(1);

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    const isLoggedIn = !!token;

    /*
    =========================================
    SELECTED OPTIONS
    =========================================
    */
    const [selectedOptions, setSelectedOptions] =
        useState<Record<string, string>>(() => {
            const initial: Record<string, string> = {};
            product.options?.forEach((option) => {
                if (option.values.length > 0) {
                    initial[option.name] =
                        option.values[0].value;
                }
            });
            return initial;
        });

    /*
    =========================================
    ACTIVE VARIANT
    =========================================
    */
    const selectedVariantName =
        Object.values(selectedOptions)
            .join(" / ");

    const activeVariant =
        product.variants?.find(
            (variant) =>
                variant.name ===
                selectedVariantName
        ) || null;

    const activeImage =
        images[activeIndex]?.image || "";

    /*
    =========================================
    NEXT IMAGE
    =========================================
    */
    function nextImage() {

        if (
            activeIndex ===
            images.length - 1
        ) {

            setActiveIndex(0);
            return;
        }

        setActiveIndex(
            activeIndex + 1
        );
    }

    /*
    =========================================
    PREV IMAGE
    =========================================
    */
    function prevImage() {

        if (activeIndex === 0) {

            setActiveIndex(
                images.length - 1
            );

            return;
        }

        setActiveIndex(
            activeIndex - 1
        );
    }

    /*
    =========================================
    SHARE
    =========================================
    */
    async function handleShare() {

        const shareData = {
            title: product.name,
            text: product.name,
            url: window.location.href,
        };

        try {

            if (navigator.share) {

                await navigator.share(
                    shareData
                );

            } else {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert(
                    "Link produk berhasil disalin"
                );
            }

        } catch {
            console.log("Share cancelled");
        }
    }

    return (
        <main className="overflow-x-hidden py-6 lg:py-10">
            <div className="mx-auto w-full max-w-7xl min-w-0 px-4 lg:px-0">
                {/* BREADCRUMB */}
                <div className="mb-5 flex flex-wrap items-center gap-1.5 text-xs lg:mb-8 lg:gap-2 lg:text-sm">

                    <Link
                        href="/"
                        className="font-normal text-gray-400 transition hover:text-[#19398A]"
                    >
                        Homepage
                    </Link>

                    <ChevronRight
                        size={18}
                        className="text-gray-300"
                    />

                    <Link
                        href="/products"
                        className="font-normal text-gray-400 transition hover:text-[#19398A]"
                    >
                        Lucky Petshop
                    </Link>

                    <ChevronRight
                        size={18}
                        className="text-gray-300"
                    />

                    <span className="min-w-0 break-words font-medium text-[#1B1B1B]">
                        {product.name}
                    </span>
                </div>

                <div className="grid min-w-0 gap-7 lg:grid-cols-[0.95fr_0.85fr] lg:gap-14">
                    {/* LEFT */}
                    <div className="min-w-0">
                        <div className="flex min-w-0 gap-5">

                            {/* THUMBNAIL */}
                            <div className="hidden flex-col gap-4 lg:flex">
                                {images.map(
                                    (
                                        img,
                                        index
                                    ) => {
                                        const active =
                                            activeIndex ===
                                            index;
                                        return (
                                            <button
                                                key={img.id}
                                                type="button"
                                                onClick={() =>
                                                    setActiveIndex(index)
                                                }
                                                className={`overflow-hidden rounded-lg border-2 transition-all duration-300 ${active
                                                    ? "border-orange-500"
                                                    : "border-gray-200 hover:border-orange-300"
                                                    }`}
                                            >
                                                <Image
                                                    src={getImageUrl(img.image)}
                                                    alt=""
                                                    width={120}
                                                    height={140}
                                                    className="h-24 w-24 object-cover"
                                                    unoptimized
                                                />
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            {/* MAIN IMAGE */}
                            <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-lg bg-[#F4F4F4] lg:aspect-auto">
                                <Image
                                    src={getImageUrl(activeImage)}
                                    alt={product.name}
                                    width={1000}
                                    height={1200}
                                    className="h-full w-full object-contain lg:object-cover"
                                    unoptimized
                                />

                                {/* SHARE */}
                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="absolute right-3 top-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-[#19398A] transition hover:scale-105 hover:text-orange-500 lg:right-5 lg:top-5 lg:h-14 lg:w-14"
                                >
                                    <Share2 className="h-5 w-5 lg:h-6 lg:w-6" />
                                </button>

                                {/* PREV */}
                                {images.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevImage}
                                        className="absolute bottom-3 right-15 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-[#19398A] lg:bottom-5 lg:right-20 lg:h-12 lg:w-12"
                                    >
                                        <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
                                    </button>
                                )}

                                {/* NEXT */}
                                {images.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={nextImage}
                                        className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-[#19398A] lg:bottom-5 lg:right-5 lg:h-12 lg:w-12"
                                    >
                                        <ChevronRightIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* MOBILE THUMBNAILS */}
                        {images.length > 1 ? (
                            <div className="mt-3 flex max-w-full gap-3 overflow-x-auto pb-1 lg:hidden">
                                {images.map(
                                    (
                                        img,
                                        index
                                    ) => {
                                        const active =
                                            activeIndex ===
                                            index;

                                        return (
                                            <button
                                                key={img.id}
                                                type="button"
                                                onClick={() =>
                                                    setActiveIndex(index)
                                                }
                                                className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-[#F4F4F4] transition-all duration-300 ${active
                                                    ? "border-orange-500"
                                                    : "border-gray-200"
                                                    }`}
                                            >
                                                <Image
                                                    src={getImageUrl(img.image)}
                                                    alt=""
                                                    width={96}
                                                    height={96}
                                                    className="h-full w-full object-contain"
                                                    unoptimized
                                                />
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* RIGHT */}
                    <div className="flex min-w-0 flex-col">
                        {/* TITLE */}
                        <h1 className="text-xl font-semibold leading-7 text-[#19398A] lg:text-2xl lg:leading-normal">
                            {product.name}
                        </h1>

                        {/* PRICE */}
                        <div className="mt-2">
                            {/* PRICE */}
                            {activeVariant ? (

                                <>
                                    {activeVariant.discount_price ? (
                                        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                                            <p className="text-2xl font-semibold text-orange-500">
                                                Rp{" "}
                                                {Number(
                                                    activeVariant.discount_price
                                                ).toLocaleString("id-ID")}
                                            </p>

                                            <span className="text-sm text-gray-400 line-through lg:text-xl">
                                                Rp{" "}
                                                {Number(
                                                    activeVariant.price
                                                ).toLocaleString("id-ID")}
                                            </span>

                                        </div>

                                    ) : (

                                        <p className="text-2xl font-semibold text-orange-500 lg:text-3xl">
                                            Rp{" "}
                                            {Number(
                                                activeVariant.price
                                            ).toLocaleString("id-ID")}
                                        </p>

                                    )}
                                </>

                            ) : (
                                <>
                                    {product.discount_price ? (
                                        <div className="flex flex-wrap items-center gap-2 lg:gap-4">

                                            <p className="text-2xl font-semibold text-orange-500">
                                                Rp{" "}
                                                {Number(
                                                    product.discount_price
                                                ).toLocaleString("id-ID")}
                                            </p>

                                            <span className="text-sm text-gray-400 line-through lg:text-xl">
                                                Rp{" "}
                                                {Number(
                                                    product.price
                                                ).toLocaleString("id-ID")}
                                            </span>

                                        </div>
                                    ) : (
                                        <p className="text-2xl font-semibold text-orange-500 lg:text-3xl">
                                            Rp{" "}
                                            {Number(
                                                product.price
                                            ).toLocaleString("id-ID")}
                                        </p>
                                    )}
                                </>
                            )}

                            {/* STOCK + FAVORITE */}
                            <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-500">
                                    Stock tersedia:
                                    <span className="ml-1 font-semibold text-[#19398A]">
                                        {activeVariant
                                            ? activeVariant.stock
                                            : product.stock}
                                    </span>
                                </p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setFavorite(!favorite)
                                    }
                                    className={`flex max-w-full items-center justify-start rounded-xl transition hover:scale-105 ${favorite
                                        ? "  text-red-500"
                                        : " text-[#19398A]"
                                        }`}
                                >
                                    <span className="flex min-w-0 items-center gap-2 text-sm"><Heart
                                        size={20}
                                        className="shrink-0"
                                        fill={
                                            favorite
                                                ? "currentColor"
                                                : "none"
                                        }
                                    /><span className="truncate">Tambah ke favorit</span></span>
                                </button>
                            </div>
                            <div className="my-5 border border-dashed border-gray-200/80 lg:my-6" />
                        </div>

                        {/* OPTIONS */}
                        <div className="space-y-4">
                            {product.options?.length ? (
                                <div className="space-y-4">
                                    {product.options.map((option) => (
                                        <div key={option.id}>
                                            <h3 className="mb-3 text-[#19398A]">
                                                {option.name}
                                                {selectedOptions[option.name] ? (
                                                    <span className="ml-2 text-[#19398A] font-semibold">
                                                        : {selectedOptions[option.name]}
                                                    </span>
                                                ) : null}
                                            </h3>
                                            <div className="flex flex-wrap gap-2.5 lg:gap-3">
                                                {option.values.map((value) => {
                                                    const active =
                                                        selectedOptions[
                                                        option.name
                                                        ] === value.value;
                                                    return (
                                                        <button
                                                            key={value.id}
                                                            type="button"
                                                            onClick={() => {

                                                                setSelectedOptions(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [option.name]:
                                                                            value.value,
                                                                    })
                                                                );
                                                            }}
                                                            className={`rounded-md border px-3 py-2 text-sm font-medium transition lg:px-4 ${active
                                                                ? "border-orange-500 bg-orange-50 text-orange-500"
                                                                : "border-gray-300 hover:border-orange-500 hover:text-orange-500"
                                                                }`}
                                                        >
                                                            {value.value}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            ) : null}

                            {/* QUANTITY + BUTTON */}
                            <div className="space-y-4">
                                {/* QUANTITY */}
                                <div>
                                    <p className="mb-3 font-normal text-[#19398A]">
                                        Kuantitas
                                    </p>

                                    <div className="flex w-fit items-center overflow-hidden rounded-lg border border-gray-300">
                                        {/* MINUS */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (quantity > 1) {
                                                    setQuantity(quantity - 1);
                                                }
                                            }}
                                            className="flex cursor-pointer h-10 w-10 items-center justify-center text-xl font-semibold text-[#19398A] transition hover:bg-gray-100"
                                        >
                                            -
                                        </button>

                                        {/* VALUE */}
                                        <div className="flex h-10 min-w-15 items-center justify-center border-x border-gray-300 text-sm font-semibold text-[#19398A]">
                                            {quantity}
                                        </div>

                                        {/* PLUS */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const maxStock =
                                                    activeVariant
                                                        ? activeVariant.stock
                                                        : product.stock;

                                                if (quantity < maxStock) {
                                                    setQuantity(quantity + 1);
                                                }
                                            }}
                                            className="flex cursor-pointer h-10 w-10 items-center justify-center text-xl font-semibold text-[#19398A] transition hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* BUTTON */}
                            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap sm:items-center lg:mt-8 lg:gap-4">
                                {/* ADD TO CART */}
                                <div className="w-full sm:w-fit">
                                    {isLoggedIn ? (
                                        <AddToCartButton
                                            product={{
                                                ...product,
                                                price:
                                                    activeVariant?.discount_price ||
                                                    activeVariant?.price ||
                                                    product.discount_price ||
                                                    product.price,

                                                stock:
                                                    activeVariant?.stock ||
                                                    product.stock,

                                                variantName:
                                                    activeVariant?.name || null,
                                            }}
                                            quantity={quantity}
                                        />
                                    ) : (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAuthModal(true)
                                            }
                                            className="w-full rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-orange-600 sm:w-80"
                                        >
                                            Tambah ke Keranjang
                                        </button>

                                    )}
                                </div>

                                {/* CHECKOUT NOW */}
                                <button
                                    type="button"
                                    onClick={() => {

                                        if (!isLoggedIn) {

                                            setShowAuthModal(true);
                                            return;
                                        }

                                        window.location.href =
                                            "/checkout";
                                    }}
                                    className="w-full cursor-pointer rounded-lg border border-orange-500 px-6 py-3 text-sm font-medium text-orange-500 transition hover:bg-orange-50 sm:w-auto"
                                >
                                    Checkout Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-10 border-t border-dashed border-gray-200 pt-6 lg:mt-12 lg:pt-8">
                    <h2 className="mb-3 text-lg font-bold text-[#19398A] lg:text-xl">
                        Deskripsi Produk
                    </h2>

                    <p className="text-sm leading-7 text-gray-600 lg:text-base lg:leading-normal">
                        {product.description ||
                            "Tidak ada deskripsi produk."}
                    </p>
                </div>

                {/* RELATED PRODUCTS */}
                {relatedProducts.length > 0 && (
                    <div className="mt-10 border-t border-dashed border-gray-200 pt-8 lg:mt-12 lg:pt-10">

                        {/* HEADER */}
                        <div className="mb-6 flex items-end justify-between gap-4 lg:mb-8">

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-orange-500 lg:text-sm">
                                    Related Products
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-[#19398A] lg:text-3xl">
                                    You May Also Like
                                </h2>
                            </div>

                            <Link
                                href="/products"
                                className="hidden shrink-0 text-sm font-semibold text-[#19398A] underline underline-offset-4 hover:text-orange-500 lg:inline-flex"
                            >
                                Lihat Semua
                            </Link>
                        </div>

                        {/* PRODUCTS */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-7 lg:grid-cols-5 lg:gap-x-4 lg:gap-y-8">
                            {relatedProducts.map((item) => {
                                const hasDiscount =
                                    item.discount_price &&
                                    Number(item.discount_price) > 0 &&
                                    Number(item.discount_price) <
                                    Number(item.price);
                                return (
                                    <div
                                        key={item.id}
                                        className="group overflow-hidden rounded-t-2xl bg-white transition duration-300 hover:-translate-y-1"
                                    >
                                        <Link
                                            href={`/products/${item.slug}`}
                                        >
                                            {/* IMAGE */}
                                            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 lg:rounded-2xl">
                                                {/* BADGE */}
                                                {hasDiscount ? (
                                                    <div className="absolute left-2 top-2 z-20 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white lg:left-3 lg:top-3 lg:px-3 lg:text-[11px]">
                                                        Sale
                                                    </div>
                                                ) : null}
                                                <Image
                                                    src={getImageUrl(item.image)}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover transition duration-500 group-hover:scale-105"
                                                    unoptimized
                                                />
                                            </div>
                                        </Link>

                                        {/* CONTENT */}
                                        <div className="pt-3 lg:pt-4">
                                            {/* TITLE */}
                                            <h3 className="line-clamp-2 text-sm font-medium leading-5 text-[#19398A] lg:truncate lg:text-base lg:leading-normal">
                                                {item.name}
                                            </h3>
                                            {/* PRICE */}
                                            <div className="mt-1.5 lg:mt-3">
                                                {hasDiscount ? (
                                                    <>
                                                        <p className="text-xs font-medium text-gray-400 line-through lg:text-sm">
                                                            Rp{" "}
                                                            {Number(
                                                                item.price
                                                            ).toLocaleString("id-ID")}
                                                        </p>

                                                        <p className="text-base font-bold text-orange-500 lg:text-lg">
                                                            Rp{" "}
                                                            {Number(
                                                                item.discount_price
                                                            ).toLocaleString("id-ID")}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-base font-bold text-orange-500 lg:text-lg">
                                                        Rp{" "}
                                                        {Number(
                                                            item.price
                                                        ).toLocaleString("id-ID")}
                                                    </p>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex justify-center lg:hidden">
                            <Link
                                href="/products"
                                className="text-base font-semibold text-[#19398A] underline underline-offset-4 hover:text-orange-500"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* AUTH MODAL */}
            {showAuthModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-brightness-75 transition-all duration-300"
                    onClick={() =>
                        setShowAuthModal(false)
                    }
                >

                    {/* MODAL */}
                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="relative w-full max-w-md rounded-xl bg-white p-7 shadow-2xl"
                    >

                        {/* CLOSE */}
                        <button
                            type="button"
                            onClick={() =>
                                setShowAuthModal(false)
                            }
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-orange-500 transition hover:bg-orange-50 cursor-pointer"
                        >
                            ✕
                        </button>

                        {/* CONTENT */}
                        <div className="pr-8">

                            <h2 className="text-xl font-semibold text-[#19398A]">
                                Authentikasi Diperlukan
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                Kamu harus login atau membuat akun terlebih dahulu untuk melanjutkan belanja dan checkout produk.
                            </p>

                        </div>

                        {/* BUTTON */}
                        <div className="mt-5 grid grid-cols-2 gap-4">

                            {/* LOGIN */}
                            <Link
                                href="/login"
                                className="flex h-12 items-center justify-center rounded-lg bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600"
                            >
                                Login
                            </Link>

                            {/* REGISTER */}
                            <Link
                                href="/register"
                                className="flex h-12 items-center justify-center rounded-lg border border-orange-500 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                            >
                                Daftar
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
