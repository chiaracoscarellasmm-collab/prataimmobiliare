import type { Metadata } from 'next';

import ArrowLink from '@/components/ui/ArrowLink';
import PageHero from '@/components/ui/PageHero';
import { getI18n } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.notFound.title,
    robots: { index: false, follow: true },
  };
}

export default async function NotFound() {
  const { t } = await getI18n();

  return (
    <PageHero
      label="404"
      title={
        <>
          {t.notFound.title}
          <br />
          {t.notFound.titleEm}
        </>
      }
      intro={t.notFound.intro}
      actions={
        <>
          <ArrowLink href="/">{t.notFound.home}</ArrowLink>
          <ArrowLink href="/immobili">{t.notFound.properties}</ArrowLink>
        </>
      }
    />
  );
}
