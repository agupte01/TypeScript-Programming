/**
 * main.tsx — Shopping Cart app entry point
 *
 * Wraps the entire app in CartProvider so every component
 * in the tree can access cart state via the useCart() hook.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { CartProvider } from './context/CartContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* CartProvider must wrap App so useCart() is available everywhere */}
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);
