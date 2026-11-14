/**
 * fakestore.ts
 * ------------
 * Typed fetch wrappers for the FakeStore API.
 * No API key required — the API is completely free and open.
 *
 * Docs: https://fakestoreapi.com/docs
 */

import type { Product } from '../types/store.types';

/** FakeStore API base URL. */
const BASE = 'https://fakestoreapi.com';

/** Shared fetch helper — throws on non-ok HTTP responses. */
async function storeFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`);
  if (!response.ok) {
    throw new Error(`FakeStore API error ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Fetches all products.
 * @returns Array of all Product objects (~20 items).
 */
export async function fetchProducts(): Promise<Product[]> {
  return storeFetch<Product[]>('/products');
}

/**
 * Fetches all available category strings.
 * @returns Array of category names (e.g. ["electronics", "jewelery", ...]).
 */
export async function fetchCategories(): Promise<string[]> {
  return storeFetch<string[]>('/products/categories');
}

/**
 * Fetches products filtered to a single category.
 * @param category - One of the strings returned by fetchCategories().
 * @returns Array of Product objects in that category.
 */
export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  return storeFetch<Product[]>(`/products/category/${encodeURIComponent(category)}`);
}
