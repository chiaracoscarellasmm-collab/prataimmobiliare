import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';

import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import ScrollToLink from '@/components/ui/ScrollToLink';
import MultiStepValuationForm from '@/components/valuation/MultiStepValuationForm';
import { getI18n } from '@/lib/i18n';
import styles from './routes.module.css';
import ValuationFlow from './ValuationFlow';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.sellPage.metaTitle,
    description: t.sellPage.metaDescription,
    alternates: { canonical: '/vendi-affitta' },
    openGraph: {
      title: t.sellPage.ogTitle,
      description: t.sellPage.ogDescription,
      url: '/vendi-affitta',
    },
  };
}

export default async function VendiAffittaPage() {
  const { t } = await getI18n();

  return (
    <>
      <PageHero
        label={t.sellPage.label}
        title={
          <>
            {t.sellPage.title}
            <br />
            {t.sellPage.titleEm}
          </>
        }
        intro={t.sellPage.intro}
        actions={<ScrollToLink targetId="questionario">{t.sellPage.cta}</ScrollToLink>}
      />

      <div className="container" style={{ paddingBottom: 'clamp(2rem, 5vw, 4rem)' }}>
        <Reveal media className={styles.figure}>
          <Image
            src="/images/about/vendi-wide.jpg"
            alt={t.sellPage.imageAlt}
            width={2400}
            height={1030}
            priority
            sizes="100vw"
          />
        </Reveal>
      </div>

      <Suspense fallback={<MultiStepValuationForm />}>
        <ValuationFlow />
      </Suspense>
    </>
  );
}
