'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useI18n } from '@/components/i18n/LanguageProvider';
import type { Property } from '@/data/properties';
import { propertyStatusLabel, propertyTitle, propertyTypeLabel } from '@/lib/copy';
import { effectivePrice, formatListFacts, formatPrice } from '@/lib/format';
import styles from './PropertyCard.module.css';

type Props = {
  property: Property;
  /** CSS aspect-ratio for the frame. */
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  onDark?: boolean;
  /** Hides the closing link where the surrounding layout already implies it. */
  showCta?: boolean;
};

export default function PropertyCard({
  property,
  ratio = '4 / 3',
  sizes = '(min-width: 1200px) 30vw, (min-width: 768px) 46vw, 100vw',
  priority = false,
  onDark = false,
  showCta = true,
}: Props) {
  const { locale, t } = useI18n();
  const cover = property.coverImage ?? property.images[0];
  const status = propertyStatusLabel(t, property.status);

  const transaction =
    property.transactionType === 'vendita' ? t.property.forSale : t.property.forRent;

  /* At most two tags, so the photograph keeps the frame. */
  const tags = [transaction, status || (property.usafEligible ? 'USAF' : '')].filter(Boolean);

  const specs = formatListFacts(
    property.surface,
    property.bedrooms,
    property.bathrooms,
    t.property,
    locale
  );

  if (!cover) return null;

  return (
    <Link
      href={`/immobili/${property.slug}`}
      className={`${styles.card} ${onDark ? styles.onDark : ''}`.trim()}
    >
      <div className={styles.media} style={{ '--ratio': ratio } as React.CSSProperties}>
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes={sizes}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag, i) => (
              <span key={tag} className={`${styles.tag} ${i > 0 ? styles.tagQuiet : ''}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.meta}>
          {propertyTypeLabel(t, property.propertyType)} · {property.location.comune}
        </p>

        <h3 className={styles.title}>{propertyTitle(t, property)}</h3>

        <p className={styles.price}>
          {formatPrice(effectivePrice(property), property.transactionType, t.property, locale)}
        </p>

        {specs && <p className={styles.specs}>{specs}</p>}

        {showCta && (
          <span className={styles.cta}>
            {t.results.cardCta}
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </span>
        )}
      </div>
    </Link>
  );
}
