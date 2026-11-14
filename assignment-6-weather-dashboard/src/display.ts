/**
 * display.ts
 * ----------
 * All DOM-manipulation functions for the Weather Dashboard.
 * This module is intentionally free of fetch logic — it only
 * reads typed data objects and writes to the DOM.
 *
 * Temperature: Open-Meteo returns °C. We convert to °F in the UI layer.
 * Weather icons: WMO codes are mapped to emoji + descriptions (no CDN needed).
 */

import type { CurrentWeather, DailyForecast, GeoLocation, WmoCondition } from './types';

// ---------------------------------------------------------------------------
// DOM element references
// ---------------------------------------------------------------------------

const loadingEl       = document.getElementById('loading')          as HTMLElement;
const errorEl         = document.getElementById('error-message')    as HTMLElement;
const errorTextEl     = document.getElementById('error-text')       as HTMLElement;
const currentSection  = document.getElementById('current-weather')  as HTMLElement;
const forecastSection = document.getElementById('forecast-section') as HTMLElement;
const forecastRow     = document.getElementById('forecast-row')     as HTMLElement;
const unitToggle      = document.getElementById('unit-toggle')      as HTMLButtonElement;

// Current weather fields
const cityNameEl  = document.getElementById('city-name')           as HTMLElement;
const descEl      = document.getElementById('weather-description') as HTMLElement;
const iconEl      = document.getElementById('weather-icon')        as HTMLElement;
const tempEl      = document.getElementById('temperature')         as HTMLElement;
const feelsEl     = document.getElementById('feels-like')          as HTMLElement;
const humidityEl  = document.getElementById('humidity')            as HTMLElement;
const windEl      = document.getElementById('wind-speed')          as HTMLElement;
const pressureEl  = document.getElementById('pressure')            as HTMLElement;

// ---------------------------------------------------------------------------
// WMO weather-code lookup table
// ---------------------------------------------------------------------------

/**
 * Maps WMO weather interpretation codes to human-readable descriptions and emoji.
 * Full code list: https://open-meteo.com/en/docs#weathervariables
 */
const WMO_CONDITIONS: Record<number, WmoCondition> = {
  0:  { description: 'Clear sky',                emoji: '☀️'  },
  1:  { description: 'Mainly clear',             emoji: '🌤️' },
  2:  { description: 'Partly cloudy',            emoji: '⛅'  },
  3:  { description: 'Overcast',                 emoji: '☁️'  },
  45: { description: 'Fog',                      emoji: '🌫️' },
  48: { description: 'Icy fog',                  emoji: '🌫️' },
  51: { description: 'Light drizzle',            emoji: '🌦️' },
  53: { description: 'Moderate drizzle',         emoji: '🌦️' },
  55: { description: 'Dense drizzle',            emoji: '🌧️' },
  56: { description: 'Light freezing drizzle',   emoji: '🌨️' },
  57: { description: 'Heavy freezing drizzle',   emoji: '🌨️' },
  61: { description: 'Slight rain',              emoji: '🌧️' },
  63: { description: 'Moderate rain',            emoji: '🌧️' },
  65: { description: 'Heavy rain',               emoji: '🌧️' },
  66: { description: 'Light freezing rain',      emoji: '🌨️' },
  67: { description: 'Heavy freezing rain',      emoji: '🌨️' },
  71: { description: 'Slight snowfall',          emoji: '❄️'  },
  73: { description: 'Moderate snowfall',        emoji: '❄️'  },
  75: { description: 'Heavy snowfall',           emoji: '❄️'  },
  77: { description: 'Snow grains',              emoji: '🌨️' },
  80: { description: 'Slight rain showers',      emoji: '🌦️' },
  81: { description: 'Moderate rain showers',    emoji: '🌦️' },
  82: { description: 'Violent rain showers',     emoji: '⛈️'  },
  85: { description: 'Slight snow showers',      emoji: '🌨️' },
  86: { description: 'Heavy snow showers',       emoji: '🌨️' },
  95: { description: 'Thunderstorm',             emoji: '⛈️'  },
  96: { description: 'Thunderstorm with hail',   emoji: '⛈️'  },
  99: { description: 'Thunderstorm, heavy hail', emoji: '⛈️'  },
};

/**
 * Returns the WMO condition for a given code.
 * Falls back gracefully if the code is unrecognised.
 */
export function getWmoCondition(code: number): WmoCondition {
  return WMO_CONDITIONS[code] ?? { description: 'Unknown', emoji: '🌡️' };
}

// ---------------------------------------------------------------------------
// Temperature helpers
// ---------------------------------------------------------------------------

/** Converts Celsius to Fahrenheit, rounded to one decimal place. */
export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9 / 5 + 32) * 10) / 10;
}

/**
 * Formats a Celsius temperature as a display string with the correct unit symbol.
 *
 * @param celsius - Temperature in °C (as returned by Open-Meteo).
 * @param unit    - 'C' for Celsius, 'F' for Fahrenheit.
 * @returns Formatted string, e.g. "18.4°C" or "65.1°F".
 */
export function formatTemp(celsius: number, unit: 'C' | 'F'): string {
  const value = unit === 'C' ? Math.round(celsius * 10) / 10 : celsiusToFahrenheit(celsius);
  return `${value}°${unit}`;
}

// ---------------------------------------------------------------------------
// Loading / error state
// ---------------------------------------------------------------------------

/** Shows or hides the loading spinner and clears weather sections while loading. */
export function showLoading(show: boolean): void {
  if (show) {
    loadingEl.removeAttribute('hidden');
    errorEl.setAttribute('hidden', '');
  } else {
    loadingEl.setAttribute('hidden', '');
  }
}

/** Displays an error message and hides the weather sections. */
export function showError(message: string): void {
  showLoading(false);
  errorTextEl.textContent = message;
  errorEl.removeAttribute('hidden');
  currentSection.setAttribute('hidden', '');
  forecastSection.setAttribute('hidden', '');
}

// ---------------------------------------------------------------------------
// Current weather
// ---------------------------------------------------------------------------

/**
 * Populates the current-weather card with the API data.
 *
 * @param current  - Typed CurrentWeather object from the forecast response.
 * @param location - GeoLocation with the resolved city name and country.
 * @param unit     - Temperature unit to display ('C' or 'F').
 */
export function displayCurrentWeather(
  current:  CurrentWeather,
  location: GeoLocation,
  unit:     'C' | 'F'
): void {
  // City name + country code (and state if available)
  const region = location.admin1 ? `${location.admin1}, ` : '';
  cityNameEl.textContent = `${location.name}, ${region}${location.country_code}`;

  // WMO condition — emoji and description
  const condition = getWmoCondition(current.weather_code);
  iconEl.textContent   = condition.emoji;
  descEl.textContent   = condition.description;

  // Temperature
  tempEl.textContent  = formatTemp(current.temperature_2m, unit);
  feelsEl.textContent = `Feels like ${formatTemp(current.apparent_temperature, unit)}`;

  // Stats
  humidityEl.textContent = `${current.relative_humidity_2m}%`;
  windEl.textContent     = `${Math.round(current.wind_speed_10m)} km/h`;
  pressureEl.textContent = `${Math.round(current.surface_pressure)} hPa`;

  // Reveal section
  currentSection.removeAttribute('hidden');
  errorEl.setAttribute('hidden', '');

  // Enable unit toggle now that data is loaded
  unitToggle.disabled    = false;
  unitToggle.textContent = unit === 'C' ? 'Switch to °F' : 'Switch to °C';
}

// ---------------------------------------------------------------------------
// 5-day forecast
// ---------------------------------------------------------------------------

/**
 * Renders daily forecast cards into the forecast row.
 *
 * The daily arrays from Open-Meteo are parallel (same index = same day).
 * We skip index 0 (today) and show the next 5 days.
 *
 * @param daily - Typed DailyForecast object from the forecast response.
 * @param unit  - Temperature unit to display.
 */
export function displayForecast(daily: DailyForecast, unit: 'C' | 'F'): void {
  forecastRow.innerHTML = '';

  // Show up to 5 days starting from index 0 (today through day 4)
  const count = Math.min(daily.time.length, 5);

  for (let i = 0; i < count; i++) {
    const date      = new Date(daily.time[i] + 'T12:00:00'); // noon avoids DST edge cases
    const dayName   = i === 0
      ? 'Today'
      : date.toLocaleDateString('en-US', { weekday: 'short' });
    const condition = getWmoCondition(daily.weather_code[i]);
    const hi        = formatTemp(daily.temperature_2m_max[i], unit);
    const lo        = formatTemp(daily.temperature_2m_min[i], unit);

    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <span class="forecast-day">${dayName}</span>
      <span class="forecast-icon">${condition.emoji}</span>
      <span class="forecast-hi">${hi}</span>
      <span class="forecast-lo">${lo}</span>
      <span class="forecast-desc">${condition.description}</span>
    `;

    forecastRow.appendChild(card);
  }

  forecastSection.removeAttribute('hidden');
}
