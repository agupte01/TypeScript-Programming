/**
 * FilterBar.tsx
 * -------------
 * Category pills + sort dropdown for the product grid.
 * Purely presentational — all state lives in App via useProducts hook.
 */

import type { SortOption } from '../types/store.types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  categories:          string[];
  selectedCategory:    string;
  setSelectedCategory: (cat: string) => void;
  sortOption:          SortOption;
  setSortOption:       (opt: SortOption) => void;
}

/** Capitalises the first letter of a string for display. */
function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function FilterBar({
  categories,
  selectedCategory,
  setSelectedCategory,
  sortOption,
  setSortOption,
}: FilterBarProps) {
  return (
    <div className={styles.bar}>
      {/* Category pills */}
      <div className={styles.pills} role="group" aria-label="Filter by category">
        {/* "All" pill is always shown first */}
        <button
          className={`${styles.pill} ${selectedCategory === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('all')}
          aria-pressed={selectedCategory === 'all'}
        >
          All
        </button>

        {categories.map(cat => (
          <button
            key={cat}
            className={`${styles.pill} ${selectedCategory === cat ? styles.active : ''}`}
            onClick={() => setSelectedCategory(cat)}
            aria-pressed={selectedCategory === cat}
          >
            {capitalise(cat)}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className={styles.sortWrapper}>
        <label htmlFor="sort-select" className={styles.sortLabel}>Sort:</label>
        <select
          id="sort-select"
          className={styles.sortSelect}
          value={sortOption}
          onChange={e => setSortOption(e.target.value as SortOption)}
          aria-label="Sort products"
        >
          <option value="none">Default</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating-desc">Top Rated</option>
        </select>
      </div>
    </div>
  );
}
