'use client';

import Image from 'next/image';
import { useState } from 'react';

import styles from './PropertyVideoPlayer.module.css';

type Props = {
  videoId: string;
  title: string;
  playLabel: string;
};

/**
 * Click-to-load: nessun iframe YouTube prima dell'interazione. Prima del
 * click è solo un'immagine (thumbnail) + pulsante — zero richieste esterne.
 */
export default function PropertyVideoPlayer({ videoId, title, playLabel }: Props) {
  const [loaded, setLoaded] = useState(false);
  // maxresdefault non esiste per tutti i video: fallback all'unica risoluzione garantita da YouTube.
  const [thumbnailSrc, setThumbnailSrc] = useState(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);

  return (
    <div className={styles.frame}>
      {loaded ? (
        <iframe
          className={styles.iframe}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" className={styles.playButton} onClick={() => setLoaded(true)} aria-label={playLabel}>
          <Image
            src={thumbnailSrc}
            alt=""
            fill
            sizes="(min-width: 1024px) 1100px, 100vw"
            className={styles.thumbnail}
            onError={() => setThumbnailSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)}
          />
          <span className={styles.playIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
