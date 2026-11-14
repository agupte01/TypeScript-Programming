/**
 * useMovieSearch.ts
 * -----------------
 * Custom hook that encapsulates all show-search state and logic.
 *
 * By extracting fetch logic into a hook we keep components clean —
 * they only receive data and callbacks, never raw fetch calls.
 * This is the React/TypeScript equivalent of the api.js + state pattern
 * used in the vanilla JS assignments.
 */

import { useState, useCallback } from 'react';
import { searchShows } from '../api/tvmaze';
import type { TVShow, SearchState } from '../types/movie.types';

/** The typed shape returned by this hook. */
interface UseMovieSearchResult {
  results: TVShow[];
  status:  SearchState;
  error:   string | null;
  search:  (query: string) => Promise<void>;
}

/**
 * Manages show search state: results, loading status, and errors.
 *
 * @returns { results, status, error, search }
 *
 * @example
 *   const { results, status, error, search } = useMovieSearch();
 *   // Call search('Seinfeld') to trigger a fetch
 */
export function useMovieSearch(): UseMovieSearchResult {
  // The list of shows from the search endpoint
  const [results, setResults] = useState<TVShow[]>([]);

  // Tracks the lifecycle of the search: idle → loading → success | error
  const [status, setStatus] = useState<SearchState>('idle');

  // Human-readable error message (null when not in error state)
  const [error, setError] = useState<string | null>(null);

  /**
   * Executes a show search and updates state.
   * Wrapped in useCallback so child components receiving it as a prop
   * won't re-render unnecessarily.
   *
   * @param query - Search term entered by the user.
   */
  const search = useCallback(async (query: string): Promise<void> => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Transition to loading state — clear previous results and errors
    setStatus('loading');
    setError(null);
    setResults([]);

    try {
      const shows = await searchShows(trimmed);
      setResults(shows);
      setStatus('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
      setStatus('error');
    }
  }, []); // no dependencies — searchShows is a stable import

  return { results, status, error, search };
}
