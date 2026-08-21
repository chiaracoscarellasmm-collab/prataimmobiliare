'use client';

import { useEffect, useRef } from 'react';

import styles from './ValuationForm.module.css';

type Props = {
  step: number;
  title: string;
  body?: string;
  children: React.ReactNode;
};

/** Un solo step alla volta, con un piccolo fade+translateY — mai invadente. */
export default function FormStep({ step, title, body, children }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  return (
    <div key={step} className={`${styles.step} ${styles.stepEnter}`}>
      <div className={styles.stepHead}>
        <h2 className={styles.question} tabIndex={-1} ref={headingRef}>
          {title}
        </h2>
        {body && <p className={styles.stepBody}>{body}</p>}
      </div>
      {children}
    </div>
  );
}
