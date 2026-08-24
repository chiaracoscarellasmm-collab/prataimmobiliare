'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import ArrowLink from '@/components/ui/ArrowLink';
import PropertyGrid from '@/components/property/PropertyGrid';
import PropertySearch from '@/components/property/PropertySearch';
import { useI18n } from '@/components/i18n/LanguageProvider';
import { interpolate } from '@/data/i18n';
import type { Property } from '@/data/properties';
import { contact } from '@/data/site';
import {
  buildFacets,
  filterProperties,
  filtersFromParams,
  filtersToQuery,
  sortFromParams,
  sortProperties,
  type PropertyFilterState,
  type SortKey,
} from '@/lib/filters';
import styles from './browser.module.css';

const PAGE_SIZE = 9;

/**
 * Filters and sort live in the URL, so a search is shareable, survives a
 * refresh and behaves with the back button. Only facet values ever go there —
 * nothing personal.
 */
export default function PropertyBrowser({ properties }: { properties: Property[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const facets = useMemo(() => buildFacets(properties), [properties]);
  const filters = useMemo(() => filtersFromParams(new URLSearchParams(params.toString())), [params]);
  const sort = useMemo(() => sortFromParams(new URLSearchParams(params.toString())), [params]);

  const results = useMemo(
    () => sortProperties(filterProperties(properties, filters), sort),
    [properties, filters, sort]
  );

  const push = useCallback(
    (nextFilters: PropertyFilterState, nextSort: SortKey) => {
      const qs = filtersToQuery(nextFilters, nextSort);
      router.replace(qs ? `/immobili?${qs}` : '/immobili', { scroll: false });
      setVisible(PAGE_SIZE);
    },
    [router]
  );

  const shown = results.slice(0, visible);
  const countLabel =
    results.length === 1
      ? t.results.countOne
      : interpolate(t.results.countMany, { count: results.length });

  return (
    /* Il listing vive su fondo chiaro: `surface-light` ri-punta i token, così
       le fotografie restano protagoniste. */
    <div className={`surface-light ${styles.light}`}>
      <PropertySearch
        value={filters}
        onChange={(next) => push(next, sort)}
        facets={facets}
        resultCount={
          // Live count for the sheet's action, computed on the draft.
          results.length
        }
      />

      <section className={`container ${styles.results}`} aria-label={t.results.heading}>
        <header className={styles.resultsHead}>
          <div>
            <h2 className={styles.resultsTitle}>{t.results.heading}</h2>
            <p className={styles.resultsCount}>{countLabel}</p>
          </div>

          <div className={styles.sort}>
            <label className={styles.sortLabel} htmlFor="sort">
              {t.results.sort}
            </label>
            <select
              id="sort"
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => push(filters, e.target.value as SortKey)}
            >
              <option value="recent">{t.results.sortRecent}</option>
              <option value="price-asc">{t.results.sortPriceAsc}</option>
              <option value="price-desc">{t.results.sortPriceDesc}</option>
              <option value="surface">{t.results.sortSurface}</option>
            </select>
          </div>
        </header>

        <PropertyGrid
          properties={shown}
          emptyAction={
            <ArrowLink href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer">
              {t.propertiesPage.emptyCta}
            </ArrowLink>
          }
        />

        {visible < results.length && (
          <div className={styles.more}>
            <button
              type="button"
              className="pill pill-solid"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
            >
              {t.results.loadMore}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
