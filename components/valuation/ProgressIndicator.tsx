'use client';

import type { Dictionary } from '@/data/i18n';
import { interpolate } from '@/data/i18n';
import { STEP_COUNT } from '@/lib/valuation';
import styles from './ValuationForm.module.css';

type Props = { step: number; t: Dictionary };

/** Linea sottile + "0X / 07" — mai una barra colorata stile software. */
export default function ProgressIndicator({ step, t }: Props) {
  return (
    <>
      <div className={styles.progressRow}>
        <p className={styles.stepCount}>
          {interpolate(t.valuation.stepOf, {
            current: String(step).padStart(2, '0'),
            total: String(STEP_COUNT).padStart(2, '0'),
          })}
        </p>
        <p className={styles.stepName}>{t.valuation.stepLabels[step - 1]}</p>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEP_COUNT}
        aria-valuenow={step}
        aria-label={t.valuation.progress}
      >
        <span className={styles.bar} style={{ transform: `scaleX(${step / STEP_COUNT})` }} />
      </div>
    </>
  );
}
