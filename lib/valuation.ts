/** Shape of a valuation request. Mirrors the fields the form collects. */
export interface ValuationData {
  intent: '' | 'vendere' | 'affittare';
  /** Set when the request arrives from the USAF rental route. */
  target: '' | 'usaf';

  propertyType: string;
  location: string;
  address: string;
  surface: string;
  bedrooms: string;
  bathrooms: string;
  features: string[];

  condition: string;
  constructionYear: string;
  renovationYear: string;
  energyClass: string;
  occupancy: string;

  timeline: string;
  photos: File[];

  name: string;
  phone: string;
  email: string;
  contactPreference: string;
  notes: string;
  privacyConsent: boolean;
}

export const INITIAL_VALUATION: ValuationData = {
  intent: '',
  target: '',
  propertyType: '',
  location: '',
  address: '',
  surface: '',
  bedrooms: '',
  bathrooms: '',
  features: [],
  condition: '',
  constructionYear: '',
  renovationYear: '',
  energyClass: '',
  occupancy: '',
  timeline: '',
  photos: [],
  name: '',
  phone: '',
  email: '',
  contactPreference: '',
  notes: '',
  privacyConsent: false,
};

export const PROPERTY_TYPES = [
  'Appartamento',
  'Casa indipendente',
  'Villa',
  'Casa a schiera',
  'Rustico',
  'Terreno',
  'Locale commerciale',
  'Altro',
];

export const FEATURES = [
  'Garage',
  'Posto auto',
  'Terrazzo',
  'Giardino',
  'Ascensore',
];

export const CONDITIONS = [
  'Nuovo / recente',
  'Ottimo stato',
  'Buono stato',
  'Da ristrutturare',
  'In costruzione',
  'Non saprei',
];

export const ENERGY_CLASSES = [
  'A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G', 'Non lo so',
];

export const OCCUPANCY = ['Libero', 'Occupato', 'Locato', 'Altro', 'Non lo so'];

export const TIMELINES = [
  'Il prima possibile',
  'Entro 3 mesi',
  'Entro 6 mesi',
  'Non ho ancora deciso',
  'Voglio prima conoscere il valore',
];

export const CONTACT_PREFERENCES = ['Telefono', 'WhatsApp', 'Email'];

export const STEP_TITLES = [
  'Il tuo obiettivo',
  'L’immobile',
  'Lo stato',
  'Le tempistiche',
  'I tuoi contatti',
];

export type Errors = Partial<Record<keyof ValuationData, string>>;

export type ValidationMessages = {
  intent: string;
  propertyType: string;
  location: string;
  surface: string;
  condition: string;
  timeline: string;
  name: string;
  phone: string;
  phoneInvalid: string;
  emailInvalid: string;
  privacy: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Permissive on purpose: people write numbers in many shapes. */
const PHONE = /^[+\d][\d\s().-]{6,}$/;

/** Only the genuinely required fields block progress. */
export function validateStep(
  step: number,
  data: ValuationData,
  msg: ValidationMessages
): Errors {
  const errors: Errors = {};

  if (step === 0 && !data.intent) {
    errors.intent = msg.intent;
  }

  if (step === 1) {
    if (!data.propertyType) errors.propertyType = msg.propertyType;
    if (!data.location.trim()) errors.location = msg.location;
    if (data.surface && !/^\d{1,5}$/.test(data.surface.trim())) {
      errors.surface = msg.surface;
    }
  }

  if (step === 2 && !data.condition) {
    errors.condition = msg.condition;
  }

  if (step === 3 && !data.timeline) {
    errors.timeline = msg.timeline;
  }

  if (step === 4) {
    if (!data.name.trim()) errors.name = msg.name;
    if (!data.phone.trim() && !data.email.trim()) {
      errors.phone = msg.phone;
    } else {
      if (data.phone.trim() && !PHONE.test(data.phone.trim())) {
        errors.phone = msg.phoneInvalid;
      }
      if (data.email.trim() && !EMAIL.test(data.email.trim())) {
        errors.email = msg.emailInvalid;
      }
    }
    if (!data.privacyConsent) {
      errors.privacyConsent = msg.privacy;
    }
  }

  return errors;
}
