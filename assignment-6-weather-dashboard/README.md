# Weather Dashboard

A fully typed TypeScript weather dashboard. Search any city in the world and get current conditions plus a 5-day forecast. **No API key, no sign-up, no configuration**: it runs straight after `npm install`.

---

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Quick Start](#quick-start)
5. [Available Scripts](#available-scripts)
6. [Project Structure](#project-structure)
7. [Architecture & Data Flow](#architecture--data-flow)
8. [Module-by-Module Walkthrough](#module-by-module-walkthrough)
9. [API Reference (Open-Meteo)](#api-reference-open-meteo)
10. [WMO Weather Code Table](#wmo-weather-code-table)
11. [TypeScript Concepts Demonstrated](#typescript-concepts-demonstrated)
12. [Error Handling](#error-handling)
13. [Accessibility](#accessibility)
14. [Manual Test Checklist](#manual-test-checklist)
15. [Troubleshooting](#troubleshooting)
16. [Future Improvements](#future-improvements)
17. [Author & License](#author--license)

---

## Overview
The app turns a city name into weather data in two steps:
1. **Geocode**: the Open-Meteo Geocoding API converts "Vancouver" into latitude/longitude.
2. **Forecast**: the Open-Meteo Forecast API returns current conditions and daily data for those coordinates.

Everything is typed end-to-end. Every API response has an interface, every function has typed parameters and return values, and success/failure is modelled with a discriminated union rather than exceptions or `any`.

## Tech Stack
| Tool | Purpose |
|---|---|
| TypeScript 5 (strict) | Language; no `any` anywhere |
| Vite 5 | Dev server and production bundler |
| HTML5 / CSS3 | Markup and glassmorphism styling (CSS variables, grid, flexbox) |
| Open-Meteo APIs | Free geocoding + weather data, **no key required** |

## Features
- Search any city worldwide (with state/province and country shown)
- Current temperature, feels-like, humidity, wind speed (km/h), surface pressure
- Emoji weather icons derived from WMO weather codes (no image CDN dependency)
- 5-day forecast cards with daily high and low
- °C / °F toggle that re-renders cached data instantly, with **no extra network request**
- Loading spinner, friendly error banner, disabled toggle until data exists
- Responsive layout (down to ~320px)
- Never throws: all network failures are returned as typed results

## Quick Start
**Prerequisites:** Node.js 18+ and npm 9+.

```bash
cd assignment-6-weather-dashboard
npm install
npm run dev
```
Open the URL Vite prints (normally http://localhost:5173) and search for a city, e.g. `Vancouver`, `Tokyo`, `Paris`.

No `.env` file, API key or account is needed.

## Available Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type-check with `tsc`, then produce an optimised bundle in `dist/` |
| `npm run preview` | Serve the production build locally |

## Project Structure
```
assignment-6-weather-dashboard/
├── index.html        # Page skeleton: search form, unit toggle, weather card, forecast row
├── style.css         # Blue gradient theme, glass cards, responsive rules
├── src/
│   ├── types.ts      # All interfaces: GeoLocation, ForecastResponse, WeatherResult<T>, ...
│   ├── api.ts        # geocodeCity, fetchForecast, fetchWeatherForCity (typed fetch)
│   ├── display.ts    # DOM rendering, WMO lookup table, temperature formatting
│   └── main.ts       # Event wiring and application state
├── tsconfig.json     # Strict compiler options
├── package.json
└── README.md
```

## Architecture & Data Flow
```
 user types "Vancouver" + submit
            │
            ▼
        main.ts  handleSearch()
            │  showLoading(true)
            ▼
        api.ts   fetchWeatherForCity()
            │   1) geocodeCity()  ──► geocoding-api.open-meteo.com
            │         └─ no results? → { success:false, error:"City not found" }
            │   2) fetchForecast(lat, lon) ──► api.open-meteo.com
            ▼
   WeatherResult<{location, forecast}>
            │
   success? ├─ no  → display.showError(message)
            └─ yes → cache in lastLocation / lastForecast
                     display.displayCurrentWeather()
                     display.displayForecast()

 user clicks "Switch to °F"
            │
            ▼
   main.ts handleUnitToggle(): flips currentUnit, re-renders from cache (0 requests)
```
Separation of concerns: `api.ts` knows nothing about the DOM; `display.ts` knows nothing about `fetch`; `main.ts` is the only module that holds state.

## Module-by-Module Walkthrough

### `types.ts`
- `GeoLocation`, `GeocodingResponse`: shape of geocoding results (`results` is optional because the API omits it when nothing matches).
- `CurrentWeather`, `DailyForecast`, `ForecastResponse`: the forecast response. Daily data arrives as **parallel arrays** (index *i* of each array describes day *i*).
- `WmoCondition`: `{ description, emoji }` for a weather code.
- `WeatherResult<T>`: discriminated union `{success:true,data:T} | {success:false,error:string}`.

### `api.ts`
- `apiFetch<T>(url)`: generic wrapper; catches network errors, checks `response.ok`, returns `WeatherResult<T>`.
- `geocodeCity(city)`: calls `/v1/search?name=…&count=1`; converts "no results" into a friendly error.
- `fetchForecast(lat, lon)`: requests exactly the variables the UI needs (`temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `weather_code`, `wind_speed_10m`, `surface_pressure`, plus daily `weather_code`, max/min temperature), with `wind_speed_unit=kmh`, `timezone=auto`, `forecast_days=5`.
- `fetchWeatherForCity(city)`: chains both calls; short-circuits on the first failure.
- Query strings are built with `URLSearchParams`, which encodes spaces and special characters safely.

### `display.ts`
- DOM references are looked up once at module load.
- `WMO_CONDITIONS` lookup table and `getWmoCondition(code)` with a safe fallback.
- `celsiusToFahrenheit`, `formatTemp(celsius, unit)`.
- `showLoading`, `showError`, `displayCurrentWeather`, `displayForecast`.
- Forecast dates are parsed as `YYYY-MM-DDT12:00:00` (noon) to avoid off-by-one-day errors from timezone/DST shifts.

### `main.ts`
Holds `currentUnit`, `lastLocation`, `lastForecast`. Registers the submit and toggle listeners.

## API Reference (Open-Meteo)
No authentication. Free for non-commercial use. Docs: https://open-meteo.com/en/docs

| Endpoint | Purpose |
|---|---|
| `GET https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json` | City name to coordinates |
| `GET https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current=..&daily=..&timezone=auto&forecast_days=5&wind_speed_unit=kmh` | Current + daily weather |

Example geocoding response (trimmed):
```json
{ "results": [{ "name": "Vancouver", "latitude": 49.24966, "longitude": -123.11934,
                "country": "Canada", "country_code": "CA", "admin1": "British Columbia" }] }
```
Example forecast response (trimmed):
```json
{ "timezone": "America/Vancouver",
  "current": { "temperature_2m": 8.5, "relative_humidity_2m": 82, "apparent_temperature": 6.2,
               "weather_code": 61, "wind_speed_10m": 15.2, "surface_pressure": 1015.2 },
  "daily": { "time": ["2026-01-15", "..."], "weather_code": [61, "..."],
             "temperature_2m_max": [10.2, "..."], "temperature_2m_min": [5.1, "..."] } }
```

## WMO Weather Code Table
| Code | Meaning | Icon |
|---|---|---|
| 0 | Clear sky | ☀️ |
| 1 / 2 / 3 | Mainly clear / Partly cloudy / Overcast | 🌤️ ⛅ ☁️ |
| 45 / 48 | Fog / Icy fog | 🌫️ |
| 51–57 | Drizzle (incl. freezing) | 🌦️ 🌧️ 🌨️ |
| 61–67 | Rain (incl. freezing) | 🌧️ 🌨️ |
| 71–77 | Snow | ❄️ 🌨️ |
| 80–82 | Rain showers | 🌦️ ⛈️ |
| 85–86 | Snow showers | 🌨️ |
| 95–99 | Thunderstorm (with hail) | ⛈️ |

## TypeScript Concepts Demonstrated
- **Interfaces for external data**: modelling a third-party JSON shape field by field.
- **Discriminated unions**: `WeatherResult<T>` forces callers to check `success` before touching `data`.
```ts
const r = await fetchWeatherForCity('Oslo');
if (r.success) r.data.forecast.current.temperature_2m; // OK
else r.error;                                          // OK; r.data would be a compile error
```
- **Generics**: `apiFetch<T>` returns `WeatherResult<T>` for any response type.
- **Literal union types**: `'C' | 'F'` for units.
- **`Record<number, WmoCondition>`**: typed lookup table, with `??` fallback for unknown keys.
- **Type narrowing**: `unknown` caught errors narrowed with `instanceof Error`.
- **`import type`**: type-only imports erased at compile time.
- **Optional chaining / nullish coalescing**: safe access of `results?`, `admin1?`.
- **Module separation**: types / api / display / main.

## Error Handling
| Situation | Result |
|---|---|
| Empty input | Ignored silently |
| City not found | "City not found: "xyz". Please check the spelling." |
| HTTP error | "HTTP 500: ..." in the red banner |
| Offline / DNS failure | The browser's network error message in the banner |
| Success after an error | Banner hides, cards render |

## Accessibility
Loading uses `role="status"` + `aria-live="polite"`; errors use `role="alert"`; the input has an `aria-label`; decorative emoji are `aria-hidden`; all controls are keyboard reachable.

## Manual Test Checklist
- [ ] `Vancouver` shows current card and 5 forecast cards
- [ ] Toggle to °F: all numbers change, DevTools Network tab shows **no** new request
- [ ] `asdkjhqwe` shows the "City not found" banner
- [ ] Empty submit does nothing
- [ ] Search a second city after an error: error clears
- [ ] DevTools offline mode shows an error banner, not a crash
- [ ] Resize to 320px: layout stays usable
- [ ] `npm run build` completes with no type errors

## Troubleshooting
| Problem | Fix |
|---|---|
| `vite: command not found` | Run `npm install` first |
| Blank page | Check the console; make sure `index.html` loads `/src/main.ts` |
| "Failed to fetch" | You are offline or a network filter blocks `open-meteo.com` |
| Wrong city picked | The geocoder returns the top match; add a region, e.g. `Paris, Texas` may need the plain name `Paris` (future work: result picker) |

## Future Improvements
- Let users pick among multiple geocoding matches
- `navigator.geolocation` "use my location" button
- Hourly forecast chart; remember last city in `localStorage`
- Weather-based background themes

## Author & License
Your Name · SFU JavaScript & TypeScript Web Development · MIT License
