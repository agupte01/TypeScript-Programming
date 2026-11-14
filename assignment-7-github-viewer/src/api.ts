/**
 * api.ts
 * ------
 * All communication with the GitHub REST API.
 *
 * Unauthenticated rate limit: 60 requests/hour per IP.
 * To increase this, add a personal access token:
 *   headers: { Authorization: 'Bearer YOUR_TOKEN' }
 *
 * Endpoints used:
 *   GET /users/{username}              — fetch a user profile
 *   GET /users/{username}/repos        — list public repositories
 */

import type { GitHubUser, GitHubRepo, GitHubError, ApiResult } from './types';

/** GitHub REST API base URL. */
const BASE = 'https://api.github.com';

// ── Type guard ────────────────────────────────────────────────────────────────

/**
 * Narrows an unknown value to GitHubError.
 * GitHub always returns { message: string } in its error bodies.
 */
export function isGitHubError(obj: unknown): obj is GitHubError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    typeof (obj as GitHubError).message === 'string'
  );
}

// ── Generic fetch wrapper ─────────────────────────────────────────────────────

/**
 * Typed fetch helper that always returns an ApiResult<T> — never throws.
 * Handles network errors, HTTP errors, and GitHub's own error body format.
 *
 * @param url - Fully-formed GitHub API URL.
 * @returns    ApiResult<T> discriminated union.
 */
async function ghFetch<T>(url: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const json: unknown = await response.json();

    if (!response.ok) {
      // Extract GitHub's human-readable error message if available
      const msg = isGitHubError(json)
        ? json.message
        : `HTTP ${response.status}: ${response.statusText}`;

      // Special-case common status codes for friendlier messages
      const friendly =
        response.status === 404 ? 'User not found.' :
        response.status === 403 ? 'API rate limit exceeded. Try again in a minute.' :
        response.status === 429 ? 'Too many requests. Please wait before searching again.' :
        msg;

      return { success: false, error: friendly, status: response.status };
    }

    return { success: true, data: json as T };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown network error';
    return { success: false, error: `Network error: ${msg}`, status: 0 };
  }
}

// ── Public API functions ──────────────────────────────────────────────────────

/**
 * Fetches a GitHub user's public profile.
 *
 * @param username - GitHub login (e.g. "torvalds").
 * @returns         ApiResult<GitHubUser>
 *
 * @example
 *   const result = await fetchUser('torvalds');
 *   if (result.success) console.log(result.data.name);
 */
export async function fetchUser(username: string): Promise<ApiResult<GitHubUser>> {
  return ghFetch<GitHubUser>(`${BASE}/users/${encodeURIComponent(username.trim())}`);
}

/**
 * Fetches all public repositories for a GitHub user, sorted by most-recently
 * pushed by default (we apply our own client-side sort on top).
 *
 * Requests up to 100 repos per page; most users have far fewer.
 *
 * @param username - GitHub login.
 * @returns         ApiResult<GitHubRepo[]>
 */
export async function fetchRepos(username: string): Promise<ApiResult<GitHubRepo[]>> {
  const params = new URLSearchParams({
    per_page: '100',
    sort:     'pushed',
  });
  const url = `${BASE}/users/${encodeURIComponent(username.trim())}/repos?${params}`;
  return ghFetch<GitHubRepo[]>(url);
}
