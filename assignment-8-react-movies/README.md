# CineSearch: React + TypeScript Show Finder

Search thousands of TV shows, browse results as a poster grid, and open a detail modal with summary, genres, network, rating and cast. Built with React 18 + TypeScript. Uses the **TVMaze API: free, no API key, no sign-up**. Runs right after `npm install`.

---

## Table of Contents
1. [Overview](#overview)
2. [Why TVMaze](#why-tvmaze)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Quick Start](#quick-start)
6. [Available Scripts](#available-scripts)
7. [Project Structure](#project-structure)
8. [Component Tree & Data Flow](#component-tree--data-flow)
9. [Component & Hook Reference](#component--hook-reference)
10. [API Reference](#api-reference)
11. [TypeScript Concepts Demonstrated](#typescript-concepts-demonstrated)
12. [React Concepts Demonstrated](#react-concepts-demonstrated)
13. [Error Handling & States](#error-handling--states)
14. [Accessibility](#accessibility)
15. [Manual Test Checklist](#manual-test-checklist)
16. [Troubleshooting](#troubleshooting)
17. [Future Improvements](#future-improvements)
18. [Author & License](#author--license)

---

## Overview
The user types a title, `useMovieSearch` fetches matches, `App` renders a grid of `MovieCard`s, and clicking a card opens `MovieDetail`, which makes its own second request for full details including cast.

## Why TVMaze
The original version used OMDb, which needs a personal API key. TVMaze is open and key-free, so the project works for anyone who clones it. File and component names (`MovieCard`, `useMovieSearch`) were kept for continuity, but the data is TV shows.

## Tech Stack
React 18, TypeScript 5 (strict), Vite 5, CSS Modules, TVMaze REST API.

## Features
- Search by show title; results are scored by relevance by TVMaze
- Poster cards: title, premiere year, rating, genres
- Detail modal: large poster, year range, status (Running/Ended), runtime, rating, genres, network, language, plain-text summary, top 5 cast, link to TVMaze
- Close modal via ×, backdrop click or Escape
- Idle, loading, error, empty and results states
- Lazy-loaded images with an inline SVG fallback for missing artwork

## Quick Start
Prerequisites: Node.js 18+, npm 9+.
```bash
cd assignment-8-react-movies
npm install
npm run dev
```
Open http://localhost:5173 and search `breaking bad`, `office`, `batman`.

## Available Scripts
| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the build |

## Project Structure
```
assignment-8-react-movies/
├── index.html
├── src/
│   ├── main.tsx                  # React root
│   ├── App.tsx                   # Layout, selected-show state, conditional rendering
│   ├── App.module.css
│   ├── api/tvmaze.ts             # searchShows, getShowDetails
│   ├── hooks/useMovieSearch.ts   # results/status/error + search()
│   ├── types/movie.types.ts      # TVShow, TVShowDetail, CastMember, SearchState, ...
│   └── components/
│       ├── SearchBar.tsx(+css)   # Controlled input
│       ├── MovieCard.tsx(+css)   # Poster card
│       └── MovieDetail.tsx(+css) # Modal with own data fetching
├── vite.config.ts  tsconfig.json  package.json
```

## Component Tree & Data Flow
```
<App>                          state: selectedShowId (number | null)
 ├─ useMovieSearch()           state: results, status, error ; fn: search
 ├─ <SearchBar onSearch isLoading/>        state: query (local, controlled)
 ├─ <MovieCard movie onClick/> × N
 └─ {selectedShowId !== null && <MovieDetail id onClose/>}   fetches /shows/:id?embed=cast
```
Flow: SearchBar submit → `search(query)` → status `loading` → `searchShows()` → `success`/`error` → App re-renders. Card click → `setSelectedShowId(id)` → modal mounts → `useEffect` fetches detail.

## Component & Hook Reference
| Unit | Props / Returns | Notes |
|---|---|---|
| `SearchBar` | `{ onSearch(q), isLoading }` | Disables when loading or empty |
| `MovieCard` | `{ movie: TVShow, onClick(id: number) }` | Keyboard activatable (Enter/Space) |
| `MovieDetail` | `{ id: number, onClose() }` | Cancel flag prevents setState after unmount; strips HTML from summary |
| `useMovieSearch` | `{ results, status, error, search }` | `search` wrapped in `useCallback` |

## API Reference
Base `https://api.tvmaze.com`, no auth, roughly 20 requests / 10 s per IP.

| Endpoint | Use |
|---|---|
| `GET /search/shows?q={query}` | Returns `[{ score, show }]`; we unwrap to `show[]` |
| `GET /shows/{id}?embed=cast` | Full show with `_embedded.cast` in one call |

Fields can be `null` (`image`, `rating.average`, `premiered`, `network`, `summary`), and every one is typed that way and handled.

## TypeScript Concepts Demonstrated
- Interfaces mirroring API shapes; `extends` (`TVShowDetail extends TVShow`)
- Nullable fields (`string | null`) enforced by the compiler
- Typed props interfaces; typed callbacks `(id: number) => void`
- Union `SearchState = 'idle' | 'loading' | 'success' | 'error'`
- `useState<number | null>` generics
- `unknown` in `catch` narrowed via `instanceof Error`
- Return-type interface for a custom hook

## React Concepts Demonstrated
Custom hooks, `useState`, `useEffect` with cleanup, `useCallback`, controlled inputs, conditional rendering, lists with stable `key`, lifting state up, CSS Modules, portal-style modal pattern.

## Error Handling & States
| State | UI |
|---|---|
| idle | Welcome prompt |
| loading | Spinner |
| success, 0 results | "No Results Found" |
| success | Count + grid |
| error | Red message (e.g. "TVMaze API error 429") |
| modal loading/error | Spinner / message inside the modal |

## Accessibility
`role="search"`, labelled input, cards are `role="button"` with `tabIndex=0`, modal has `role="dialog"` + `aria-modal`, status regions use `aria-live`.

## Manual Test Checklist
- [ ] Search `office` returns cards with posters
- [ ] Gibberish returns "No Results Found" (not an error)
- [ ] Click card opens modal with cast; Escape closes it
- [ ] Open a show without an image: placeholder shown
- [ ] Open two shows quickly: no stale data flicker
- [ ] `npm run build` has no type errors

## Troubleshooting
| Problem | Fix |
|---|---|
| Styles missing | Ensure `*.module.css` files exist beside components |
| 429 errors | Wait 10 seconds |
| Blank modal | Check console; the show id may no longer exist |

## Future Improvements
Debounced live search, favourites in `localStorage`, episode list per season, `AbortController` for in-flight searches, tests with Vitest + Testing Library.

## Author & License
Your Name · SFU JavaScript & TypeScript Web Development · MIT
