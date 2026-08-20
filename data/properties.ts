/**
 * Sorgente: Google Sheet "Immobili" (template v3) → Cloudflare R2 → questo
 * dataset generato. Non modificare a mano: `npm run sync:properties`
 * rigenera `data/generated/properties.json` da quella pipeline.
 *
 * Il frontend non interroga mai Google Sheets o R2 direttamente — legge solo
 * questo JSON già validato e già filtrato su Visibile=SI.
 */
import generated from './generated/properties.json';

export type TransactionType = 'vendita' | 'affitto';

export type PropertyStatus =
  | 'Disponibile'
  | 'In trattativa'
  | 'Venduto'
  | 'Affittato'
  | 'In costruzione'
  | 'Ritirato';

export interface PropertyImage {
  src: string;
  alt: string;
  /** Intrinseco, usato per riservare lo spazio ed evitare layout shift. */
  width: number;
  height: number;
}

export interface PropertyLocation {
  comune: string;
  provincia: string | null;
  zona: string | null;
  address: string | null;
  showAddress: boolean;
}

export interface PropertyEnergy {
  class: string;
  ipe: number | null;
}

export interface PropertySeo {
  title: string | null;
  description: string | null;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  visible: boolean;
  status: PropertyStatus;
  transactionType: TransactionType;
  propertyType: string;
  publicationDate: string | null;
  featuredHome: boolean;
  homeOrder: number | null;
  usafEligible: boolean;
  newDevelopment: boolean;
  projectName: string | null;
  location: PropertyLocation;
  /** `null` = trattativa riservata / prezzo su richiesta. */
  price: number | null;
  priceOnRequest: boolean;
  monthlyRent: number | null;
  monthlyCondoFees: number | null;
  surface: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: string | null;
  buildingFloors: number | null;
  constructionYear: number | null;
  energy: PropertyEnergy | null;
  garage: boolean;
  garageType: string | null;
  parkingSpot: boolean;
  parkingSpotCovered: boolean;
  garden: boolean;
  gardenSurface: number | null;
  terrace: boolean;
  terraceSurface: number | null;
  balcony: boolean;
  porch: boolean;
  porchSurface: number | null;
  elevator: boolean;
  cellar: boolean;
  airConditioning: boolean;
  furnished: boolean;
  photovoltaic: boolean;
  pool: boolean;
  heating: string | null;
  /** Testo libero, dalla colonna "Altre caratteristiche" (separatore `|`). */
  otherFeatures: string[];
  shortDescription: string | null;
  description: string | null;
  videoUrl: string | null;
  seo: PropertySeo;
  coverImage: PropertyImage | null;
  images: PropertyImage[];
}

/**
 * Il dataset generato contiene già solo gli immobili Visibile=SI (vedi
 * scripts/sync-properties.mjs) — questo filtro è una seconda rete di
 * sicurezza, non l'unica.
 */
export const properties: Property[] = (generated as Property[]).filter((p) => p.visible);

/* ------------------------------------------------------------- SELECTORS - */

export const getPropertyBySlug = (slug: string) => properties.find((p) => p.slug === slug);

export const getFeaturedProperties = (limit = 5) =>
  properties
    .filter((p) => p.featuredHome)
    .sort((a, b) => (a.homeOrder ?? Infinity) - (b.homeOrder ?? Infinity))
    .slice(0, limit);

export const getUsafProperties = () => properties.filter((p) => p.usafEligible);

export const getNewDevelopmentProperties = () => properties.filter((p) => p.newDevelopment);

export const getRelatedProperties = (current: Property, limit = 3) =>
  properties
    .filter((p) => p.slug !== current.slug)
    .sort((a, b) => {
      const score = (p: Property) =>
        (p.transactionType === current.transactionType ? 2 : 0) +
        (p.propertyType === current.propertyType ? 2 : 0) +
        (p.location.comune === current.location.comune ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, limit);

/** Facet values derivati dal dataset — mai hardcoded nella UI. */
export const propertyFacets = {
  locations: [...new Set(properties.map((p) => p.location.comune))].sort(),
  types: [...new Set(properties.map((p) => p.propertyType))].sort(),
  transactions: ['vendita', 'affitto'] as TransactionType[],
};
