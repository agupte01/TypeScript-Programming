/**
 * store.types.ts
 * --------------
 * All TypeScript interfaces, types, and discriminated union actions
 * for the Shopping Cart app. Fully typed state and actions make the
 * useReducer pattern type-safe end-to-end.
 */

/** A product from the FakeStore API. */
export interface Product {
  id:          number;
  title:       string;
  price:       number;
  description: string;
  category:    string;
  image:       string;
  rating: {
    rate:  number;
    count: number;
  };
}

/** A cart item pairs a product with a quantity. */
export interface CartItem {
  product:  Product;
  quantity: number;
}

/** The shape of the cart reducer state. */
export interface CartState {
  items: CartItem[];
}

/**
 * Discriminated union of all cart actions.
 * Using a union (not a plain string) lets TypeScript narrow the
 * payload type automatically in each switch case.
 */
export type CartAction =
  | { type: 'ADD_ITEM';    product: Product }
  | { type: 'REMOVE_ITEM'; productId: number }
  | { type: 'INCREMENT';   productId: number }
  | { type: 'DECREMENT';   productId: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART';   items: CartItem[] };

/** Sort options for the product grid. */
export type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'none';
