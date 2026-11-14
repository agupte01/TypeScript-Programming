/**
 * App.tsx
 * -------
 * Root component for the CineSearch React + TypeScript Show Finder.
 *
 * Responsibilities:
 *  - Renders SearchBar, the show grid, and the ShowDetail modal.
 *  - Uses the useMovieSearch hook for all fetch state.
 *  - Manages which show detail modal is open via selectedShowId state.
 *
 * API: TVMaze (https://www.tvmaze.com/api) — no API key required.
 */

import { useState } from 'react';
import { useMovieSearch } from './hooks/useMovieSearch';
import { SearchBar }    from './components/SearchBar';
import { MovieCard }    from './components/MovieCard';
import { MovieDetail }  from './components/MovieDetail';
import styles from './App.module.css';

/**
 * App is the top-level component — it owns application-level state
 * (which modal is open) and delegates everything else to the hook and children.
 */
function App() {
  // Custom hook: encapsulates all search state and the search function
  const { results, status, error, search } = useMovieSearch();

  // null = no modal open; number = TVMaze show ID of the modal to open
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);

  return (
    <div className={styles.app}>
      {/* ── Header ───────────────────────────────────────── */}
      <header className={styles.header}>
        <h1 className={styles.logo}>🎬 CineSearch</h1>
        <p className={styles.tagline}>Search thousands of TV shows — powered by TVMaze, no API key needed</p>
        {/* SearchBar receives a typed onSearch callback and the loading flag */}
        <SearchBar onSearch={search} isLoading={status === 'loading'} />
      </header>

      {/* ── Main content ──────────────────────────────────── */}
      <main className={styles.main}>

        {/* Loading state */}
        {status === 'loading' && (
          <div className={styles.loadingState} aria-live="polite" role="status">
            <div className={styles.spinner} aria-hidden="true" />
            <p>Searching…</p>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && error && (
          <div className={styles.errorState} role="alert">
            <p>⚠️ {error}</p>
          </div>
        )}

        {/* Idle state — shown before any search */}
        {status === 'idle' && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📺</div>
            <h2>Find Your Next Show</h2>
            <p>Type a title above to search thousands of TV shows and series.</p>
          </div>
        )}

        {/* No results */}
        {status === 'success' && results.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h2>No Results Found</h2>
            <p>Try a different title or check your spelling.</p>
          </div>
        )}

        {/* Results grid — MovieCard components */}
        {status === 'success' && results.length > 0 && (
          <>
            <p className={styles.resultsCount}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>
            <section className={styles.grid} aria-label="Search results">
              {results.map(show => (
                <MovieCard
                  key={show.id}
                  movie={show}
                  onClick={setSelectedShowId}
                />
              ))}
            </section>
          </>
        )}
      </main>

      {/* ── Modal — rendered at App level so it sits above everything ── */}
      {selectedShowId !== null && (
        <MovieDetail
          id={selectedShowId}
          onClose={() => setSelectedShowId(null)}
        />
      )}
    </div>
  );
}

export default App;
