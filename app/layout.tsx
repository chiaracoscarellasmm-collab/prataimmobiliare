import type { Metadata, Viewport } from 'next';
import { Archivo, Plus_Jakarta_Sans } from 'next/font/google';

import './globals.css';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import WhatsAppButton from '@/components/site/WhatsAppButton';
import RevealEngine from '@/components/site/RevealEngine';
import { LanguageProvider } from '@/components/i18n/LanguageProvider';
import { site } from '@/data/site';
import { getI18n } from '@/lib/i18n';

/**
 * One variable grotesque covers display, UI and — via the width axis — the
 * condensed numerals used for surfaces, prices and dates. The brand serif
 * lives only in the logo artwork.
 */
const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-archivo',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    metadataBase: new URL(site.url),
    title: {
      default: t.meta.homeTitle,
      template: t.meta.titleTemplate,
    },
    description: t.meta.description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_GB' : 'it_IT',
      siteName: site.name,
      title: t.meta.homeTitle,
      description: t.meta.description,
      url: '/',
      images: [{ url: '/images/home/hero.jpg', width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.name,
      description: t.meta.description,
    },
    robots: { index: true, follow: true },
    icons: {
      icon: [{ url: '/brand/icon.png', type: 'image/png' }],
      apple: [{ url: '/brand/icon.png' }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#100E0C',
  colorScheme: 'dark',
};

/**
 * Adds `js` to <html> before first paint so reveal states never flash:
 * without JS the content is simply visible, which is the accessible default.
 */
const jsFlag = `document.documentElement.classList.add('js')`;

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getI18n();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable}`}
      /* The inline script below adds `js` before hydration — expected mismatch. */
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>
        <LanguageProvider locale={locale} dictionary={t}>
          <a className="skip-link" href="#main">
            {t.meta.skip}
          </a>
          <Header />
          <main id="main">{children}</main>
        </LanguageProvider>
        <Footer />
        <WhatsAppButton />
        <RevealEngine />
      </body>
    </html>
  );
}
