'use client';

import PropertyCard from '@/components/property/PropertyCard';
import Reveal from '@/components/ui/Reveal';
import { useI18n } from '@/components/i18n/LanguageProvider';
import type { Property } from '@/data/properties';
import styles from './PropertyGrid.module.css';

type Props = {
  properties: Property[];
  onDark?: boolean;
  loading?: boolean;
  /** Rendered beside the reset action in the empty state. */
  emptyAction?: React.ReactNode;
  onEditFilters?: () => void;
};

/** Discreet placeholders — never a spinner. */
function Skeletons() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeleton} aria-hidden="true">
          <div className={styles.skeletonMedia} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      ))}
    </>
  );
}

export default function PropertyGrid({
  properties,
  onDark = false,
  loading = false,
  emptyAction,
  onEditFilters,
}: Props) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className={styles.grid}>
        <Skeletons />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>{t.propertiesPage.emptyTitle}</p>
        <p className={styles.emptyBody}>{t.propertiesPage.emptyBody}</p>
        <div className={styles.emptyActions}>
          {onEditFilters && (
            <button type="button" className="pill pill-solid" onClick={onEditFilters}>
              {t.results.editFilters}
            </button>
          )}
          {emptyAction}
        </div>
      </div>
    );
  }

  return (
    <ul className={styles.grid}>
      {properties.map((property, i) => (
        <Reveal as="li" key={property.id} delay={(i % 3) * 70}>
          <PropertyCard property={property} onDark={onDark} priority={i < 3} />
        </Reveal>
      ))}
    </ul>
  );
}
