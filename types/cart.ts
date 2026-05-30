export type CartItem = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
  variantName?: string;
};