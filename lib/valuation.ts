/**
 * Schema e validazione del questionario di valutazione.
 *
 * Un solo oggetto di stato, come richiesto: nessuno step ha uno stato
 * proprio, tutto vive qui e il form si limita a leggerlo/scriverlo. I valori
 * dei campi a scelta sono slug stabili (mai il testo visibile): le etichette
 * si traducono altrove (vedi lib/copy.ts → valuationLabel), così lo stato
 * resta indipendente dalla lingua.
 */

export interface ValuationData {
  address: string;

  propertyType: string;
  propertyTypeOther: string;

  floor: string;
  context: string;
  contextOther: string;
  condominium: '' | 'si' | 'no';

  surface: string;
  constructionYear: string;
  constructionYearUnknown: boolean;
  rooms: string;

  externalFeatures: string[];
  garden: '' | 'no' | 'privato' | 'condominiale';
  gardenSurface: string;
  gardenSurfaceUnknown: boolean;

  condition: string;
  energyClass: string;
  heating: string;
  heatingOther: string;

  occupancyStatus: string;
  condominiumFees: string;
  condominiumFeesUnknown: boolean;

  objective: '' | 'vendere' | 'affittare' | 'entrambe';

  firstName: string;
  lastName: string;
  phone: string;

  privacyAccepted: boolean;
}

export const INITIAL_VALUATION: ValuationData = {
  address: '',
  propertyType: '',
  propertyTypeOther: '',
  floor: '',
  context: '',
  contextOther: '',
  condominium: '',
  surface: '',
  constructionYear: '',
  constructionYearUnknown: false,
  rooms: '',
  externalFeatures: [],
  garden: '',
  gardenSurface: '',
  gardenSurfaceUnknown: false,
  condition: '',
  energyClass: '',
  heating: '',
  heatingOther: '',
  occupancyStatus: '',
  condominiumFees: '',
  condominiumFeesUnknown: false,
  objective: '',
  firstName: '',
  lastName: '',
  phone: '',
  privacyAccepted: false,
};

/** Ogni option-list è { value: slug stabile, key: chiave di traduzione in t.valuation.labels }. */
export type Option = { value: string; key: string };

export const PROPERTY_TYPES: Option[] = [
  { value: 'appartamento', key: 'appartamento' },
  { value: 'casa-indipendente', key: 'casaIndipendente' },
  { value: 'villa', key: 'villa' },
  { value: 'casa-a-schiera', key: 'casaASchiera' },
  { value: 'bifamiliare', key: 'bifamiliare' },
  { value: 'rustico', key: 'rustico' },
  { value: 'locale-commerciale', key: 'localeCommerciale' },
  { value: 'ufficio', key: 'ufficio' },
  { value: 'terreno', key: 'terreno' },
  { value: 'altro', key: 'altro' },
];

export const FLOORS: Option[] = [
  { value: 'terra', key: 'floorTerra' },
  { value: '1', key: 'floor1' },
  { value: '2', key: 'floor2' },
  { value: '3', key: 'floor3' },
  { value: '4-piu', key: 'floor4Piu' },
  { value: 'ultimo', key: 'floorUltimo' },
  { value: 'piu-livelli', key: 'floorPiuLivelli' },
];

export const CONTEXTS: Option[] = [
  { value: 'indipendente', key: 'contextIndipendente' },
  { value: 'piccolo-condominio', key: 'contextPiccoloCondominio' },
  { value: 'condominio', key: 'contextCondominio' },
  { value: 'residence', key: 'contextResidence' },
  { value: 'corte-borgo', key: 'contextCorteBorgo' },
  { value: 'complesso-residenziale', key: 'contextComplessoResidenziale' },
  { value: 'altro', key: 'altro' },
];

export const ROOMS: Option[] = [
  { value: '1', key: 'rooms1' },
  { value: '2', key: 'rooms2' },
  { value: '3', key: 'rooms3' },
  { value: '4', key: 'rooms4' },
  { value: '5', key: 'rooms5' },
  { value: '6+', key: 'rooms6Piu' },
  { value: 'non-lo-so', key: 'dontKnow' },
];

export const EXTERNAL_FEATURES: Option[] = [
  { value: 'garage', key: 'featureGarage' },
  { value: 'posto-auto', key: 'featurePostoAuto' },
  { value: 'cantina', key: 'featureCantina' },
  { value: 'soffitta', key: 'featureSoffitta' },
  { value: 'taverna', key: 'featureTaverna' },
  { value: 'terrazzo', key: 'featureTerrazzo' },
  { value: 'balcone', key: 'featureBalcone' },
  { value: 'porticato', key: 'featurePorticato' },
  { value: 'deposito', key: 'featureDeposito' },
  { value: 'nessuna', key: 'featureNessuna' },
  { value: 'altro', key: 'altro' },
];

export const CONDOMINIUM_OPTIONS: Option[] = [
  { value: 'si', key: 'yes' },
  { value: 'no', key: 'no' },
];

export const GARDEN_OPTIONS: Option[] = [
  { value: 'no', key: 'gardenNo' },
  { value: 'privato', key: 'gardenPrivato' },
  { value: 'condominiale', key: 'gardenCondominiale' },
];

export const CONDITIONS: Option[] = [
  { value: 'nuova-costruzione', key: 'conditionNuovaCostruzione' },
  { value: 'nuovo-mai-abitato', key: 'conditionNuovoMaiAbitato' },
  { value: 'ristrutturato', key: 'conditionRistrutturato' },
  { value: 'ottimo-stato', key: 'conditionOttimoStato' },
  { value: 'buono-stato', key: 'conditionBuonoStato' },
  { value: 'da-ristrutturare', key: 'conditionDaRistrutturare' },
  { value: 'in-costruzione', key: 'conditionInCostruzione' },
  { value: 'non-lo-so', key: 'dontKnow' },
];

export const ENERGY_CLASSES: Option[] = [
  'A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G',
].map((c) => ({ value: c, key: `energy${c}` }));
ENERGY_CLASSES.push({ value: 'non-lo-so', key: 'dontKnow' });

export const HEATINGS: Option[] = [
  { value: 'autonomo', key: 'heatingAutonomo' },
  { value: 'centralizzato', key: 'heatingCentralizzato' },
  { value: 'pompa-di-calore', key: 'heatingPompaDiCalore' },
  { value: 'pavimento', key: 'heatingPavimento' },
  { value: 'caldaia', key: 'heatingCaldaia' },
  { value: 'stufa-camino', key: 'heatingStufaCamino' },
  { value: 'altro', key: 'altro' },
  { value: 'non-lo-so', key: 'dontKnow' },
];

export const OCCUPANCY_STATUSES: Option[] = [
  { value: 'libero', key: 'occupancyLibero' },
  { value: 'occupato-proprietario', key: 'occupancyOccupatoProprietario' },
  { value: 'affittato', key: 'occupancyAffittato' },
  { value: 'occupato-terzi', key: 'occupancyOccupatoTerzi' },
  { value: 'in-costruzione', key: 'conditionInCostruzione' },
  { value: 'altro', key: 'altro' },
];

export const OBJECTIVES: Option[] = [
  { value: 'vendere', key: 'objectiveVendere' },
  { value: 'affittare', key: 'objectiveAffittare' },
  { value: 'entrambe', key: 'objectiveEntrambe' },
];

/** Sette step numerati; il riepilogo finale non è uno step a sé. */
export const STEP_COUNT = 7;

export type Errors = Partial<Record<keyof ValuationData, string>>;

const PHONE = /^[+\d][\d\s().-]{6,}$/;

/** Solo i campi davvero obbligatori bloccano l'avanzamento. */
export function validateStep(step: number, data: ValuationData, msg: Record<string, string>): Errors {
  const errors: Errors = {};

  if (step === 1) {
    if (!data.address.trim()) errors.address = msg.address;
    if (!data.propertyType) errors.propertyType = msg.propertyType;
    if (data.propertyType === 'altro' && !data.propertyTypeOther.trim()) {
      errors.propertyTypeOther = msg.propertyTypeOther;
    }
  }

  if (step === 2) {
    if (!data.surface.trim() || !/^\d{1,5}$/.test(data.surface.trim())) {
      errors.surface = msg.surface;
    }
  }

  if (step === 4 && !data.condition) {
    errors.condition = msg.condition;
  }

  if (step === 6 && !data.objective) {
    errors.objective = msg.objective;
  }

  if (step === 7) {
    if (!data.firstName.trim()) errors.firstName = msg.firstName;
    if (!data.lastName.trim()) errors.lastName = msg.lastName;
    if (!data.phone.trim()) errors.phone = msg.phone;
    else if (!PHONE.test(data.phone.trim())) errors.phone = msg.phoneInvalid;
    if (!data.privacyAccepted) errors.privacyAccepted = msg.privacy;
  }

  return errors;
}

/** Tutti gli errori del form intero — usata prima dell'invio finale dal riepilogo. */
export function validateAll(data: ValuationData, msg: Record<string, string>): Errors {
  return [1, 2, 4, 6, 7].reduce<Errors>(
    (all, step) => ({ ...all, ...validateStep(step, data, msg) }),
    {}
  );
}
