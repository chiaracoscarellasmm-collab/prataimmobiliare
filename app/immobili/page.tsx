import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';

import { properties } from '@/data/properties';
import { getI18n } from '@/lib/i18n';
import PropertyBrowser from './PropertyBrowser';
import styles from './browser.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.propertiesPage.metaTitle,
    description: t.propertiesPage.metaDescription,
    alternates: { canonical: '/immobili' },
    openGraph: {
      title: t.propertiesPage.ogTitle,
      description: t.propertiesPage.ogDescription,
      url: '/immobili',
      images: [{ url: '/hero_immobili_prata_immobiliare.png' }],
    },
  };
}

export default async function ImmobiliPage() {
  const { t } = await getI18n();

  return (
    <>
      {/* The page opens on a photograph, not on a grid of listings. */}
      <section className={styles.hero} aria-labelledby="properties-title">
        <div className={styles.heroBg}>
          <Image
            src="/hero_immobili_prata_immobiliare.webp"
            alt={t.propertiesPage.heroAlt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={82}
          />
        </div>
        <div className={styles.heroScrim} aria-hidden="true" />

        <div className={`container ${styles.heroInner}`}>
          <p className={styles.heroLabel}>{t.propertiesPage.label}</p>
          <h1 id="properties-title" className={styles.heroTitle}>
            {t.propertiesPage.title}
            <br />
            <em>{t.propertiesPage.titleEm}</em>
          </h1>
          <p className={styles.heroIntro}>{t.propertiesPage.intro}</p>
        </div>
      </section>

      <Suspense fallback={null}>
        <PropertyBrowser properties={properties} />
      </Suspense>
    </>
  );
}
