/**
 * MovieCard.tsx  (Show Card)
 * --------------------------
 * Displays a brief TV show result from the search endpoint.
 *
 * Props are strictly typed — the card receives a TVShow object
 * and a typed onClick callback, keeping all API concerns out of this component.
 */

import type { TVShow } from '../types/movie.types';
import styles from './MovieCard.module.css';

/** Typed props for MovieCard. */
interface MovieCardProps {
  /** The show data from the TVMaze search results list. */
  movie:   TVShow;
  /** Called with the show's numeric id when the card is clicked. */
  onClick: (id: number) => void;
}

/** Inline SVG placeholder shown when no poster art is available. */
const NO_IMAGE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='210' height='295' viewBox='0 0 210 295'%3E%3Crect width='210' height='295' fill='%23222'/%3E%3Ctext x='105' y='147' text-anchor='middle' fill='%23555' font-size='14' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * MovieCard renders a clickable card with poster, title, year, and type badge.
 *
 * @param props - { movie, onClick }
 */
export function MovieCard({ movie, onClick }: MovieCardProps) {
  const imageSrc  = movie.image?.medium ?? NO_IMAGE_URL;
  const year      = movie.premiered ? movie.premiered.slice(0, 4) : 'N/A';
  const rating    = movie.rating.average !== null ? `⭐ ${movie.rating.average}` : '';
  const genre     = movie.genres.slice(0, 2).join(' · ') || movie.type;

  return (
    <article
      className={styles.card}
      onClick={() => onClick(movie.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick(movie.id); }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${movie.name}`}
    >
      {/* Poster image */}
      <div className={styles.posterWrapper}>
        <img
          className={styles.poster}
          src={imageSrc}
          alt={`Poster for ${movie.name}`}
          loading="lazy"
        />
      </div>

      {/* Card info */}
      <div className={styles.info}>
        <h3 className={styles.title}>{movie.name}</h3>
        <p className={styles.year}>{year}</p>
        {rating && <p className={styles.rating}>{rating}</p>}
        <span className={`${styles.typeBadge} ${styles[movie.status === 'Running' ? 'running' : 'ended']}`}>
          {genre}
        </span>
      </div>
    </article>
  );
}
