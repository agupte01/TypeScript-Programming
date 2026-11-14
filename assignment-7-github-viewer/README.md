# GitHub Profile Viewer

A TypeScript web app to look up any public GitHub user and see their profile, stats and repositories, sortable by stars, forks or recent activity. **No API key needed**: GitHub's public REST API allows 60 unauthenticated requests per hour per IP, which is plenty.

---

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Quick Start](#quick-start)
5. [Available Scripts](#available-scripts)
6. [Project Structure](#project-structure)
7. [Architecture & Data Flow](#architecture--data-flow)
8. [Module-by-Module Walkthrough](#module-by-module-walkthrough)
9. [API Reference](#api-reference)
10. [Rate Limiting](#rate-limiting)
11. [TypeScript Concepts Demonstrated](#typescript-concepts-demonstrated)
12. [Error Handling](#error-handling)
13. [Security Notes](#security-notes)
14. [Manual Test Checklist](#manual-test-checklist)
15. [Troubleshooting](#troubleshooting)
16. [Future Improvements](#future-improvements)
17. [Author & License](#author--license)

---

## Overview
Type a username (try `torvalds`, `gaearon`, `octocat`). Two requests run **in parallel** with `Promise.all`: the user profile and the repo list. The repo list is cached in memory so changing the sort order re-sorts locally with no additional request.

## Tech Stack
| Tool | Purpose |
|---|---|
| TypeScript 5 (strict) | Language, no `any` |
| Vite 5 | Dev server / bundler |
| HTML5 / CSS3 | GitHub-dark inspired UI |
| GitHub REST API v3 | Data source, no key needed |

## Features
- Avatar, display name, `@login`, bio, location and website link
- Stats: public repos, followers, following
- Up to 100 repositories with description, language, stars, forks, last-updated date
- Sort by **Stars**, **Forks** or **Recently updated**, client-side and instant
- Language colour dots for 18+ common languages (grey fallback)
- Friendly messages for 404 (not found) and 403/429 (rate limited)
- Loading spinner, ARIA roles, keyboard-friendly controls

## Quick Start
Prerequisites: Node.js 18+, npm 9+.
```bash
cd assignment-7-github-viewer
npm install
npm run dev
```
Open http://localhost:5173 and search a username. Nothing else to configure.

## Available Scripts
| Command | Description |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | `tsc` type-check + production build to `dist/` |
| `npm run preview` | Serve the built output |

## Project Structure
```
assignment-7-github-viewer/
├── index.html      # Search form, profile card, sort dropdown, repo list
├── style.css       # Dark theme, cards, responsive grid
├── src/
│   ├── types.ts    # GitHubUser, GitHubRepo, GitHubError, ApiResult<T>, SortKey, UserSummary
│   ├── api.ts      # fetchUser, fetchRepos, isGitHubError, ghFetch<T>
│   ├── display.ts  # displayUser, displayRepos, sortRepos, language colours
│   └── main.ts     # Events + state (currentRepos, currentSort)
├── tsconfig.json
├── package.json
└── README.md
```

## Architecture & Data Flow
```
submit(username)
   │ showLoading(true)
   ▼
Promise.all([ fetchUser(u), fetchRepos(u) ])      ← parallel
   │
   ├─ user failed?  → showError(user.error)
   ├─ repos failed? → showError(repos.error)
   └─ both OK → currentRepos = repos.data
                displayUser(user) ; displayRepos(currentRepos, currentSort) ; showProfile()

sort dropdown change
   └─ currentSort = value ; displayRepos(currentRepos, currentSort)   (no network)
```

## Module-by-Module Walkthrough
- **`types.ts`**: field-accurate interfaces. `name`, `bio`, `location`, `blog` are `string | null` because GitHub returns `null` for unset values. `ApiResult<T>` is a discriminated union whose failure branch also carries the HTTP `status`. `UserSummary = Pick<GitHubUser, ...>` demonstrates a utility type.
- **`api.ts`**: `ghFetch<T>` never throws. It sets the `Accept: application/vnd.github.v3+json` header, parses the body as `unknown`, narrows with the `isGitHubError` type guard, and maps 404/403/429 to friendly text.
- **`display.ts`**: `sortRepos(repos: Readonly<GitHubRepo[]>, key)` copies before sorting so the cache is never mutated; uses an exhaustive `switch` over `SortKey`. `displayRepos` builds a `DocumentFragment` for one DOM insertion.
- **`main.ts`**: owns state and listeners.

## API Reference
Base URL `https://api.github.com`, no auth.

| Endpoint | Use |
|---|---|
| `GET /users/{username}` | Profile |
| `GET /users/{username}/repos?per_page=100&sort=pushed` | Public repos (first 100) |

## Rate Limiting
Unauthenticated: **60 requests/hour/IP**. Each search costs **2** requests, so about 30 searches per hour. When exceeded GitHub returns 403 and the app shows "API rate limit exceeded. Try again in a minute." Just wait; no key is required for normal use.

## TypeScript Concepts Demonstrated
- Utility types: `Pick<T,K>`, `Readonly<T[]>`, `Record<string,string>`
- Discriminated union `ApiResult<T>` and narrowing via `if (result.success)`
- Type guard `obj is GitHubError`
- Union literal `SortKey` + exhaustive `switch` (compiler errors if a case is missing)
- Generic `ghFetch<T>`
- `unknown` over `any` for parsed JSON
- Non-mutating array operations (`[...repos].sort`)

## Error Handling
| Case | Message |
|---|---|
| Unknown user | "User not found." |
| Rate limited | "API rate limit exceeded. Try again in a minute." |
| 429 | "Too many requests. Please wait before searching again." |
| Offline | "Network error: ..." |

## Security Notes
Repo descriptions and names come from users and are inserted via `innerHTML`. For a production app, escape them or build nodes with `textContent`. This is a good extension exercise.

## Manual Test Checklist
- [ ] `torvalds` loads profile and repos
- [ ] Switching sort changes order and fires no network request
- [ ] `thisuserdoesnotexist-98765` shows "User not found."
- [ ] User with no bio/location/blog hides those rows cleanly
- [ ] User with zero repos shows "No public repositories found."
- [ ] `npm run build` has zero type errors

## Troubleshooting
| Problem | Fix |
|---|---|
| Always rate limited | Wait an hour, or switch network; a token is optional (see below) |
| Avatar missing | Blocked image CDN; check the console |

Optional token (never commit it): add `Authorization: 'Bearer <token>'` to the headers in `api.ts` to raise the limit to 5,000/hour.

## Future Improvements
Pagination beyond 100 repos, language filter, followers list, escape HTML, debounced search, cache responses in `sessionStorage`.

## Author & License
Your Name · SFU JavaScript & TypeScript Web Development · MIT
