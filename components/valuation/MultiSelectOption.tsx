'use client';

import type { Dictionary } from '@/data/i18n';
import { valuationLabel } from '@/lib/copy';
import type { Option } from '@/lib/valuation';
import styles from './ValuationForm.module.css';

type Props = {
  option: Option;
  selected: boolean;
  onToggle: () => void;
  t: Dictionary;
};

/** Pillola a selezione multipla — checkbox reale, stesso visual style di OptionCard. */
export default function MultiSelectOption({ option, selected, onToggle, t }: Props) {
  return (
    <label className={styles.chip}>
      <input type="checkbox" checked={selected} onChange={onToggle} />
      <span>{valuationLabel(t, option.key)}</span>
    </label>
  );
}
