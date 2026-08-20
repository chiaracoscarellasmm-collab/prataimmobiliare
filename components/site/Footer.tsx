import Image from 'next/image';
import Link from 'next/link';

import ArrowLink from '@/components/ui/ArrowLink';
import { contact, legalNav, nav, socials } from '@/data/site';
import { hourLabel, hourTime } from '@/lib/copy';
import { getI18n } from '@/lib/i18n';
import styles from './Footer.module.css';

const year = new Date().getFullYear();

export default async function Footer() {
  const { t } = await getI18n();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div>
            <p className={styles.lede}>
              {t.footer.ledeBefore}
              <em className="em">{t.footer.ledeEm}</em>
            </p>
            <div style={{ marginTop: '1.75rem' }}>
              <ArrowLink href="/contatti">{t.footer.cta}</ArrowLink>
            </div>
          </div>

          <div className={styles.cols}>
            <nav className={styles.col} aria-label={t.nav.footer}>
              <h2 className={styles.colHead}>{t.nav.site}</h2>
              <Link href="/" className={styles.link}>
                {t.nav.home}
              </Link>
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className={styles.link}>
                  {t.nav[item.key]}
                </Link>
              ))}
            </nav>

            <div className={styles.col}>
              <h2 className={styles.colHead}>{t.nav.contact}</h2>
              <a href={contact.phone.href} className={styles.link}>
                {contact.phone.label}
              </a>
              <p className={styles.value}>
                {t.hours.vat} {contact.vat}
              </p>
              <a href={contact.email.href} className={styles.link}>
                {contact.email.label}
              </a>
              <address className={styles.value} style={{ fontStyle: 'normal' }}>
                {contact.address.street}
                <br />
                {contact.address.city}
                <br />
                {contact.address.postalCode} {contact.address.province}
              </address>
              <a
                href={contact.maps.href}
                className={styles.link}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t.hours.maps}
              </a>
            </div>

            <div className={styles.col}>
              <h2 className={styles.colHead}>{t.hours.visit}</h2>
              <dl className={styles.hours}>
                {contact.hoursCompact.map((row) => (
                  <div key={row.days} className={styles.hoursBlock}>
                    <dt>{hourLabel(t, row.days)}</dt>
                    <dd>{hourTime(t, row.time)}</dd>
                  </div>
                ))}
              </dl>
              <p className={styles.hoursNote}>{t.hours.note}</p>
            </div>

            <div className={styles.col}>
              <h2 className={styles.colHead}>{t.contact.social}</h2>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className={styles.link}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.fine}>
            © {year} Prata Immobiliare · {t.hours.vat} {contact.vat}
          </p>
          <div className={styles.legal}>
            {legalNav.map((item) => (
              <Link key={item.href} href={item.href} className={styles.link}>
                {t.nav[item.key]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        {/* Wordmark del brand col solo nome: la Didone del logo non esiste come
            webfont nel progetto, quindi si usa l'artwork, nel beige di brand. */}
        <Image
          src="/brand/name-sand.png"
          alt=""
          width={1567}
          height={141}
          sizes="100vw"
        />
      </div>
    </footer>
  );
}
