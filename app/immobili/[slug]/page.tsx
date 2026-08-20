import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import PropertyCard from '@/components/property/PropertyCard';
import PropertyGallery from '@/components/property/PropertyGallery';
import Reveal from '@/components/ui/Reveal';
import { interpolate } from '@/data/i18n';
import { getPropertyBySlug, getRelatedProperties, properties } from '@/data/properties';
import { contact, site } from '@/data/site';
import { buildCharacteristics, buildEnergyInfo, buildKeyFacts } from '@/lib/characteristics';
import { propertyStatusLabel, propertyTitle, propertyTypeLabel } from '@/lib/copy';
import { effectivePrice, formatPrice } from '@/lib/format';
import { getI18n } from '@/lib/i18n';
import { isMeaningfulValue } from '@/lib/properties/isMeaningfulValue';
import styles from './detail.module.css';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { t, locale } = await getI18n();
  const property = getPropertyBySlug(slug);
  if (!property) return { title: t.propertiesPage.notFound };

  const name = propertyTitle(t, property);
  const title = property.seo.title ?? `${name} — ${property.location.comune}`;
  const description =
    property.seo.description ??
    property.shortDescription ??
    `${propertyTypeLabel(t, property.propertyType)}, ${property.location.comune}.`;
  const cover = property.coverImage ?? property.images[0];

  return {
    title,
    description,
    alternates: { canonical: `/immobili/${property.slug}` },
    openGraph: {
      title,
      description,
      url: `/immobili/${property.slug}`,
      images: cover ? [{ url: cover.src }] : undefined,
    },
  };
}

export default async function PropertyPage({ params }: Params) {
  const { slug } = await params;
  const { t, locale } = await getI18n();
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const images = property.images;
  const [cover, ...rest] = images;
  if (!cover) notFound(); // un immobile visibile senza foto non è un dato pubblicabile

  const related = getRelatedProperties(property, 3);
  const name = propertyTitle(t, property);
  const price = effectivePrice(property);
  const priceLabel = formatPrice(price, property.transactionType, t.property, locale);
  const statusLabel = propertyStatusLabel(t, property.status);

  const keyFacts = buildKeyFacts(t, property, locale);
  const characteristics = buildCharacteristics(t, property, locale);
  const energy = buildEnergyInfo(property, locale, t.property.energyIpeUnit);

  /* Venduto/Affittato ma ancora pubblicato: niente più "prenota una visita"
     come invito principale, si propone di guardare altrove. */
  const isClosed = property.status === 'Venduto' || property.status === 'Affittato';

  const descriptionParagraphs = property.description
    ? property.description.split(/\n+/).map((p) => p.trim()).filter(Boolean)
    : [];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name,
    url: `${site.url}/immobili/${property.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location.comune,
      addressRegion: property.location.provincia ?? undefined,
      addressCountry: 'IT',
    },
    ...(isMeaningfulValue(property.surface)
      ? { floorSize: { '@type': 'QuantitativeValue', value: property.surface, unitCode: 'MTK' } }
      : {}),
    ...(isMeaningfulValue(property.bedrooms) ? { numberOfRooms: property.bedrooms } : {}),
  };

  return (
    <div className={`${styles.page} surface-light`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article>
        {/* ------------------------------------------------------------ top */}
        <header className={`container ${styles.top}`}>
          <nav className={styles.breadcrumb} aria-label={t.property.breadcrumb}>
            <Link href="/immobili">{t.propertiesPage.label}</Link>
            <span aria-hidden="true">/</span>
            <span>{propertyTypeLabel(t, property.propertyType)}</span>
          </nav>

          <div className={styles.titleRow}>
            <div>
              <p className={styles.label}>
                {property.transactionType === 'vendita'
                  ? t.property.forSale
                  : t.property.forRent}
              </p>
              <h1 className={styles.title}>{name}</h1>
              <p className={styles.location}>{property.location.comune}</p>
              {statusLabel && <p className={styles.statusBadge}>{statusLabel}</p>}
            </div>
            <p className={styles.price}>{priceLabel}</p>
          </div>
        </header>

        {/* -------------------------------------------------------- gallery */}
        <section className="container" aria-label={t.property.mainPhoto}>
          <div className={styles.heroGallery}>
            <Reveal className={`${styles.plate} ${styles.plateMain}`}>
              <Image
                src={cover.src}
                alt={cover.alt}
                width={cover.width}
                height={cover.height}
                priority
                sizes="(min-width: 1024px) 62vw, 100vw"
              />
            </Reveal>

            {rest.length > 0 && (
              <div className={styles.side}>
                {rest.slice(0, 2).map((image) => (
                  <Reveal className={styles.plate} key={image.src} delay={80}>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="(min-width: 1024px) 32vw, 100vw"
                    />
                  </Reveal>
                ))}
              </div>
            )}

            {images.length > 1 && (
              <PropertyGallery
                images={images}
                title={name}
                triggerClassName={styles.galleryBtn}
                trigger={
                  <>
                    {t.property.allPhotos}
                    <span className={styles.galleryCount}>
                      {interpolate(t.property.photoCount, { count: images.length })}
                    </span>
                  </>
                }
              />
            )}
          </div>

          {/* ---------------------------------------------------- key facts */}
          {keyFacts.length > 0 && (
            <dl className={styles.specs}>
              {keyFacts.map((fact, i) => (
                <div key={i} className={styles.spec}>
                  <dd className={styles.specValue}>{fact.value}</dd>
                  <dt className={styles.specKey}>{fact.key}</dt>
                </div>
              ))}
            </dl>
          )}
        </section>

        {/* ----------------------------------------------- description + cta */}
        <section className={`container ${styles.body}`}>
          <div>
            <p className={styles.label}>{t.property.theProperty}</p>
            <h2 className={styles.sectionTitle}>{t.property.descriptionTitle}</h2>

            {descriptionParagraphs.length > 0 && (
              <div className={styles.prose}>
                {descriptionParagraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {energy && (
              <div className={styles.energy}>
                <p className={styles.energyLabel}>{t.property.energyTitle}</p>
                <p className={styles.energyClass}>{energy.energyClass}</p>
                {energy.ipeLabel && (
                  <p className={styles.energyIpe}>
                    {t.property.energyIpeLabel}
                    <br />
                    {energy.ipeLabel}
                  </p>
                )}
              </div>
            )}

            {characteristics.length > 0 && (
              <>
                <h3 className={styles.sectionTitle} style={{ marginTop: '2.5rem' }}>
                  {t.property.characteristics}
                </h3>
                <div className={styles.charGrid}>
                  {characteristics.map((tile, i) => (
                    <div key={i} className={styles.charTile}>
                      <p className={styles.charValue}>{tile.value}</p>
                      {tile.key && <p className={styles.charKey}>{tile.key}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {property.videoUrl && (
              <p style={{ marginTop: '2rem' }}>
                <a
                  href={property.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill pill-solid"
                >
                  {t.property.videoCta}
                  <span className="arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </p>
            )}
          </div>

          <aside className={styles.panel}>
            <p className={styles.panelPrice}>{priceLabel}</p>
            <p className={styles.panelMeta}>
              {propertyTypeLabel(t, property.propertyType)} · {property.location.comune}
            </p>
            <div className={styles.panelActions}>
              {isClosed ? (
                <Link href="/immobili" className={styles.panelPrimary}>
                  {t.property.similarCta}
                </Link>
              ) : (
                <>
                  <Link
                    href={`/contatti?immobile=${property.slug}`}
                    className={styles.panelPrimary}
                  >
                    {t.property.requestInfo}
                  </Link>
                  <Link
                    href={`/contatti?immobile=${property.slug}&visita=1`}
                    className={styles.panelSecondary}
                  >
                    {t.property.bookVisit}
                  </Link>
                </>
              )}
              {/* Only when a real number has been configured. */}
              {contact.whatsapp.href && (
                <a
                  className={styles.panelSecondary}
                  href={contact.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </aside>
        </section>

        {/* ------------------------------------------------ editorial shots */}
        {rest.length > 0 && (
          <section className="container" aria-label={t.property.characteristics}>
            <div className={styles.shots}>
              {rest.map((image) => (
                <Reveal className={styles.shot} key={image.src}>
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

        {/* -------------------------------------------------------- location */}
        <section className="container section-sm" aria-labelledby="where-title">
          <p className={styles.label}>{t.property.whereIs}</p>
          <h2 id="where-title" className={styles.sectionTitle}>
            {property.location.showAddress && property.location.address
              ? `${property.location.address}, ${property.location.comune}`
              : property.location.zona
                ? `${property.location.zona}, ${property.location.comune}`
                : property.location.comune}
          </h2>
          {/* No invented coordinates: without them, no map. */}
          <p className="meta" style={{ maxWidth: '52ch' }}>
            {t.property.whereIsNote}
          </p>
        </section>

        {/* ------------------------------------------------------------- cta */}
        <div className="container">
          <section className={styles.cta} aria-labelledby="property-cta">
            <h2 id="property-cta" className={styles.ctaTitle}>
              {isClosed ? t.property.similarCta : t.property.ctaTitle}
            </h2>
            {!isClosed && <p className={styles.ctaBody}>{t.property.ctaBody}</p>}
            <div className={styles.ctaActions}>
              {isClosed ? (
                <Link href="/immobili" className={styles.ctaPrimary}>
                  {t.propertiesPage.label}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <>
                  <Link
                    href={`/contatti?immobile=${property.slug}&visita=1`}
                    className={styles.ctaPrimary}
                  >
                    {t.property.bookVisit}
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link href={`/contatti?immobile=${property.slug}`} className={styles.ctaGhost}>
                    {t.property.requestInfo}
                    <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>

        {/* --------------------------------------------------------- related */}
        {related.length > 0 && (
          <section className={`container ${styles.related}`} aria-labelledby="related-title">
            <p className={styles.label}>{t.property.relatedLabel}</p>
            <h2 id="related-title" className={styles.sectionTitle}>
              {t.property.relatedTitle}
            </h2>
            <ul className={styles.relatedGrid}>
              {related.map((item, i) => (
                <Reveal as="li" key={item.id} delay={i * 70}>
                  <PropertyCard property={item} />
                </Reveal>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
