'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import ArrowLink from '@/components/ui/ArrowLink';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { useI18n } from '@/components/i18n/LanguageProvider';
import { projects } from '@/data/projects';
import { labelOf } from '@/data/i18n';
import { padIndex } from '@/lib/format';
import styles from './DevelopmentsSection.module.css';

/**
 * Editorial sequence for the development projects.
 *
 * Desktop: the render stays pinned while the project record scrolls past it,
 * crossfading as each panel takes the middle of the screen. Mobile collapses
 * to a plain vertical sequence — legibility before effect.
 */
export default function DevelopmentsSection() {
  const { t } = useI18n();
  const panelRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const nodes = panelRefs.current.filter(Boolean) as HTMLLIElement[];
    if (!nodes.length || !window.matchMedia('(min-width: 1024px)').matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        // The panel closest to the middle band wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = nodes.indexOf(visible.target as HTMLLIElement);
        if (index >= 0) setActive(index);
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.section} aria-labelledby="developments-title">
      <div className="container">
        <div className={styles.head}>
          <div>
            <SectionLabel>{t.developments.label}</SectionLabel>
            <Reveal delay={80}>
              <h2
                id="developments-title"
                className={styles.title}
                style={{ marginTop: '1.25rem' }}
              >
                {t.developments.title}
                <br />
                <em className="em">{t.developments.titleEm}</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <p className={`lead pretty ${styles.intro}`}>{t.developments.intro}</p>
          </Reveal>
        </div>

        <div className={styles.stage}>
          <div className={styles.visual} aria-hidden="true">
            <div className={styles.stack}>
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className={`${styles.slide} ${i === active ? styles.slideActive : ''}`}
                >
                  <Image
                    src={project.heroImage.src}
                    alt=""
                    width={project.heroImage.width}
                    height={project.heroImage.height}
                    sizes="52vw"
                  />
                </div>
              ))}
            </div>
            <p className={styles.counter}>
              <span className={styles.counterNow}>{padIndex(active)}</span>
              <span>/ {padIndex(projects.length - 1)}</span>
            </p>
          </div>

          <ol className={styles.panels}>
            {projects.map((project, i) => (
              <li
                key={project.id}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                className={`${styles.panel} ${i === active ? styles.panelActive : ''}`}
              >
                <p className={styles.index}>{t.developments.index}</p>

                <h3 className={styles.projectName}>{project.projectName}</h3>

                <div className={styles.mobileFigure}>
                  <Image
                    src={project.heroImage.src}
                    alt={project.heroImage.alt}
                    width={project.heroImage.width}
                    height={project.heroImage.height}
                    sizes="100vw"
                  />
                </div>

                <p className="pretty" style={{ maxWidth: '42ch' }}>
                  {project.intro}
                </p>

                <dl className={styles.specs}>
                  <div className={styles.spec}>
                    <dt className={styles.specKey}>{t.developments.location}</dt>
                    <dd className={styles.specValue}>{project.location}</dd>
                  </div>
                  <div className={styles.spec}>
                    <dt className={styles.specKey}>{t.developments.units}</dt>
                    <dd className={styles.specValue}>{project.numberOfUnits}</dd>
                  </div>
                  <div className={styles.spec}>
                    <dt className={styles.specKey}>{t.developments.status}</dt>
                    <dd className={styles.specValue}>
                      {labelOf(t.project.statuses as Record<string, string>, project.status)}
                    </dd>
                  </div>
                  <div className={styles.spec}>
                    <dt className={styles.specKey}>{t.developments.delivery}</dt>
                    <dd className={styles.specValue}>{project.delivery}</dd>
                  </div>
                </dl>

                <div>
                  <ArrowLink href={`/progetti/${project.slug}`}>{t.developments.cta}</ArrowLink>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
