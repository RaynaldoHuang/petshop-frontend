/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import Image from "next/image";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";

import {
  ArrowLeft,
  ImagePlus,
  Save,
  X,
} from "lucide-react";
import { getStorageUrl } from "@/lib/storage";

const API =
  process.env.NEXT_PUBLIC_API_URL;

type ProductImage = {
  id: number;
  image: string;
};

type ProductOption = {
  name: string;
  values: string[];
};

type Variant = {
  name: string;
  price: string;
  discount_price: string;
  stock: string;
  sku: string;
};

type Product = {
  id: number;

  name: string;
  slug: string;

  description: string | null;

  price: string | number;
  discount_price: string | number | null;

  stock: number;
  sold_count: number;

  image: string | null;

  is_active: boolean | number;

  images?: ProductImage[];

  options?: {
    name: string;
    values: {
      value: string;
    }[];
  }[];

  variants?: {
    name?: string | null;
    price?: string | number | null;
    discount_price?: string | number | null;
    stock?: string | number | null;
    sku?: string | null;
  }[];
};

export default function EditProductPage() {

  const params =
    useParams<{ id: string }>();

  /*
  =========================================
  PRODUCT
  =========================================
  */
  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [discountPrice, setDiscountPrice] =
    useState("");

  const [stock, setStock] =
    useState("");

  const [soldCount, setSoldCount] =
    useState("0");

  const [isActive, setIsActive] =
    useState(true);

  /*
  =========================================
  OPTIONS
  =========================================
  */
  const [options, setOptions] =
    useState<ProductOption[]>([]);

  /*
  =========================================
  VARIANTS
  =========================================
  */
  const [variants, setVariants] =
    useState<Variant[]>([]);

  /*
  =========================================
  IMAGE
  =========================================
  */
  const [image, setImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [currentImage, setCurrentImage] =
    useState("");

  /*
  =========================================
  GALLERY
  =========================================
  */
  const [images, setImages] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  const [existingImages, setExistingImages] =
    useState<ProductImage[]>([]);

  /*
  =========================================
  STATE
  =========================================
  */
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  =========================================
  IMAGE URL
  =========================================
  */
  function getImageUrl(
    path: string
  ) {

    if (!path || path.trim() === "" || path.trim() === "0") {
      return "/pet-placeholder.jpg";
    }

    if (path.startsWith("http")) {
      return path;
    }

    return getStorageUrl(path);
  }

  /*
  =========================================
  FETCH
  =========================================
  */
  useEffect(() => {

    async function fetchData() {

      try {

        const res = await fetch(
          `${API}/products/by-id/${params.id}`,
          {
            cache: "no-store",
          }
        );

        const product: Product =
          await res.json();

        setName(product.name || "");

        setSlug(product.slug || "");

        setDescription(
          product.description || ""
        );

        setPrice(
          product.price !== null
            ? String(product.price)
            : ""
        );

        setDiscountPrice(
          product.discount_price !== null
            ? String(product.discount_price)
            : ""
        );

        setStock(
          product.stock !== null
            ? String(product.stock)
            : ""
        );

        setSoldCount(
          product.sold_count !== null
            ? String(product.sold_count)
            : "0"
        );

        setIsActive(
          Boolean(product.is_active)
        );

        setCurrentImage(
          product.image || ""
        );

        setExistingImages(
          product.images || []
        );

        /*
        =========================================
        OPTIONS
        =========================================
        */
        if (product.options) {

          setOptions(
            product.options.map(
              (option) => ({
                name:
                  option.name || "",

                values:
                  option.values.map(
                    (v) =>
                      v.value || ""
                  ),
              })
            )
          );
        }

        /*
        =========================================
        VARIANTS
        =========================================
        */
        if (product.variants) {

          setVariants(
            product.variants.map(
              (variant) => ({

                name:
                  variant.name || "",

                price:
                  variant.price !== null
                    ? String(
                      variant.price
                    )
                    : "",

                discount_price:
                  variant.discount_price !== null
                    ? String(
                      variant.discount_price
                    )
                    : "",

                stock:
                  variant.stock !== null
                    ? String(
                      variant.stock
                    )
                    : "",

                sku:
                  variant.sku || "",
              })
            )
          );
        }

      } catch {

        setError(
          "Gagal mengambil produk"
        );

      } finally {

        setLoading(false);
      }
    }

    if (params.id) {
      fetchData();
    }

  }, [params.id]);

  /*
  =========================================
  GENERATE VARIANTS
  =========================================
  */
  function generateVariants(
    optionData: ProductOption[]
  ) {

    if (!optionData.length) {

      setVariants([]);
      return;
    }

    const combinations =
      optionData.reduce(
        (acc, option) => {

          const result: string[] = [];

          acc.forEach((a) => {

            option.values.forEach((v) => {

              if (!v.trim()) return;

              result.push(
                a
                  ? `${a} / ${v}`
                  : v
              );
            });
          });

          return result;

        },
        [""]
      );

    const generated =
      combinations.map(
        (combo) => {

          const existing =
            variants.find(
              (v) =>
                v.name === combo
            );

          return {

            name: combo,

            price:
              existing?.price || "",

            discount_price:
              existing?.discount_price || "",

            stock:
              existing?.stock || "",

            sku:
              existing?.sku || "",
          };
        }
      );

    setVariants(generated);
  }

  useEffect(() => {

    if (options.length) {
      generateVariants(options);
    }

  }, [options]);

  /*
  =========================================
  SUBMIT
  =========================================
  */
  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    try {

      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "name",
        name
      );

      formData.append(
        "slug",
        slug
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "price",
        price
      );

      formData.append(
        "discount_price",
        discountPrice
      );

      formData.append(
        "stock",
        stock
      );

      formData.append(
        "sold_count",
        soldCount
      );

      formData.append(
        "is_active",
        isActive ? "1" : "0"
      );

      formData.append(
        "options",
        JSON.stringify(options)
      );

      formData.append(
        "variants",
        JSON.stringify(variants)
      );

      /*
      THUMBNAIL
      */
      if (image) {

        formData.append(
          "image",
          image
        );
      }

      /*
      EXISTING IMAGES
      */
      existingImages.forEach(
        (img) => {

          formData.append(
            "existing_images[]",
            String(img.id)
          );
        }
      );

      /*
      NEW IMAGES
      */
      images.forEach((file) => {

        formData.append(
          "images[]",
          file
        );
      });

      const res = await fetch(
        `${API}/products/${params.id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {

        const text =
          await res.text();

        console.log(text);

        throw new Error(
          "Backend Error"
        );
      }

      window.location.href =
        "/admin/products";

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan"
      );

    } finally {

      setSaving(false);
    }
  }

  if (loading) {

    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-6xl">

        <div className="mb-8">

          <Link
            href="/admin/products"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-600"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Edit Produk
          </h1>
        </div>

        {error ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >

          {/* LEFT */}
          <div className="grid gap-6">

            {/* PRODUCT */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Informasi Produk
              </h2>

              <div className="grid gap-5">

                <Input
                  label="Nama Produk"
                  value={name}
                  onChange={setName}
                />

                <Input
                  label="Slug"
                  value={slug}
                  onChange={setSlug}
                />

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={6}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                />

                <div className="grid gap-5 md:grid-cols-2">

                  <Input
                    label="Harga"
                    value={price}
                    onChange={setPrice}
                  />

                  <Input
                    label="Harga Diskon"
                    value={discountPrice}
                    onChange={setDiscountPrice}
                  />

                  <Input
                    label="Stock"
                    value={stock}
                    onChange={setStock}
                  />

                  <Input
                    label="Terjual"
                    value={soldCount}
                    onChange={setSoldCount}
                  />

                </div>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center justify-between">

                <h2 className="text-xl font-semibold">
                  Product Options
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setOptions([
                      ...options,
                      {
                        name: "",
                        values: [""],
                      },
                    ])
                  }
                  className="rounded-xl bg-orange-500 px-4 py-2 text-white"
                >
                  Tambah Option
                </button>
              </div>

              <div className="space-y-5">

                {options.map(
                  (
                    option,
                    optionIndex
                  ) => (

                    <div
                      key={optionIndex}
                      className="rounded-2xl border border-gray-200 p-5"
                    >

                      <Input
                        label="Nama Option"
                        value={option.name}
                        onChange={(value) => {

                          const updated =
                            [...options];

                          updated[
                            optionIndex
                          ].name =
                            value;

                          setOptions(updated);
                        }}
                      />

                      <div className="mt-4">

                        <div className="mb-3 flex items-center justify-between">

                          <p className="text-sm font-semibold text-gray-700">
                            Values
                          </p>

                          <button
                            type="button"
                            onClick={() => {

                              const updated =
                                [...options];

                              updated[
                                optionIndex
                              ].values.push("");

                              setOptions(updated);
                            }}
                            className="text-sm font-semibold text-orange-500"
                          >
                            + Tambah Value
                          </button>
                        </div>

                        <div className="space-y-3">

                          {option.values.map(
                            (
                              value,
                              valueIndex
                            ) => (

                              <div
                                key={valueIndex}
                                className="flex gap-3"
                              >

                                <input
                                  type="text"
                                  value={value || ""}
                                  onChange={(e) => {

                                    const updated =
                                      [...options];

                                    updated[
                                      optionIndex
                                    ].values[
                                      valueIndex
                                    ] =
                                      e.target.value;

                                    setOptions(updated);
                                  }}
                                  className="w-full rounded-xl border border-gray-300 px-4 py-3"
                                />

                                <button
                                  type="button"
                                  onClick={() => {

                                    const updated =
                                      [...options];

                                    updated[
                                      optionIndex
                                    ].values =
                                      updated[
                                        optionIndex
                                      ].values.filter(
                                        (
                                          _,
                                          i
                                        ) =>
                                          i !==
                                          valueIndex
                                      );

                                    setOptions(updated);
                                  }}
                                  className="rounded-xl bg-red-100 px-4 text-red-500"
                                >
                                  <X size={18} />
                                </button>

                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* VARIANTS */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-xl font-semibold">
                Variant Combination
              </h2>

              <div className="space-y-4">

                {variants.map(
                  (
                    variant,
                    index
                  ) => (

                    <div
                      key={index}
                      className="grid gap-4 rounded-2xl border border-gray-200 p-5 md:grid-cols-5"
                    >

                      <div>
                        <p className="font-semibold text-[#19398A]">
                          {variant.name}
                        </p>
                      </div>

                      <input
                        type="number"
                        value={variant.price || ""}
                        onChange={(e) => {

                          const updated =
                            [...variants];

                          updated[index].price =
                            e.target.value;

                          setVariants(updated);
                        }}
                        className="rounded-xl border border-gray-300 px-4 py-3"
                      />

                      <input
                        type="number"
                        value={variant.discount_price || ""}
                        onChange={(e) => {

                          const updated =
                            [...variants];

                          updated[index].discount_price =
                            e.target.value;

                          setVariants(updated);
                        }}
                        className="rounded-xl border border-gray-300 px-4 py-3"
                      />

                      <input
                        type="number"
                        value={variant.stock || ""}
                        onChange={(e) => {

                          const updated =
                            [...variants];

                          updated[index].stock =
                            e.target.value;

                          setVariants(updated);
                        }}
                        className="rounded-xl border border-gray-300 px-4 py-3"
                      />

                      <input
                        type="text"
                        value={variant.sku || ""}
                        onChange={(e) => {

                          const updated =
                            [...variants];

                          updated[index].sku =
                            e.target.value;

                          setVariants(updated);
                        }}
                        className="rounded-xl border border-gray-300 px-4 py-3"
                      />

                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="grid gap-6">

            {/* THUMBNAIL */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Thumbnail Utama
              </h2>

              <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6">

                {preview ? (

                  <div className="relative h-64 w-full overflow-hidden rounded-xl">

                    <Image
                      src={preview}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                ) : currentImage ? (

                  <div className="relative h-64 w-full overflow-hidden rounded-xl">

                    <Image
                      src={getImageUrl(currentImage)}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                ) : (

                  <ImagePlus size={40} />

                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {

                    const file =
                      e.target.files?.[0];

                    if (!file) return;

                    setImage(file);

                    setPreview(
                      URL.createObjectURL(file)
                    );
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* GALLERY */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Gallery Produk
              </h2>

              {/* UPLOAD */}
              <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-orange-400 hover:bg-orange-50">

                <div>

                  <ImagePlus
                    className="mx-auto mb-3 text-gray-400"
                    size={36}
                  />

                  <p className="text-sm font-semibold text-gray-700">
                    Upload banyak gambar
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Bisa pilih banyak gambar sekaligus
                  </p>
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {

                    if (!e.target.files) return;

                    const selectedFiles =
                      Array.from(
                        e.target.files
                      );

                    /*
                    =========================================
                    MAX 4 IMAGES
                    =========================================
                    */
                    const totalImages =
                      existingImages.length +
                      images.length +
                      selectedFiles.length;

                    if (totalImages > 4) {

                      alert(
                        "Maksimal hanya 4 gambar"
                      );

                      return;
                    }

                    /*
                    =========================================
                    SAVE NEW IMAGES
                    =========================================
                    */
                    setImages((prev) => [
                      ...prev,
                      ...selectedFiles,
                    ]);

                    /*
                    =========================================
                    PREVIEW
                    =========================================
                    */
                    const previews =
                      selectedFiles.map(
                        (file) =>
                          URL.createObjectURL(
                            file
                          )
                      );

                    setImagePreviews(
                      (prev) => [
                        ...prev,
                        ...previews,
                      ]
                    );
                  }}
                  className="hidden"
                />
              </label>

              <p className="mt-3 text-xs text-gray-500">
                Maksimal 4 gambar produk
              </p>

              {/* EXISTING IMAGES */}
              {existingImages.length >
                0 && (
                  <div className="mt-5">

                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      Gallery Lama
                    </p>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

                      {existingImages.map(
                        (
                          img,
                          index
                        ) => (
                          <div
                            key={img.id}
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100"
                          >

                            <div className="relative h-36 w-full">

                              <Image
                                src={getImageUrl(
                                  img.image
                                )}
                                alt=""
                                fill
                                unoptimized
                                className="object-cover transition duration-300 group-hover:scale-105"
                              />
                            </div>

                            {/* NUMBER */}
                            <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-gray-700 shadow">
                              {index + 1}
                            </div>

                            {/* REMOVE */}
                            <button
                              type="button"
                              onClick={() => {

                                setExistingImages(
                                  existingImages.filter(
                                    (
                                      item
                                    ) =>
                                      item.id !==
                                      img.id
                                  )
                                );
                              }}
                              className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* NEW IMAGES */}
              {imagePreviews.length >
                0 && (
                  <div className="mt-5">

                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      Gallery Baru
                    </p>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">

                      {imagePreviews.map(
                        (
                          preview,
                          index
                        ) => (
                          <div
                            key={index}
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100"
                          >

                            <div className="relative h-36 w-full">

                              <Image
                                src={preview}
                                alt=""
                                fill
                                unoptimized
                                className="object-cover transition duration-300 group-hover:scale-105"
                              />
                            </div>

                            {/* NUMBER */}
                            <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-gray-700 shadow">
                              {index + 1}
                            </div>

                            {/* REMOVE */}
                            <button
                              type="button"
                              onClick={() => {

                                setImages(
                                  images.filter(
                                    (
                                      _,
                                      i
                                    ) =>
                                      i !== index
                                  )
                                );

                                setImagePreviews(
                                  imagePreviews.filter(
                                    (
                                      _,
                                      i
                                    ) =>
                                      i !== index
                                  )
                                );
                              }}
                              className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* STATUS */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Status
              </h2>

              <label className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-4">

                <div>

                  <p className="text-sm font-semibold text-gray-900">
                    Produk Aktif
                  </p>

                  <p className="text-xs text-gray-500">
                    Produk tampil di customer
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) =>
                    setIsActive(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5"
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
              >

                <Save size={18} />

                {saving
                  ? "Menyimpan..."
                  : "Update Produk"}
              </button>
            </div>

          </div>
        </form>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {

  return (
    <label className="block">

      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </span>

      <input
        type="text"
        value={value || ""}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full rounded-xl border border-gray-300 px-4 py-3"
      />
    </label>
  );
}
