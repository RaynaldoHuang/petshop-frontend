import { CartItem } from "@/types/cart";

const CART_KEY = "petshop_cart";

/*
=========================================
GET CART
=========================================
*/
export function getCart(): CartItem[] {

  if (typeof window === "undefined") {
    return [];
  }

  const cart =
    localStorage.getItem(CART_KEY);

  return cart
    ? JSON.parse(cart)
    : [];
}

/*
=========================================
DISPATCH EVENT
=========================================
*/
function dispatchCartUpdate() {

  if (typeof window !== "undefined") {

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  }
}

/*
=========================================
SAVE CART
=========================================
*/
export function saveCart(
  cart: CartItem[]
) {

  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

  dispatchCartUpdate();
}

/*
=========================================
ADD TO CART
=========================================
*/
export function addToCart(
  item: CartItem
) {

  const cart = getCart();

  /*
  =========================================
  CHECK SAME PRODUCT + SAME VARIANT
  =========================================
  */
  const existingItem =
    cart.find(
      (cartItem) =>
        cartItem.id === item.id &&
        cartItem.variantName === item.variantName
    );

  /*
  =========================================
  IF EXISTS
  =========================================
  */
  if (existingItem) {

    existingItem.quantity +=
      item.quantity;

  } else {

    cart.push(item);
  }

  saveCart(cart);

  /*
  =========================================
  REALTIME UPDATE
  =========================================
  */
  window.dispatchEvent(
    new Event("cartUpdated")
  );
}

/*
=========================================
REMOVE FROM CART
=========================================
*/
export function removeFromCart(
  id: number,
  variantName?: string
) {

  const cart = getCart().filter(
    (item) =>
      !(
        item.id === id &&
        item.variantName === variantName
      )
  );

  saveCart(cart);

  window.dispatchEvent(
    new Event("cartUpdated")
  );
}

/*
=========================================
UPDATE QUANTITY
=========================================
*/
export function updateCartQuantity(
  id: number,
  quantity: number,
  variantName?: string
) {

  const cart = getCart();

  const item = cart.find(
    (i) =>
      i.id === id &&
      i.variantName === variantName
  );

  if (!item) return;

  if (quantity <= 0) {

    removeFromCart(
      id,
      variantName
    );

    return;
  }
  item.quantity = quantity;
  saveCart(cart);
  window.dispatchEvent(
    new Event("cartUpdated")
  );
}

/*
=========================================
CLEAR CART
=========================================
*/
export function clearCart() {

  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(CART_KEY);

  dispatchCartUpdate();
}