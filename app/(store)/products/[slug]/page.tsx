import { notFound } from "next/navigation";

import ProductDetailClient from "./ProductDetailClient";

type ProductImage = {
  id: number;
  image: string;
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
};

async function getProduct(
  slug: string
): Promise<Product> {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error(
      "Gagal mengambil detail produk"
    );
  }

  return res.json();
}

/*
=========================================
RELATED PRODUCTS
=========================================
*/
async function getRelatedProducts() {

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return [];
  }

  const products = await res.json();

  return products.data || products;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug } = await params;

  /*
  =========================================
  PRODUCT
  =========================================
  */
  const product =
    await getProduct(slug);

  /*
  =========================================
  RELATED PRODUCTS
  =========================================
  */
  const allProducts =
    await getRelatedProducts();

  const relatedProducts =
    allProducts
      .filter(
        (item: Product) =>
          item.id !== product.id
      )
      .slice(0, 4);

  /*
  =========================================
  IMAGES
  =========================================
  */
  const images = [
    ...(product.image
      ? [
        {
          id: -1,
          image: product.image,
        },
      ]
      : []),

    ...(product.images || []),
  ];

  return (
    <ProductDetailClient
      product={product}
      images={images}
      relatedProducts={relatedProducts}
    />
  );
}