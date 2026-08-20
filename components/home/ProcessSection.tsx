import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { getI18n } from '@/lib/i18n';
import styles from './ProcessSection.module.css';

export default async function ProcessSection() {
  const { t } = await getI18n();

  return (
    <section className={styles.section} aria-labelledby="process-title">
      <div className="container on-dark">
        <div className={styles.head}>
          <div>
            <SectionLabel>{t.process.label}</SectionLabel>
            <Reveal delay={80}>
              <h2 id="process-title" className={styles.title} style={{ marginTop: '1.25rem' }}>
                {t.process.title}
                <br />
                {t.process.titleEm}
              </h2>
            </Reveal>
          </div>
        </div>

        <ol className={styles.steps}>
          {t.process.steps.map((step, i) => (
            <Reveal as="li" key={step.name} className={styles.step} delay={i * 70}>
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.name}>{step.name}</h3>
              <p className={styles.desc}>{step.desc}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
