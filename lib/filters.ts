import type { Property } from '@/data/properties';
import { propertyAmenityCodes } from '@/lib/copy';
import { effectivePrice } from '@/lib/format';

/**
 * Filter state for the property listing.
 *
 * Everything here is a string because the state round-trips through the URL:
 * a filtered view has to be shareable and survive a refresh. Empty string
 * always means "no constraint".
 */
export interface PropertyFilterState {
  /** Free-text location, matched loosely against the comune. */
  location: string;
  type: string;
  transaction: string;
  priceMin: string;
  priceMax: string;
  bedrooms: string;
  bathrooms: string;
  surfaceMin: string;
  surfaceMax: string;
  /** Comma-separated feature labels, all of which must be present. */
  features: string;
  /** '1' restricts to properties suitable for USAF personnel. */
  usaf: string;
}

export const EMPTY_FILTERS: PropertyFilterState = {
  location: '',
  type: '',
  transaction: '',
  priceMin: '',
  priceMax: '',
  bedrooms: '',
  bathrooms: '',
  surfaceMin: '',
  surfaceMax: '',
  features: '',
  usaf: '',
};

export type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'surface';

export const SORT_KEYS: SortKey[] = ['recent', 'price-asc', 'price-desc', 'surface'];

/** Short URL keys, so a shared link stays readable. */
const URL_KEYS: Record<keyof PropertyFilterState, string> = {
  location: 'dove',
  type: 'tipo',
  transaction: 'contratto',
  priceMin: 'pmin',
  priceMax: 'pmax',
  bedrooms: 'camere',
  bathrooms: 'bagni',
  surfaceMin: 'mqmin',
  surfaceMax: 'mqmax',
  features: 'extra',
  usaf: 'usaf',
};

export function filtersFromParams(params: URLSearchParams): PropertyFilterState {
  const next = { ...EMPTY_FILTERS };
  for (const key of Object.keys(URL_KEYS) as (keyof PropertyFilterState)[]) {
    next[key] = params.get(URL_KEYS[key]) ?? '';
  }
  return next;
}

export function filtersToQuery(filters: PropertyFilterState, sort: SortKey): string {
  const query = new URLSearchParams();
  for (const key of Object.keys(URL_KEYS) as (keyof PropertyFilterState)[]) {
    const value = filters[key].trim();
    if (value) query.set(URL_KEYS[key], value);
  }
  if (sort !== 'recent') query.set('ordina', sort);
  return query.toString();
}

export function sortFromParams(params: URLSearchParams): SortKey {
  const value = params.get('ordina');
  return SORT_KEYS.includes(value as SortKey) ? (value as SortKey) : 'recent';
}

export function countActive(filters: PropertyFilterState): number {
  return (Object.keys(EMPTY_FILTERS) as (keyof PropertyFilterState)[]).filter(
    (key) => filters[key].trim() !== ''
  ).length;
}

/** Price steps offered in the dropdown, derived from nothing but round numbers. */
export const PRICE_STEPS = [
  50_000, 100_000, 150_000, 200_000, 250_000, 300_000, 400_000, 500_000, 750_000, 1_000_000,
];

export const SURFACE_STEPS = [50, 80, 100, 150, 200, 300, 500];

const norm = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Amenity a colonna fissa (codice stabile) + testo libero "Altre caratteristiche". */
function propertyFeatureTags(p: Property): string[] {
  return [...propertyAmenityCodes(p), ...p.otherFeatures];
}

export function filterProperties(
  properties: Property[],
  filters: PropertyFilterState
): Property[] {
  const wanted = filters.features
    ? filters.features.split(',').map(norm).filter(Boolean)
    : [];

  // "Pordenone" è un comune reale quanto "Prata di Pordenone": se il testo
  // digitato coincide esattamente con un comune esistente, non deve
  // includere gli altri che lo contengono come sottostringa. Il match
  // parziale resta solo per la digitazione libera/incompleta.
  const locationQuery = filters.location ? norm(filters.location) : '';
  const isExactLocation =
    locationQuery !== '' && properties.some((p) => norm(p.location.comune) === locationQuery);

  return properties.filter((p) => {
    if (locationQuery) {
      const comune = norm(p.location.comune);
      const matches = isExactLocation ? comune === locationQuery : comune.includes(locationQuery);
      if (!matches) return false;
    }
    if (filters.type && p.propertyType !== filters.type) return false;
    if (filters.transaction && p.transactionType !== filters.transaction) return false;
    if (filters.bedrooms && (p.bedrooms ?? 0) < Number(filters.bedrooms)) return false;
    if (filters.bathrooms && (p.bathrooms ?? 0) < Number(filters.bathrooms)) return false;
    if (filters.usaf === '1' && !p.usafEligible) return false;

    // Un immobile a trattativa riservata non viene mai escluso da un limite di prezzo.
    const price = effectivePrice(p);
    if (price !== null) {
      if (filters.priceMin && price < Number(filters.priceMin)) return false;
      if (filters.priceMax && price > Number(filters.priceMax)) return false;
    }

    if (filters.surfaceMin && (p.surface ?? 0) < Number(filters.surfaceMin)) return false;
    if (filters.surfaceMax && (p.surface ?? 0) > Number(filters.surfaceMax)) return false;

    if (wanted.length) {
      const owned = propertyFeatureTags(p).map(norm);
      if (!wanted.every((f) => owned.some((o) => o.includes(f)))) return false;
    }

    return true;
  });
}

export function sortProperties(properties: Property[], sort: SortKey): Property[] {
  const list = [...properties];
  // Un immobile a trattativa riservata scivola in fondo, non vale zero.
  const price = (p: Property, fallback: number) => effectivePrice(p) ?? fallback;

  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => price(a, Infinity) - price(b, Infinity));
    case 'price-desc':
      return list.sort((a, b) => price(b, -Infinity) - price(a, -Infinity));
    case 'surface':
      return list.sort((a, b) => (b.surface ?? 0) - (a.surface ?? 0));
    default:
      // Dataset order \u00e8 curatoriale: in evidenza prima, poi come arrivano dal foglio.
      return list.sort((a, b) => Number(b.featuredHome) - Number(a.featuredHome));
  }
}

/** Facet values are always derived from the data, never hardcoded in the UI. */
export function buildFacets(properties: Property[]) {
  return {
    locations: [...new Set(properties.map((p) => p.location.comune))].sort(),
    types: [...new Set(properties.map((p) => p.propertyType))].sort(),
    features: [...new Set(properties.flatMap((p) => propertyFeatureTags(p)))].sort(),
    hasUsaf: properties.some((p) => p.usafEligible),
  };
}
