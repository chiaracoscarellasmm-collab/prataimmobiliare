import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ArrowLink from '@/components/ui/ArrowLink';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import { getProjectBySlug, projects } from '@/data/projects';
import { labelOf } from '@/data/i18n';
import { contact } from '@/data/site';
import { getI18n } from '@/lib/i18n';
import styles from './project.module.css';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { t } = await getI18n();
  const project = getProjectBySlug(slug);
  if (!project) return { title: t.project.notFound };

  return {
    title: `${project.projectName} — ${t.developments.label}`,
    description: project.intro,
    alternates: { canonical: `/progetti/${project.slug}` },
    openGraph: {
      title: project.projectName,
      description: project.intro,
      url: `/progetti/${project.slug}`,
      images: [{ url: project.heroImage.src }],
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const { t } = await getI18n();
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const others = projects.filter((p) => p.slug !== project.slug);
  const status = labelOf(t.project.statuses as Record<string, string>, project.status);

  return (
    <article>
      <header className={styles.top}>
        <div className="container">
          <nav className={styles.breadcrumb} aria-label={t.property.breadcrumb}>
            <Link href="/">{t.developments.label}</Link>
            <span aria-hidden="true">/</span>
            <span>{status}</span>
          </nav>

          <h1 className={styles.title}>{project.projectName}</h1>
          <p className={styles.location}>{project.location}</p>
        </div>
      </header>

      <div className="container">
        <Reveal media className={styles.hero}>
          <Image
            src={project.heroImage.src}
            alt={project.heroImage.alt}
            width={project.heroImage.width}
            height={project.heroImage.height}
            priority
            sizes="100vw"
          />
        </Reveal>
      </div>

      <section className="container section-sm" aria-label={t.project.facts}>
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt className={styles.factKey}>{t.project.units}</dt>
            <dd className={styles.factValue}>{project.numberOfUnits}</dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.factKey}>{t.project.status}</dt>
            <dd className={styles.factValue}>{status}</dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.factKey}>{t.project.delivery}</dt>
            <dd className={styles.factValue}>{project.delivery}</dd>
          </div>
          <div className={styles.fact}>
            <dt className={styles.factKey}>{t.project.location}</dt>
            <dd className={styles.factValue}>{project.location}</dd>
          </div>
        </dl>

        <div className={styles.body}>
          <div>
            <SectionLabel>{t.project.theProject}</SectionLabel>
            <div className={styles.prose} style={{ marginTop: '1.5rem' }}>
              <p>{project.intro}</p>
              {project.description.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>{t.project.characteristics}</SectionLabel>
            <ul className={styles.featureList} style={{ marginTop: '1.5rem' }}>
              {project.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {project.gallery.length > 0 && (
        <section className="container section-sm" aria-label={t.project.images}>
          <div className={styles.gallery}>
            {project.gallery.map((image) => (
              <Reveal media key={image.src} className={styles.shot}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 768px) 60vw, 100vw"
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {project.availability.length > 0 && (
        <section className="container section-sm" aria-labelledby="availability-title">
          <SectionLabel>{t.project.availability}</SectionLabel>
          <h2 id="availability-title" className={styles.sectionTitle} style={{ marginTop: '1.25rem' }}>
            {t.project.unitsTitle}
          </h2>

          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">{t.project.unit}</th>
                <th scope="col">{t.project.surface}</th>
                <th scope="col">{t.project.composition}</th>
                <th scope="col">{t.project.status}</th>
              </tr>
            </thead>
            <tbody>
              {project.availability.map((unit) => (
                <tr key={unit.label}>
                  <td>{unit.label}</td>
                  <td>{unit.surface}</td>
                  <td>{unit.rooms}</td>
                  <td>{labelOf(t.project.unitStatus as Record<string, string>, unit.availability)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="meta" style={{ marginTop: '1rem' }}>
            {t.project.unitNote}
          </p>
        </section>
      )}

      {project.floorPlans.length > 0 && (
        <section className="container section-sm" aria-labelledby="plans-title">
          <h2 id="plans-title" className={styles.sectionTitle}>
            {t.project.floorPlans}
          </h2>
          <div className={styles.plans}>
            {project.floorPlans.map((plan) => (
              <div key={plan.src} className={styles.plan}>
                <Image
                  src={plan.src}
                  alt={plan.alt}
                  width={plan.width}
                  height={plan.height}
                  sizes="(min-width: 1024px) 48vw, 100vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.cta} aria-labelledby="project-cta">
        <div className="container on-dark">
          <SectionLabel>{t.project.more}</SectionLabel>
          <h2 id="project-cta" className={styles.ctaTitle} style={{ margin: '1.25rem 0 1.75rem' }}>
            {t.project.tellYou}
          </h2>
          <ArrowLink href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer">
            {t.project.contact}
          </ArrowLink>
        </div>
      </section>

      {others.length > 0 && (
        <section className="container section-sm" aria-labelledby="other-projects">
          <h2 id="other-projects" className={styles.sectionTitle}>
            {t.project.others}
          </h2>
          <ul className={styles.others}>
            {others.map((other) => (
              <Reveal as="li" key={other.id}>
                <Link href={`/progetti/${other.slug}`} className={styles.otherLink}>
                  <div className={styles.otherFrame}>
                    <Image
                      src={other.heroImage.src}
                      alt={other.heroImage.alt}
                      width={other.heroImage.width}
                      height={other.heroImage.height}
                      sizes="(min-width: 900px) 45vw, 100vw"
                    />
                  </div>
                  <p className="label" style={{ marginTop: '1rem' }}>
                    {labelOf(t.project.statuses as Record<string, string>, other.status)}
                  </p>
                  <p className={styles.otherName}>{other.projectName}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
