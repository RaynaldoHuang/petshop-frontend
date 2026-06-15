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
import { apiFetch } from "@/lib/api";

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

        const res = await apiFetch(
          `${API}/admin/products/${params.id}`,
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

    // The generator intentionally preserves the current variant values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const res = await apiFetch(
        `${API}/admin/products/${params.id}`,
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#17376f]/20 border-t-[#17376f]" />
          Memuat data produk...
        </div>
      </div>
    );
  }
  
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      <div className="mx-auto max-w-[1500px]">

        <div className="mb-6">

          <Link
            href="/admin/products"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#17376f]"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>

          <p className="text-sm font-semibold text-orange-500">Catalog management</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
            Edit Produk
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Perbarui informasi, media, stok, dan variasi produk.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]"
        >

          {/* LEFT */}
          <div className="grid gap-6">

            {/* PRODUCT */}
            <div className="rounded-lg border border-slate-200 bg-white p-5">

              <h2 className="mb-4 text-base font-bold text-slate-900">
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
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5"
                />

                <div className="grid gap-5 md:grid-cols-2">

                  <Input
                    label="Harga"
                    type="number"
                    value={price}
                    onChange={setPrice}
                  />

                  <Input
                    label="Harga Diskon"
                    type="number"
                    value={discountPrice}
                    onChange={setDiscountPrice}
                  />

                  <Input
                    label="Stock"
                    type="number"
                    value={stock}
                    onChange={setStock}
                  />

                  <Input
                    label="Terjual"
                    type="number"
                    value={soldCount}
                    onChange={setSoldCount}
                  />

                </div>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="rounded-lg border border-slate-200 bg-white p-5">

              <div className="mb-5 flex items-center justify-between">

                <h2 className="text-base font-bold">
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
                  className="rounded-md bg-orange-500 px-4 py-2 text-white"
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
                      className="rounded-lg border border-slate-200 p-5"
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

                          <p className="text-sm font-semibold text-slate-700">
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
                                  className="w-full rounded-md border border-slate-200 px-3 py-2.5"
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
                                  className="rounded-md bg-red-100 px-4 text-red-500"
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
            <div className="rounded-lg border border-slate-200 bg-white p-5">

              <h2 className="mb-4 text-base font-bold">
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
                      className="grid gap-4 rounded-lg border border-slate-200 p-5 md:grid-cols-5"
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
                        className="rounded-md border border-slate-200 px-3 py-2.5"
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
                        className="rounded-md border border-slate-200 px-3 py-2.5"
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
                        className="rounded-md border border-slate-200 px-3 py-2.5"
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
                        className="rounded-md border border-slate-200 px-3 py-2.5"
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
            <div className="rounded-lg border border-slate-200 bg-white p-5">

              <h2 className="mb-4 text-base font-bold text-slate-900">
                Thumbnail Utama
              </h2>

              <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-5">

                {preview ? (

                  <div className="relative h-64 w-full overflow-hidden rounded-md">

                    <Image
                      src={preview}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                ) : currentImage ? (

                  <div className="relative h-64 w-full overflow-hidden rounded-md">

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
            <div className="rounded-lg border border-slate-200 bg-white p-5">

              <h2 className="mb-4 text-base font-bold text-slate-900">
                Gallery Produk
              </h2>

              {/* UPLOAD */}
              <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-orange-400 hover:bg-orange-50">

                <div>

                  <ImagePlus
                    className="mx-auto mb-3 text-slate-400"
                    size={36}
                  />

                  <p className="text-sm font-semibold text-slate-700">
                    Upload banyak gambar
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
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

              <p className="mt-3 text-xs text-slate-500">
                Maksimal 4 gambar produk
              </p>

              {/* EXISTING IMAGES */}
              {existingImages.length >
                0 && (
                  <div className="mt-5">

                    <p className="mb-3 text-sm font-semibold text-slate-700">
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
                            className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
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
                            <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-slate-700">
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

                    <p className="mb-3 text-sm font-semibold text-slate-700">
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
                            className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
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
                            <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-slate-700">
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
            <div className="rounded-lg border border-slate-200 bg-white p-5">

              <h2 className="mb-4 text-base font-bold text-slate-900">
                Status
              </h2>

              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">

                <div>

                  <p className="text-sm font-semibold text-slate-900">
                    Produk Aktif
                  </p>

                  <p className="text-xs text-slate-500">
                    Produk tampil di customer
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive((current) => !current)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    isActive ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
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
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (
    value: string
  ) => void;
}) {

  return (
    <label className="block">

      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value || ""}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[#315b9f] focus:ring-2 focus:ring-[#315b9f]/10"
      />
    </label>
  );
}
