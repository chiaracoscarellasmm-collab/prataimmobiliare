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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // La pagina USAF Housing è diventata "Locazioni Americani" — redirect
      // permanente per non rompere eventuali link o segnalibri esistenti.
      { source: '/locazioni-base-usaf', destination: '/locazioni-americani', permanent: true },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 80, 82, 85, 90],
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
