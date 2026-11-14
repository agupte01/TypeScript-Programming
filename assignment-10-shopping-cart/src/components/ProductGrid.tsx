/**
 * ProductGrid.tsx
 * ---------------
 * Responsive grid of ProductCards with loading skeleton and error states.
 */

import { ProductCard } from './ProductCard';
import type { Product } from '../types/store.types';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: Product[];
  loading:  boolean;
  error:    string | null;
}

export function ProductGrid({ products, loading, error }: ProductGridProps) {
  // Loading: show 8 skeleton cards
  if (loading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={styles.skeleton}>
            <div className={styles.skeletonImg} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.short}`} />
              <div className={styles.skeletonLine} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No products match the current filters.</p>
      </div>
    );
  }

  return (
    <section className={styles.grid} aria-label="Products">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}
