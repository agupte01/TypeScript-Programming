/**
 * main.tsx — React application entry point
 *
 * Creates the React root and renders the App component.
 * React 18 uses createRoot() instead of the legacy ReactDOM.render().
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Mount React onto the #root div defined in index.html
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // StrictMode enables additional development-only checks and warnings
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
