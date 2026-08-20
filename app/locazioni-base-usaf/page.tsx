import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import ArrowLink from '@/components/ui/ArrowLink';
import PageHero from '@/components/ui/PageHero';
import PropertyGrid from '@/components/property/PropertyGrid';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { getUsafProperties } from '@/data/properties';
import { getI18n } from '@/lib/i18n';
import styles from './usaf.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.usafPage.metaTitle,
    description: t.usafPage.metaDescription,
    alternates: { canonical: '/locazioni-base-usaf' },
    openGraph: {
      title: t.usafPage.ogTitle,
      description: t.usafPage.ogDescription,
      url: '/locazioni-base-usaf',
    },
  };
}

export default async function UsafPage() {
  const { t } = await getI18n();
  const rentals = getUsafProperties();

  return (
    <>
      <PageHero
        label={t.usafPage.label}
        title={
          <>
            {t.usafPage.title}
            <br />
            {t.usafPage.titleEm}
          </>
        }
        intro={t.usafPage.intro}
        actions={
          <>
            <ArrowLink href="#available">{t.usafPage.findHome}</ArrowLink>
            <ArrowLink href="/vendi-affitta?intent=affittare&target=usaf">
              {t.usafPage.listProperty}
            </ArrowLink>
          </>
        }
      />

      <div className="container" style={{ paddingBottom: 'clamp(2rem, 5vw, 4rem)' }}>
        <Reveal media className={styles.figure}>
          <Image
            src="/images/usaf/hero.jpg"
            alt={t.usafPage.heroAlt}
            width={2400}
            height={1350}
            priority
            sizes="100vw"
          />
        </Reveal>
      </div>

      <section className={styles.audiences} aria-labelledby="audiences-title">
        <div className="container">
          <h2 id="audiences-title" className="sr-only">
            {t.usafPage.audiences}
          </h2>
          <div className={styles.audienceGrid}>
            <div className={styles.audience}>
              <p className={styles.audienceLabel}>{t.usafPage.personnelLabel}</p>
              <h3 className={styles.audienceTitle}>{t.usafPage.personnelTitle}</h3>
              <p className={`pretty ${styles.audienceBody}`}>{t.usafPage.personnelBody}</p>
              <Reveal media className={styles.audienceMedia}>
                <Image
                  src="/images/usaf/personnel.jpg"
                  alt={t.usafPage.personnelAlt}
                  width={1500}
                  height={1100}
                  sizes="(min-width: 900px) 45vw, 100vw"
                />
              </Reveal>
              <div>
                <ArrowLink href="#available">{t.usafPage.viewRentals}</ArrowLink>
              </div>
            </div>

            <div className={styles.audience}>
              <p className={styles.audienceLabel}>{t.usafPage.ownersLabel}</p>
              <h3 className={styles.audienceTitle}>{t.usafPage.ownersTitle}</h3>
              <p className={`pretty ${styles.audienceBody}`}>{t.usafPage.ownersBody}</p>
              <Reveal media className={styles.audienceMedia}>
                <Image
                  src="/images/usaf/owners.jpg"
                  alt={t.usafPage.ownersAlt}
                  width={1500}
                  height={1100}
                  sizes="(min-width: 900px) 45vw, 100vw"
                />
              </Reveal>
              <div>
                <ArrowLink href="/vendi-affitta?intent=affittare&target=usaf">
                  {t.usafPage.listProperty}
                </ArrowLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.available} id="available" aria-labelledby="available-title">
        <div className="container on-dark">
          <div className={styles.availableHead}>
            <div>
              <SectionLabel>{t.usafPage.available}</SectionLabel>
              <h2 id="available-title" className={styles.availableTitle} style={{ marginTop: '1.25rem' }}>
                {t.usafPage.availableTitle}
              </h2>
            </div>
            <p className="lead">{t.usafPage.availableIntro}</p>
          </div>

          <PropertyGrid
            properties={rentals}
            onDark
            emptyAction={<ArrowLink href="/contatti">{t.usafPage.tellUs}</ArrowLink>}
          />

          <div style={{ marginTop: 'clamp(2.5rem, 5vw, 4rem)' }}>
            <ArrowLink href="/immobili?t=affitto">{t.usafPage.allRentals}</ArrowLink>
          </div>
        </div>
      </section>

      <section className="container section-sm" aria-labelledby="how-title">
        <SectionLabel>{t.usafPage.how}</SectionLabel>
        <h2
          id="how-title"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--fs-h2)',
            lineHeight: 1.02,
            letterSpacing: '-0.024em',
            margin: '1.25rem 0 clamp(2rem, 5vw, 3.5rem)',
            maxWidth: '14ch',
          }}
        >
          {t.usafPage.howTitle}
        </h2>

        <ol className={styles.steps}>
          {t.usafPage.steps.map((step, i) => (
            <Reveal as="li" key={step.name} className={styles.step} delay={i * 70}>
              <span className={styles.stepNum} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className={styles.stepName}>{step.name}</h3>
                <p className="meta" style={{ marginTop: '0.35rem' }}>
                  {step.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="container section-sm" aria-labelledby="faq-title">
        <SectionLabel>FAQ</SectionLabel>
        <h2
          id="faq-title"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--fs-h3)',
            letterSpacing: '-0.018em',
            margin: '1.25rem 0 clamp(1.5rem, 4vw, 2.5rem)',
          }}
        >
          {t.usafPage.faqTitle}
        </h2>

        <div className={styles.faq}>
          {t.usafPage.faq.map((entry) => (
            <details key={entry.q} className={styles.item}>
              <summary className={styles.summary}>
                <span>{entry.q}</span>
                <span className={styles.sign} aria-hidden="true">
                  +
                </span>
              </summary>
              <p className={styles.answer}>{entry.a}</p>
            </details>
          ))}
        </div>

        <p className="meta" style={{ marginTop: '2rem', maxWidth: '52ch' }}>
          {t.usafPage.faqMore}{' '}
          <Link href="/contatti" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {t.usafPage.faqWrite}
          </Link>
          .
        </p>
      </section>
    </>
  );
}
