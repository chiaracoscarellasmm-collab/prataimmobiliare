import type { Metadata } from 'next';
import Image from 'next/image';

import ArrowLink from '@/components/ui/ArrowLink';
import PageHero from '@/components/ui/PageHero';
import ProcessSection from '@/components/home/ProcessSection';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { contact } from '@/data/site';
import { getI18n } from '@/lib/i18n';
import styles from './about.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.about.metaTitle,
    description: t.about.metaDescription,
    alternates: { canonical: '/chi-siamo' },
    openGraph: {
      title: `${t.about.metaTitle} — Prata Immobiliare`,
      description: t.about.ogDescription,
      url: '/chi-siamo',
    },
  };
}

/** PLACEHOLDER — nessun membro del team è reale. Sostituire con dati forniti. */
const team = [
  { name: '[NOME COGNOME]', role: '[RUOLO]' },
  { name: '[NOME COGNOME]', role: '[RUOLO]' },
  { name: '[NOME COGNOME]', role: '[RUOLO]' },
];

export default async function ChiSiamoPage() {
  const { t } = await getI18n();

  return (
    <>
      <PageHero
        label={t.about.label}
        title={
          <>
            {t.about.title}
            <br />
            {t.about.titleEm}
          </>
        }
        intro={t.about.intro}
        actions={
          <ArrowLink href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer">
            {t.about.cta}
          </ArrowLink>
        }
      />

      <div className="container" style={{ paddingBottom: 'clamp(2.5rem, 6vw, 5rem)' }}>
        <Reveal media className={styles.figure}>
          <Image
            src="/images/about/hero.webp"
            alt={t.about.heroAlt}
            width={2200}
            height={1283}
            priority
            sizes="100vw"
          />
        </Reveal>
      </div>

      <section className="container section-sm" aria-labelledby="agency-title">
        <div className={styles.split}>
          <div>
            <SectionLabel>{t.about.agency}</SectionLabel>
            <Reveal delay={80}>
              <h2 id="agency-title" className={styles.pullTitle} style={{ margin: '1.25rem 0 1.75rem' }}>
                {t.about.agencyTitle}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <div className={styles.prose}>
                <p>{t.about.agencyP1}</p>
                <p>{t.about.agencyP2}</p>
              </div>
            </Reveal>
          </div>

          <Reveal media className={styles.portrait}>
            <Image
              src="/images/about/studio.webp"
              alt={t.about.studioAlt}
              width={1300}
              height={1650}
              sizes="(min-width: 900px) 34vw, 100vw"
            />
          </Reveal>
        </div>
      </section>

      <section className="container section-sm" aria-labelledby="values-title">
        <SectionLabel>{t.about.valuesLabel}</SectionLabel>
        <Reveal delay={80}>
          <h2 id="values-title" className={styles.pullTitle} style={{ margin: '1.25rem 0 clamp(2rem, 4vw, 3rem)' }}>
            {t.about.valuesTitle}
          </h2>
        </Reveal>

        <ol className={styles.values}>
          {t.about.values.map((value, i) => (
            <Reveal as="li" key={value.name} className={styles.value} delay={i * 70}>
              <span className={styles.valueNum} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.valueName}>{value.name}</h3>
              <p className={styles.valueBody}>{value.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="container section-sm" aria-labelledby="territory-title">
        <div className={`${styles.split} ${styles.splitReverse}`}>
          <Reveal media className={styles.figure} style={{ aspectRatio: '3 / 2' }}>
            <Image
              src="/images/about/territorio.webp"
              alt={t.about.territoryAlt}
              width={1800}
              height={1080}
              sizes="(min-width: 900px) 60vw, 100vw"
            />
          </Reveal>

          <div>
            <SectionLabel>{t.about.territory}</SectionLabel>
            <Reveal delay={80}>
              <h2 id="territory-title" className={styles.pullTitle} style={{ margin: '1.25rem 0 1.5rem' }}>
                {t.about.territoryTitle}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="lead pretty" style={{ maxWidth: '42ch' }}>
                {t.about.territoryBody}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <ProcessSection />

      <section className={styles.team} aria-labelledby="team-title">
        <div className="container">
          <SectionLabel>{t.about.team}</SectionLabel>
          <Reveal delay={80}>
            <h2 id="team-title" className={styles.pullTitle} style={{ marginTop: '1.25rem' }}>
              {t.about.teamTitle}
            </h2>
          </Reveal>

          <div className={styles.teamGrid}>
            {team.map((member, i) => (
              <Reveal key={i} className={styles.member} delay={i * 80}>
                <div className={styles.memberFrame}>{t.about.photoPlaceholder}</div>
                <p className={styles.memberName}>{member.name}</p>
                <p className="meta">{member.role}</p>
              </Reveal>
            ))}
          </div>

          <p className="meta" style={{ marginTop: '2rem', maxWidth: '48ch' }}>
            {t.about.teamNote}
          </p>
        </div>
      </section>

      <section className="container section-sm">
        <div className={styles.split}>
          <Reveal>
            <h2 className={styles.pullTitle}>{t.about.closeTitle}</h2>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'grid', gap: '0.5rem', justifyItems: 'start' }}>
              <ArrowLink href="/immobili">{t.about.seeProperties}</ArrowLink>
              <ArrowLink href="/vendi-affitta">{t.about.requestValuation}</ArrowLink>
              <ArrowLink href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer">
                {t.about.contact}
              </ArrowLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
