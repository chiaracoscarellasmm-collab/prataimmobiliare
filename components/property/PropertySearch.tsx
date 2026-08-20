'use client';

import { useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/components/i18n/LanguageProvider';
import { interpolate } from '@/data/i18n';
import { featureFacetLabel, propertyTypeLabel } from '@/lib/copy';
import {
  EMPTY_FILTERS,
  PRICE_STEPS,
  SURFACE_STEPS,
  countActive,
  type PropertyFilterState,
} from '@/lib/filters';
import FilterPopover from './FilterPopover';
import styles from './PropertySearch.module.css';

type Facets = {
  locations: readonly string[];
  types: readonly string[];
  features: readonly string[];
  hasUsaf: boolean;
};

type Props = {
  value: PropertyFilterState;
  onChange: (next: PropertyFilterState) => void;
  facets: Facets;
  resultCount: number;
};

const BEDROOM_STEPS = ['1', '2', '3', '4'];

/** Italian thousands, no decimals — "€ 320.000". */
const money = (value: number, locale: string) =>
  new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);

export default function PropertySearch({ value, onChange, facets, resultCount }: Props) {
  const { t, locale } = useI18n();
  const [draft, setDraft] = useState(value);
  const [sheetOpen, setSheetOpen] = useState(false);

  // The bar edits a draft; the URL only changes when the user commits.
  useEffect(() => setDraft(value), [value]);

  const set = <K extends keyof PropertyFilterState>(key: K, next: PropertyFilterState[K]) =>
    setDraft((d) => ({ ...d, [key]: next }));

  const commit = (next: PropertyFilterState = draft) => {
    onChange(next);
    setSheetOpen(false);
  };

  const activeCount = countActive(draft);
  const selectedFeatures = useMemo(
    () => (draft.features ? draft.features.split(',').filter(Boolean) : []),
    [draft.features]
  );

  const toggleFeature = (feature: string) => {
    const next = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature];
    set('features', next.join(','));
  };

  /* ------------------------------------------------------------- labels -- */
  const typeLabel = draft.type ? propertyTypeLabel(t, draft.type) : '';
  const transactionLabel =
    draft.transaction === 'vendita'
      ? t.search.sale
      : draft.transaction === 'affitto'
        ? t.search.rent
        : '';

  const priceLabel = (() => {
    const min = draft.priceMin ? money(Number(draft.priceMin), locale) : '';
    const max = draft.priceMax ? money(Number(draft.priceMax), locale) : '';
    if (min && max) return `${min} — ${max}`;
    if (min) return `${t.search.noMin.slice(0, 0)}${min}+`;
    if (max) return `≤ ${max}`;
    return '';
  })();

  const bedroomsLabel = draft.bedrooms ? `${draft.bedrooms}+` : '';

  /* ------------------------------------------------------------ controls - */
  const optionList = (
    options: { value: string; label: string }[],
    current: string,
    onPick: (value: string) => void,
    close: () => void
  ) => (
    <ul className={styles.options}>
      {options.map((option) => (
        <li key={option.value || 'any'}>
          <button
            type="button"
            className={`${styles.option} ${current === option.value ? styles.optionOn : ''}`}
            onClick={() => {
              onPick(option.value);
              close();
            }}
            aria-pressed={current === option.value}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );

  /* The advanced panel is shared between the desktop popover and the mobile
     sheet, so the two can never drift apart. */
  const advanced = (
    <div className={styles.advanced}>
      <div className={styles.advGroup}>
        <p className={styles.advLabel}>{t.search.surface}</p>
        <div className={styles.advRow}>
          <label className={styles.selectWrap}>
            <span className="sr-only">{t.search.surfaceMin}</span>
            <select
              className={styles.select}
              value={draft.surfaceMin}
              onChange={(e) => set('surfaceMin', e.target.value)}
            >
              <option value="">{t.search.noMin}</option>
              {SURFACE_STEPS.map((s) => (
                <option key={s} value={String(s)}>
                  {s} m²
                </option>
              ))}
            </select>
          </label>
          <span className={styles.dash} aria-hidden="true">
            —
          </span>
          <label className={styles.selectWrap}>
            <span className="sr-only">{t.search.surfaceMax}</span>
            <select
              className={styles.select}
              value={draft.surfaceMax}
              onChange={(e) => set('surfaceMax', e.target.value)}
            >
              <option value="">{t.search.noMax}</option>
              {SURFACE_STEPS.map((s) => (
                <option key={s} value={String(s)}>
                  {s} m²
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className={styles.advGroup}>
        <p className={styles.advLabel}>{t.search.bathrooms}</p>
        <div className={styles.chips}>
          {BEDROOM_STEPS.map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.chip} ${draft.bathrooms === n ? styles.chipOn : ''}`}
              onClick={() => set('bathrooms', draft.bathrooms === n ? '' : n)}
              aria-pressed={draft.bathrooms === n}
            >
              {n}+
            </button>
          ))}
        </div>
      </div>

      {facets.features.length > 0 && (
        <div className={styles.advGroup}>
          <p className={styles.advLabel}>{t.search.features}</p>
          <div className={styles.chips}>
            {facets.features.map((feature) => (
              <button
                key={feature}
                type="button"
                className={`${styles.chip} ${
                  selectedFeatures.includes(feature) ? styles.chipOn : ''
                }`}
                onClick={() => toggleFeature(feature)}
                aria-pressed={selectedFeatures.includes(feature)}
              >
                {featureFacetLabel(t, feature)}
              </button>
            ))}
          </div>
        </div>
      )}

      {facets.hasUsaf && (
        <div className={styles.advGroup}>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={draft.usaf === '1'}
              onChange={(e) => set('usaf', e.target.checked ? '1' : '')}
            />
            <span>{t.search.usaf}</span>
          </label>
        </div>
      )}
    </div>
  );

  const resultsLabel =
    resultCount === 1
      ? t.search.showResultsOne
      : interpolate(t.search.showResults, { count: resultCount });

  return (
    <>
      <div className={styles.barOuter}>
        <div className="container">
          <form
            className={styles.bar}
            onSubmit={(e) => {
              e.preventDefault();
              commit();
            }}
            role="search"
          >
            {/* Where — free text, so a comune can be typed or picked. */}
            <div className={`${styles.field} ${styles.fieldWhere}`}>
              <label className={styles.pill} htmlFor="search-where">
                <span className={styles.pillLabel}>{t.search.whereLabel}</span>
                <input
                  id="search-where"
                  className={styles.input}
                  value={draft.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder={t.search.where}
                  list="search-locations"
                  autoComplete="off"
                />
              </label>
              <datalist id="search-locations">
                {facets.locations.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </div>

            <FilterPopover
              label={t.search.type}
              value={typeLabel}
              placeholder={t.search.typeAny}
            >
              {(close) =>
                optionList(
                  [
                    { value: '', label: t.search.typeAny },
                    ...facets.types.map((type) => ({
                      value: type,
                      label: propertyTypeLabel(t, type),
                    })),
                  ],
                  draft.type,
                  (v) => set('type', v),
                  close
                )
              }
            </FilterPopover>

            <FilterPopover
              label={t.search.transaction}
              value={transactionLabel}
              placeholder={t.search.transactionAny}
            >
              {(close) =>
                optionList(
                  [
                    { value: '', label: t.search.transactionAny },
                    { value: 'vendita', label: t.search.sale },
                    { value: 'affitto', label: t.search.rent },
                  ],
                  draft.transaction,
                  (v) => set('transaction', v),
                  close
                )
              }
            </FilterPopover>

            <FilterPopover
              label={t.search.price}
              value={priceLabel}
              placeholder={t.search.priceAny}
              wide
            >
              {() => (
                <div className={styles.range}>
                  <label className={styles.selectWrap}>
                    <span className={styles.advLabel}>{t.search.priceMin}</span>
                    <select
                      className={styles.select}
                      value={draft.priceMin}
                      onChange={(e) => set('priceMin', e.target.value)}
                    >
                      <option value="">{t.search.noMin}</option>
                      {PRICE_STEPS.map((p) => (
                        <option key={p} value={String(p)}>
                          {money(p, locale)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.selectWrap}>
                    <span className={styles.advLabel}>{t.search.priceMax}</span>
                    <select
                      className={styles.select}
                      value={draft.priceMax}
                      onChange={(e) => set('priceMax', e.target.value)}
                    >
                      <option value="">{t.search.noMax}</option>
                      {PRICE_STEPS.map((p) => (
                        <option key={p} value={String(p)}>
                          {money(p, locale)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </FilterPopover>

            <FilterPopover
              label={t.search.bedrooms}
              value={bedroomsLabel}
              placeholder={t.search.bedroomsAny}
            >
              {(close) =>
                optionList(
                  [
                    { value: '', label: t.search.bedroomsAny },
                    ...BEDROOM_STEPS.map((n) => ({ value: n, label: `${n}+` })),
                  ],
                  draft.bedrooms,
                  (v) => set('bedrooms', v),
                  close
                )
              }
            </FilterPopover>

            <FilterPopover
              label={t.search.more}
              value={activeCount > 0 ? String(activeCount) : ''}
              placeholder="—"
              wide
            >
              {(close) => (
                <>
                  {advanced}
                  <div className={styles.panelFoot}>
                    <button
                      type="button"
                      className={styles.ghost}
                      onClick={() => {
                        setDraft(EMPTY_FILTERS);
                        commit(EMPTY_FILTERS);
                        close();
                      }}
                    >
                      {t.search.reset}
                    </button>
                    <button
                      type="button"
                      className={styles.solid}
                      onClick={() => {
                        commit();
                        close();
                      }}
                    >
                      {t.search.apply}
                    </button>
                  </div>
                </>
              )}
            </FilterPopover>

            <button type="submit" className={styles.submit}>
              {t.search.submit}
            </button>

            {/* Mobile: one field, then a sheet with everything else. */}
            <div className={styles.mobileActions}>
              <button
                type="button"
                className={styles.mobileFilters}
                onClick={() => setSheetOpen(true)}
              >
                {t.search.openFilters}
                {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
              </button>
              <button type="submit" className={styles.submitMobile}>
                {t.search.submit}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ------------------------------------------------------ mobile sheet */}
      <div
        className={`${styles.sheet} ${sheetOpen ? styles.sheetOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.search.advancedTitle}
        aria-hidden={!sheetOpen}
        inert={!sheetOpen}
      >
        <div className={styles.sheetHead}>
          <p className={styles.sheetTitle}>{t.search.advancedTitle}</p>
          <button
            type="button"
            className={styles.sheetClose}
            onClick={() => setSheetOpen(false)}
            aria-label={t.search.close}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className={styles.sheetBody}>
          <div className={styles.advGroup}>
            <p className={styles.advLabel}>{t.search.type}</p>
            <div className={styles.chips}>
              {facets.types.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`${styles.chip} ${draft.type === type ? styles.chipOn : ''}`}
                  onClick={() => set('type', draft.type === type ? '' : type)}
                  aria-pressed={draft.type === type}
                >
                  {propertyTypeLabel(t, type)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.advGroup}>
            <p className={styles.advLabel}>{t.search.transaction}</p>
            <div className={styles.chips}>
              {[
                { value: 'vendita', label: t.search.sale },
                { value: 'affitto', label: t.search.rent },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.chip} ${
                    draft.transaction === option.value ? styles.chipOn : ''
                  }`}
                  onClick={() =>
                    set('transaction', draft.transaction === option.value ? '' : option.value)
                  }
                  aria-pressed={draft.transaction === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.advGroup}>
            <p className={styles.advLabel}>{t.search.price}</p>
            <div className={styles.advRow}>
              <label className={styles.selectWrap}>
                <span className="sr-only">{t.search.priceMin}</span>
                <select
                  className={styles.select}
                  value={draft.priceMin}
                  onChange={(e) => set('priceMin', e.target.value)}
                >
                  <option value="">{t.search.noMin}</option>
                  {PRICE_STEPS.map((p) => (
                    <option key={p} value={String(p)}>
                      {money(p, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <span className={styles.dash} aria-hidden="true">
                —
              </span>
              <label className={styles.selectWrap}>
                <span className="sr-only">{t.search.priceMax}</span>
                <select
                  className={styles.select}
                  value={draft.priceMax}
                  onChange={(e) => set('priceMax', e.target.value)}
                >
                  <option value="">{t.search.noMax}</option>
                  {PRICE_STEPS.map((p) => (
                    <option key={p} value={String(p)}>
                      {money(p, locale)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className={styles.advGroup}>
            <p className={styles.advLabel}>{t.search.bedrooms}</p>
            <div className={styles.chips}>
              {BEDROOM_STEPS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.chip} ${draft.bedrooms === n ? styles.chipOn : ''}`}
                  onClick={() => set('bedrooms', draft.bedrooms === n ? '' : n)}
                  aria-pressed={draft.bedrooms === n}
                >
                  {n}+
                </button>
              ))}
            </div>
          </div>

          {advanced}
        </div>

        <div className={styles.sheetFoot}>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => {
              setDraft(EMPTY_FILTERS);
              commit(EMPTY_FILTERS);
            }}
          >
            {t.search.reset}
          </button>
          <button type="button" className={styles.solid} onClick={() => commit()}>
            {resultsLabel}
          </button>
        </div>
      </div>
    </>
  );
}
