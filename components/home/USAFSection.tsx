import Link from 'next/link';

import ArrowLink from '@/components/ui/ArrowLink';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { getI18n } from '@/lib/i18n';
import styles from './USAFSection.module.css';

/** A restrained mark, at 18×12px. Never an emblem in a circle. */
function FlagMark() {
  return (
    <svg className={styles.flag} viewBox="0 0 18 12" aria-hidden="true" focusable="false">
      <rect width="18" height="12" fill="#8d7259" />
      {[1, 3, 5, 7, 9, 11].map((y) => (
        <rect key={y} y={y} width="18" height="1" fill="#e8dfd1" />
      ))}
      <rect width="8" height="6" fill="#4c4436" />
    </svg>
  );
}

export default async function USAFSection() {
  const { t } = await getI18n();
  const routes = [
    { label: t.usafHome.looking, href: '/locazioni-base-usaf#available' },
    { label: t.usafHome.renting, href: '/vendi-affitta?intent=affittare&target=usaf' },
  ];

  return (
    <section className={styles.section} aria-labelledby="usaf-title">
      {/* Decorative ground: the flag reads as a texture inside the dark, not
          as a photograph the content sits on. */}
      <div className={styles.ground} aria-hidden="true" />
      {/* Solo sotto la colonna di testo: la bandiera resta piena a destra. */}
      <div className={styles.textVeil} aria-hidden="true" />

      <div className={`container on-dark ${styles.content}`}>
        <div className={styles.grid}>
          <div className={styles.text}>
            <SectionLabel>{t.usafHome.label}</SectionLabel>

            <Reveal delay={80}>
              <h2 id="usaf-title" className={styles.title}>
                {t.usafHome.title}
                <br />
                <em className="em">{t.usafHome.titleEm}</em>
                <br />
                {t.usafHome.titleAfter}
              </h2>
            </Reveal>

            <Reveal delay={160}>
              <p className={`lead pretty ${styles.body}`}>{t.usafHome.body}</p>
            </Reveal>

            <Reveal delay={220}>
              <div className={styles.routes}>
                {routes.map((route) => (
                  <Link key={route.href} href={route.href} className={styles.route}>
                    <span>{route.label}</span>
                    <span className={`arrow ${styles.arrow}`} aria-hidden="true">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>

            <Reveal delay={280}>
              <p className={styles.badge}>
                <FlagMark />
                {t.usafHome.badge}
              </p>
            </Reveal>
          </div>
        </div>

        <div className={styles.foot}>
          <ArrowLink href="/locazioni-base-usaf">{t.usafHome.cta}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
