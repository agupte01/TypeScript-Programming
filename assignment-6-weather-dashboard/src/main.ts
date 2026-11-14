/**
 * main.ts — Weather Dashboard entry point
 *
 * Orchestrates user interactions:
 *  - Form submit → geocode city → fetch forecast → render.
 *  - Unit toggle → re-render stored data with the new unit (no extra API call).
 *  - Typed state management for lastLocation, lastForecast, and currentUnit.
 */

import { fetchWeatherForCity } from './api';
import {
  showLoading,
  showError,
  displayCurrentWeather,
  displayForecast,
} from './display';
import type { GeoLocation, ForecastResponse } from './types';

// ── DOM references ────────────────────────────────────────────────────────────
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const cityInput  = document.getElementById('city-input')  as HTMLInputElement;
const unitToggle = document.getElementById('unit-toggle') as HTMLButtonElement;

// ── Typed application state ───────────────────────────────────────────────────

/** Currently selected temperature unit. */
let currentUnit: 'C' | 'F' = 'C';

/**
 * Last successfully resolved location and forecast.
 * Stored so the unit toggle can re-render without a new API call.
 */
let lastLocation: GeoLocation     | null = null;
let lastForecast: ForecastResponse | null = null;

// ── Search handler ────────────────────────────────────────────────────────────

/**
 * Geocodes a city name then fetches its current conditions and forecast,
 * updating the UI with the results.
 *
 * @param city - City name entered by the user.
 */
async function handleSearch(city: string): Promise<void> {
  const trimmed = city.trim();
  if (!trimmed) return;

  showLoading(true);

  const result = await fetchWeatherForCity(trimmed);

  showLoading(false);

  if (!result.success) {
    showError(result.error);
    return;
  }

  // Cache for unit-toggle re-renders
  lastLocation = result.data.location;
  lastForecast = result.data.forecast;

  displayCurrentWeather(lastForecast.current, lastLocation, currentUnit);
  displayForecast(lastForecast.daily, currentUnit);
}

// ── Unit toggle handler ───────────────────────────────────────────────────────

/**
 * Flips the temperature unit between °C and °F and re-renders stored data.
 * Does NOT make a new API call.
 */
function handleUnitToggle(): void {
  currentUnit = currentUnit === 'C' ? 'F' : 'C';
  unitToggle.textContent = currentUnit === 'C' ? 'Switch to °F' : 'Switch to °C';

  if (lastForecast && lastLocation) {
    displayCurrentWeather(lastForecast.current, lastLocation, currentUnit);
    displayForecast(lastForecast.daily, currentUnit);
  }
}

// ── Event listeners ───────────────────────────────────────────────────────────

searchForm.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  handleSearch(cityInput.value);
});

unitToggle.addEventListener('click', handleUnitToggle);
