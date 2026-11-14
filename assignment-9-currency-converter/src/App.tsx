/**
 * App.tsx — Currency Converter root component
 *
 * Uses the useConverter hook for all API and conversion logic.
 * Manages: amount, fromCurrency, toCurrency as controlled state.
 * Computes the conversion result with useMemo — updates in real time.
 */

import { useState, useEffect, useMemo } from 'react';
import { useConverter } from './hooks/useConverter';
import { CurrencySelector } from './components/CurrencySelector';
import { AmountInput } from './components/AmountInput';
import { ResultDisplay } from './components/ResultDisplay';
import './App.css';

function App() {
  // Controlled input state
  const [amount, setAmount]           = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency]   = useState<string>('EUR');

  // Custom hook: handles fetch, rates map, currencies list, convert function
  const { currencies, loadingState, error, loadRates, convert } = useConverter();

  // Load rates whenever the base (from) currency changes
  useEffect(() => {
    loadRates(fromCurrency);
  }, [fromCurrency, loadRates]);

  /**
   * useMemo computes the conversion result only when its inputs change.
   * This avoids redundant recalculation on every render.
   */
  const conversionResult = useMemo(
    () => convert(amount, fromCurrency, toCurrency),
    [amount, fromCurrency, toCurrency, convert]
  );

  /** Swaps the from and to currency codes. */
  function handleSwap(): void {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  const isLoading = loadingState === 'loading';

  return (
    <div className="page">
      <div className="card">
        {/* Header */}
        <div className="card-header">
          <h1 className="title">💱 Currency Converter</h1>
          <p className="subtitle">Live rates via Frankfurter · ECB data · No API key needed</p>
        </div>

        {/* Amount input */}
        <AmountInput
          value={amount}
          onChange={setAmount}
          disabled={isLoading}
        />

        {/* Currency selectors + swap button */}
        <div className="currency-row">
          <CurrencySelector
            label="From"
            value={fromCurrency}
            currencies={currencies.length > 0 ? currencies : [fromCurrency]}
            onChange={setFromCurrency}
            disabled={isLoading}
          />

          {/* Swap button */}
          <button
            className="swap-btn"
            onClick={handleSwap}
            disabled={isLoading}
            aria-label="Swap currencies"
            title="Swap currencies"
          >
            ⇄
          </button>

          <CurrencySelector
            label="To"
            value={toCurrency}
            currencies={currencies.length > 0 ? currencies : [toCurrency]}
            onChange={setToCurrency}
            disabled={isLoading}
          />
        </div>

        {/* Conversion result */}
        <ResultDisplay
          result={conversionResult}
          loadingState={loadingState}
          error={error}
        />
      </div>
    </div>
  );
}

export default App;
