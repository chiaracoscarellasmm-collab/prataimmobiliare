import Image from 'next/image';
import Link from 'next/link';

import Reveal from '@/components/ui/Reveal';
import { getI18n } from '@/lib/i18n';
import styles from './ValuationCTA.module.css';

export default async function ValuationCTA() {
  const { t } = await getI18n();

  return (
    /* `surface-light` re-points the colour tokens, so the copy reads dark on
       the cream ground instead of inheriting the dark-section palette. */
    <section className={`${styles.section} surface-light`} aria-labelledby="valuation-title">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.text}>
            <Reveal>
              <p className={styles.eyebrow}>{t.valuationCta.label}</p>
            </Reveal>

            <Reveal delay={90}>
              <h2 id="valuation-title" className={styles.title}>
                {t.valuationCta.title}
                <br />
                {t.valuationCta.titleEm}
              </h2>
            </Reveal>

            <Reveal delay={170}>
              <p className={styles.italic}>{t.valuationCta.italic}</p>
            </Reveal>

            <Reveal delay={250}>
              <p className={`pretty ${styles.body}`}>{t.valuationCta.body}</p>
            </Reveal>

            <Reveal delay={330}>
              <div className={styles.action}>
                <Link href="/vendi-affitta#questionario" className={styles.cta}>
                  <span>{t.valuationCta.cta}</span>
                  <span className={styles.ctaArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
                <p className={styles.note}>{t.valuationCta.note}</p>
              </div>
            </Reveal>

            <Reveal delay={410}>
              {/* A single editorial line, divided by hairlines — not three cards. */}
              <dl className={styles.benefits}>
                {t.valuationCta.benefits.map((benefit) => (
                  <div key={benefit.term} className={styles.benefit}>
                    <dt className={styles.benefitTerm}>{benefit.term}</dt>
                    <dd className={styles.benefitDesc}>{benefit.desc}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal className={styles.figure}>
            {/* Sostituibile: fotografia residenziale, non finanziaria. */}
            <Image
              src="/images/home/valutazione.jpg"
              alt={t.valuationCta.imageAlt}
              width={2000}
              height={1330}
              sizes="(min-width: 900px) 58vw, 100vw"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
