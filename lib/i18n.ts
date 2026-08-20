import { cache } from 'react';
import { cookies } from 'next/headers';

import { dictionaries, isLocale, LOCALE_COOKIE, type Dictionary, type Locale } from '@/data/i18n';

export type { Dictionary, Locale };
export { isLocale, LOCALE_COOKIE };

export const getLocale = cache(async (): Promise<Locale> => {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : 'it';
});

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export const getI18n = cache(async (): Promise<{ locale: Locale; t: Dictionary }> => {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
});
