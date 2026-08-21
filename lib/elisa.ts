import { elisa } from '@/data/site';

/**
 * Testo fisso, richiesto verbatim: nessuna variante per lingua o sezione,
 * cosi ogni CTA "parla con Elisa" della pagina apre la stessa conversazione.
 */
const ELISA_MESSAGE =
  'Buongiorno Elisa, vorrei avere maggiori informazioni sul servizio Locazioni Americani di Prata Immobiliare.';

function getElisaWhatsAppDigits(): string {
  return elisa.whatsapp.href.replace(/\D/g, '');
}

/** `https://wa.me/<numero-elisa>?text=<messaggio codificato>` — mai il numero generale dell'agenzia. */
export function buildElisaWhatsAppUrl(message: string = ELISA_MESSAGE): string {
  return `https://wa.me/${getElisaWhatsAppDigits()}?text=${encodeURIComponent(message)}`;
}
