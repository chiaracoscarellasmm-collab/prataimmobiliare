import type { Dictionary } from '@/data/i18n';
import { labelOf } from '@/data/i18n';
import type { Property } from '@/data/properties';

export function propertyTitle(t: Dictionary, property: Property): string {
  const translated = labelOf(t.property.titles as Record<string, string>, property.slug);
  return translated === property.slug ? property.title : translated;
}

export function propertyTypeLabel(t: Dictionary, type: string): string {
  return labelOf(t.property.types as Record<string, string>, type);
}

export function propertyStatusLabel(t: Dictionary, status: Property['status']): string {
  return t.property.status[status] ?? '';
}

export function propertyFeatureLabel(t: Dictionary, feature: string): string {
  return labelOf(t.property.features as Record<string, string>, feature);
}

/** I dodici amenity a colonna fissa nel foglio — nomi di campo = chiavi i18n dirette. */
export const AMENITY_CODES = [
  'garage',
  'parkingSpot',
  'garden',
  'terrace',
  'balcony',
  'porch',
  'elevator',
  'cellar',
  'airConditioning',
  'furnished',
  'photovoltaic',
  'pool',
] as const;

export type AmenityCode = (typeof AMENITY_CODES)[number];

export function propertyAmenityCodes(property: Property): AmenityCode[] {
  return AMENITY_CODES.filter((code) => property[code] === true);
}

export function amenityLabel(t: Dictionary, code: AmenityCode): string {
  return t.property[code];
}

/** Un facet può essere un'amenity a codice fisso o testo libero — un solo punto per etichettarli entrambi. */
export function featureFacetLabel(t: Dictionary, code: string): string {
  return (AMENITY_CODES as readonly string[]).includes(code)
    ? amenityLabel(t, code as AmenityCode)
    : propertyFeatureLabel(t, code);
}

export function valuationLabel(t: Dictionary, key: string): string {
  return labelOf(t.valuation.labels as Record<string, string>, key);
}

export function hourLabel(t: Dictionary, key: string): string {
  return labelOf(t.hours as unknown as Record<string, string>, key);
}

export function hourTime(t: Dictionary, time: string): string {
  return time === 'appointment' ? t.hours.appointment : time;
}
