/**
 * useConverter.ts
 * ---------------
 * Custom hook that manages all currency conversion state and logic.
 *
 * Demonstrates:
 *  - useCallback for stable fetch function reference
 *  - useMemo for derived currency list (sorted, memoized)
 *  - Generic-friendly typed state
 *
 * Frankfurter note: the base currency is absent from the `rates` map,
 * so we insert it manually with rate 1.0 before storing.
 */

import { useState, useCallback, useMemo } from 'react';
import { fetchRates } from '../api/exchange';
import type {
  FrankfurterResponse,
  ConversionResult,
  LoadingState,
  CurrencyCode,
} from '../types/currency.types';

/** Shape of the object returned by this hook. */
interface UseConverterResult {
  rates:        Record<string, number> | null;
  currencies:   CurrencyCode[];           // sorted list of all available codes
  lastUpdated:  string;
  loadingState: LoadingState;
  error:        string | null;
  loadRates:    (base: string) => Promise<void>;
  convert:      (amount: number, from: string, to: string) => ConversionResult | null;
}

/**
 * Manages exchange-rate fetching, currency list, and conversion logic.
 *
 * @returns Hook interface with state values, loadRates, and convert functions.
 *
 * @example
 *   const { currencies, loadRates, convert } = useConverter();
 *   await loadRates('USD');
 *   const result = convert(100, 'USD', 'EUR');
 */
export function useConverter(): UseConverterResult {
  /**
   * The flat exchange-rate map: { USD: 1, EUR: 0.917, GBP: 0.785, … }
   * The base currency is inserted with rate 1.0 so the convert formula
   * works uniformly without special-casing the base.
   */
  const [rates, setRates]               = useState<Record<string, number> | null>(null);
  const [lastUpdated, setLastUpdated]   = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError]               = useState<string | null>(null);

  /**
   * Sorted, memoized list of currency codes derived from the rates map.
   * useMemo avoids re-sorting on every render — only recalculates when
   * `rates` changes (i.e. when a new base currency is loaded).
   */
  const currencies = useMemo<CurrencyCode[]>(() => {
    if (!rates) return [];
    return Object.keys(rates).sort();
  }, [rates]);

  /**
   * Fetches exchange rates for the given base currency.
   * Wrapped in useCallback so it is stable across renders.
   *
   * @param base - ISO 4217 base currency code (e.g. "USD").
   */
  const loadRates = useCallback(async (base: string): Promise<void> => {
    setLoadingState('loading');
    setError(null);

    try {
      const data: FrankfurterResponse = await fetchRates(base);

      // Frankfurter omits the base from the rates map — add it explicitly
      // so that convert(x, 'USD', 'USD') returns x without special-casing.
      const allRates: Record<string, number> = {
        ...data.rates,
        [data.base]: 1.0,
      };

      setRates(allRates);
      setLastUpdated(data.date);   // "YYYY-MM-DD" string from the API
      setLoadingState('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch rates.';
      setError(msg);
      setLoadingState('error');
    }
  }, []); // no dependencies — fetchRates is a stable module import

  /**
   * Converts an amount from one currency to another using the cached rates.
   * Returns null if rates have not been loaded yet.
   *
   * Since all rates are relative to the stored base currency, and we've
   * inserted base = 1.0, the formula is simply:
   *   result = amount * (toRate / fromRate)
   *
   * @param amount - The numeric amount to convert.
   * @param from   - Source currency code (e.g. "USD").
   * @param to     - Target currency code (e.g. "EUR").
   * @returns ConversionResult or null if rates unavailable.
   */
  const convert = useCallback(
    (amount: number, from: string, to: string): ConversionResult | null => {
      if (!rates) return null;

      const fromRate = rates[from];
      const toRate   = rates[to];

      if (fromRate === undefined || toRate === undefined) return null;

      const rate   = toRate / fromRate;
      const result = amount * rate;

      return { from, to, amount, result, rate, lastUpdated };
    },
    [rates, lastUpdated]
  );

  return { rates, currencies, lastUpdated, loadingState, error, loadRates, convert };
}
