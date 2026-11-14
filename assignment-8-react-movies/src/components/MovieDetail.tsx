/**
 * MovieDetail.tsx  (Show Detail Modal)
 * -------------------------------------
 * Modal component that fetches and displays full show detail.
 *
 * This component is responsible for its own data fetching via useEffect —
 * it receives a numeric TVMaze show id prop and fetches the detail internally.
 * This is the React equivalent of opening a modal and making a second API
 * call in the vanilla JS version, but with typed state and clean lifecycle
 * management via a cancellation flag.
 */

import { useState, useEffect, type KeyboardEvent } from 'react';
import { getShowDetails } from '../api/tvmaze';
import type { TVShowDetail } from '../types/movie.types';
import styles from './MovieDetail.module.css';

/** Typed props for the MovieDetail modal. */
interface MovieDetailProps {
  /** The numeric TVMaze show ID to display. */
  id:      number;
  /** Called when the user closes the modal. */
  onClose: () => void;
}

const NO_IMAGE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='210' height='295' viewBox='0 0 210 295'%3E%3Crect width='210' height='295' fill='%23222'/%3E%3Ctext x='105' y='147' text-anchor='middle' fill='%23555' font-size='14' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * Strips HTML tags from TVMaze summary strings.
 * TVMaze returns summaries as HTML (e.g. "<p>A crime drama…</p>").
 */
function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent ?? '';
}

/**
 * MovieDetail renders a modal overlay with full show information.
 * Fetches detail data when `id` changes (on mount + any prop change).
 *
 * @param props - { id, onClose }
 */
export function MovieDetail({ id, onClose }: MovieDetailProps) {
  const [detail, setDetail]   = useState<TVShowDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError]     = useState<string | null>(null);

  // Fetch detail whenever id changes
  useEffect(() => {
    let cancelled = false; // guard against state updates after unmount

    setLoading(true);
    setError(null);
    setDetail(null);

    getShowDetails(id)
      .then(data => {
        if (!cancelled) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load show details.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [id]);

  // Close modal on Escape key
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>): void {
    if (e.key === 'Escape') onClose();
  }

  const imageSrc = detail?.image?.original ?? NO_IMAGE_URL;
  const cast     = detail?._embedded?.cast?.slice(0, 5) ?? [];
  const year     = detail?.premiered ? detail.premiered.slice(0, 4) : '';
  const endYear  = detail?.ended ? detail.ended.slice(0, 4) : (detail?.status === 'Running' ? 'present' : '');
  const yearRange = year && endYear ? `${year} – ${endYear}` : year;

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Show details"
      tabIndex={-1}
    >
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} aria-hidden="true" />
            <p>Loading details…</p>
          </div>
        )}

        {error && (
          <div className={styles.errorState} role="alert">
            <p>⚠️ {error}</p>
          </div>
        )}

        {detail && !loading && (
          <div className={styles.content}>
            {/* Left: poster */}
            <div className={styles.posterCol}>
              <img
                className={styles.poster}
                src={imageSrc}
                alt={`Poster for ${detail.name}`}
              />
            </div>

            {/* Right: info */}
            <div className={styles.infoCol}>
              <h2 className={styles.title}>{detail.name}</h2>

              {/* Badges row */}
              <div className={styles.badges}>
                {yearRange && <span className={styles.badge}>{yearRange}</span>}
                <span className={styles.badge}>{detail.status}</span>
                {detail.averageRuntime && (
                  <span className={styles.badge}>{detail.averageRuntime} min</span>
                )}
              </div>

              {/* Rating */}
              {detail.rating.average !== null && (
                <div className={styles.rating}>
                  <span className={styles.star}>⭐</span>
                  <span className={styles.ratingValue}>{detail.rating.average}</span>
                  <span className={styles.ratingMax}>/10</span>
                </div>
              )}

              {/* Detail rows */}
              <div className={styles.rows}>
                {detail.genres.length > 0 && (
                  <DetailRow label="Genres"  value={detail.genres.join(', ')} />
                )}
                {detail.network && (
                  <DetailRow label="Network" value={detail.network.name} />
                )}
                {detail.language && (
                  <DetailRow label="Language" value={detail.language} />
                )}
              </div>

              {/* Summary */}
              {detail.summary && (
                <div className={styles.plot}>
                  <span className={styles.plotLabel}>Summary</span>
                  <p>{stripHtml(detail.summary)}</p>
                </div>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <div className={styles.plot}>
                  <span className={styles.plotLabel}>Cast</span>
                  <p>{cast.map(c => c.person.name).join(', ')}</p>
                </div>
              )}

              {/* TVMaze external link */}
              <a
                className={styles.imdbLink}
                href={`https://www.tvmaze.com/shows/${detail.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on TVMaze ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Small helper sub-component for a label/value row. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}
