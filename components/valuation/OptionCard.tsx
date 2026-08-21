'use client';

import type { Dictionary } from '@/data/i18n';
import { valuationLabel } from '@/lib/copy';
import type { Option } from '@/lib/valuation';
import styles from './ValuationForm.module.css';

type Props = {
  option: Option;
  name: string;
  selected: boolean;
  onSelect: () => void;
  t: Dictionary;
};

/** Un'unica pillola selezionabile — vero radio input, mai un div cliccabile. */
export default function OptionCard({ option, name, selected, onSelect, t }: Props) {
  return (
    <label className={styles.chip}>
      <input type="radio" name={name} checked={selected} onChange={onSelect} />
      <span>{valuationLabel(t, option.key)}</span>
    </label>
  );
}
