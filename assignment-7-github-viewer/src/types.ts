/**
 * types.ts
 * --------
 * All TypeScript interfaces and types for the GitHub Profile Viewer.
 * Every field mirrors the GitHub REST API response shape exactly,
 * so fetch results can be cast without using `any`.
 */

/** A GitHub user profile returned by GET /users/{username} */
export interface GitHubUser {
  login:        string;
  id:           number;
  avatar_url:   string;
  html_url:     string;
  name:         string | null;   // may be null if user hasn't set a display name
  bio:          string | null;
  location:     string | null;
  blog:         string | null;   // personal website URL (may be empty string)
  public_repos: number;
  followers:    number;
  following:    number;
  created_at:   string;          // ISO 8601 date string
}

/** A single public repository returned by GET /users/{username}/repos */
export interface GitHubRepo {
  id:                number;
  name:              string;
  full_name:         string;
  html_url:          string;
  description:       string | null;
  language:          string | null;  // primary language, or null
  stargazers_count:  number;
  forks_count:       number;
  updated_at:        string;         // ISO 8601 date string
  topics:            string[];
  fork:              boolean;        // true if this is a fork of another repo
}

/** Shape of an error response from GitHub (e.g. 404 user not found) */
export interface GitHubError {
  message:            string;
  documentation_url?: string;
}

/**
 * Discriminated union wrapping every API call result.
 *
 * Usage:
 *   const result = await fetchUser('torvalds');
 *   if (result.success) {
 *     // result.data is GitHubUser
 *   } else {
 *     // result.error is a string, result.status is the HTTP status code
 *   }
 */
export type ApiResult<T> =
  | { success: true;  data: T }
  | { success: false; error: string; status: number };

/** The three ways to sort the repository list. */
export type SortKey = 'stars' | 'forks' | 'updated';

// ── Utility types ─────────────────────────────────────────────────────────────

/**
 * A slim view of a user — only the fields needed for the profile card stats.
 * Demonstrates the Pick<T, K> utility type.
 */
export type UserSummary = Pick<
  GitHubUser,
  'login' | 'avatar_url' | 'name' | 'public_repos' | 'followers' | 'following'
>;
