import { COLUMNS } from '../sync/columns.mjs';
import { IDEALISTA_COLUMN } from '../sync/googleSheetsWrite.mjs';

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildSlug(raw, existingSlugs, idealistaId) {
  const parts = [raw.propertyType, raw.comune].filter(Boolean).map(slugify).filter(Boolean);
  const base = parts.join('-') || `immobile-${idealistaId}`;
  if (!existingSlugs.has(base)) return base;

  const withId = `${base}-${idealistaId}`;
  if (!existingSlugs.has(withId)) return withId;

  let n = 2;
  while (existingSlugs.has(`${withId}-${n}`)) n++;
  return `${withId}-${n}`;
}

const bool = (v) => (v ? 'SI' : '0');
const num = (v) => (v !== null && v !== undefined ? String(v) : '0');
const str = (v) => (v && String(v).trim() !== '' ? v : '0');

/** Coppie chiave-segnale → etichetta colonna, per il conflict-check descrizione vs dato strutturato. */
const CONFLICT_CHECKS = {
  furnished: 'Arredato',
  garden: 'Giardino',
  terrace: 'Terrazzo',
  balcony: 'Balcone',
  elevator: 'Ascensore',
  airConditioning: 'Climatizzazione',
};

function buildShortDescription(raw) {
  const bits = [];
  if (raw.propertyType) bits.push(raw.propertyType);
  if (raw.comune) bits.push(`a ${raw.comune}`);
  if (raw.surface) bits.push(`${raw.surface} m²`);
  if (raw.bedrooms) bits.push(`${raw.bedrooms} camere`);
  return bits.length ? `${bits.join(', ')}.` : '0';
}

function cleanDescription(text) {
  if (!text) return '0';
  const cleaned = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 3)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned || '0';
}

/** Campi mai toccati da un import — né in creazione né in aggiornamento (né con --force). */
export const NEW_PROPERTY_DEFAULTS = {
  [COLUMNS.visible]: 'NO',
  [COLUMNS.status]: 'Disponibile',
  [COLUMNS.featuredHome]: '0',
  [COLUMNS.homeOrder]: '0',
  [COLUMNS.usaf]: '0',
  [COLUMNS.newDevelopment]: '0',
  [COLUMNS.projectName]: '0',
};

/**
 * Trasforma un annuncio già acquisito ({ idealistaId, url, raw }) in una
 * riga pronta per il Google Sheet, usando gli header reali (COLUMNS) — mai
 * indici hardcoded. Non include i campi editoriali: quelli si aggiungono
 * solo in fase di creazione (vedi NEW_PROPERTY_DEFAULTS), mai in aggiornamento.
 */
export function normalizeIdealistaListing({ idealistaId, url, raw }, { existingSlugs = new Set() } = {}) {
  const warnings = [];
  const resolved = {};

  for (const [key, columnLabel] of Object.entries(CONFLICT_CHECKS)) {
    const signal = raw.signals[key];
    if (signal?.positive && signal?.negative) {
      warnings.push(
        `WARNING\nConflicting value: ${columnLabel}\nIl testo contiene sia una conferma sia una smentita per questo campo.\nSaved as: 0`
      );
      resolved[key] = false; // conflitto: trattato come dato assente, mai indovinato
    } else {
      resolved[key] = Boolean(signal?.positive);
    }
  }

  const id = `IDE-${idealistaId}`;
  const slug = buildSlug(raw, existingSlugs, idealistaId);

  const record = {
    [COLUMNS.id]: id,
    [COLUMNS.slug]: slug,
    [COLUMNS.title]: raw.title || [raw.propertyType, raw.comune].filter(Boolean).join(' a ') || '0',
    [COLUMNS.status]: 'Disponibile',
    [COLUMNS.transaction]: raw.transaction === 'affitto' ? 'Affitto' : 'Vendita',
    [COLUMNS.propertyType]: str(raw.propertyType),
    [COLUMNS.comune]: str(raw.comune),
    [COLUMNS.provincia]: str(raw.provincia),
    [COLUMNS.price]: raw.transaction === 'vendita' ? num(raw.price) : '0',
    [COLUMNS.priceOnRequest]: bool(raw.priceOnRequest),
    [COLUMNS.monthlyRent]: raw.transaction === 'affitto' ? num(raw.monthlyRent) : '0',
    [COLUMNS.surface]: num(raw.surface),
    [COLUMNS.bedrooms]: num(raw.bedrooms),
    [COLUMNS.bathrooms]: num(raw.bathrooms),
    [COLUMNS.floor]: str(raw.floor),
    [COLUMNS.buildingFloors]: num(raw.buildingFloors),
    [COLUMNS.constructionYear]: num(raw.constructionYear),
    [COLUMNS.energyClass]: str(raw.energyClass),
    [COLUMNS.ipe]: raw.energyClass ? num(raw.ipe) : '0',
    [COLUMNS.garage]: bool(raw.garage),
    [COLUMNS.garageType]: str(raw.garageType),
    [COLUMNS.parkingSpot]: bool(raw.parkingSpot),
    [COLUMNS.parkingSpotCovered]: bool(raw.parkingSpotCovered),
    [COLUMNS.garden]: bool(resolved.garden),
    [COLUMNS.gardenSurface]: num(raw.gardenSurface),
    [COLUMNS.terrace]: bool(resolved.terrace),
    [COLUMNS.terraceSurface]: num(raw.terraceSurface),
    [COLUMNS.balcony]: bool(resolved.balcony),
    [COLUMNS.porch]: bool(raw.signals.porch?.positive),
    [COLUMNS.porchSurface]: num(raw.porchSurface),
    [COLUMNS.elevator]: bool(resolved.elevator),
    [COLUMNS.cellar]: bool(raw.signals.cellar?.positive),
    [COLUMNS.airConditioning]: bool(resolved.airConditioning),
    [COLUMNS.furnished]: bool(resolved.furnished),
    [COLUMNS.photovoltaic]: bool(raw.signals.photovoltaic?.positive),
    [COLUMNS.pool]: bool(raw.signals.pool?.positive),
    [COLUMNS.heating]: str(raw.heating),
    [COLUMNS.otherFeatures]: raw.otherFeatures.length ? raw.otherFeatures.join('|') : '0',
    [COLUMNS.shortDescription]: buildShortDescription(raw),
    [COLUMNS.description]: cleanDescription(raw.fullText),
    [IDEALISTA_COLUMN]: url,
  };

  return { id, slug, record, warnings };
}
