import Reveal from '@/components/ui/Reveal';
import { testimonials } from '@/data/testimonials';
import { getI18n } from '@/lib/i18n';
import styles from './Testimonials.module.css';

export default async function Testimonials() {
  const { t } = await getI18n();

  return (
    <section className={styles.section} aria-labelledby="testimonials-title">
      <div className="container">
        <Reveal className={styles.intro}>
          <p className={styles.badge}>{t.testimonials.badge}</p>
          <h2 id="testimonials-title" className={styles.title}>
            {t.testimonials.title} <em className="em">{t.testimonials.titleEm}</em>
          </h2>
          <p className={styles.lede}>{t.testimonials.lede}</p>
        </Reveal>

        <div className={styles.grid}>
          {testimonials.map((item, i) => (
            <Reveal key={item.id} delay={80 + i * 60} as="figure" className={styles.card}>
              <blockquote className={styles.quote}>
                <p>
                  {t.testimonials.quotes[item.id as keyof typeof t.testimonials.quotes] ??
                    item.quote}
                </p>
              </blockquote>
              <figcaption className={styles.person}>
                <span className={styles.avatar} aria-hidden="true">
                  {item.initials}
                </span>
                <span>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.detail}>
                    {t.testimonials.details[item.id as keyof typeof t.testimonials.details] ??
                      item.detail}
                  </span>
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
