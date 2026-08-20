'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useI18n } from '@/components/i18n/LanguageProvider';
import { projects } from '@/data/projects';
import styles from './CircularProjectsShowcase.module.css';

export type ShowcaseItem = {
  id: string;
  title: string;
  location: string;
  status: string;
  delivery: string;
  units: number;
  image: { src: string; alt: string; width: number; height: number };
  href: string;
};

/** Built from the project dataset — replace the data, not the component. */
const ITEMS: ShowcaseItem[] = projects.map((project, i) => ({
  id: String(i + 1).padStart(2, '0'),
  title: project.projectName,
  location: project.location,
  status: project.status,
  delivery: project.delivery,
  units: project.numberOfUnits,
  image: project.heroImage,
  href: `/progetti/${project.slug}`,
}));

/** Each transition holds the record still before the wipe begins. */
const HOLD = 0.42;

/**
 * Scroll-driven radial reveal.
 *
 * One number — the scroll progress through the section — drives everything:
 * the conic-gradient mask that paints the next photograph in, the needle that
 * sweeps with it, and the index that follows. Layers already passed stay at a
 * full turn, so a photograph is never absent and nothing can flash.
 *
 * The loop writes CSS custom properties straight to the DOM; React state only
 * changes when the active project does, which is at most a handful of times.
 */
export default function CircularProjectsShowcase({
  items = ITEMS,
}: {
  items?: ShowcaseItem[];
}) {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const needleRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  const [active, setActive] = useState(0);

  const transitions = Math.max(items.length - 1, 1);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let running = false;

    const paint = () => {
      running = false;
      const rect = section.getBoundingClientRect();
      const range = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / range, 0), 1);

      // Which transition we are inside, and how far through it.
      const scaled = progress * transitions;
      const segment = Math.min(Math.floor(scaled), transitions - 1);
      const local = scaled - segment;
      const reveal = local <= HOLD ? 0 : (local - HOLD) / (1 - HOLD);
      const angle = reveal * 360;

      // Layers before the wipe are complete; the one being drawn follows the
      // angle; everything after it is still hidden.
      layerRefs.current.forEach((layer, i) => {
        if (!layer) return;
        const full = i <= segment;
        const drawing = i === segment + 1;
        layer.style.setProperty('--a', `${full ? 360 : drawing ? angle : 0}deg`);
      });

      if (needleRef.current) {
        needleRef.current.style.setProperty('--a', `${angle}deg`);
        needleRef.current.style.opacity = reveal > 0 && reveal < 1 ? '0.55' : '0';
      }

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }

      // The record turns over once the new photograph is past half drawn.
      const next = reveal > 0.55 ? segment + 1 : segment;
      setActive((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      if (running) return;
      running = true;
      frame.current = requestAnimationFrame(paint);
    };

    const attach = () => {
      paint();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    };

    const detach = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame.current);
    };

    const sync = () => {
      if (motionQuery.matches) {
        detach();
        // Everything visible, nothing masked.
        layerRefs.current.forEach((layer) => layer?.style.setProperty('--a', '360deg'));
        setActive(items.length - 1);
        return;
      }
      attach();
    };

    sync();
    motionQuery.addEventListener('change', sync);
    return () => {
      motionQuery.removeEventListener('change', sync);
      detach();
    };
  }, [transitions, items.length]);

  const current = items[Math.min(active, items.length - 1)];

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} surface-light`}
      style={{ '--segments': transitions } as React.CSSProperties}
      aria-labelledby="developments-title"
    >
      <div className={styles.pin}>
        <div className={styles.head}>
          <p className={styles.label}>{t.developments.label}</p>
          <h2 id="developments-title" className={styles.headTitle}>
            {t.developments.title} <em>{t.developments.titleEm}</em>
          </h2>
          <p className={styles.intro}>{t.developments.intro}</p>
        </div>

        <div className={styles.stage}>
          <ol className={styles.index}>
            {items.map((item, i) => (
              <li
                key={item.id}
                className={`${styles.indexItem} ${i === active ? styles.indexActive : ''}`}
                aria-current={i === active ? 'true' : undefined}
              >
                {item.id}
                {i === active && (
                  <span className={styles.indexTotal}>
                    {' '}
                    · {String(items.length).padStart(2, '0')}
                  </span>
                )}
              </li>
            ))}
          </ol>

          <div className={styles.circle}>
            <div className={styles.disc}>
              {items.map((item, i) => (
                <div
                  key={item.id}
                  ref={(el) => {
                    layerRefs.current[i] = el;
                  }}
                  className={styles.layer}
                  /* The first plate is the ground; the rest are painted in. */
                  data-masked={i > 0 ? 'true' : 'false'}
                  aria-hidden={i !== active}
                >
                  <Image
                    src={item.image.src}
                    alt={i === active ? item.image.alt : ''}
                    width={item.image.width}
                    height={item.image.height}
                    sizes="(min-width: 1024px) 34vw, 74vw"
                    priority={i < 2}
                    quality={82}
                  />
                </div>
              ))}
            </div>

            <span ref={needleRef} className={styles.needle} aria-hidden="true" />

            <Link href={current.href} className={styles.expand} aria-label={t.developments.cta}>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className={styles.record}>
            {/* Keyed on the active project so the copy re-enters on change. */}
            <div key={current.id} className={styles.recordInner}>
              <p className={styles.recordLabel}>{t.developments.index}</p>
              <h3 className={styles.projectName}>{current.title}</h3>
              <p className={styles.place}>{current.location}</p>
              <p className={styles.meta}>
                <span>
                  {t.developments.units} {String(current.units).padStart(2, '0')}
                </span>
                <span>
                  {t.developments.delivery} {current.delivery}
                </span>
              </p>
              <Link href={current.href} className={`arrow-link ${styles.cta}`}>
                <span>{t.developments.cta}</span>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.foot}>
          <p className={styles.counter}>
            {current.id} / {String(items.length).padStart(2, '0')}
          </p>
          <p className={styles.status}>{current.status}</p>
        </div>

        <span className={styles.track} aria-hidden="true">
          <span ref={barRef} className={styles.trackBar} />
        </span>
      </div>
    </section>
  );
}
