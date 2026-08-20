import Image from 'next/image';
import Link from 'next/link';

import { getI18n } from '@/lib/i18n';
import styles from './FinalCTA.module.css';

export default async function FinalCTA() {
  const { t } = await getI18n();
  const routes = [
    { label: t.finalCta.looking, href: '/immobili' },
    { label: t.finalCta.selling, href: '/vendi-affitta' },
    { label: t.finalCta.usaf, href: '/locazioni-base-usaf' },
  ];

  return (
    <section className={styles.section} aria-labelledby="final-cta-title">
      <div className={styles.bg}>
        <Image
          src="/municipio_pordenone_foto_agenziaimmobiliare.jpg"
          alt={t.finalCta.imageAlt}
          fill
          sizes="100vw"
          quality={82}
        />
      </div>
      <div className={styles.scrim} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <p className={`label ${styles.label}`}>{t.finalCta.label}</p>
        <h2 id="final-cta-title" className={styles.title}>
          {t.finalCta.title}
          <br />
          <em className="em">{t.finalCta.titleEm}</em>
        </h2>

        <nav className={styles.routes} aria-label={t.finalCta.routes}>
          {routes.map((route) => (
            <Link key={route.href} href={route.href} className={styles.route}>
              <span>{route.label}</span>
              <span className={`arrow ${styles.arrow}`} aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
