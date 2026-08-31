'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, type MouseEvent, type TouchEvent } from 'react';

import { useI18n } from '@/components/i18n/LanguageProvider';
import { projects } from '@/data/projects';
import styles from './SpecBand.module.css';

const ICON_AREA = 'M2 14V2h12M2 14h12M5 11V6h5';

/** Small line marks, in the register of a technical sheet. */
const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d={d} />
  </svg>
);

/** Borgo Rose is the one real development on the books — its three unit
    types replace the old cycle through the (mostly placeholder) project
    list. Read once at module scope: static data, no need to recompute. */
const project = projects.find((p) => p.slug === 'residenze-progetto-a');
const TYPES = project?.apartmentTypes ?? [];

export default function SpecBand() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const plateRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  if (!project || TYPES.length === 0) return null;

  const type = TYPES[active];

  /* Pseudo-3D tilt, mouse-driven: a plain CSS-var write per frame, no React
     state — desktop/fine-pointer only, and off entirely under reduced motion. */
  const tilt = (event: MouseEvent<HTMLDivElement>) => {
    const el = plateRef.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty('--ry', `${((px - 0.5) * 10).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - py) * 8).toFixed(2)}deg`);
  };

  const resetTilt = () => {
    const el = plateRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  /* Swipe to switch plate on touch devices — mouse/desktop is untouched,
     since touchstart/touchmove/touchend never fire from a mouse pointer. */
  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = event.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    const SWIPE_THRESHOLD = 40;
    if (touchDeltaX.current <= -SWIPE_THRESHOLD) {
      setActive((i) => Math.min(TYPES.length - 1, i + 1));
    } else if (touchDeltaX.current >= SWIPE_THRESHOLD) {
      setActive((i) => Math.max(0, i - 1));
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <section className={styles.band} aria-label={t.spec.label}>
      <div className={styles.stage}>
        <div
          ref={plateRef}
          className={styles.plate}
          onMouseMove={tilt}
          onMouseLeave={resetTilt}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className={styles.plateFrame}>
            {/* All three plans mount together (stacked, only the active one
                visible) so the browser fetches them as soon as this section
                enters view — switching tabs is then instant, no fresh
                request per click. */}
            {TYPES.map((item, i) => (
              <div
                key={item.id}
                className={`${styles.plateImage} ${i === active ? styles.plateImageActive : ''}`}
                aria-hidden={i === active ? undefined : true}
              >
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  sizes="(min-width: 900px) 550px, 380px"
                />
              </div>
            ))}
          </div>
        </div>

        <ol className={styles.typeTabs}>
          {TYPES.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                className={`${styles.typeTab} ${i === active ? styles.typeTabActive : ''}`}
                aria-current={i === active ? 'true' : undefined}
                onClick={() => setActive(i)}
              >
                {item.id}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.panel}>
        <div>
          <h2 className={styles.name}>{project.projectName}</h2>
          <p className={styles.location}>{project.location}</p>
        </div>

        <div key={type.id} className={styles.typeBlock}>
          <p className={styles.typeName}>{type.name}</p>

          <dl className={styles.stats}>
            <div>
              <dt className={styles.statKey}>
                <Icon d={ICON_AREA} />
                {t.spec.area}
              </dt>
              <dd className={styles.statValue}>{type.area}</dd>
            </div>
          </dl>

          <p className={styles.description}>{type.description}</p>
        </div>

        <div className={styles.foot}>
          <Link href="/immobili" className={`arrow-link ${styles.cta}`}>
            <span>{t.spec.cta}</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
