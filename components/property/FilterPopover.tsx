'use client';

import { useEffect, useId, useRef, useState } from 'react';

import styles from './PropertySearch.module.css';

type Props = {
  label: string;
  /** What the pill shows when something is chosen; falsy means "unset". */
  value?: string;
  placeholder: string;
  children: (close: () => void) => React.ReactNode;
  /** Widens the panel for two-column contents such as a price range. */
  wide?: boolean;
};

/**
 * A pill that opens a small panel.
 *
 * Native `<select>` cannot be styled to match this design, so this is a custom
 * disclosure — but it keeps the semantics a select would give you: a labelled
 * button, `aria-expanded`, Escape to dismiss, focus returned to the trigger,
 * and a click outside to close.
 */
export default function FilterPopover({
  label,
  value,
  placeholder,
  children,
  wide = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div className={styles.field} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.pill} ${value ? styles.pillSet : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className={styles.pillLabel}>{label}</span>
        <span className={styles.pillValue}>{value || placeholder}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>

      <div
        id={panelId}
        className={`${styles.panel} ${wide ? styles.panelWide : ''} ${open ? styles.panelOpen : ''}`}
        role="group"
        aria-label={label}
        hidden={!open}
      >
        {children(close)}
      </div>
    </div>
  );
}
