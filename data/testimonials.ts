/**
 * ⚠️  TESTIMONIANZE PLACEHOLDER
 * Sostituire con recensioni reali e autorizzate. Nessuna delle citazioni
 * qui presenti proviene da un cliente reale.
 */

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  detail: string;
  initials: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 't-1',
    quote:
      'Ci siamo sentiti seguiti dal primo incontro fino alla firma. Un rapporto professionale, ma soprattutto umano.',
    name: '[Nome Cognome]',
    detail: 'Acquisto · [Località]',
    initials: 'NC',
  },
  {
    id: 't-2',
    quote:
      'Hanno presentato la nostra casa con una cura che non ci aspettavamo. Le fotografie hanno fatto la differenza.',
    name: '[Nome Cognome]',
    detail: 'Vendita · [Località]',
    initials: 'NC',
  },
  {
    id: 't-3',
    quote:
      'Ogni passaggio ci è stato spiegato con chiarezza, senza fretta. Abbiamo deciso con serenità.',
    name: '[Nome Cognome]',
    detail: 'Locazione · [Località]',
    initials: 'NC',
  },
];
