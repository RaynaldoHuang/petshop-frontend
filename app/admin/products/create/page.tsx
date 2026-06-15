/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import Image from "next/image";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ChevronDown,
  ImagePlus,
  Save,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

type Category = {
  id: number;
  name: string;
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

export default function CreateProductPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [categoryId, setCategoryId] =
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

  const [options, setOptions] =
    useState<ProductOption[]>([]);

  const [variants, setVariants] =
    useState<Variant[]>([]);

  /*
  =========================================
  MAIN IMAGE
  =========================================
  */
  const [image, setImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  /*
  =========================================
  MULTIPLE IMAGES
  =========================================
  */
  const [images, setImages] =
    useState<File[]>([]);

  const [imagePreviews, setImagePreviews] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchCategories() {
      const res = await apiFetch(
        `${API}/categories`,
        {
          cache: "no-store",
        }
      );

      if (res.ok) {
        setCategories(await res.json());
      }
    }

    fetchCategories();
  }, []);

  /*
  =========================================
  MAIN IMAGE
  =========================================
  */
  function handleImageChange(
    file: File | null
  ) {
    setImage(file);

    setPreview(
      file
        ? URL.createObjectURL(file)
        : ""
    );
  }

  /*
  =========================================
  MULTIPLE IMAGES
  =========================================
  */
  function handleMultipleImages(
    files: FileList | null
  ) {
    if (!files) return;

    const selectedFiles =
      Array.from(files);

    /*
    max 5 gambar
    */
    const totalImages =
      images.length +
      selectedFiles.length;

    if (totalImages > 4) {
      alert(
        "Maksimal hanya 4 gambar"
      );

      return;
    }

    /*
    tambah gambar baru
    */
    setImages((prev) => [
      ...prev,
      ...selectedFiles,
    ]);

    /*
    tambah preview baru
    */
    const previews =
      selectedFiles.map((file) =>
        URL.createObjectURL(file)
      );

    setImagePreviews((prev) => [
      ...prev,
      ...previews,
    ]);
  }

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
      setLoading(true);
      setError("");

      const formData =
        new FormData();

      formData.append("name", name);

      formData.append("slug", slug);

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

      if (categoryId) {
        formData.append(
          "category_id",
          categoryId
        );
      }

      /*
      MAIN IMAGE
      */
      if (image) {
        formData.append(
          "image",
          image
        );
      }

      /*
      MULTIPLE IMAGES
      */
      images.forEach((file) => {
        formData.append(
          "images[]",
          file
        );
      });

      /*
=========================================
OPTIONS
=========================================
*/
      formData.append(
        "options",
        JSON.stringify(options)
      );

      /*
      =========================================
      VARIANTS
      =========================================
      */
      formData.append(
        "variants",
        JSON.stringify(variants)
      );

      const res = await apiFetch(
        `${API}/admin/products`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const data =
          await res.json();

        throw new Error(
          data.message ||
          "Gagal menyimpan produk"
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
      setLoading(false);
    }
  }

  function addOption() {

    setOptions([
      ...options,
      {
        name: "",
        values: [""],
      },
    ]);
  }

  function generateVariants(
    options: ProductOption[]
  ) {

    if (
      options.length === 0
    ) {
      setVariants([]);
      return;
    }

    const combinations =
      options.reduce(
        (acc, option) => {

          const result: string[] = [];

          acc.forEach((a) => {

            option.values.forEach((v) => {

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
        (combo) => ({
          name: combo,
          price: "",
          discount_price: "",
          stock: "",
          sku: "",
        })
      );

    setVariants(generated);
  }

  useEffect(() => {
    generateVariants(options);
  }, [options]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/products"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#17376f]"
            >
              <ArrowLeft size={16} />
              Kembali ke produk
            </Link>

            <p className="text-sm font-semibold text-orange-500">Catalog management</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#17376f]">
              Tambah Produk
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Lengkapi informasi, media, stok, dan variasi produk.
            </p>
          </div>
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
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-base font-bold text-slate-900">
              Informasi Produk
            </h2>

            <div className="grid gap-5">
              <Input
                label="Nama Produk"
                value={name}
                onChange={setName}
                placeholder="Contoh: Royal Canin"
                required
              />

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Slug"
                  value={slug}
                  onChange={setSlug}
                  placeholder="Kosongkan jika otomatis"
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Kategori
                  </span>

                  <div className="relative">
                    <select
                      value={categoryId}
                      onChange={(e) =>
                        setCategoryId(
                          e.target.value
                        )
                      }
                      className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-10 text-sm outline-none transition focus:border-[#315b9f] focus:ring-2 focus:ring-[#315b9f]/10"
                    >
                      <option value="">
                        Pilih kategori
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={
                              category.id
                            }
                            value={
                              category.id
                            }
                          >
                            {
                              category.name
                            }
                          </option>
                        )
                      )}
                    </select>
                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Deskripsi
                </span>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={6}
                  placeholder="Tulis deskripsi produk..."
                  className="w-full rounded-md border border-slate-200 px-3 py-2.5 outline-none focus:border-[#315b9f]"
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Harga Diskon"
                  type="number"
                  value={
                    discountPrice
                  }
                  onChange={
                    setDiscountPrice
                  }
                />

                <Input
                  label="Harga"
                  type="number"
                  value={price}
                  onChange={setPrice}
                  required
                />

                <Input
                  label="Stok"
                  type="number"
                  value={stock}
                  onChange={setStock}
                  required
                />

                <Input
                  label="Jumlah Terjual"
                  type="number"
                  value={soldCount}
                  onChange={
                    setSoldCount
                  }
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="grid gap-6">
            {/* MAIN IMAGE */}
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-base font-bold text-slate-900">
                Thumbnail Utama
              </h2>

              <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-orange-400 hover:bg-orange-50">
                {preview ? (
                  <div className="relative h-64 w-full overflow-hidden rounded-md">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <>
                    <ImagePlus
                      className="mb-4 text-slate-400"
                      size={44}
                    />

                    <p className="text-sm font-semibold text-slate-700">
                      Upload thumbnail
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(
                      e.target.files?.[0] ||
                      null
                    )
                  }
                  className="hidden"
                />
              </label>
            </div>

            {/* MULTIPLE IMAGES */}
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-base font-bold text-slate-900">
                Gallery Produk
              </h2>

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
                    Bisa pilih banyak
                    gambar sekaligus
                  </p>
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    handleMultipleImages(
                      e.target.files
                    )
                  }
                  className="hidden"
                />
              </label>

              <p className="mt-3 text-xs text-slate-500">
                Maksimal 5 gambar
                produk
              </p>

              {imagePreviews.length >
                0 ? (
                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
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

                        {/* number */}
                        <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-slate-700">
                          {index + 1}
                        </div>

                        {/* remove */}
                        <button
                          type="button"
                          onClick={() => {
                            setImages(
                              images.filter(
                                (
                                  _,
                                  i
                                ) =>
                                  i !==
                                  index
                              )
                            );

                            setImagePreviews(
                              imagePreviews.filter(
                                (
                                  _,
                                  i
                                ) =>
                                  i !==
                                  index
                              )
                            );
                          }}
                          className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <X
                            size={15}
                          />
                        </button>
                      </div>
                    )
                  )}
                </div>
              ) : null}
            </div>

            {/* =========================================
PRODUCT OPTIONS
========================================= */}
            <div className="rounded-lg border border-slate-200 bg-white p-5">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Product Variant
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Contoh:
                    Warna, Ukuran, Rasa, dll
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addOption}
                  className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Tambah Option
                </button>
              </div>

              <div className="space-y-6">

                {options.map(
                  (
                    option,
                    optionIndex
                  ) => (
                    <div
                      key={optionIndex}
                      className="rounded-lg border border-slate-200 p-5"
                    >

                      {/* HEADER */}
                      <div className="mb-4 flex items-center justify-between">

                        <Input
                          label="Nama Option"
                          value={option.name}
                          onChange={(value) => {

                            const updated =
                              [...options];

                            updated[
                              optionIndex
                            ].name = value;

                            setOptions(
                              updated
                            );
                          }}
                          placeholder="Contoh: Warna"
                        />

                        <button
                          type="button"
                          onClick={() => {

                            const updated =
                              options.filter(
                                (
                                  _,
                                  i
                                ) =>
                                  i !==
                                  optionIndex
                              );

                            setOptions(
                              updated
                            );
                          }}
                          className="mt-7 rounded-md border border-red-200 px-3 py-3 text-red-500 transition hover:bg-red-50"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* VALUES */}
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
                                value={value}
                                onChange={(
                                  e
                                ) => {

                                  const updated =
                                    [...options];

                                  updated[
                                    optionIndex
                                  ].values[
                                    valueIndex
                                  ] =
                                    e.target.value;

                                  setOptions(
                                    updated
                                  );
                                }}
                                placeholder="Contoh: Merah"
                                className="flex-1 rounded-md border border-slate-200 px-3 py-2.5 outline-none focus:border-[#315b9f]"
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

                                  setOptions(
                                    updated
                                  );
                                }}
                                className="rounded-md border border-red-200 px-3 text-red-500 transition hover:bg-red-50"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )
                        )}

                        <button
                          type="button"
                          onClick={() => {

                            const updated =
                              [...options];

                            updated[
                              optionIndex
                            ].values.push("");

                            setOptions(
                              updated
                            );
                          }}
                          className="rounded-md border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                        >
                          + Tambah Value
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* =========================================
VARIANT TABLE
========================================= */}
            {variants.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-5">

                <div className="mb-5">
                  <h2 className="text-base font-bold text-slate-900">
                    Variant Combination
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Set harga, stock,
                    dan SKU tiap variant
                  </p>
                </div>

                <div className="overflow-x-auto">

                  <table className="min-w-full border-collapse">

                    <thead>

                      <tr className="border-b border-slate-200">

                        <th className="px-3 py-3 text-left text-sm font-semibold text-slate-700">
                          Variant
                        </th>

                        <th className="px-3 py-3 text-left text-sm font-semibold text-slate-700">
                          Price
                        </th>

                        <th className="px-3 py-3 text-left text-sm font-semibold text-slate-700">
                          Discount
                        </th>

                        <th className="px-3 py-3 text-left text-sm font-semibold text-slate-700">
                          Stock
                        </th>

                        <th className="px-3 py-3 text-left text-sm font-semibold text-slate-700">
                          SKU
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {variants.map(
                        (
                          variant,
                          index
                        ) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100"
                          >

                            <td className="px-3 py-4">
                              <div className="font-semibold text-[#19398A]">
                                {
                                  variant.name
                                }
                              </div>
                            </td>

                            <td className="px-3 py-4">
                              <input
                                type="number"
                                value={
                                  variant.price
                                }
                                onChange={(
                                  e
                                ) => {

                                  const updated =
                                    [...variants];

                                  updated[
                                    index
                                  ].price =
                                    e.target.value;

                                  setVariants(
                                    updated
                                  );
                                }}
                                className="w-32 rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#315b9f]"
                              />
                            </td>

                            <td className="px-3 py-4">
                              <input
                                type="number"
                                value={
                                  variant.discount_price
                                }
                                onChange={(
                                  e
                                ) => {

                                  const updated =
                                    [...variants];

                                  updated[
                                    index
                                  ].discount_price =
                                    e.target.value;

                                  setVariants(
                                    updated
                                  );
                                }}
                                className="w-32 rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#315b9f]"
                              />
                            </td>

                            <td className="px-3 py-4">
                              <input
                                type="number"
                                value={
                                  variant.stock
                                }
                                onChange={(
                                  e
                                ) => {

                                  const updated =
                                    [...variants];

                                  updated[
                                    index
                                  ].stock =
                                    e.target.value;

                                  setVariants(
                                    updated
                                  );
                                }}
                                className="w-28 rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#315b9f]"
                              />
                            </td>

                            <td className="px-3 py-4">
                              <input
                                type="text"
                                value={
                                  variant.sku
                                }
                                onChange={(
                                  e
                                ) => {

                                  const updated =
                                    [...variants];

                                  updated[
                                    index
                                  ].sku =
                                    e.target.value;

                                  setVariants(
                                    updated
                                  );
                                }}
                                className="w-40 rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#315b9f]"
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
                    Produk tampil di
                    customer
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
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
              >
                <Save size={18} />

                {loading
                  ? "Menyimpan..."
                  : "Simpan Produk"}
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
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        required={required}
        placeholder={placeholder}
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
