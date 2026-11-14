/**
 * exchange.ts
 * -----------
 * Typed fetch wrapper for the Frankfurter exchange-rate API.
 *
 * No API key required — Frankfurter is completely free and open-source.
 * Data source: European Central Bank (ECB), updated daily on weekdays.
 * Rate limit: none enforced (please be polite — it's a free service).
 *
 * Docs: https://www.frankfurter.app/docs
 * Source: https://github.com/hakanensari/frankfurter
 */

import type { FrankfurterResponse } from '../types/currency.types';

/** Frankfurter API base URL. */
const BASE = 'https://api.frankfurter.dev/v1';

/**
 * Fetches the latest exchange rates with the given currency as the base.
 *
 * The response includes ~33 major currencies. The base currency itself
 * is NOT in the `rates` map — the calling hook adds it with value 1.0.
 *
 * @param baseCurrency - ISO 4217 code to use as the base (e.g. "USD").
 * @returns            Typed FrankfurterResponse with a `rates` map.
 * @throws             Error on network failure or unsupported currency.
 *
 * @example
 *   const data = await fetchRates('USD');
 *   // data.rates.EUR → 0.917
 *   // data.date      → "2024-01-15"
 */
export async function fetchRates(baseCurrency: string): Promise<FrankfurterResponse> {
  const params = new URLSearchParams({ from: baseCurrency });
  const url    = `${BASE}/latest?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    // Frankfurter returns a plain-text error message for invalid currency codes
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Frankfurter API error (${response.status}): ${text}`);
  }

  return response.json() as Promise<FrankfurterResponse>;
}
