/**
 * Recupero della pagina Idealista — SENZA aggirare protezioni anti-bot.
 *
 * Idealista usa DataDome: una richiesta HTTP diretta riceve una pagina di
 * challenge/CAPTCHA (HTTP 403), non l'annuncio. Non tentiamo headless
 * browser "stealth", proxy o soluzioni del CAPTCHA — sarebbe un bypass di
 * una protezione esplicita, fuori discussione a prescindere da chi lo chiede.
 *
 * Finché non c'è un accesso autorizzato (API ufficiale Idealista), l'unica
 * via legittima è: un umano apre l'annuncio nel proprio browser e ne
 * incolla il testo in un file, che questo modulo può leggere al posto del
 * fetch. Vedi loadIdealistaProperty({ pasteFile }).
 */
const BLOCK_SIGNATURES = ['captcha-delivery.com', 'Please enable JS', 'datadome', 'DataDome'];

export class IdealistaBlockedError extends Error {
  constructor(url, status) {
    super(
      `Idealista ha bloccato la richiesta automatica (HTTP ${status}) con una protezione anti-bot ` +
        `(DataDome). Non è possibile e non tento di aggirarla.\n` +
        `Per procedere: apri "${url}" nel tuo browser, copia il testo visibile della pagina in un file ` +
        `di testo, e rilancia con --paste <percorso-file>.`
    );
    this.name = 'IdealistaBlockedError';
    this.url = url;
    this.status = status;
  }
}

export async function fetchListingHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept-Language': 'it-IT,it;q=0.9',
    },
  });
  const text = await res.text();

  if (!res.ok || BLOCK_SIGNATURES.some((sig) => text.includes(sig))) {
    throw new IdealistaBlockedError(url, res.status);
  }

  return text;
}
