/**
 * CartItem.tsx
 * ------------
 * A single item row inside the cart sidebar.
 * Shows product thumbnail, title, price, quantity controls, and remove button.
 */

import { useCart } from '../context/CartContext';
import type { CartItem as CartItemType } from '../types/store.types';
import styles from './CartItem.module.css';

interface CartItemProps { item: CartItemType; }

export function CartItem({ item }: CartItemProps) {
  const { incrementItem, decrementItem, removeItem } = useCart();
  const { product, quantity } = item;
  const lineTotal = (product.price * quantity).toFixed(2);

  return (
    <li className={styles.item}>
      {/* Small product thumbnail */}
      <div className={styles.imgWrapper}>
        <img
          className={styles.img}
          src={product.image}
          alt={product.title}
          loading="lazy"
        />
      </div>

      {/* Info column */}
      <div className={styles.info}>
        <p className={styles.title}>{product.title}</p>
        <p className={styles.price}>${product.price.toFixed(2)} each</p>

        {/* Quantity controls */}
        <div className={styles.qtyRow}>
          <button
            className={styles.qtyBtn}
            onClick={() => decrementItem(product.id)}
            aria-label="Decrease quantity"
          >−</button>

          <span className={styles.qty} aria-label={`Quantity: ${quantity}`}>
            {quantity}
          </span>

          <button
            className={styles.qtyBtn}
            onClick={() => incrementItem(product.id)}
            aria-label="Increase quantity"
          >+</button>

          <span className={styles.lineTotal}>${lineTotal}</span>
        </div>
      </div>

      {/* Remove button */}
      <button
        className={styles.removeBtn}
        onClick={() => removeItem(product.id)}
        aria-label={`Remove ${product.title} from cart`}
        title="Remove"
      >×</button>
    </li>
  );
}
