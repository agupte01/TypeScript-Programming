# ShopReact: Shopping Cart (React + TypeScript)

A small e-commerce front end: browse products, filter by category, sort, and manage a cart in a slide-in sidebar with global state via Context + `useReducer`, persisted to `localStorage`. Uses the **FakeStore API: free, no API key**. Runs right after `npm install`.

---

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Quick Start](#quick-start)
5. [Available Scripts](#available-scripts)
6. [Project Structure](#project-structure)
7. [Architecture & State Design](#architecture--state-design)
8. [Component Reference](#component-reference)
9. [API Reference](#api-reference)
10. [TypeScript Concepts Demonstrated](#typescript-concepts-demonstrated)
11. [React Concepts Demonstrated](#react-concepts-demonstrated)
12. [Error Handling & States](#error-handling--states)
13. [Manual Test Checklist](#manual-test-checklist)
14. [Troubleshooting](#troubleshooting)
15. [Future Improvements](#future-improvements)
16. [Author & License](#author--license)

---

## Overview
Two kinds of state live in separate places:
- **Server/catalogue state** (products, categories, filter, sort) → `useProducts` hook, local to `App`.
- **Cart state** (items, quantities, totals) → `CartContext`, global, available to any component via `useCart()`.

## Tech Stack
React 18, TypeScript 5 (strict), Vite 5, CSS Modules, FakeStore API.

## Features
- ~20 products with image, title, price, rating
- Category pills (fetched from the API) + sort: Default / Price low→high / Price high→low / Top rated
- Add to cart, change quantity, remove, clear cart
- Header badge with live item count
- Slide-in cart sidebar with subtotal and total
- **Cart persists across page reloads** (saved to `localStorage`, key `shopReactCart`)
- Loading and error states

## Quick Start
Prerequisites: Node.js 18+, npm 9+.
```bash
cd assignment-10-shopping-cart
npm install
npm run dev
```
Open http://localhost:5173. No key or config.

## Available Scripts
`npm run dev` · `npm run build` (type-check + bundle) · `npm run preview`

## Project Structure
```
assignment-10-shopping-cart/
├── index.html
├── src/
│   ├── main.tsx                 # <CartProvider><App/></CartProvider>
│   ├── App.tsx / App.module.css # Header, filter bar, grid, sidebar toggle
│   ├── api/fakestore.ts         # fetchProducts, fetchCategories, fetchProductsByCategory
│   ├── context/CartContext.tsx  # Reducer + provider + useCart hook
│   ├── hooks/useProducts.ts     # Fetch, category filter, sort
│   ├── types/store.types.ts     # Product, CartItem, SortOption, actions
│   └── components/
│       ├── FilterBar  ProductGrid  ProductCard
│       └── CartSidebar  CartItem   (each with a .module.css)
```

## Architecture & State Design
```
main.tsx
 └─ <CartProvider>                 useReducer(cartReducer) → { items, totalItems, totalPrice (string, 2 dp), addItem/removeItem/incrementItem/decrementItem/clearCart }
     └─ <App>                      state: cartOpen ; useProducts() → filtered/sorted products
         ├─ header badge           useCart().totalItems
         ├─ <FilterBar/>           category + sort setters
         ├─ <ProductGrid/> → <ProductCard/>   addItem(product)
         └─ <CartSidebar/> → <CartItem/>      increment / decrement / remove
```
**Why a reducer?** Cart changes are a small set of named transitions (add, remove, increment, decrement, clear, load). A reducer keeps them in one pure, testable function and makes illegal states hard to create.

**Derived data:** `totalItems` and `totalPrice` are computed from `items`, never stored separately, so they cannot drift out of sync.

## Component Reference
| Component | Responsibility |
|---|---|
| `App` | Layout, cart open/close |
| `FilterBar` | Category pills + sort select (controlled) |
| `ProductGrid` | Loading / error / empty / grid |
| `ProductCard` | One product, "Add to cart" |
| `CartSidebar` | Overlay panel, list, totals, clear |
| `CartItem` | Row with quantity controls |
| `useProducts` | Data + filter + sort |
| `useCart` | Context accessor; throws if used outside the provider |

## API Reference
Base `https://fakestoreapi.com`, no auth.

| Endpoint | Use |
|---|---|
| `GET /products` | All products |
| `GET /products/categories` | Category names |
| `GET /products/category/{name}` | Products in one category |

## TypeScript Concepts Demonstrated
- Discriminated-union **reducer actions** (`ADD_ITEM`, `REMOVE_ITEM`, `INCREMENT`, `DECREMENT`, `CLEAR_CART`, `LOAD_CART`) with exhaustive `switch`
- Typed React Context with a safe `useCart` guard (no non-null assertions at call sites)
- Generic fetch helper `storeFetch<T>`
- `SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'none'` driving a comparator
- Typed props for every component
- Immutable updates with `map`/`filter`/spread

## React Concepts Demonstrated
Context API, `useReducer`, custom hooks, `useMemo` for derived lists, controlled form controls, conditional rendering, composition, CSS Modules.

## Error Handling & States
Loading while fetching; error message if the API fails (with the HTTP status); empty message when a filter matches nothing; the cart works fully offline once products are loaded.

## Manual Test Checklist
- [ ] Products load; category pills appear
- [ ] Selecting a category shows only that category
- [ ] Each sort option reorders correctly
- [ ] Add same item twice → quantity 2, not two rows
- [ ] Decrement to 0 removes the item
- [ ] Badge, subtotal and total update everywhere
- [ ] Clear cart empties it
- [ ] `npm run build` passes

## Troubleshooting
| Problem | Fix |
|---|---|
| Products never load | FakeStore can be slow or down; retry |
| `useCart` error | Component rendered outside `CartProvider` |
| Cart is stale or corrupted | Clear the `shopReactCart` key in DevTools → Application → Local Storage |

## Future Improvements
Validate data read from `localStorage`, product detail route (React Router), checkout form with validation, search, Vitest tests for the reducer.

## Author & License
Your Name · SFU JavaScript & TypeScript Web Development · MIT
