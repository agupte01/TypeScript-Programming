/**
 * display.ts
 * ----------
 * All DOM-manipulation functions for the GitHub Profile Viewer.
 * No fetch logic lives here — only typed data → DOM rendering.
 */

import type { GitHubUser, GitHubRepo, SortKey } from './types';

// ── DOM references ────────────────────────────────────────────────────────────
const loadingEl      = document.getElementById('loading')          as HTMLElement;
const errorEl        = document.getElementById('error-message')    as HTMLElement;
const errorTextEl    = document.getElementById('error-text')       as HTMLElement;
const profileSection = document.getElementById('profile-section')  as HTMLElement;
const reposSection   = document.getElementById('repos-section')    as HTMLElement;

// Profile fields
const avatarEl    = document.getElementById('avatar')           as HTMLImageElement;
const nameEl      = document.getElementById('profile-name')     as HTMLElement;
const loginEl     = document.getElementById('profile-login')    as HTMLElement;
const bioEl       = document.getElementById('profile-bio')      as HTMLElement;
const locationEl  = document.getElementById('profile-location') as HTMLElement;
const blogEl      = document.getElementById('profile-blog')     as HTMLAnchorElement;
const statRepos   = document.getElementById('stat-repos')       as HTMLElement;
const statFollowers = document.getElementById('stat-followers') as HTMLElement;
const statFollowing = document.getElementById('stat-following') as HTMLElement;

// Repos
const reposList   = document.getElementById('repos-list')       as HTMLUListElement;

// ── Language colour map ───────────────────────────────────────────────────────

/**
 * Maps common programming languages to their GitHub-conventional dot colour.
 * Falls back to a neutral grey for unlisted languages.
 */
const LANG_COLORS: Record<string, string> = {
  TypeScript:  '#3178c6',
  JavaScript:  '#f1e05a',
  Python:      '#3572A5',
  Java:        '#b07219',
  'C++':       '#f34b7d',
  C:           '#555555',
  'C#':        '#178600',
  Go:          '#00ADD8',
  Rust:        '#dea584',
  Ruby:        '#701516',
  PHP:         '#4F5D95',
  Swift:       '#F05138',
  Kotlin:      '#A97BFF',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  Shell:       '#89e051',
  Dockerfile:  '#384d54',
  Vue:         '#41b883',
  Svelte:      '#ff3e00',
};

function langColor(language: string | null): string {
  if (!language) return '#8b949e';
  return LANG_COLORS[language] ?? '#8b949e';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// ── Loading / error state ─────────────────────────────────────────────────────

export function showLoading(show: boolean): void {
  if (show) {
    loadingEl.removeAttribute('hidden');
    errorEl.setAttribute('hidden', '');
    profileSection.setAttribute('hidden', '');
    reposSection.setAttribute('hidden', '');
  } else {
    loadingEl.setAttribute('hidden', '');
  }
}

export function showError(message: string): void {
  showLoading(false);
  errorTextEl.textContent = message;
  errorEl.removeAttribute('hidden');
}

export function hideProfile(): void {
  profileSection.setAttribute('hidden', '');
  reposSection.setAttribute('hidden', '');
}

export function showProfile(): void {
  profileSection.removeAttribute('hidden');
  reposSection.removeAttribute('hidden');
}

// ── Profile rendering ─────────────────────────────────────────────────────────

/**
 * Populates the profile card with a GitHubUser object.
 *
 * @param user - Typed GitHubUser from the API.
 */
export function displayUser(user: GitHubUser): void {
  avatarEl.src   = user.avatar_url;
  avatarEl.alt   = `${user.login}'s avatar`;
  nameEl.textContent     = user.name    || user.login;
  loginEl.textContent    = `@${user.login}`;
  bioEl.textContent      = user.bio     || '';
  locationEl.textContent = user.location ? `📍 ${user.location}` : '';

  // Blog link — only show when the user has set one
  const blog = user.blog?.trim();
  if (blog) {
    blogEl.textContent = blog;
    // Ensure the URL has a scheme for the href
    blogEl.href = blog.startsWith('http') ? blog : `https://${blog}`;
    blogEl.removeAttribute('hidden');
  } else {
    blogEl.setAttribute('hidden', '');
  }

  statRepos.textContent     = user.public_repos.toLocaleString();
  statFollowers.textContent = user.followers.toLocaleString();
  statFollowing.textContent = user.following.toLocaleString();
}

// ── Repo sorting ──────────────────────────────────────────────────────────────

/**
 * Returns a new sorted array of repos according to the given sort key.
 * Uses `Readonly` on the input to signal the original array is not mutated.
 *
 * @param repos   - Source repo array (not mutated).
 * @param sortKey - 'stars' | 'forks' | 'updated'
 * @returns        New sorted array.
 */
export function sortRepos(
  repos: Readonly<GitHubRepo[]>,
  sortKey: SortKey
): GitHubRepo[] {
  // Spread to a new array before sorting (sort() mutates in place)
  const copy = [...repos];

  switch (sortKey) {
    case 'stars':
      return copy.sort((a, b) => b.stargazers_count - a.stargazers_count);
    case 'forks':
      return copy.sort((a, b) => b.forks_count - a.forks_count);
    case 'updated':
      // ISO strings sort lexicographically, which matches chronological order
      return copy.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }
}

// ── Repo rendering ────────────────────────────────────────────────────────────

/**
 * Renders sorted repo cards into the repos list.
 *
 * @param repos   - Array of GitHubRepo objects.
 * @param sortKey - Current sort order (used to sort before rendering).
 */
export function displayRepos(repos: Readonly<GitHubRepo[]>, sortKey: SortKey): void {
  const sorted = sortRepos(repos, sortKey);

  reposList.innerHTML = '';

  if (sorted.length === 0) {
    reposList.innerHTML = '<li class="no-repos">No public repositories found.</li>';
    return;
  }

  const fragment = document.createDocumentFragment();

  sorted.forEach(repo => {
    const li = document.createElement('li');
    li.className = 'repo-card';

    // Description defaults to an em-dash if not provided
    const desc = repo.description ?? '—';

    li.innerHTML = `
      <a class="repo-name" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
        ${repo.name}
      </a>
      <p class="repo-description">${desc}</p>
      <div class="repo-meta">
        ${repo.language ? `
          <span class="repo-meta-item">
            <span class="lang-dot" style="background:${langColor(repo.language)}"></span>
            ${repo.language}
          </span>` : ''}
        <span class="repo-meta-item" title="Stars">⭐ ${repo.stargazers_count.toLocaleString()}</span>
        <span class="repo-meta-item" title="Forks">🍴 ${repo.forks_count.toLocaleString()}</span>
        <span class="repo-meta-item" title="Last updated">🕒 ${formatDate(repo.updated_at)}</span>
      </div>
    `;

    fragment.appendChild(li);
  });

  reposList.appendChild(fragment);
}
