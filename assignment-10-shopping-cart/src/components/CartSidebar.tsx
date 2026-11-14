/**
 * CartSidebar.tsx
 * ---------------
 * Slide-in cart sidebar showing all cart items, subtotal, and checkout.
 * Reads cart state via useCart() context hook.
 */

import { useCart } from '../context/CartContext';
import { CartItem } from './CartItem';
import styles from './CartSidebar.module.css';

interface CartSidebarProps {
  isOpen:  boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, totalItems, totalPrice, clearCart } = useCart();

  /** Simulates a checkout — in a real app this would navigate to a checkout page. */
  function handleCheckout(): void {
    if (items.length === 0) return;
    alert(`✅ Order placed!\n\n${totalItems} item(s) for $${totalPrice}\n\nThank you for shopping!`);
    clearCart();
    onClose();
  }

  return (
    <>
      {/* Backdrop — click to close */}
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.heading}>
            Your Cart
            {totalItems > 0 && (
              <span className={styles.count}>{totalItems}</span>
            )}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">×</button>
        </div>

        {/* Items list */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyIcon}>🛒</p>
              <p>Your cart is empty.</p>
              <p className={styles.emptyHint}>Browse products and click "Add to Cart"!</p>
            </div>
          ) : (
            <ul className={styles.itemsList} aria-label="Cart items">
              {items.map(item => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {/* Footer — subtotal + actions */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
              <span className={styles.subtotalPrice}>${totalPrice}</span>
            </div>

            <button
              className={styles.checkoutBtn}
              onClick={handleCheckout}
            >
              Checkout →
            </button>

            <button
              className={styles.clearBtn}
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
