/**
 * types.ts
 * --------
 * Shared TypeScript interfaces and types for the Weather Dashboard app.
 * All types mirror the Open-Meteo API response shapes so that fetch
 * results can be safely cast without resorting to `any`.
 *
 * API docs: https://open-meteo.com/en/docs
 * Geocoding docs: https://open-meteo.com/en/docs/geocoding-api
 */

// ---------------------------------------------------------------------------
// Geocoding API types
// ---------------------------------------------------------------------------

/**
 * A single location result from the Open-Meteo Geocoding API.
 * The API may return multiple candidates; we always use the first.
 */
export interface GeoLocation {
  id:           number;
  name:         string;   // City name, e.g. "Vancouver"
  latitude:     number;
  longitude:    number;
  country:      string;   // Full country name, e.g. "Canada"
  country_code: string;   // ISO 3166-1 alpha-2, e.g. "CA"
  admin1?:      string;   // State / province, e.g. "British Columbia"
}

/** Full response from the geocoding endpoint. */
export interface GeocodingResponse {
  results?: GeoLocation[]; // undefined when no city matches
}

// ---------------------------------------------------------------------------
// Forecast API types
// ---------------------------------------------------------------------------

/**
 * Current-conditions block inside the forecast response.
 * Every field listed here was explicitly requested via the `current=` query
 * parameter, so they are guaranteed to be present.
 */
export interface CurrentWeather {
  time:                  string;  // ISO 8601 local time, e.g. "2024-01-15T12:00"
  temperature_2m:        number;  // °C (2 m above ground)
  relative_humidity_2m:  number;  // %
  apparent_temperature:  number;  // °C (feels-like)
  weather_code:          number;  // WMO weather interpretation code
  wind_speed_10m:        number;  // km/h (we request wind_speed_unit=kmh)
  surface_pressure:      number;  // hPa
}

/**
 * Daily forecast block inside the forecast response.
 * Arrays are parallel — index 0 is today, index 4 is five days from now.
 */
export interface DailyForecast {
  time:               string[];  // ["2024-01-15", "2024-01-16", ...]
  weather_code:       number[];  // WMO code for each day
  temperature_2m_max: number[];  // °C daily high
  temperature_2m_min: number[];  // °C daily low
}

/**
 * Full shape of a successful Open-Meteo forecast API response.
 * Only the fields we explicitly request are modelled here.
 */
export interface ForecastResponse {
  latitude:  number;
  longitude: number;
  timezone:  string;   // IANA timezone, e.g. "America/Vancouver"
  current:   CurrentWeather;
  daily:     DailyForecast;
}

// ---------------------------------------------------------------------------
// WMO weather-code lookup types
// ---------------------------------------------------------------------------

/** Human-readable description and emoji for a WMO weather code. */
export interface WmoCondition {
  description: string;  // e.g. "Light rain"
  emoji:       string;  // e.g. "🌧️"
}

// ---------------------------------------------------------------------------
// App-level result type
// ---------------------------------------------------------------------------

/**
 * Discriminated union wrapping every API call result.
 *
 * Usage:
 *   const result = await fetchWeather('Vancouver');
 *   if (result.success) {
 *     // result.data is ForecastResponse
 *   } else {
 *     // result.error is a string message
 *   }
 */
export type WeatherResult<T> =
  | { success: true;  data: T }
  | { success: false; error: string };
