'use client';

import type { Dictionary } from '@/data/i18n';
import { valuationLabel } from '@/lib/copy';
import {
  CONDITIONS,
  ENERGY_CLASSES,
  OBJECTIVES,
  PROPERTY_TYPES,
  type ValuationData,
} from '@/lib/valuation';
import styles from './ValuationForm.module.css';

type Props = {
  data: ValuationData;
  t: Dictionary;
  onEdit: () => void;
  onSend: () => void;
};

function findLabel(t: Dictionary, options: { value: string; key: string }[], value: string) {
  const found = options.find((o) => o.value === value);
  return found ? valuationLabel(t, found.key) : null;
}

/** Piccolo riepilogo prima dell'invio — le informazioni chiave, non un dump di tutti i campi. */
export default function ValuationSummary({ data, t, onEdit, onSend }: Props) {
  const v = t.valuation;

  const propertyType =
    data.propertyType === 'altro' && data.propertyTypeOther.trim()
      ? data.propertyTypeOther.trim()
      : findLabel(t, PROPERTY_TYPES, data.propertyType);

  const lines: { key: string; value: string }[] = [];
  if (propertyType) lines.push({ key: v.propertyTypeLabel, value: propertyType });
  if (data.address.trim()) lines.push({ key: v.addressLabel, value: data.address.trim() });
  if (data.surface.trim()) lines.push({ key: v.surfaceLabel, value: `${data.surface.trim()} m²` });
  if (data.rooms) {
    lines.push({
      key: v.roomsLabel,
      value: data.rooms === 'non-lo-so' ? v.dontKnowLabel : data.rooms,
    });
  }
  const conditionLabel =
    data.condition === 'non-lo-so' ? v.dontKnowLabel : findLabel(t, CONDITIONS, data.condition);
  if (conditionLabel) lines.push({ key: v.conditionLabel, value: conditionLabel });
  if (data.energyClass) {
    lines.push({
      key: v.energyClassLabel,
      value: data.energyClass === 'non-lo-so' ? v.dontKnowLabel : (findLabel(t, ENERGY_CLASSES, data.energyClass) ?? ''),
    });
  }
  const objectiveLabel = findLabel(t, OBJECTIVES, data.objective);
  if (objectiveLabel) lines.push({ key: v.objectiveLabel, value: objectiveLabel });

  return (
    <div className={styles.step}>
      <div>
        <p className={styles.summaryLabel}>{v.summaryLabel}</p>
        <h2 className={styles.summaryTitle}>{v.summaryTitle}</h2>
      </div>

      <div className={styles.summaryCard}>
        {lines.map((line) => (
          <div key={line.key} className={styles.summaryLine}>
            <span className={styles.summaryKey}>{line.key}</span>
            <span className={styles.summaryValue}>{line.value}</span>
          </div>
        ))}
      </div>

      <div>
        <button type="button" className={styles.summaryEdit} onClick={onEdit}>
          {v.edit}
        </button>
      </div>

      <button type="button" className={`btn ${styles.whatsappBtn}`} onClick={onSend}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.96 9.96 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm5.87 14.24c-.25.7-1.45 1.33-2 1.4-.53.08-1.2.11-1.94-.12-.45-.14-1.02-.33-1.76-.64-3.1-1.34-5.12-4.46-5.28-4.67-.15-.21-1.26-1.68-1.26-3.2s.8-2.27 1.08-2.58c.28-.31.6-.38.8-.38.2 0 .4 0 .58.01.19.01.44-.07.68.53.25.6.85 2.08.92 2.23.08.15.13.32.02.53-.1.21-.15.34-.3.52-.15.18-.3.4-.44.54-.15.15-.3.31-.13.6.17.31.75 1.26 1.62 2.05 1.12 1.02 2.06 1.34 2.36 1.49.3.15.48.13.66-.08.18-.21.76-.9.97-1.21.2-.31.4-.26.68-.16.28.1 1.76.85 2.06 1 .3.15.5.23.57.36.08.13.08.72-.17 1.42Z" />
        </svg>
        {v.send}
        <span className="arrow" aria-hidden="true">→</span>
      </button>
    </div>
  );
}
