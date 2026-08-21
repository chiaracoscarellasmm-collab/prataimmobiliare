import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHero from '@/components/ui/PageHero';
import ScrollToLink from '@/components/ui/ScrollToLink';
import ValuationForm from '@/components/valuation/ValuationForm';
import { getI18n } from '@/lib/i18n';

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
            <em className="em">{t.sellPage.titleEm}</em>
          </>
        }
        intro={t.sellPage.intro}
        actions={
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            <ScrollToLink targetId="questionario">{t.sellPage.cta}</ScrollToLink>
            <p className="meta">{t.sellPage.microcopy}</p>
          </div>
        }
      />

      <Suspense fallback={null}>
        <ValuationForm />
      </Suspense>
    </>
  );
}
