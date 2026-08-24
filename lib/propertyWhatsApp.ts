import type { Locale } from '@/data/i18n';
import { contact } from '@/data/site';

/** Numero generale dell'agenzia, mai quello dedicato a Elisa/Locazioni Americani. */
function getAgencyWhatsAppDigits(): string {
  return contact.whatsapp.href.replace(/\D/g, '');
}

const messageByLocale: Record<Locale, (title: string, url: string) => string> = {
  it: (title, url) => `Buongiorno, vorrei avere maggiori informazioni su questo immobile: ${title} — ${url}`,
  en: (title, url) => `Hello, I would like more information about this property: ${title} — ${url}`,
};

/** `https://wa.me/<numero-agenzia>?text=<messaggio con titolo e link dell'immobile>`. */
export function buildPropertyWhatsAppUrl(title: string, url: string, locale: Locale): string {
  const message = messageByLocale[locale](title, url);
  return `https://wa.me/${getAgencyWhatsAppDigits()}?text=${encodeURIComponent(message)}`;
}
