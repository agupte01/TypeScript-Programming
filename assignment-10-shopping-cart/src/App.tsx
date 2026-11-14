/**
 * App.tsx — ShopReact root component
 *
 * Orchestrates the full e-commerce layout:
 *  - Header with cart icon button + item count badge
 *  - FilterBar for category + sort
 *  - ProductGrid for product display
 *  - CartSidebar slide-in panel
 *
 * Cart state is provided globally via CartProvider in main.tsx.
 */

import { useState } from 'react';
import { useProducts }  from './hooks/useProducts';
import { useCart }      from './context/CartContext';
import { FilterBar }    from './components/FilterBar';
import { ProductGrid }  from './components/ProductGrid';
import { CartSidebar }  from './components/CartSidebar';
import styles from './App.module.css';

function App() {
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  // Product data, filtering, and sorting from the custom hook
  const {
    filteredProducts,
    categories,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
    loading,
    error,
  } = useProducts();

  // Cart count from context — used for the header badge
  const { totalItems } = useCart();

  return (
    <div className={styles.app}>
      {/* ── Header ───────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span>🛍️</span>
            <span>ShopReact</span>
          </div>

          {/* Cart toggle button with item-count badge */}
          <button
            className={styles.cartBtn}
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart — ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
          >
            <span className={styles.cartIcon}>🛒</span>
            <span>Cart</span>
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className={styles.main}>
        {/* Filter bar: category pills + sort dropdown */}
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />

        {/* Results count */}
        {!loading && !error && (
          <p className={styles.resultCount}>
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' ? ` in "${selectedCategory}"` : ''}
          </p>
        )}

        {/* Product grid */}
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          error={error}
        />
      </main>

      {/* ── Cart sidebar ──────────────────────────────────── */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </div>
  );
}

export default App;
