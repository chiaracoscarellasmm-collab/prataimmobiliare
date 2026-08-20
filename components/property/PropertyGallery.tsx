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

/** Full-screen viewer: keyboard-operable, focus returned on close. */
export default function PropertyGallery({
  images,
  title,
  triggerClassName,
  trigger,
}: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, go]);

  if (images.length === 0) return null;

  const current = images[index];

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
        className={`${styles.viewer} ${open ? styles.viewerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${t.property.galleryOpen} — ${title}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className={styles.viewerHead}>
          <p className={styles.viewerTitle}>{title}</p>
          <button
            ref={closeRef}
            type="button"
            className={styles.viewerIndex}
            onClick={close}
            aria-label={t.property.galleryClose}
          >
            {t.property.galleryClose} ✕
          </button>
        </div>

        <div className={styles.viewerStage}>
          <Image
            key={current.src}
            className={styles.viewerImage}
            src={current.src}
            alt={current.alt}
            width={current.width}
            height={current.height}
            sizes="100vw"
          />
        </div>

        <div className={styles.viewerFoot}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => go(-1)}
            aria-label={t.property.galleryPrev}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => go(1)}
            aria-label={t.property.galleryNext}
          >
            <span aria-hidden="true">→</span>
          </button>
          <p className={styles.caption}>
            {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            <br />
            {current.alt}
          </p>
        </div>
      </div>
    </>
  );
}
