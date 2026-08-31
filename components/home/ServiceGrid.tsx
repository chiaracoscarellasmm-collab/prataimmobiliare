'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useI18n } from '@/components/i18n/LanguageProvider';
import { contact } from '@/data/site';
import styles from './ServiceGrid.module.css';

type ServiceKey =
  | 'sales'
  | 'valuation'
  | 'rentals'
  | 'developments'
  | 'mortgages'
  | 'advisory'
  | 'holiday';

type Service = {
  key: ServiceKey;
  href: string;
  image: string;
  /** Slot in the editorial grid declared in the stylesheet. */
  area: string;
  /** Flip to true to publish a service that is prepared but not yet shown. */
  enabled: boolean;
  /** Some cards point nowhere more specific than the homepage — title and
      body carry the message on their own, without a CTA that overpromises. */
  showCta?: boolean;
};

/**
 * The agency's competences, read as a magazine spread rather than a set of
 * equal tiles: the frames differ in width and height, and one photograph
 * dominates each row.
 *
 * Adding a service is a one-line change here plus its copy in the dictionary
 * and a photograph at the matching path.
 */
const SERVICES: Service[] = [
  { key: 'sales', href: '/immobili', image: '/images/services/sales.webp', area: 'a', enabled: true },
  {
    key: 'valuation',
    href: '/vendi-affitta#questionario',
    image: '/images/services/valuation.webp',
    area: 'b',
    enabled: true,
  },
  {
    key: 'rentals',
    href: '/locazioni-americani',
    image: '/images/services/rentals-usaf.webp',
    area: 'c',
    enabled: true,
  },
  {
    key: 'developments',
    href: '/',
    image: '/images/services/developments.webp',
    area: 'd',
    enabled: true,
    showCta: false,
  },
  {
    key: 'mortgages',
    href: contact.whatsapp.href,
    image: '/images/services/mortgages.webp',
    area: 'e',
    enabled: true,
    showCta: false,
  },
  {
    key: 'advisory',
    href: contact.whatsapp.href,
    image: '/images/services/advisory.webp',
    area: 'f',
    enabled: true,
    showCta: false,
  },
  // Pronto per il futuro: immobili nelle località turistiche.
  {
    key: 'holiday',
    href: '/immobili',
    image: '/images/services/holiday.webp',
    area: 'g',
    enabled: false,
  },
];

export default function ServiceGrid() {
  const { t } = useI18n();
  const services = SERVICES.filter((service) => service.enabled);

  return (
    <section className={styles.section} aria-labelledby="services-title">
      <div className="container">
        <div className={styles.divider} aria-hidden="true" />
      </div>
      <div className={styles.grid}>
        <div className={styles.copy}>
          <div>
            <p className={styles.label}>{t.services.label}</p>
            <h2 id="services-title" className={styles.title}>
              {t.services.title}
            </h2>
          </div>

          <div className={styles.copyFoot}>
            <p className={styles.intro}>{t.services.intro}</p>
            <div className={styles.actions}>
              <Link href="/vendi-affitta#questionario" className="pill pill-solid">
                {t.services.ctaPrimary}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer" className="pill">
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </div>

        {services.map(({ key, href, image, area, showCta = true }, i) => {
          const item = t.services.items[key];
          const external = href.startsWith('http');
          return (
            <Link
              key={key}
              href={href}
              className={styles.card}
              data-area={area}
              aria-label={`${item.title.replace('\n', ' ')} — ${item.body}`}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className={styles.plate}>
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 32vw, (min-width: 720px) 50vw, 100vw"
                  quality={80}
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
              </span>
              <span className={styles.veil} aria-hidden="true" />

              <span className={styles.cardBody}>
                <span className={styles.cardTitle}>{item.title}</span>

                <span className={styles.reveal}>
                  <span className={styles.cardText}>{item.body}</span>
                  {showCta && (
                    <span className={styles.cardCta}>
                      {item.cta}
                      <span className={styles.cardArrow} aria-hidden="true">
                        →
                      </span>
                    </span>
                  )}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
