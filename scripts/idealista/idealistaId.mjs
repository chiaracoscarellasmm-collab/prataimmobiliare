const URL_RE = /^https?:\/\/(?:www\.)?idealista\.[a-z.]{2,6}\//i;
const ID_RE = /idealista\.[a-z.]{2,6}\/(?:immobile\/)?(\d{6,})/i;

export function validateIdealistaUrl(url) {
  if (typeof url !== 'string' || !URL_RE.test(url)) {
    throw new Error(`URL non valido: "${url}". Atteso un link idealista.it (es. https://www.idealista.it/36324591).`);
  }
}

export function extractIdealistaId(url) {
  const match = url.match(ID_RE);
  if (!match) {
    throw new Error(`Impossibile estrarre l'ID annuncio dall'URL: "${url}".`);
  }
  return match[1];
}
