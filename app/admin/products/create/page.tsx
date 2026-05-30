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
  ImagePlus,
  Save,
  X,
} from "lucide-react";

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
      const res = await fetch(
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

      const res = await fetch(
        `${API}/products`,
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
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin/products"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              <ArrowLeft size={16} />
              Kembali ke produk
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              Tambah Produk
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Tambahkan produk baru
              ke katalog petshop.
            </p>
          </div>
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">
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
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Kategori
                  </span>

                  <select
                    value={categoryId}
                    onChange={(e) =>
                      setCategoryId(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
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
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
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
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Thumbnail Utama
              </h2>

              <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-orange-400 hover:bg-orange-50">
                {preview ? (
                  <div className="relative h-64 w-full overflow-hidden rounded-xl">
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
                      className="mb-4 text-gray-400"
                      size={44}
                    />

                    <p className="text-sm font-semibold text-gray-700">
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
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-gray-900">
                Gallery Produk
              </h2>

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

              <p className="mt-3 text-xs text-gray-500">
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

                        {/* number */}
                        <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-gray-700 shadow">
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
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Product Variant
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Contoh:
                    Warna, Ukuran, Rasa, dll
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addOption}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
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
                      className="rounded-2xl border border-gray-200 p-5"
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
                          className="mt-7 rounded-xl border border-red-200 px-3 py-3 text-red-500 transition hover:bg-red-50"
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
                                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
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
                                className="rounded-xl border border-red-200 px-3 text-red-500 transition hover:bg-red-50"
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
                          className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
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
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Variant Combination
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Set harga, stock,
                    dan SKU tiap variant
                  </p>
                </div>

                <div className="overflow-x-auto">

                  <table className="min-w-full border-collapse">

                    <thead>

                      <tr className="border-b border-gray-200">

                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                          Variant
                        </th>

                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                          Price
                        </th>

                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                          Discount
                        </th>

                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                          Stock
                        </th>

                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
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
                                className="w-32 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-orange-500"
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
                                className="w-32 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-orange-500"
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
                                className="w-28 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-orange-500"
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
                                className="w-40 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:border-orange-500"
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
                    Produk tampil di
                    customer
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
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
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
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500"
      />
    </label>
  );
}