"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

type AddToCartButtonProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    image: string | null;
    stock: number;

    variantName?: string | null;
  };

  quantity?: number;
};

export default function AddToCartButton({
  product,
  quantity = 1,
}: AddToCartButtonProps) {

  const [added, setAdded] =
    useState(false);

  const buttonClass =
    "rounded-lg w-80 bg-orange-500 cursor-pointer px-6 py-3 text-sm font-medium text-white transition hover:bg-orange-600";

  function handleAddToCart() {

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: product.image,
      stock: product.stock,

      quantity,

      variantName:
        product.variantName || undefined,
    });

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={buttonClass}
    >
      {added
        ? "Berhasil ditambahkan"
        : "Tambah ke Keranjang"}
    </button>
  );
}