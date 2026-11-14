/**
 * CartContext.tsx
 * ---------------
 * Global cart state using React Context API + useReducer.
 *
 * Pattern:
 *  1. cartReducer handles all state transitions for cart actions.
 *  2. CartProvider wraps the app and exposes the cart via context.
 *  3. useCart() is a typed convenience hook for consuming the context.
 *
 * localStorage sync:
 *  - On mount, LOAD_CART restores any previously saved cart.
 *  - After every dispatch, the updated items are persisted.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { CartState, CartAction, CartItem, Product } from '../types/store.types';

// ── Reducer ───────────────────────────────────────────────────────────────────

/**
 * Pure reducer function — takes current state and an action, returns new state.
 * TypeScript narrows the action payload type in each case via the discriminated union.
 *
 * @param state  - Current CartState.
 * @param action - Typed CartAction.
 * @returns       New CartState (always a new object reference).
 */
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {

    case 'ADD_ITEM': {
      // If the product already exists, increment its quantity
      const existing = state.items.find(i => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      // Otherwise add as a new cart item with quantity 1
      return { items: [...state.items, { product: action.product, quantity: 1 }] };
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.product.id !== action.productId) };

    case 'INCREMENT':
      return {
        items: state.items.map(i =>
          i.product.id === action.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      };

    case 'DECREMENT':
      return {
        items: state.items
          // Decrement, then filter out any items that reached 0
          .map(i =>
            i.product.id === action.productId
              ? { ...i, quantity: i.quantity - 1 }
              : i
          )
          .filter(i => i.quantity > 0),
      };

    case 'CLEAR_CART':
      return { items: [] };

    case 'LOAD_CART':
      return { items: action.items };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

/** The typed shape exposed via CartContext. */
interface CartContextValue {
  items:         CartItem[];
  dispatch:      React.Dispatch<CartAction>;
  addItem:       (product: Product) => void;
  removeItem:    (productId: number) => void;
  incrementItem: (productId: number) => void;
  decrementItem: (productId: number) => void;
  clearCart:     () => void;
  totalItems:    number;
  totalPrice:    string;
}

const CartContext = createContext<CartContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

/** localStorage key for persisting the cart. */
const STORAGE_KEY = 'shopReactCart';

/** Safely reads the cart from localStorage. Returns [] on parse error. */
function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

interface CartProviderProps { children: ReactNode; }

/**
 * CartProvider wraps the app tree and provides cart state + actions.
 * Restores the cart from localStorage on mount and saves on every change.
 */
export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Restore cart from localStorage on first render
  useEffect(() => {
    const saved = loadCartFromStorage();
    if (saved.length > 0) {
      dispatch({ type: 'LOAD_CART', items: saved });
    }
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  // Stable action helpers — wrapped in useCallback to avoid unnecessary re-renders
  const addItem       = useCallback((product: Product) => dispatch({ type: 'ADD_ITEM',    product }),    []);
  const removeItem    = useCallback((productId: number) => dispatch({ type: 'REMOVE_ITEM', productId }), []);
  const incrementItem = useCallback((productId: number) => dispatch({ type: 'INCREMENT',   productId }), []);
  const decrementItem = useCallback((productId: number) => dispatch({ type: 'DECREMENT',   productId }), []);
  const clearCart     = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  // Derived values — computed from state, not stored
  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items
    .reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    .toFixed(2);

  return (
    <CartContext.Provider value={{
      items: state.items,
      dispatch,
      addItem, removeItem, incrementItem, decrementItem, clearCart,
      totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Typed hook to consume the cart context.
 * Throws if used outside of a CartProvider (development safety check).
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
