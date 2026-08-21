import Image from 'next/image';

import ArrowLink from '@/components/ui/ArrowLink';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { getI18n } from '@/lib/i18n';
import styles from './Manifesto.module.css';

export default async function Manifesto() {
  const { t } = await getI18n();

  return (
    <section className={styles.section} aria-labelledby="manifesto-title">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.text}>
            <SectionLabel>{t.manifesto.label}</SectionLabel>

            <Reveal delay={80}>
              <h2 id="manifesto-title" className={`${styles.heading} balance`}>
                {t.manifesto.title}{' '}
                <span className={styles.headingSoft}>
                  <em className="em">{t.manifesto.titleEm}</em>
                </span>
              </h2>
            </Reveal>

            <Reveal delay={160}>
              <p className={`lead pretty ${styles.body}`}>{t.manifesto.body}</p>
            </Reveal>

            <Reveal delay={240}>
              <ArrowLink href="/chi-siamo">{t.manifesto.cta}</ArrowLink>
            </Reveal>
          </div>

          <figure className={styles.figure}>
            <Reveal media className={styles.frame}>
              <Image
                src="/images/home/manifesto.webp"
                alt={t.manifesto.imageAlt}
                width={1000}
                height={1400}
                sizes="(min-width: 900px) 34vw, 100vw"
              />
            </Reveal>
            <figcaption className={styles.caption}>{t.manifesto.caption}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
