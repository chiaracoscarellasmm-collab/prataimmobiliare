import type { Metadata } from 'next';

import ArrowLink from '@/components/ui/ArrowLink';
import PageHero from '@/components/ui/PageHero';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { contact, socials } from '@/data/site';
import { hourLabel, hourTime } from '@/lib/copy';
import { getI18n } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.contactsPage.metaTitle,
    description: t.contactsPage.metaDescription,
    alternates: { canonical: '/contatti' },
  };
}

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gap: '0.35rem',
  padding: 'clamp(1.1rem, 2.2vw, 1.6rem) 0',
  borderBottom: '1px solid var(--line)',
};

export default async function ContattiPage() {
  const { t } = await getI18n();

  return (
    <>
      <PageHero
        label={t.contactsPage.label}
        title={
          <>
            {t.contactsPage.title}
            <br />
            {t.contactsPage.titleEm}
          </>
        }
        intro={t.contactsPage.intro}
      />

      <section className="container section-sm" aria-labelledby="contact-details">
        <h2 id="contact-details" className="sr-only">
          {t.contact.details}
        </h2>

        <div
          style={{
            display: 'grid',
            gap: 'clamp(2.5rem, 6vw, 6rem)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          }}
        >
          <div>
            <SectionLabel>{t.contact.details}</SectionLabel>
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--line)' }}>
              <div style={rowStyle}>
                <p className="label">{t.contact.address}</p>
                <address style={{ fontStyle: 'normal' }}>
                  {contact.address.street}
                  <br />
                  {contact.address.city}
                  <br />
                  {contact.address.postalCode} {contact.address.province}
                </address>
                <a
                  href={contact.maps.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ width: 'fit-content' }}
                >
                  {t.hours.maps}
                </a>
              </div>
              <div style={rowStyle}>
                <p className="label">{t.contact.phone}</p>
                <a href={contact.phone.href}>{contact.phone.label}</a>
              </div>
              <div style={rowStyle}>
                <p className="label">{t.contact.email}</p>
                <a href={contact.email.href}>{contact.email.label}</a>
              </div>
              <div style={rowStyle}>
                <p className="label">{t.hours.vat}</p>
                <p>{contact.vat}</p>
              </div>
              <div style={rowStyle}>
                <p className="label">{t.contact.hours}</p>
                <dl style={{ margin: 0, display: 'grid', gap: '0.35rem' }}>
                  {contact.hours.map((row) => (
                    <div
                      key={row.day}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '7rem 1fr',
                        gap: '0.75rem',
                      }}
                    >
                      <dt>{hourLabel(t, row.day)}</dt>
                      <dd style={{ margin: 0 }}>{hourTime(t, row.time)}</dd>
                    </div>
                  ))}
                </dl>
                <p className="meta" style={{ marginTop: '0.75rem' }}>
                  {t.hours.note}
                </p>
              </div>
              <div style={rowStyle}>
                <p className="label">{t.contact.social}</p>
                <p>
                  {socials.map((s, i) => (
                    <span key={s.label}>
                      {i > 0 ? ' · ' : null}
                      <a href={s.href} rel="noopener noreferrer" target="_blank">
                        {s.label}
                      </a>
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>{t.contact.write}</SectionLabel>
            <Reveal delay={80}>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--fs-h3)',
                  letterSpacing: '-0.018em',
                  margin: '1.25rem 0 1.25rem',
                  maxWidth: '18ch',
                }}
              >
                {t.contactsPage.writeTitle}
              </h3>
            </Reveal>
            <Reveal delay={140}>
              <p className="lead pretty" style={{ maxWidth: '40ch', marginBottom: '1.75rem' }}>
                {t.contactsPage.writeBody}
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ display: 'grid', gap: '0.25rem', justifyItems: 'start' }}>
                <ArrowLink href="/vendi-affitta#questionario">{t.contactsPage.valuation}</ArrowLink>
                <ArrowLink href="/immobili">{t.contactsPage.seeProperties}</ArrowLink>
                <ArrowLink href="/locazioni-americani">{t.contactsPage.usaf}</ArrowLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
