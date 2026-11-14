/**
 * main.ts — GitHub Profile Viewer entry point
 *
 * Orchestrates:
 *  - Form submit: fetch user + repos in parallel with Promise.all
 *  - Sort dropdown change: re-sort and re-render without a new API call
 *  - Typed state management for the current repos array and sort key
 */

import { fetchUser, fetchRepos } from './api';
import { showLoading, showError, showProfile, displayUser, displayRepos } from './display';
import type { GitHubRepo, SortKey } from './types';

// ── DOM references ────────────────────────────────────────────────────────────
const searchForm   = document.getElementById('search-form')   as HTMLFormElement;
const usernameInput = document.getElementById('username-input') as HTMLInputElement;
const sortSelect   = document.getElementById('sort-select')   as HTMLSelectElement;

// ── Typed application state ───────────────────────────────────────────────────

/** Repos from the last successful search — stored so we can re-sort without re-fetching. */
let currentRepos: GitHubRepo[] = [];

/** Currently-selected sort key. Defaults to stars (highest-value view). */
let currentSort: SortKey = 'stars';

// ── Search handler ────────────────────────────────────────────────────────────

/**
 * Fetches a GitHub user profile and their repos simultaneously, then renders both.
 *
 * @param username - GitHub login entered by the user.
 */
async function handleSearch(username: string): Promise<void> {
  const trimmed = username.trim();
  if (!trimmed) return;

  showLoading(true);

  // Run both requests in parallel — faster than awaiting sequentially
  const [userResult, reposResult] = await Promise.all([
    fetchUser(trimmed),
    fetchRepos(trimmed),
  ]);

  showLoading(false);

  // The user fetch is the primary indicator of success/failure
  if (!userResult.success) {
    showError(userResult.error);
    return;
  }

  if (!reposResult.success) {
    showError(reposResult.error);
    return;
  }

  // Cache repos for the sort-dropdown re-renders
  currentRepos = reposResult.data;

  // Render both sections
  displayUser(userResult.data);
  displayRepos(currentRepos, currentSort);
  showProfile();
}

// ── Sort handler ──────────────────────────────────────────────────────────────

/**
 * Re-renders the cached repo list with the newly-selected sort key.
 * Does NOT make a new API call.
 */
function handleSortChange(): void {
  // Cast is safe — the select only contains valid SortKey option values
  currentSort = sortSelect.value as SortKey;
  displayRepos(currentRepos, currentSort);
}

// ── Event listeners ───────────────────────────────────────────────────────────

searchForm.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  handleSearch(usernameInput.value);
});

sortSelect.addEventListener('change', handleSortChange);
