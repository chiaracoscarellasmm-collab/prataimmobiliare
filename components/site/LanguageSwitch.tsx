'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { setLocale } from '@/app/actions/locale';
import type { Locale } from '@/data/i18n';
import { useI18n } from '@/components/i18n/LanguageProvider';
import styles from './LanguageSwitch.module.css';

const LOCALES: Locale[] = ['it', 'en'];

export default function LanguageSwitch() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className={styles.switch} role="group" aria-label={t.meta.language}>
      {LOCALES.map((code, i) => (
        <span key={code} className={styles.item}>
          {i > 0 ? (
            <span className={styles.dot} aria-hidden="true">
              ·
            </span>
          ) : null}
          <button
            type="button"
            className={locale === code ? styles.active : styles.idle}
            aria-pressed={locale === code}
            disabled={pending}
            onClick={() => {
              if (code === locale) return;
              startTransition(async () => {
                await setLocale(code);
                router.refresh();
              });
            }}
          >
            {code.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
