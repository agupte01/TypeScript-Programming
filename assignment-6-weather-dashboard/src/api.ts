/**
 * api.ts
 * ------
 * Handles all communication with the Open-Meteo API suite.
 *
 * No API key required — Open-Meteo is completely free and open-source.
 * Docs: https://open-meteo.com/en/docs
 *
 * Endpoints used:
 *   GET https://geocoding-api.open-meteo.com/v1/search   — city name → lat/lon
 *   GET https://api.open-meteo.com/v1/forecast           — current + 5-day forecast
 */

import type {
  GeocodingResponse,
  GeoLocation,
  ForecastResponse,
  WeatherResult,
} from './types';

// ---------------------------------------------------------------------------
// Base URLs
// ---------------------------------------------------------------------------

const GEO_BASE      = 'https://geocoding-api.open-meteo.com/v1';
const FORECAST_BASE = 'https://api.open-meteo.com/v1';

// ---------------------------------------------------------------------------
// Generic fetch helper
// ---------------------------------------------------------------------------

/**
 * Typed fetch wrapper that always returns a WeatherResult<T> — never throws.
 *
 * @param url - Fully-formed URL to request.
 * @returns    WeatherResult whose `data` field is typed as T on success.
 */
async function apiFetch<T>(url: string): Promise<WeatherResult<T>> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const json = await response.json() as T;
    return { success: true, data: json };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unknown network error occurred.';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Geocoding
// ---------------------------------------------------------------------------

/**
 * Resolves a city name to its geographic coordinates.
 *
 * @param city - City name entered by the user (e.g. "Vancouver" or "Paris").
 * @returns     WeatherResult<GeoLocation> — the first/best-matching location.
 *
 * @example
 *   const result = await geocodeCity('Tokyo');
 *   if (result.success) console.log(result.data.latitude);
 */
export async function geocodeCity(city: string): Promise<WeatherResult<GeoLocation>> {
  const params = new URLSearchParams({
    name:     city.trim(),
    count:    '1',
    language: 'en',
    format:   'json',
  });

  const result = await apiFetch<GeocodingResponse>(`${GEO_BASE}/search?${params}`);

  if (!result.success) return result;

  if (!result.data.results || result.data.results.length === 0) {
    return { success: false, error: `City not found: "${city}". Please check the spelling.` };
  }

  return { success: true, data: result.data.results[0] };
}

// ---------------------------------------------------------------------------
// Forecast
// ---------------------------------------------------------------------------

/**
 * Fetches current conditions and a 5-day daily forecast for given coordinates.
 *
 * Current variables requested:
 *   temperature_2m, relative_humidity_2m, apparent_temperature,
 *   weather_code, wind_speed_10m, surface_pressure
 *
 * Daily variables requested:
 *   weather_code, temperature_2m_max, temperature_2m_min
 *
 * @param latitude  - Geographic latitude (from geocodeCity).
 * @param longitude - Geographic longitude (from geocodeCity).
 * @returns          WeatherResult<ForecastResponse>
 *
 * @example
 *   const result = await fetchForecast(49.25, -123.12);
 *   if (result.success) console.log(result.data.current.temperature_2m);
 */
export async function fetchForecast(
  latitude: number,
  longitude: number
): Promise<WeatherResult<ForecastResponse>> {
  const params = new URLSearchParams({
    latitude:        latitude.toString(),
    longitude:       longitude.toString(),
    current:         [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'surface_pressure',
    ].join(','),
    daily:           [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
    ].join(','),
    wind_speed_unit: 'kmh',
    timezone:        'auto',
    forecast_days:   '5',
  });

  return apiFetch<ForecastResponse>(`${FORECAST_BASE}/forecast?${params}`);
}

// ---------------------------------------------------------------------------
// Combined entry point
// ---------------------------------------------------------------------------

/**
 * Convenience wrapper: geocodes a city name and fetches its forecast in two
 * sequential requests (geocoding must complete first to get coordinates).
 *
 * Returns both the location info (for the city name display) and the full
 * forecast data in a single result object.
 *
 * @param city - City name as typed by the user.
 * @returns     WeatherResult<{ location: GeoLocation; forecast: ForecastResponse }>
 */
export async function fetchWeatherForCity(city: string): Promise<WeatherResult<{
  location: GeoLocation;
  forecast: ForecastResponse;
}>> {
  const geoResult = await geocodeCity(city);
  if (!geoResult.success) return geoResult;

  const forecastResult = await fetchForecast(geoResult.data.latitude, geoResult.data.longitude);
  if (!forecastResult.success) return forecastResult;

  return {
    success: true,
    data: {
      location: geoResult.data,
      forecast: forecastResult.data,
    },
  };
}
