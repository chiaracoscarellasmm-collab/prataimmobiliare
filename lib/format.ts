import type { Locale } from '@/data/i18n';
import type { Property } from '@/data/properties';

const locales: Record<Locale, string> = {
  it: 'it-IT',
  en: 'en-GB',
};

function euro(locale: Locale) {
  return new Intl.NumberFormat(locales[locale], {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
    useGrouping: true,
  });
}

function number(locale: Locale) {
  return new Intl.NumberFormat(locales[locale]);
}

export type PriceCopy = {
  priceOnRequest: string;
  perMonth: string;
  room: string;
  rooms: string;
};

/** Prezzo per la vendita, canone per l'affitto — mai entrambi, mai € 0. */
export function effectivePrice(property: Property): number | null {
  return property.transactionType === 'affitto' ? property.monthlyRent : property.price;
}

/** Prices are optional: some listings are handled on request. */
export function formatPrice(
  value: number | null,
  transaction: 'vendita' | 'affitto' = 'vendita',
  copy: PriceCopy,
  locale: Locale = 'it'
): string {
  if (value === null) return copy.priceOnRequest;
  const formatted = euro(locale).format(value);
  return transaction === 'affitto' ? `${formatted} ${copy.perMonth}` : formatted;
}

export function formatSurface(value: number, locale: Locale = 'it'): string {
  return `${number(locale).format(value)} m²`;
}

export function padIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/**
 * "180 m² · 3 camere · 2 bagni" — riga compatta usata su card e dettaglio.
 * Ogni campo è opzionale: un immobile senza camere valorizzate (es. un
 * terreno) semplicemente non aggiunge quel pezzo, mai "0 camere".
 */
export function formatListFacts(
  surface: number | null,
  bedrooms: number | null,
  bathrooms: number | null,
  copy: PriceCopy & { bathroom: string; bathrooms: string },
  locale: Locale = 'it'
): string {
  const bits: string[] = [];
  if (surface !== null) bits.push(formatSurface(surface, locale));
  if (bedrooms !== null) bits.push(`${bedrooms} ${bedrooms === 1 ? copy.room : copy.rooms}`);
  if (bathrooms !== null) bits.push(`${bathrooms} ${bathrooms === 1 ? copy.bathroom : copy.bathrooms}`);
  return bits.join(' · ');
}
