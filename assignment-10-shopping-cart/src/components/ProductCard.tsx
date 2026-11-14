/**
 * ProductCard.tsx
 * ---------------
 * Displays a single product with price, rating, and Add to Cart button.
 * Reads cart state via useCart() to show "Added" badge when item is in cart.
 */

import { useCart } from '../context/CartContext';
import type { Product } from '../types/store.types';
import styles from './ProductCard.module.css';

interface ProductCardProps { product: Product; }

/** Renders 5 filled/empty star characters based on a 0–5 rating. */
function StarRating({ rate }: { rate: number }) {
  return (
    <span className={styles.stars} aria-label={`Rating: ${rate} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < Math.round(rate) ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem } = useCart();

  // Check if this product is already in the cart
  const cartItem = items.find(i => i.product.id === product.id);
  const inCart   = Boolean(cartItem);

  return (
    <article className={styles.card}>
      {/* Product image */}
      <div className={styles.imageWrapper}>
        <img
          className={styles.image}
          src={product.image}
          alt={product.title}
          loading="lazy"
        />
        {inCart && (
          <span className={styles.inCartBadge} aria-label="In cart">
            ✓ {cartItem!.quantity} in cart
          </span>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        {/* Category tag */}
        <span className={styles.category}>{product.category}</span>

        {/* Title — truncated to 2 lines */}
        <h3 className={styles.title}>{product.title}</h3>

        {/* Rating */}
        <div className={styles.ratingRow}>
          <StarRating rate={product.rating.rate} />
          <span className={styles.ratingCount}>({product.rating.count})</span>
        </div>

        {/* Price + Add to Cart */}
        <div className={styles.footer}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          <button
            className={`${styles.addBtn} ${inCart ? styles.addBtnAdded : ''}`}
            onClick={() => addItem(product)}
            aria-label={`Add ${product.title} to cart`}
          >
            {inCart ? '+ Add More' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
