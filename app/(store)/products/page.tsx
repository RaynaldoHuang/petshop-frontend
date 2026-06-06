/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  Suspense,
} from "react";

import { getStorageUrl } from "@/lib/storage";

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
  if (!image || image.trim() === "" || image.trim() === "0") {
    return "/pet-placeholder.jpg";
  }

  if (image.startsWith("http")) {
    return image;
  }

  return getStorageUrl(image);
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

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
    setCategorySlug(
      searchParams.get("category")
    );
  }, [searchParams]);

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
  }, [activeCategory, categorySlug]);

  useEffect(() => {
    if (!categorySlug) {
      setActiveCategory("all");
      return;
    }

    const category = categories.find(
      (item) => item.slug === categorySlug
    );

    if (category) {
      setActiveCategory(category.id);
    }
  }, [categories, categorySlug]);

  function handleAllProducts() {
    setActiveCategory("all");
    router.push("/products");
  }

  function handleCategoryChange(
    category: Category
  ) {
    setActiveCategory(category.id);
    router.push(
      `/products?category=${category.slug}`
    );
  }


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
    <main className="bg-white py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* HEADER */}
        <div className="mb-6 lg:mb-10">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-500 lg:text-sm">
            Our Products
          </p>

          <h1 className="mt-2 text-3xl font-bold leading-tight text-[#19398A] lg:text-4xl">
            Explore Pet Essentials
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 lg:text-base lg:leading-7">
            Temukan makanan,
            aksesoris, vitamin,
            dan kebutuhan terbaik
            untuk hewan
            kesayangan Anda.
          </p>
        </div>

        {/* CATEGORY */}
        <div className="-mx-4 mb-7 overflow-x-auto px-4 pb-1 lg:mx-0 lg:mb-12 lg:overflow-visible lg:px-0 lg:pb-0">
          <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap lg:gap-3">
            <button
              type="button"
              onClick={handleAllProducts}
              className={`h-11 rounded-full px-5 text-sm font-medium transition cursor-pointer lg:h-auto lg:py-3 ${activeCategory === "all"
                && !categorySlug
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
                  handleCategoryChange(
                    category
                  )
                }
                className={`h-11 rounded-full px-5 text-sm font-medium transition cursor-pointer lg:h-auto lg:py-3 ${categorySlug ===
                  category.slug ||
                  (!categorySlug &&
                    activeCategory ===
                    category.id)
                  ? "bg-[#19398A] text-white"
                  : "bg-gray-100 text-[#19398A] hover:bg-orange-100"
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 py-16 text-center text-sm text-gray-500 lg:py-20">
            Loading
            products...
          </div>
        ) : paginatedProducts.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-5 py-12 text-center lg:p-10">
            <p className="font-semibold text-gray-700">
              Produk belum
              tersedia.
            </p>
          </div>
        ) : (
          <>
            {/* PRODUCTS */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-y-10">
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
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 lg:rounded-2xl">
                          {/* BADGE */}
                          {isFlashSale ? (
                            <div className="absolute left-2 top-2 z-20 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white lg:left-3 lg:top-3 lg:px-3 lg:text-[11px]">
                              Flash
                              Sale
                            </div>
                          ) : isNormalSale ? (
                            <div className="absolute left-2 top-2 z-20 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white lg:left-3 lg:top-3 lg:px-3 lg:text-[11px]">
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

                      <div className="pt-3 lg:pt-4">
                        <h3 className="line-clamp-2 min-h-[40px] text-sm font-medium leading-5 text-[#19398A] lg:min-h-0 lg:truncate lg:text-base lg:leading-normal">
                          {
                            product.name
                          }
                        </h3>

                        <div className="mt-2 lg:mt-3">
                          {hasDiscount ? (
                            <>
                              <p className="text-xs font-medium text-gray-400 line-through lg:text-sm">
                                Rp{" "}
                                {Number(
                                  product.price
                                ).toLocaleString(
                                  "id-ID"
                                )}
                              </p>

                              <p
                                className={`text-base font-bold lg:text-lg ${isFlashSale
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
                            <p className="text-base font-bold text-orange-500 lg:text-lg">
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
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2 lg:mt-12 lg:gap-3">
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
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition lg:h-11 lg:w-11 ${currentPage === page
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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="py-20 text-center text-gray-500">
              Loading products...
            </div>
          </div>
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
