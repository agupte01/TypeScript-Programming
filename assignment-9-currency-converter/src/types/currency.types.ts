/**
 * currency.types.ts
 * -----------------
 * All TypeScript interfaces and types for the Frankfurter API.
 *
 * Frankfurter is a free, open-source exchange-rate API backed by the
 * European Central Bank. No API key required.
 * Docs: https://www.frankfurter.app/docs
 */

/**
 * Full response from GET /latest?from={base}
 *
 * Note: the base currency itself is NOT included in `rates` — it is
 * always 1.0 by definition. The hook adds it manually before storing.
 *
 * @example
 *   // GET https://api.frankfurter.app/latest?from=USD
 *   {
 *     "amount": 1.0,
 *     "base": "USD",
 *     "date": "2024-01-15",
 *     "rates": { "EUR": 0.917, "GBP": 0.785, … }
 *   }
 */
export interface FrankfurterResponse {
  amount: number;                      // always 1.0 for "latest" requests
  base:   string;                      // ISO 4217 base currency code, e.g. "USD"
  date:   string;                      // "YYYY-MM-DD" of the rate data
  rates:  Record<string, number>;      // { EUR: 0.917, GBP: 0.785, … }
}

/** The computed result of a single conversion operation. */
export interface ConversionResult {
  from:        string;   // source currency code
  to:          string;   // target currency code
  amount:      number;   // the amount entered by the user
  result:      number;   // converted value
  rate:        number;   // the exchange rate applied
  lastUpdated: string;   // "YYYY-MM-DD" date string from the API
}

/** Tracks the async state of the rates fetch. */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * CurrencyCode is typed as string for flexibility.
 * Frankfurter supports ~33 major currencies (all ISO 4217 standard).
 * Using a branded string type keeps the API surface clean without
 * enumerating all 33 codes.
 */
export type CurrencyCode = string;
