/**
 * SearchBar.tsx
 * -------------
 * Controlled search input component.
 *
 * Props are explicitly typed — the parent (App) passes the onSearch callback
 * and the loading flag down as props, keeping this component purely presentational.
 */

import { useState, type FormEvent } from 'react';
import styles from './SearchBar.module.css';

/** Typed props interface for SearchBar. */
interface SearchBarProps {
  /** Called with the trimmed query string when the user submits. */
  onSearch:  (query: string) => void;
  /** When true, disables the input and button to prevent duplicate submissions. */
  isLoading: boolean;
}

/**
 * SearchBar renders a controlled text input and submit button.
 * The local `query` state is an internal concern — the parent only
 * receives the final value via onSearch on form submit.
 *
 * @param props - { onSearch, isLoading }
 */
export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  // Local controlled state for the input value
  const [query, setQuery] = useState<string>('');

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search" noValidate>
      <label htmlFor="movie-search" className={styles.srOnly}>
        Search for a movie or series
      </label>

      <input
        id="movie-search"
        type="search"
        className={styles.input}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search movies, series, episodes…"
        disabled={isLoading}
        autoComplete="off"
        spellCheck={false}
        aria-label="Movie search input"
      />

      <button
        type="submit"
        className={styles.button}
        disabled={isLoading || query.trim().length === 0}
        aria-label="Search"
      >
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}
