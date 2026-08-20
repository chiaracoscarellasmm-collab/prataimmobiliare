'use client';

import { useI18n } from '@/components/i18n/LanguageProvider';
import styles from './routes.module.css';

type Props = { onSelect: (intent: 'vendere' | 'affittare') => void };

/** Choosing a route preselects the first answer of the questionnaire. */
export default function IntentRoutes({ onSelect }: Props) {
  const { t } = useI18n();
  const routes = [
    {
      intent: 'vendere' as const,
      title: t.sellPage.sellTitle,
      body: t.sellPage.sellBody,
    },
    {
      intent: 'affittare' as const,
      title: t.sellPage.rentTitle,
      body: t.sellPage.rentBody,
    },
  ];

  return (
    <div className={styles.routes}>
      {routes.map((route, i) => (
        <button
          key={route.intent}
          type="button"
          className={styles.route}
          onClick={() => onSelect(route.intent)}
          style={{ textAlign: 'left' }}
        >
          <span className={styles.routeIndex} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className={styles.routeTitle}>{route.title}</span>
          <span className={`pretty ${styles.routeBody}`}>{route.body}</span>
          <span className={styles.routeCta}>
            {t.sellPage.start}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
