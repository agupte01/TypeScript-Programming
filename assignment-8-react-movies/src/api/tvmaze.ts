/**
 * tvmaze.ts
 * ---------
 * Typed fetch wrappers for the TVMaze REST API.
 *
 * No API key required — TVMaze is completely free and open.
 * Rate limit: ~20 calls/10 seconds (generous for a UI app).
 * Docs: https://www.tvmaze.com/api
 */

import type {
  TVMazeSearchResult,
  TVShow,
  TVShowDetail,
} from '../types/movie.types';

/** TVMaze API base URL. */
const BASE = 'https://api.tvmaze.com';

// ---------------------------------------------------------------------------
// Generic fetch helper
// ---------------------------------------------------------------------------

/**
 * Typed fetch helper.
 * Throws an Error on network failure or a non-2xx HTTP status.
 *
 * @param path - Path to append to BASE, e.g. "/search/shows?q=batman".
 * @returns Parsed JSON cast to T.
 */
async function tvFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`);

  if (!response.ok) {
    throw new Error(`TVMaze API error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public functions
// ---------------------------------------------------------------------------

/**
 * Searches for shows matching a query string.
 *
 * @param query - Title search term entered by the user.
 * @returns Array of TVShow objects (unwrapped from the score wrapper).
 * @throws Error on network failure or API error.
 *
 * @example
 *   const shows = await searchShows('breaking bad');
 */
export async function searchShows(query: string): Promise<TVShow[]> {
  const params = new URLSearchParams({ q: query.trim() });
  const results = await tvFetch<TVMazeSearchResult[]>(`/search/shows?${params}`);
  return results.map(r => r.show);
}

/**
 * Fetches full detail for a single show by its TVMaze numeric ID.
 * Embeds the cast list in a single request with `?embed=cast`.
 *
 * @param id - TVMaze show ID (numeric).
 * @returns Full TVShowDetail object including embedded cast.
 * @throws Error if the ID is not found.
 *
 * @example
 *   const detail = await getShowDetails(82); // Game of Thrones
 */
export async function getShowDetails(id: number): Promise<TVShowDetail> {
  return tvFetch<TVShowDetail>(`/shows/${id}?embed=cast`);
}
