/**
 * movie.types.ts
 * --------------
 * All TypeScript interfaces and types for the TVMaze API responses.
 * Using explicit interfaces instead of `any` makes every API call
 * type-safe from fetch to render.
 *
 * TVMaze API docs: https://www.tvmaze.com/api
 * No API key required — completely free and open.
 */

// ---------------------------------------------------------------------------
// Search endpoint types  (GET /search/shows?q={query})
// ---------------------------------------------------------------------------

/** Rating object embedded in TVMaze show responses. */
export interface TVMazeRating {
  average: number | null; // null when no ratings yet
}

/** Image URLs for a show's artwork. */
export interface TVMazeImage {
  medium:   string; // ~210×295 jpg
  original: string; // full resolution
}

/** Network or streaming service the show airs on. */
export interface TVMazeNetwork {
  name:    string;
  country: { name: string; code: string } | null;
}

/**
 * A brief show object returned inside every search result.
 * Contains the subset of fields we need for the card grid.
 */
export interface TVShow {
  id:          number;
  name:        string;
  type:        string;          // "Scripted" | "Reality" | "Animation" | …
  genres:      string[];
  status:      string;          // "Running" | "Ended" | "To Be Determined" | …
  premiered:   string | null;   // "2011-04-17" or null
  ended:       string | null;
  rating:      TVMazeRating;
  image:       TVMazeImage | null;
  summary:     string | null;   // HTML string (contains <p> tags)
  network:     TVMazeNetwork | null;
}

/**
 * A single entry in the array returned by the search endpoint.
 * TVMaze wraps each result with a relevance score.
 */
export interface TVMazeSearchResult {
  score: number;
  show:  TVShow;
}

// ---------------------------------------------------------------------------
// Detail endpoint types  (GET /shows/{id}?embed=cast)
// ---------------------------------------------------------------------------

/** A single cast member from the ?embed=cast response. */
export interface CastMember {
  person:    { name: string };
  character: { name: string };
}

/**
 * Full show detail returned by GET /shows/{id}?embed=cast.
 * Extends TVShow with runtime and embedded cast list.
 */
export interface TVShowDetail extends TVShow {
  language:        string | null;
  averageRuntime:  number | null;  // minutes
  _embedded?: {
    cast: CastMember[];
  };
}

// ---------------------------------------------------------------------------
// App-level utility types
// ---------------------------------------------------------------------------

/**
 * Tracks the lifecycle of any async operation.
 * Used to drive conditional rendering (idle → loading → success | error).
 */
export type SearchState = 'idle' | 'loading' | 'success' | 'error';
