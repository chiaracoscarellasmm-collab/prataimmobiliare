'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import MultiStepValuationForm from '@/components/valuation/MultiStepValuationForm';
import SectionLabel from '@/components/ui/SectionLabel';
import { useI18n } from '@/components/i18n/LanguageProvider';
import type { ValuationData } from '@/lib/valuation';
import IntentRoutes from './IntentRoutes';
import styles from './routes.module.css';

/**
 * Holds the intent selected either by the two routes or by an incoming link
 * (`?intent=affittare&target=usaf`), and hands it to the questionnaire.
 */
export default function ValuationFlow() {
  const { t } = useI18n();
  const params = useSearchParams();
  const fromUrl = params.get('intent');
  const target = params.get('target') === 'usaf' ? 'usaf' : '';

  const [intent, setIntent] = useState<ValuationData['intent']>(
    fromUrl === 'vendere' || fromUrl === 'affittare' ? fromUrl : ''
  );

  const select = useCallback((next: 'vendere' | 'affittare') => {
    setIntent(next);
    document.getElementById('questionario')?.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <>
      <section className={styles.section} aria-labelledby="routes-title">
        <div className="container">
          <div className={styles.head}>
            <SectionLabel>{t.sellPage.routesLabel}</SectionLabel>
            <h2 id="routes-title" className={styles.title} style={{ marginTop: '1.25rem' }}>
              {t.sellPage.routesTitle}
            </h2>
          </div>
          <IntentRoutes onSelect={select} />
        </div>
      </section>

      <MultiStepValuationForm initialIntent={intent} initialTarget={target} />
    </>
  );
}
