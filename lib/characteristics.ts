import type { Dictionary, Locale } from '@/data/i18n';
import type { Property } from '@/data/properties';
import { propertyFeatureLabel } from '@/lib/copy';
import { formatSurface } from '@/lib/format';
import { isMeaningfulValue } from '@/lib/properties/isMeaningfulValue';

/** Narrowing wrapper: stessa regola di `isMeaningfulValue`, ma tipata. */
function meaningful<T>(value: T | null | undefined): value is T {
  return isMeaningfulValue(value);
}

export interface CharacteristicTile {
  /** Etichetta piccola. Assente = il `value` stesso è la caratteristica (es. "Ascensore"). */
  key?: string;
  value: string;
}

/**
 * Griglia editoriale della pagina dettaglio: solo dati valorizzati, nell'ordine
 * dello spec (superficie → altre caratteristiche). Un booleano senza un
 * sotto-valore mostra solo la propria etichetta, mai "Sì" o un trattino.
 */
export function buildCharacteristics(t: Dictionary, property: Property, locale: Locale): CharacteristicTile[] {
  const tiles: CharacteristicTile[] = [];

  if (meaningful(property.surface)) {
    tiles.push({ key: t.property.surface, value: formatSurface(property.surface, locale) });
  }
  if (meaningful(property.bedrooms)) {
    tiles.push({ key: t.property.bedrooms, value: String(property.bedrooms) });
  }
  if (meaningful(property.bathrooms)) {
    tiles.push({ key: t.property.bathroomsLabel, value: String(property.bathrooms) });
  }
  if (meaningful(property.floor)) {
    tiles.push({ key: t.property.floorLabel, value: property.floor });
  }
  if (meaningful(property.buildingFloors)) {
    tiles.push({ key: t.property.buildingFloorsLabel, value: String(property.buildingFloors) });
  }
  if (meaningful(property.constructionYear)) {
    tiles.push({ key: t.property.yearLabel, value: String(property.constructionYear) });
  }

  if (property.garage) {
    tiles.push(
      meaningful(property.garageType)
        ? { key: t.property.garage, value: propertyFeatureLabel(t, property.garageType) }
        : { value: t.property.garage }
    );
  }

  if (property.parkingSpot) {
    tiles.push(
      property.parkingSpotCovered
        ? { key: t.property.parkingSpot, value: t.property.covered }
        : { value: t.property.parkingSpot }
    );
  }

  if (property.garden) {
    tiles.push(
      meaningful(property.gardenSurface)
        ? { key: t.property.garden, value: formatSurface(property.gardenSurface, locale) }
        : { value: t.property.garden }
    );
  }

  if (property.terrace) {
    tiles.push(
      meaningful(property.terraceSurface)
        ? { key: t.property.terrace, value: formatSurface(property.terraceSurface, locale) }
        : { value: t.property.terrace }
    );
  }

  if (property.balcony) tiles.push({ value: t.property.balcony });

  if (property.porch) {
    tiles.push(
      meaningful(property.porchSurface)
        ? { key: t.property.porch, value: formatSurface(property.porchSurface, locale) }
        : { value: t.property.porch }
    );
  }

  if (property.elevator) tiles.push({ value: t.property.elevator });
  if (property.cellar) tiles.push({ value: t.property.cellar });
  if (property.airConditioning) tiles.push({ value: t.property.airConditioning });
  if (property.furnished) tiles.push({ value: t.property.furnished });
  if (property.photovoltaic) tiles.push({ value: t.property.photovoltaic });
  if (property.pool) tiles.push({ value: t.property.pool });

  if (meaningful(property.heating)) {
    tiles.push({ key: t.property.heating, value: propertyFeatureLabel(t, property.heating) });
  }

  if (meaningful(property.otherFeatures)) {
    for (const feature of property.otherFeatures) {
      tiles.push({ value: propertyFeatureLabel(t, feature) });
    }
  }

  return tiles;
}

/**
 * Striscia in alto, vicino al prezzo: solo un assaggio (superficie, camere,
 * bagni, piano, garage, classe energetica), non l'elenco completo — quello
 * vive più giù in {@link buildCharacteristics} e nel blocco energia a parte.
 */
export function buildKeyFacts(t: Dictionary, property: Property, locale: Locale): CharacteristicTile[] {
  const tiles: CharacteristicTile[] = [];

  if (meaningful(property.surface)) {
    tiles.push({ key: t.property.surface, value: formatSurface(property.surface, locale) });
  }
  if (meaningful(property.bedrooms)) {
    tiles.push({ key: t.property.bedrooms, value: String(property.bedrooms) });
  }
  if (meaningful(property.bathrooms)) {
    tiles.push({ key: t.property.bathroomsLabel, value: String(property.bathrooms) });
  }
  if (meaningful(property.floor)) {
    tiles.push({ key: t.property.floorLabel, value: property.floor });
  }
  // La tile qui è sempre un dt/dd: senza un valore reale (il tipo box) non
  // entra in questa striscia, ma resta comunque nella griglia caratteristiche.
  if (property.garage && meaningful(property.garageType)) {
    tiles.push({ key: t.property.garage, value: propertyFeatureLabel(t, property.garageType) });
  }
  if (property.energy) tiles.push({ key: t.property.energy, value: property.energy.class });

  return tiles;
}

export interface EnergyInfo {
  energyClass: string;
  ipeLabel: string | null;
}

/** `null` = niente classe energetica: il blocco intero va nascosto, non svuotato. */
export function buildEnergyInfo(property: Property, locale: Locale, ipeUnit: string): EnergyInfo | null {
  if (!property.energy) return null;
  const ipe = property.energy.ipe;
  const formatter = new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-GB', {
    maximumFractionDigits: 1,
  });
  return {
    energyClass: property.energy.class,
    ipeLabel: meaningful(ipe) ? `${formatter.format(ipe)} ${ipeUnit}` : null,
  };
}
