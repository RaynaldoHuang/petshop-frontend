import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Produk tidak ditemukan</h1>
        <p className="mt-2 text-sm text-gray-600">
          Produk yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 text-sm font-medium text-white hover:bg-orange-600"
        >
          Kembali ke daftar produk
        </Link>
      </div>
    </main>
  );
}