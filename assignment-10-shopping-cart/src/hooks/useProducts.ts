/**
 * useProducts.ts
 * --------------
 * Custom hook that manages product data, category filtering, and sorting.
 * Fetches products and categories in parallel on mount.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchCategories } from '../api/fakestore';
import type { Product, SortOption } from '../types/store.types';

interface UseProductsResult {
  filteredProducts:    Product[];
  categories:          string[];
  selectedCategory:    string;
  setSelectedCategory: (cat: string) => void;
  sortOption:          SortOption;
  setSortOption:       (opt: SortOption) => void;
  loading:             boolean;
  error:               string | null;
}

/**
 * Manages all product state: fetching, filtering by category, and sorting.
 *
 * @returns Hook interface with filtered products, categories, and filter setters.
 */
export function useProducts(): UseProductsResult {
  const [allProducts, setAllProducts]     = useState<Product[]>([]);
  const [filteredProducts, setFiltered]   = useState<Product[]>([]);
  const [categories, setCategories]       = useState<string[]>([]);
  const [selectedCategory, setCategory]  = useState<string>('all');
  const [sortOption, setSort]             = useState<SortOption>('none');
  const [loading, setLoading]             = useState<boolean>(true);
  const [error, setError]                 = useState<string | null>(null);

  // Fetch products and categories in parallel on mount
  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchProducts(), fetchCategories()])
      .then(([products, cats]) => {
        if (!cancelled) {
          setAllProducts(products);
          setFiltered(products);
          setCategories(cats);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  /**
   * Applies the current category filter and sort option to allProducts.
   * Called whenever either filter changes.
   */
  const applyFilters = useCallback(
    (category: string, sort: SortOption) => {
      let result = category === 'all'
        ? [...allProducts]
        : allProducts.filter(p => p.category === category);

      switch (sort) {
        case 'price-asc':   result.sort((a, b) => a.price - b.price);              break;
        case 'price-desc':  result.sort((a, b) => b.price - a.price);              break;
        case 'rating-desc': result.sort((a, b) => b.rating.rate - a.rating.rate);  break;
      }

      setFiltered(result);
    },
    [allProducts]
  );

  // Stable setters that also trigger filter re-application
  const setSelectedCategory = useCallback((cat: string) => {
    setCategory(cat);
    applyFilters(cat, sortOption);
  }, [applyFilters, sortOption]);

  const setSortOption = useCallback((opt: SortOption) => {
    setSort(opt);
    applyFilters(selectedCategory, opt);
  }, [applyFilters, selectedCategory]);

  return {
    filteredProducts,
    categories,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
    loading,
    error,
  };
}
