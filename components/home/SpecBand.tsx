'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useI18n } from '@/components/i18n/LanguageProvider';
import { projects } from '@/data/projects';
import styles from './SpecBand.module.css';

/** Small line marks, in the register of a technical sheet. */
const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICON_CALENDAR = 'M2 4h12v10H2zM2 7h12M5.5 2v3M10.5 2v3';
const ICON_PLOT = 'M2 2h12v12H2zM2 6h12M6 2v12';
const ICON_AREA = 'M2 14V2h12M2 14h12M5 11V6h5';

export default function SpecBand() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const project = projects[index];
  const plan = project.floorPlans[0] ?? project.gallery[0];

  const go = (delta: number) =>
    setIndex((i) => (i + delta + projects.length) % projects.length);

  return (
    <section className={styles.band} aria-label={t.spec.label}>
      <div className={styles.plate}>
        <Image
          src={plan.src}
          alt={plan.alt}
          width={plan.width}
          height={plan.height}
          sizes="(min-width: 900px) 52vw, 100vw"
        />
        <span className={styles.plateTag}>{t.spec.plan}</span>
      </div>

      <div className={styles.panel}>
        <div className={styles.head}>
          <span className={styles.label}>{t.spec.label}</span>
          <span className={styles.counter}>
            {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
          </span>
        </div>

        <div>
          <h2 className={styles.name}>{project.projectName}</h2>
          <p className={styles.location}>{project.location}</p>
        </div>

        <dl className={styles.stats}>
          <div>
            <dt className={styles.statKey}>
              <Icon d={ICON_CALENDAR} />
              {t.spec.completion}
            </dt>
            <dd className={styles.statValue}>{project.delivery}</dd>
          </div>
          <div>
            <dt className={styles.statKey}>
              <Icon d={ICON_PLOT} />
              {t.spec.units}
            </dt>
            <dd className={styles.statValue}>
              {String(project.numberOfUnits).padStart(2, '0')}
            </dd>
          </div>
          <div>
            <dt className={styles.statKey}>
              <Icon d={ICON_AREA} />
              {t.spec.houseArea}
            </dt>
            <dd className={styles.statValue}>{project.status}</dd>
          </div>
        </dl>

        <div className={styles.foot}>
          <div className={styles.nav}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => go(-1)}
              aria-label={t.spec.prev}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => go(1)}
              aria-label={t.spec.next}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <Link href={`/progetti/${project.slug}`} className={styles.typeTag}>
            <span className={styles.typeLabel}>{t.spec.typeLabel}</span>
            <span className={styles.typeValue}>{project.features[0]}</span>
          </Link>

          <div className={styles.thumbs} aria-hidden="true">
            {project.gallery.slice(0, 2).map((image) => (
              <span key={image.src} className={styles.thumb}>
                <Image src={image.src} alt="" width={108} height={80} sizes="54px" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
