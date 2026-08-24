'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { PropertyImage } from '@/data/properties';
import { useI18n } from '@/components/i18n/LanguageProvider';
import styles from './PropertyGallery.module.css';

type Props = {
  images: PropertyImage[];
  title: string;
  /** Lets the host page style and label its own opening control. */
  triggerClassName?: string;
  trigger?: React.ReactNode;
};

const SWIPE_THRESHOLD_PX = 50;

/** Full-screen viewer: swipe/drag, keyboard-operable, focus trapped and returned on close. */
export default function PropertyGallery({ images, title, triggerClassName, trigger }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);

  const hasMultiple = images.length > 1;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + images.length) % images.length),
    [images.length]
  );

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    // iOS Safari can rubber-band-scroll the page behind `overflow:hidden` on body alone.
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (hasMultiple && e.key === 'ArrowRight') go(1);
      if (hasMultiple && e.key === 'ArrowLeft') go(-1);
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
        if (!focusable || focusable.length === 0) return;
        const list = Array.from(focusable);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, go, hasMultiple]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!hasMultiple) return;
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Alcuni dispositivi/browser non hanno un puntatore attivo da catturare: lo swipe funziona comunque.
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const origin = dragOrigin.current;
    dragOrigin.current = null;
    if (!origin) return;
    const deltaX = e.clientX - origin.x;
    const deltaY = e.clientY - origin.y;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
      go(deltaX < 0 ? 1 : -1);
    }
  };

  if (images.length === 0) return null;

  const current = images[index];
  const prevIndex = (index - 1 + images.length) % images.length;
  const nextIndex = (index + 1) % images.length;
  // Solo i vicini immediati restano montati (nascosti) per una transizione
  // istantanea — mai l'intera gallery, anche con 70+ fotografie.
  const preloadIndices = hasMultiple ? [...new Set([prevIndex, nextIndex])].filter((i) => i !== index) : [];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName ?? styles.trigger}
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
      >
        {trigger ?? (
          <>
            {t.property.galleryOpen}
            <span aria-hidden="true">({images.length})</span>
          </>
        )}
      </button>

      <div
        ref={dialogRef}
        className={`${styles.viewer} ${open ? styles.viewerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${t.property.galleryOpen} — ${title}`}
        aria-hidden={!open}
        inert={!open}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.closeBtn}
          onClick={close}
          aria-label={t.property.galleryClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {hasMultiple && (
          <p className={styles.counter}>
            {index + 1} / {images.length}
          </p>
        )}

        <div
          className={styles.viewerStage}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragOrigin.current = null;
          }}
        >
          {open && (
            <Image
              key={current.src}
              className={styles.viewerImage}
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="100vw"
              loading="eager"
            />
          )}
          {open &&
            preloadIndices.map((i) => (
              <Image
                key={images[i].src}
                className={styles.preloadImage}
                src={images[i].src}
                alt=""
                width={images[i].width}
                height={images[i].height}
                sizes="100vw"
                loading="eager"
                aria-hidden="true"
              />
            ))}
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navPrev}`}
              onClick={() => go(-1)}
              aria-label={t.property.galleryPrev}
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navNext}`}
              onClick={() => go(1)}
              aria-label={t.property.galleryNext}
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </div>
    </>
  );
}
