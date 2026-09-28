import { readFileSync } from 'node:fs';

// Le fotografie degli immobili vivono su R2, non nel repo: next/image deve
// avere l'host in whitelist esplicita. L'hostname reale si legge dall'env
// così non serve toccare questo file quando cambia il bucket o si passa a
// un dominio pubblico personalizzato.
const r2PublicHostname = (() => {
  try {
    return process.env.R2_PUBLIC_BASE_URL ? new URL(process.env.R2_PUBLIC_BASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

// Link del vecchio sito WordPress ancora indicizzati o salvati: le schede
// erano /project/<titolo>-<codice> (es. /project/villa-in-vendita-con-giardino-vs-499).
// Il codice finale coincide con quello degli slug attuali, quindi ogni scheda
// ancora pubblicata riceve il suo redirect; le altre finiscono sull'elenco.
// Ricalcolato a ogni build, quindi segue da solo la sync dal Google Sheet.
const legacyPropertyRedirects = (() => {
  try {
    const properties = JSON.parse(readFileSync(new URL('./data/generated/properties.json', import.meta.url), 'utf8'));
    return properties.flatMap(({ slug }) => {
      const code = slug.match(/[a-z]{1,3}-\d+$/)?.[0];
      return code
        ? [{ source: `/project/:old(.*-${code})/:rest*`, destination: `/immobili/${slug}`, permanent: true }]
        : [];
    });
  } catch {
    return [];
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // La pagina USAF Housing è diventata "Locazioni Americani" — redirect
      // permanente per non rompere eventuali link o segnalibri esistenti.
      { source: '/locazioni-base-usaf', destination: '/locazioni-americani', permanent: true },
      // Vecchio sito WordPress (vedi legacyPropertyRedirects sopra).
      ...legacyPropertyRedirects,
      ...[
        '/project/:path*',
        '/project_category/:path*',
        '/property_location/:path*',
        '/listing/:path*',
        '/listings-prata-immobiliare',
        '/case-in-affitto',
        '/confronta-immobili',
      ].map((source) => ({ source, destination: '/immobili', permanent: true })),
      ...['/our-story', '/about', '/about-us'].map((source) => ({ source, destination: '/chi-siamo', permanent: true })),
      // Non esiste una pagina contatti: recapiti e orari stanno nel footer.
      ...['/contatti', '/contact', '/p/contatti.html'].map((source) => ({ source, destination: '/#contatti', permanent: true })),
      { source: '/home', destination: '/', permanent: true },
    ];
  },
  images: {
    // Ottimizzazione Vercel disattivata: il piano Hobby include solo 5.000
    // trasformazioni/mese e ogni combinazione foto × larghezza ne consuma una
    // (con ~750 foto su R2 il limite si esaurisce subito). Le sorgenti sono
    // già WebP compresse e ridimensionate a monte (scripts/photos/prepare-
    // property-photos.mjs per R2, npm run images:optimize per public/), quindi
    // vengono servite così come sono. Per i marchi usare file già alla
    // dimensione di visualizzazione (es. brand/wordmark-*-480.webp).
    unoptimized: true,
    // WebP only: sorgenti già in WebP, l'AVIF aggiuntivo raddoppiava le
    // trasformazioni Vercel per un guadagno marginale.
    formats: ['image/webp'],
    // Solo i valori realmente usati nel codice (vedi grep "quality=" prima
    // di aggiungerne altri) — 70 e 90 non erano mai richiesti.
    qualities: [75, 80, 82, 85],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      ...(r2PublicHostname ? [{ protocol: 'https', hostname: r2PublicHostname }] : []),
      // Domini R2 pubblici tipici, così funziona anche prima di impostare un dominio personalizzato.
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      // Solo per l'anteprima locale con scripts/dev-seed-fixture.mjs.
      { protocol: 'https', hostname: 'picsum.photos' },
      // Thumbnail del video immobile (sezione video, click-to-load).
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
};

export default nextConfig;
