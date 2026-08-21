/**
 * Company data. Every value marked PLACEHOLDER must be replaced with real
 * information before launch — nothing here is invented as fact.
 */

export const site = {
  name: 'Prata Immobiliare',
  wordmark: 'Prata Immobiliare',
  /** PLACEHOLDER — set the production domain. */
  url: 'https://www.prataimmobiliare.it',
  locale: 'it_IT',
  description:
    'Agenzia immobiliare a Prata di Pordenone. Vendita, locazione e nuove realizzazioni, con un servizio dedicato alle locazioni per il personale della Base USAF di Aviano.',
} as const;

export const contact = {
  address: {
    street: 'Via Cesare Battisti 30/B',
    city: 'Prata di Pordenone',
    postalCode: '33080',
    province: 'Pordenone',
  },
  vat: '01619230939',
  phone: { label: '+39 0434 610849', href: 'tel:+390434610849' },
  email: { label: 'info@prataimmobiliare.it', href: 'mailto:info@prataimmobiliare.it' },
  whatsapp: {
    label: 'WhatsApp',
    href: 'https://wa.me/390434610849',
  },
  hours: [
    { day: 'monday', time: '8.30–12.30  15.00–19.00' },
    { day: 'tuesday', time: '8.30–12.30  15.00–19.00' },
    { day: 'wednesday', time: '8.30–12.30  15.00–19.00' },
    { day: 'thursday', time: '8.30–12.30  15.00–19.00' },
    { day: 'friday', time: '8.30–12.30  15.00–18.30' },
    { day: 'saturday', time: 'appointment' },
  ],
  hoursCompact: [
    { days: 'monThu', time: '8.30–12.30 · 15.00–19.00' },
    { days: 'friday', time: '8.30–12.30 · 15.00–18.30' },
    { days: 'saturday', time: 'appointment' },
  ],
  maps: {
    href: 'https://share.google/uOOQZHrZ5nCXnUkEk',
  },
} as const;

/**
 * Referente dedicata al servizio Locazioni Americani — un canale WhatsApp
 * separato dal numero generale dell'agenzia, mai usato per altri servizi.
 */
export const elisa = {
  name: 'Elisa',
  phone: { label: '345 821 2203', href: 'tel:+393458212203' },
  whatsapp: { href: 'https://wa.me/393458212203' },
} as const;

export const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/prata_immobiliare/' },
  { label: 'Facebook', href: 'https://www.facebook.com/prataimmobiliare/' },
] as const;

export const nav = [
  { key: 'about', href: '/chi-siamo' },
  { key: 'properties', href: '/immobili' },
  { key: 'sellRent', href: '/vendi-affitta' },
  { key: 'usaf', href: '/locazioni-americani' },
] as const;

export const legalNav = [
  { key: 'privacy', href: '/privacy-policy' },
  { key: 'cookies', href: '/cookie-policy' },
] as const;
