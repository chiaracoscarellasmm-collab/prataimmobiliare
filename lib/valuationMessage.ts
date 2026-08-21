import type { Dictionary } from '@/data/i18n';
import { valuationLabel } from '@/lib/copy';
import { contact } from '@/data/site';
import {
  CONDITIONS,
  CONTEXTS,
  ENERGY_CLASSES,
  EXTERNAL_FEATURES,
  FLOORS,
  GARDEN_OPTIONS,
  HEATINGS,
  OBJECTIVES,
  OCCUPANCY_STATUSES,
  PROPERTY_TYPES,
  type Option,
  type ValuationData,
} from './valuation';

function optionLabel(t: Dictionary, options: Option[], value: string): string | null {
  const found = options.find((o) => o.value === value);
  return found ? valuationLabel(t, found.key) : null;
}

function formatFee(value: string, t: Dictionary): string {
  return `€${value.trim()} ${t.valuation.perMonth}`;
}

const m2 = (value: string) => `${value.trim()} m²`;

/**
 * Costruisce il messaggio WhatsApp riga per riga: solo i campi con una
 * risposta reale entrano nel testo — mai "Non applicabile", mai un campo
 * vuoto o undefined. "Non lo so" è un'informazione legittima e resta.
 * Un'intera sezione sparisce se non ha nemmeno una riga da mostrare.
 */
export function buildValuationMessage(data: ValuationData, t: Dictionary): string {
  const v = t.valuation;
  const blocks: string[] = [v.messageGreeting];

  /* ------------------------------------------------------------ IMMOBILE - */
  const property: string[] = [];
  const propertyTypeLabel =
    data.propertyType === 'altro' && data.propertyTypeOther.trim()
      ? data.propertyTypeOther.trim()
      : optionLabel(t, PROPERTY_TYPES, data.propertyType);
  if (propertyTypeLabel) property.push(`${v.msgType}: ${propertyTypeLabel}`);
  if (data.address.trim()) property.push(`${v.msgAddress}: ${data.address.trim()}`);
  if (data.floor) {
    const floorLabel = optionLabel(t, FLOORS, data.floor);
    if (floorLabel) property.push(`${v.msgFloor}: ${floorLabel}`);
  }
  const contextLabel =
    data.context === 'altro' && data.contextOther.trim()
      ? data.contextOther.trim()
      : optionLabel(t, CONTEXTS, data.context);
  if (contextLabel) property.push(`${v.msgContext}: ${contextLabel}`);
  if (data.condominium) property.push(`${v.msgCondominium}: ${data.condominium === 'si' ? v.yes : v.no}`);
  if (data.surface.trim()) property.push(`${v.msgSurface}: ${m2(data.surface)}`);
  if (data.constructionYearUnknown) {
    property.push(`${v.msgConstructionYear}: ${v.dontKnowLabel}`);
  } else if (data.constructionYear.trim()) {
    property.push(`${v.msgConstructionYear}: ${data.constructionYear.trim()}`);
  }
  if (data.rooms) {
    property.push(`${v.msgRooms}: ${data.rooms === 'non-lo-so' ? v.dontKnowLabel : data.rooms}`);
  }
  if (property.length) blocks.push(`${v.msgIconHome} ${v.msgSectionHome}\n${property.join('\n')}`);

  /* --------------------------------------------------- SPAZI E PERTINENZE - */
  const outdoor: string[] = [];
  const features = data.externalFeatures.filter((f) => f !== 'nessuna');
  if (features.length) {
    const labels = features.map((f) => optionLabel(t, EXTERNAL_FEATURES, f)).filter(Boolean);
    if (labels.length) outdoor.push(`${v.msgFeatures}: ${labels.join(', ')}`);
  }
  if (data.garden) {
    outdoor.push(`${v.msgGarden}: ${optionLabel(t, GARDEN_OPTIONS, data.garden)}`);
  }
  if (data.garden === 'privato' || data.garden === 'condominiale') {
    if (data.gardenSurfaceUnknown) {
      outdoor.push(`${v.msgGardenSurface}: ${v.dontKnowLabel}`);
    } else if (data.gardenSurface.trim()) {
      outdoor.push(`${v.msgGardenSurface}: ${m2(data.gardenSurface)}`);
    }
  }
  if (outdoor.length) blocks.push(`${v.msgIconOutdoor} ${v.msgSectionOutdoor}\n${outdoor.join('\n')}`);

  /* ------------------------------------------------------ STATO E IMPIANTI - */
  const condition: string[] = [];
  if (data.condition) {
    const conditionLabel =
      data.condition === 'non-lo-so' ? v.dontKnowLabel : optionLabel(t, CONDITIONS, data.condition);
    condition.push(`${v.msgCondition}: ${conditionLabel ?? data.condition}`);
  }
  if (data.energyClass) {
    condition.push(
      `${v.msgEnergyClass}: ${data.energyClass === 'non-lo-so' ? v.dontKnowLabel : optionLabel(t, ENERGY_CLASSES, data.energyClass)}`
    );
  }
  if (data.heating) {
    const heatingLabel =
      data.heating === 'altro' && data.heatingOther.trim()
        ? data.heatingOther.trim()
        : data.heating === 'non-lo-so'
          ? v.dontKnowLabel
          : optionLabel(t, HEATINGS, data.heating);
    if (heatingLabel) condition.push(`${v.msgHeating}: ${heatingLabel}`);
  }
  if (condition.length) blocks.push(`${v.msgIconCondition} ${v.msgSectionCondition}\n${condition.join('\n')}`);

  /* ---------------------------------------------------------- SITUAZIONE - */
  const situation: string[] = [];
  const occupancyLabel = optionLabel(t, OCCUPANCY_STATUSES, data.occupancyStatus);
  if (occupancyLabel) situation.push(`${v.msgOccupancy}: ${occupancyLabel}`);
  if (data.condominium === 'si') {
    if (data.condominiumFeesUnknown) {
      situation.push(`${v.msgCondominiumFees}: ${v.dontKnowLabel}`);
    } else if (data.condominiumFees.trim()) {
      situation.push(`${v.msgCondominiumFees}: ${formatFee(data.condominiumFees, t)}`);
    }
  }
  if (situation.length) blocks.push(`${v.msgIconSituation} ${v.msgSectionSituation}\n${situation.join('\n')}`);

  /* ------------------------------------------------------------ OBIETTIVO - */
  const objectiveLabel = optionLabel(t, OBJECTIVES, data.objective);
  if (objectiveLabel) blocks.push(`${v.msgIconObjective} ${v.msgSectionObjective}\n${objectiveLabel}`);

  /* ------------------------------------------------------------- CONTATTO - */
  const contactLines: string[] = [];
  if (data.firstName.trim()) contactLines.push(`${v.msgFirstName}: ${data.firstName.trim()}`);
  if (data.lastName.trim()) contactLines.push(`${v.msgLastName}: ${data.lastName.trim()}`);
  if (data.phone.trim()) contactLines.push(`${v.msgPhone}: ${data.phone.trim()}`);
  if (contactLines.length) blocks.push(`${v.msgIconContact} ${v.msgSectionContact}\n${contactLines.join('\n')}`);

  blocks.push(v.messageClosing);

  return blocks.join('\n\n');
}

/** Cifre del numero WhatsApp Business già configurato nei contatti del sito — mai un secondo numero hardcoded qui. */
export function getWhatsAppDigits(): string {
  return contact.whatsapp.href.replace(/\D/g, '');
}

/** `https://wa.me/<numero>?text=<messaggio codificato>` — mai testo non codificato nella URL. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${getWhatsAppDigits()}?text=${encodeURIComponent(message)}`;
}
