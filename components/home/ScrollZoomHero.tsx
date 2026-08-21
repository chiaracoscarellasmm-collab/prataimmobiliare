'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useI18n } from '@/components/i18n/LanguageProvider';
import { projects } from '@/data/projects';
import { properties } from '@/data/properties';
import styles from './ScrollZoomHero.module.css';

/**
 * The hero holds the page while the camera moves in.
 *
 * Mechanics: the section is taller than the viewport, its inner frame is
 * `position: sticky`, and scroll progress through the extra height is written
 * to a single CSS custom property. Scale, scrim depth and the fade of every
 * copy layer are derived from that one number in CSS — so a frame costs one
 * property write and a compositor pass, nothing more.
 */
/* Counts come from the dataset, so the figures are never invented. */
const PROPERTY_COUNT = String(properties.length).padStart(2, '0');
const PROJECT_COUNT = String(projects.length).padStart(2, '0');

export default function ScrollZoomHero() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setEntered(true);

    const section = sectionRef.current;
    if (!section) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let range = 1;
    let running = false;

    const measure = () => {
      range = Math.max(section.offsetHeight - window.innerHeight, 1);
    };

    const update = () => {
      running = false;
      const top = section.getBoundingClientRect().top;
      // 0 while the hero is fully framed, 1 the instant it releases.
      const p = Math.min(Math.max(-top / range, 0), 1);
      section.style.setProperty('--p', p.toFixed(4));
    };

    const onScroll = () => {
      if (running) return;
      running = true;
      frame.current = requestAnimationFrame(update);
    };

    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        measure();
        update();
      }, 120);
    };

    const attach = () => {
      measure();
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
    };

    const detach = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
      cancelAnimationFrame(frame.current);
      section.style.setProperty('--p', '0');
    };

    // Honour the preference, and keep honouring it if the user changes it.
    const sync = () => (motionQuery.matches ? detach() : attach());
    sync();
    motionQuery.addEventListener('change', sync);

    return () => {
      motionQuery.removeEventListener('change', sync);
      detach();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      data-entered={entered}
      aria-label="Prata Immobiliare"
    >
      {/* Tells the header to stay transparent for as long as the hero holds. */}
      <div id="hero-sentinel" className={styles.sentinel} aria-hidden="true" />

      <div className={styles.pin}>
        {/* Sostituire con la fotografia definitiva dell'agenzia. */}
        <div className={styles.frame}>
          <Image
            src="/images/home/hero.webp"
            alt={t.hero.imageAlt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={85}
          />
        </div>
        <div className={styles.scrim} aria-hidden="true" />

        <h1 className={styles.title}>
          <span>{t.hero.titleLine1}</span>
          <span>
            {t.hero.titleLine2Pre}
            <em className={styles.titleEm}>{t.hero.titleLine2Em}</em>
            {t.hero.titleLine2Post}
          </span>
        </h1>
        <div className={styles.floorScrim} aria-hidden="true" />

        <div className={styles.content}>
          <div className={styles.lower}>
            <p className={styles.support}>{t.hero.support}</p>

            <div className={styles.ctas}>
              <Link href="/immobili" className={`pill pill-solid ${styles.cta}`}>
                {t.hero.cta}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link href="/vendi-affitta" className={`pill ${styles.ctaGhost}`}>
                {t.hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
