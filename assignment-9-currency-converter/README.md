# Currency Converter (React + TypeScript)

Convert between ~30 major currencies using daily European Central Bank rates via the **Frankfurter API: free, open-source, no API key**. Runs right after `npm install`.

---

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Quick Start](#quick-start)
5. [Available Scripts](#available-scripts)
6. [Project Structure](#project-structure)
7. [Architecture & Data Flow](#architecture--data-flow)
8. [The Conversion Math](#the-conversion-math)
9. [Component & Hook Reference](#component--hook-reference)
10. [API Reference](#api-reference)
11. [TypeScript Concepts Demonstrated](#typescript-concepts-demonstrated)
12. [React Concepts Demonstrated](#react-concepts-demonstrated)
13. [Error Handling & States](#error-handling--states)
14. [Manual Test Checklist](#manual-test-checklist)
15. [Troubleshooting](#troubleshooting)
16. [Future Improvements](#future-improvements)
17. [Author & License](#author--license)

---

## Overview
Enter an amount, choose From and To currencies, and the result updates instantly. Swap currencies with one click. Rates are fetched whenever the *From* currency changes; typing an amount or changing *To* needs no network request.

## Tech Stack
React 18, TypeScript 5 (strict), Vite 5, plain CSS, Frankfurter API.

## Features
- ~30 currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF, ...)
- Real-time recalculation as you type
- Swap button (⇄)
- Shows the exchange rate (6 decimals) and the date the rates were published
- Loading, error and empty states; inputs disabled while loading

## Quick Start
Prerequisites: Node.js 18+, npm 9+.
```bash
cd assignment-9-currency-converter
npm install
npm run dev
```
Open http://localhost:5173. No key or `.env`.

## Available Scripts
`npm run dev` · `npm run build` (type-check + bundle) · `npm run preview`

## Project Structure
```
assignment-9-currency-converter/
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx / App.css           # State: amount, from, to ; layout
│   ├── api/exchange.ts             # fetchRates(base)
│   ├── hooks/useConverter.ts       # rates, currencies, loadRates, convert
│   ├── types/currency.types.ts     # FrankfurterResponse, ConversionResult, LoadingState
│   └── components/
│       ├── AmountInput.tsx
│       ├── CurrencySelector.tsx
│       └── ResultDisplay.tsx
├── vite.config.ts  tsconfig.json  package.json
```

## Architecture & Data Flow
```
App state: amount, fromCurrency, toCurrency
   │
   ├─ useEffect([fromCurrency]) → loadRates(from) → GET /latest?from=XXX
   │        └─ rates = { ...data.rates, [data.base]: 1 }  (base inserted manually)
   │
   └─ useMemo([amount, from, to, convert]) → conversionResult → <ResultDisplay/>
```
Swap sets `from ← to` and `to ← from`; the effect then refetches with the new base.

## The Conversion Math
Frankfurter omits the base currency from `rates`, so the hook adds `base: 1`. All rates are relative to that base, so for any pair:
```
rate   = rates[to] / rates[from]
result = amount × rate
```
Example with base USD (EUR 0.92): 100 USD → EUR = 100 × 0.92 / 1 = 92.

## Component & Hook Reference
| Unit | Role |
|---|---|
| `useConverter()` | Returns `{ rates, currencies, lastUpdated, loadingState, error, loadRates, convert }`; `currencies` is a memoised sorted list |
| `AmountInput` | Controlled numeric input |
| `CurrencySelector` | Labelled `<select>` of codes |
| `ResultDisplay` | Renders loading / error / empty / result |

## API Reference
Base `https://api.frankfurter.dev/v1`, no auth.

| Endpoint | Use |
|---|---|
| `GET /latest?from=USD` | All rates against USD; response `{ amount, base, date, rates }` |

Data comes from the ECB and updates once per working day (around 16:00 CET), so weekends show Friday's rates.

## TypeScript Concepts Demonstrated
`Record<string, number>` maps, interface for API response, hook return-type interface, `LoadingState` union, `type CurrencyCode = string` alias, `unknown` error narrowing, spread with computed keys `{ ...rates, [base]: 1 }`, generic `useState<Record<string, number> | null>`.

## React Concepts Demonstrated
Custom hook, `useEffect` dependencies, `useCallback` for stable function identity, `useMemo` for derived data, controlled inputs, lifting state, prop drilling of typed props.

## Error Handling & States
| State | UI |
|---|---|
| idle | "Enter an amount..." |
| loading | Spinner; inputs disabled |
| error | Red message with API/HTTP detail |
| success | Big result + rate + date |

## Manual Test Checklist
- [ ] 1 USD → EUR shows a plausible rate
- [ ] Type 250: result updates instantly, no request
- [ ] Change To: no request; change From: one request
- [ ] Swap flips both selectors
- [ ] Same currency both sides: result equals the amount
- [ ] Amount 0 and empty input do not crash
- [ ] Offline: red error, then recovers when online and you change From

## Troubleshooting
| Problem | Fix |
|---|---|
| Currency missing | Frankfurter supports only ECB-tracked currencies |
| 404 error | Unsupported base code |
| Rates look stale | ECB publishes only on working days |

## Future Improvements
Historical chart (`/2024-01-01..?from=`), favourites, `Intl.NumberFormat` currency formatting, offline cache, debounced amount input.

## Author & License
Your Name · SFU JavaScript & TypeScript Web Development · MIT
