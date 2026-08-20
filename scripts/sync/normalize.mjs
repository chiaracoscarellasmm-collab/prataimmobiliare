import { COLUMNS } from './columns.mjs';

/** "0" / "" / null / undefined = dato assente. Unica regola, riusata ovunque. */
function raw(row, key) {
  const value = row[COLUMNS[key]];
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

/** Stringa opzionale: torna il testo o null se assente. */
function str(row, key) {
  const value = raw(row, key);
  return value === '' || value === '0' ? null : value;
}

/** Numero opzionale: torna il numero o null se assente/non numerico/0. */
function num(row, key) {
  const value = raw(row, key);
  if (value === '' || value === '0') return null;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && n !== 0 ? n : null;
}

/** SI → true, NO → false, 0/""/assente → null. */
function bool(row, key) {
  const value = raw(row, key).toLowerCase();
  if (value === 'si' || value === 'sì') return true;
  if (value === 'no') return false;
  return null;
}

const TRANSACTION_MAP = { vendita: 'vendita', affitto: 'affitto' };

function transactionOf(row) {
  const value = raw(row, 'transaction').toLowerCase();
  return TRANSACTION_MAP[value] ?? null;
}

/**
 * Traduce una riga grezza del foglio in un record Property (senza immagini,
 * quelle arrivano dalla discovery R2). Non solleva mai eccezioni: eventuali
 * problemi finiscono nel report di validazione, non bloccano il parsing.
 */
export function normalizeRow(row, rowIndex) {
  const id = raw(row, 'id');
  const slugSource = raw(row, 'slug');
  // Nessuna correzione automatica: lo slug deve arrivare già lowercase e
  // url-safe dal foglio, altrimenti la validazione lo segnala come errore
  // invece di riscriverlo silenziosamente (lo slug deve restare stabile).
  const slug = slugSource;
  const title = str(row, 'title');
  const visible = bool(row, 'visible') === true;
  const status = str(row, 'status');
  const transactionType = transactionOf(row);
  const propertyType = str(row, 'propertyType');
  const comune = str(row, 'comune');

  const energyClass = str(row, 'energyClass');
  const energy = energyClass ? { class: energyClass, ipe: num(row, 'ipe') } : null;

  const otherFeatures = [
    ...new Set(
      (raw(row, 'otherFeatures') || '')
        .split('|')
        .map((f) => f.trim())
        .filter((f) => f !== '' && f !== '0')
    ),
  ];

  const priceOnRequest = bool(row, 'priceOnRequest') === true;

  const property = {
    id,
    slug,
    title,
    visible,
    status,
    transactionType,
    propertyType,
    publicationDate: str(row, 'publicationDate'),
    featuredHome: bool(row, 'featuredHome') === true,
    homeOrder: num(row, 'homeOrder'),
    usafEligible: bool(row, 'usaf') === true,
    newDevelopment: bool(row, 'newDevelopment') === true,
    projectName: str(row, 'projectName'),
    location: {
      comune,
      provincia: str(row, 'provincia'),
      zona: str(row, 'zona'),
      address: str(row, 'address'),
      showAddress: bool(row, 'showAddress') === true,
    },
    price: num(row, 'price'),
    priceOnRequest,
    monthlyRent: num(row, 'monthlyRent'),
    monthlyCondoFees: num(row, 'monthlyCondoFees'),
    surface: num(row, 'surface'),
    bedrooms: num(row, 'bedrooms'),
    bathrooms: num(row, 'bathrooms'),
    floor: str(row, 'floor'),
    buildingFloors: num(row, 'buildingFloors'),
    constructionYear: num(row, 'constructionYear'),
    energy,
    garage: bool(row, 'garage') === true,
    garageType: str(row, 'garageType'),
    parkingSpot: bool(row, 'parkingSpot') === true,
    parkingSpotCovered: bool(row, 'parkingSpotCovered') === true,
    garden: bool(row, 'garden') === true,
    gardenSurface: num(row, 'gardenSurface'),
    terrace: bool(row, 'terrace') === true,
    terraceSurface: num(row, 'terraceSurface'),
    balcony: bool(row, 'balcony') === true,
    porch: bool(row, 'porch') === true,
    porchSurface: num(row, 'porchSurface'),
    elevator: bool(row, 'elevator') === true,
    cellar: bool(row, 'cellar') === true,
    airConditioning: bool(row, 'airConditioning') === true,
    furnished: bool(row, 'furnished') === true,
    photovoltaic: bool(row, 'photovoltaic') === true,
    pool: bool(row, 'pool') === true,
    heating: str(row, 'heating'),
    otherFeatures,
    shortDescription: str(row, 'shortDescription'),
    description: str(row, 'description'),
    videoUrl: str(row, 'videoUrl'),
    seo: {
      title: str(row, 'metaTitle'),
      description: str(row, 'metaDescription'),
    },
    coverImage: null,
    images: [],
  };

  return { rowIndex, property };
}

export { bool, num, str };
