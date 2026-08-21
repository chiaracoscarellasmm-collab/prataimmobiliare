import type { Metadata } from 'next';
import Image from 'next/image';

import ArrowLink from '@/components/ui/ArrowLink';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { buildElisaWhatsAppUrl } from '@/lib/elisa';
import { getI18n } from '@/lib/i18n';
import styles from './locazioni-americani.module.css';

/**
 * Le due metà del blocco finale restano ciascuna nella propria lingua per
 * design — parlano a due pubblici diversi — quindi vivono qui, non nel
 * dizionario i18n che segue la lingua del sito.
 */
const PATHS_COPY = {
  personnel: {
    eyebrow: 'FOR USAF PERSONNEL',
    titleLine1: 'Are you looking',
    titleLine2: 'for a home?',
    body: "Our available homes change frequently. Tell us what you're looking for and we'll help you find the right property in the Aviano and Pordenone area.",
    cta: 'Ask Elisa about available homes',
    message:
      "Hi Elisa, I'm looking for a home in the Aviano area. I'd like to know more about the properties currently available.",
  },
  owner: {
    eyebrow: 'PER I PROPRIETARI',
    titleLine1: 'Affitta il tuo immobile',
    titleLine2: 'al personale americano.',
    body: 'Da oltre 30 anni seguiamo proprietari e personale americano in ogni fase della locazione, dalla ricerca dell’inquilino al contratto, con assistenza dedicata anche in inglese.',
    cta: 'Parla con Elisa',
    message:
      'Buongiorno Elisa, ho un immobile da affittare e vorrei avere maggiori informazioni sul servizio Locazioni Americani di Prata Immobiliare.',
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  const p = t.locazioniAmericani;
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: '/locazioni-americani' },
    openGraph: {
      title: p.ogTitle,
      description: p.ogDescription,
      url: '/locazioni-americani',
    },
  };
}

/**
 * Pagina servizio, non listing: nessuna lettura di properties.json, nessun
 * filtro USAF, nessuna property card. Ogni CTA apre WhatsApp con Elisa, mai
 * il numero generale dell'agenzia (vedi lib/elisa.ts).
 */
export default async function LocazioniAmericaniPage() {
  const { t } = await getI18n();
  const p = t.locazioniAmericani;
  const elisaUrl = buildElisaWhatsAppUrl();
  const elisaPersonnelUrl = buildElisaWhatsAppUrl(PATHS_COPY.personnel.message);
  const elisaOwnerUrl = buildElisaWhatsAppUrl(PATHS_COPY.owner.message);

  return (
    <>
      <section className={styles.hero} aria-labelledby="locazioni-title">
        <div className={styles.ground} aria-hidden="true" />
        <div className={styles.scrim} aria-hidden="true" />

        <div className={`container ${styles.heroContent}`}>
          <Reveal>
            <p className={styles.eyebrow}>{p.hero.eyebrow}</p>
          </Reveal>

          <Reveal delay={80}>
            <h1 id="locazioni-title" className={styles.heroTitle}>
              {p.hero.titleLine1}
              <br />
              {p.hero.titleLine2}
              <br />
              {p.hero.titleLine3}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className={`pretty ${styles.heroBody}`}>{p.hero.body}</p>
          </Reveal>

          <Reveal delay={240}>
            <div className={styles.heroActions}>
              <a href={elisaUrl} target="_blank" rel="noopener noreferrer" className={styles.heroCta}>
                {p.hero.cta}
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <p className={styles.microcopy}>{p.hero.microcopy}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ SERVIZIO */}
      <section className={`${styles.service} surface-light`} aria-labelledby="service-title">
        <div className="container">
          <SectionLabel>{p.service.eyebrow}</SectionLabel>
          <h2
            id="service-title"
            className={styles.sectionTitle}
            style={{ marginTop: '1rem', maxWidth: '18ch' }}
          >
            {p.service.titleLine1}
            <br />
            {p.service.titleLine2}
          </h2>

          <div className={styles.serviceGrid}>
            <ol className={styles.serviceList}>
              {p.service.items.map((item, i) => (
                <Reveal as="li" key={item.title} className={styles.serviceItem} delay={i * 70}>
                  <span className={styles.serviceNum} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className={styles.serviceTitle}>{item.title}</h3>
                    <p className={`pretty ${styles.serviceBody}`}>{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal media delay={140} className={styles.serviceMedia}>
              <Image
                src="/locazioni_americani.webp"
                alt=""
                width={712}
                height={890}
                sizes="(min-width: 900px) 32vw, 100vw"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- TERRITORIO */}
      <section className={styles.territory} aria-labelledby="territory-title">
        <div className={styles.mapGround} aria-hidden="true" />
        <div className={styles.mapScrim} aria-hidden="true" />

        <div className="container">
          <div className={styles.territoryHead}>
            <div>
              <SectionLabel>{p.territory.eyebrow}</SectionLabel>
              <h2 id="territory-title" className={styles.territoryTitle} style={{ marginTop: '1.25rem' }}>
                {p.territory.titleLine1}
                <br />
                {p.territory.titleLine2}
              </h2>
            </div>
            <p className={`pretty ${styles.territoryCopy}`}>{p.territory.paragraph}</p>
          </div>

          <Reveal delay={100}>
            <p className={styles.places}>{p.territory.places}</p>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- IMMOBILI RICHIESTI */}
      <section className={`${styles.requested} surface-light`} aria-labelledby="requested-title">
        <div className="container">
          <div className={styles.requestedHead}>
            <SectionLabel>{p.requested.eyebrow}</SectionLabel>
            <h2 id="requested-title" className={styles.requestedTitle}>
              {p.requested.titleLine1}
              <br />
              {p.requested.titleLine2}
            </h2>
            <p className={`pretty ${styles.requestedIntro}`}>{p.requested.intro}</p>
          </div>

          <div className={styles.requestedGrid}>
            {p.requested.items.map((item, i) => (
              <Reveal key={item.title} className={styles.requestedItem} delay={i * 50}>
                <p className={styles.requestedTitleSm}>{item.title}</p>
                <p className={`pretty ${styles.requestedBody}`}>{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- PERCORSI */}
      <section className={styles.paths} aria-label="Percorsi di contatto — American personnel and owners">
        <div className="container">
          <div className={styles.pathsGrid}>
            <div className={styles.path}>
              <Reveal>
                <p className={styles.pathEyebrow}>{PATHS_COPY.personnel.eyebrow}</p>
              </Reveal>
              <Reveal delay={70}>
                <h2 className={styles.pathTitle}>
                  {PATHS_COPY.personnel.titleLine1}
                  <br />
                  {PATHS_COPY.personnel.titleLine2}
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className={`pretty ${styles.pathBody}`}>{PATHS_COPY.personnel.body}</p>
              </Reveal>
              <Reveal delay={210}>
                <ArrowLink href={elisaPersonnelUrl} size="lg" target="_blank" rel="noopener noreferrer">
                  {PATHS_COPY.personnel.cta}
                </ArrowLink>
              </Reveal>
            </div>

            <div className={styles.path}>
              <Reveal>
                <p className={styles.pathEyebrow}>{PATHS_COPY.owner.eyebrow}</p>
              </Reveal>
              <Reveal delay={70}>
                <h2 className={styles.pathTitle}>
                  {PATHS_COPY.owner.titleLine1}
                  <br />
                  {PATHS_COPY.owner.titleLine2}
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className={`pretty ${styles.pathBody}`}>{PATHS_COPY.owner.body}</p>
              </Reveal>
              <Reveal delay={210}>
                <ArrowLink href={elisaOwnerUrl} size="lg" target="_blank" rel="noopener noreferrer">
                  {PATHS_COPY.owner.cta}
                </ArrowLink>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
