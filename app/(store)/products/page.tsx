/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";


const API = process.env.NEXT_PUBLIC_API_URL;

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  discount_price: string | null;
  stock: number;
  sold_count: number;
  image: string | null;
  category_id: number | null;

  category?: Category | null;

  flash_sale?: {
    id: number;
    discount_price: string;
    end_at: string;
  } | null;
};

function getImageUrl(image: string | null) {
  if (!image || image.trim() === "") {
    return "/pet-placeholder.jpg";
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `http://localhost:8000/storage/${image}`;
}

export default function ProductsPage() {
  const [categorySlug, setCategorySlug] =
    useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<number | "all">("all");

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] =
    useState(1);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    setCategorySlug(
      params.get("category")
    );
  }, []);

  function handlePageChange(page: number) {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const productsPerPage = 15;

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          productsRes,
          categoriesRes,
        ] = await Promise.all([
          fetch(
            `${API}/products`,
            {
              cache:
                "no-store",
            }
          ),

          fetch(
            `${API}/categories`,
            {
              cache:
                "no-store",
            }
          ),
        ]);

        if (productsRes.ok) {
          const productData: Product[] =
            await productsRes.json();

          setProducts(
            productData
          );
        }

        if (categoriesRes.ok) {
          const categoryData: Category[] =
            await categoriesRes.json();

          setCategories(
            categoryData
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);


  const filteredProducts = useMemo(() => {
    return products.filter((product) => {

      // FILTER DARI URL
      if (categorySlug) {
        return (
          product.category?.slug ===
          categorySlug
        );
      }

      // FILTER DARI BUTTON
      if (activeCategory === "all") {
        return true;
      }

      return (
        product.category_id ===
        activeCategory
      );
    });
  }, [
    products,
    activeCategory,
    categorySlug,
  ]);

  const totalPages = Math.ceil(
    filteredProducts.length /
    productsPerPage
  );

  const paginatedProducts =
    filteredProducts.slice(
      (currentPage - 1) *
      productsPerPage,

      currentPage *
      productsPerPage
    );

  return (
    <main className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* HEADER */}
        {/* <div className="mb-12">
          <p className="text-sm font-bold uppercase tracking-wide text-orange-500">
            Our Products
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#19398A]">
            Explore Pet Essentials
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500">
            Temukan makanan,
            aksesoris, vitamin,
            dan kebutuhan terbaik
            untuk hewan
            kesayangan Anda.
          </p>
        </div> */}

        {/* CATEGORY */}
        {/* CATEGORY */}
        {!categorySlug ? (
          <div className="mb-12 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                setActiveCategory("all")
              }
              className={`rounded-full px-5 py-3 text-sm font-medium transition cursor-pointer ${activeCategory === "all"
                ? "bg-[#19398A] text-white"
                : "bg-gray-100 text-[#19398A] hover:bg-orange-100"
                }`}
            >
              All Products
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setActiveCategory(
                    category.id
                  )
                }
                className={`rounded-full px-5 py-3 text-sm font-medium transition cursor-pointer ${activeCategory ===
                  category.id
                  ? "bg-[#19398A] text-white"
                  : "bg-gray-100 text-[#19398A] hover:bg-orange-100"
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        ) : null}

        {/* CONTENT */}
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Loading
            products...
          </div>
        ) : paginatedProducts.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <p className="font-semibold text-gray-700">
              Produk belum
              tersedia.
            </p>
          </div>
        ) : (
          <>
            {/* PRODUCTS */}
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
              {paginatedProducts.map(
                (product) => {
                  const flashPrice =
                    product.flash_sale &&
                      Number(
                        product
                          .flash_sale
                          .discount_price
                      ) >
                      0 &&
                      Number(
                        product
                          .flash_sale
                          .discount_price
                      ) <
                      Number(
                        product.price
                      )
                      ? product
                        .flash_sale
                        .discount_price
                      : null;

                  const normalDiscount =
                    product.discount_price &&
                      Number(
                        product.discount_price
                      ) >
                      0 &&
                      Number(
                        product.discount_price
                      ) <
                      Number(
                        product.price
                      )
                      ? product.discount_price
                      : null;

                  const finalPrice =
                    flashPrice ||
                    normalDiscount ||
                    product.price;

                  const isFlashSale =
                    !!flashPrice;

                  const isNormalSale =
                    !!normalDiscount &&
                    !isFlashSale;

                  const hasDiscount =
                    Number(
                      finalPrice
                    ) >
                    0 &&
                    Number(
                      finalPrice
                    ) <
                    Number(
                      product.price
                    );

                  return (
                    <div
                      key={
                        product.id
                      }
                      className="group overflow-hidden rounded-t-2xl bg-white transition duration-300 hover:-translate-y-1"
                    >
                      <Link
                        href={`/products/${product.slug}`}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                          {/* BADGE */}
                          {isFlashSale ? (
                            <div className="absolute left-3 top-3 z-20 rounded-full bg-red-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                              Flash
                              Sale
                            </div>
                          ) : isNormalSale ? (
                            <div className="absolute left-3 top-3 z-20 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
                              Sale
                            </div>
                          ) : null}

                          <Image
                            src={getImageUrl(
                              product.image
                            )}
                            alt={
                              product.name
                            }
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            unoptimized
                          />
                        </div>
                      </Link>

                      <div className="pt-4">
                        <h3 className="line-clamp-2 font-medium text-[#19398A] truncate">
                          {
                            product.name
                          }
                        </h3>

                        <div className="mt-3">
                          {hasDiscount ? (
                            <>
                              <p className="text-sm font-medium text-gray-400 line-through">
                                Rp{" "}
                                {Number(
                                  product.price
                                ).toLocaleString(
                                  "id-ID"
                                )}
                              </p>

                              <p
                                className={`text-lg font-bold ${isFlashSale
                                  ? "text-red-600"
                                  : "text-orange-500"
                                  }`}
                              >
                                Rp{" "}
                                {Number(
                                  finalPrice
                                ).toLocaleString(
                                  "id-ID"
                                )}
                              </p>
                            </>
                          ) : (
                            <p className="text-lg font-bold text-orange-500">
                              Rp{" "}
                              {Number(
                                product.price
                              ).toLocaleString(
                                "id-ID"
                              )}
                            </p>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          {product.sold_count ??
                            0}{" "}
                          terjual
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 ? (
              <div className="mt-12 flex items-center justify-center gap-3">
                {Array.from({
                  length: totalPages,
                }).map((_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      onClick={() =>
                        handlePageChange(page)
                      }
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition ${currentPage === page
                        ? "bg-[#19398A] text-white shadow-md"
                        : "bg-gray-100 text-[#19398A] hover:bg-orange-100"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}