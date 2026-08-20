/**
 * Estrazione euristica da testo (HTML grezzo o testo incollato a mano).
 *
 * Non abbiamo accesso a una pagina Idealista reale (bloccata da DataDome),
 * quindi questo parser lavora su TESTO VISIBILE — quello che un umano
 * incollerebbe copiando la pagina dal browser — non su selettori DOM
 * specifici che non possiamo verificare. È deliberatamente conservativo:
 * dove il testo è ambiguo, il campo resta assente piuttosto che indovinato.
 */

function stripHtml(text) {
  if (!/<[a-z][\s\S]*>/i.test(text)) return text; // non sembra HTML: lascialo com'è
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;/gi, ' ');
}

/**
 * Il footer di ogni pagina idealista.it è identico per qualsiasi annuncio:
 * link generici ("Appartamenti in condivisione", "Vendita di case e
 * appartamenti in Italia"…) che, se lasciati nel testo, inquinano il
 * rilevamento di tipologia/comune con parole che non riguardano affatto
 * QUESTO immobile. Tagliato via prima di qualunque estrazione.
 */
const FOOTER_MARKERS = [
  /Servizi di idealista/i,
  /Stai cercando un immobile\?/i,
  /Sei un professionista immobiliare\?/i,
  /Tutto su idealista/i,
];

function trimFooterBoilerplate(text) {
  let cut = text.length;
  for (const re of FOOTER_MARKERS) {
    const m = text.match(re);
    if (m && m.index < cut) cut = m.index;
  }
  return text.slice(0, cut).trim();
}

function cleanText(text) {
  const stripped = stripHtml(text)
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return trimFooterBoilerplate(stripped);
}

/**
 * Comuni dell'area operativa dell'agenzia (provincia di Pordenone): usati
 * solo per riconoscere un nome già noto nel testo, mai per inventarlo.
 * Se il testo cita un comune fuori da questa lista, resta semplicemente
 * assente — meglio "0" di un dato sbagliato.
 */
const KNOWN_COMUNI = [
  'Prata di Pordenone', 'Pordenone', 'Aviano', 'Fontanafredda', 'Porcia',
  'Brugnera', 'Polcenigo', 'Sacile', 'Pasiano di Pordenone', 'Azzano Decimo',
  'Cordenons', 'Roveredo in Piano', 'San Vito al Tagliamento', 'Maniago',
  'Zoppola', 'Budoia', 'Caneva', 'Fiume Veneto', 'Pravisdomini',
];

function findComune(text) {
  return KNOWN_COMUNI.find((c) => new RegExp(`\\b${c.replace(/\s+/g, '\\s+')}\\b`, 'i').test(text)) ?? null;
}

/**
 * L'ordine conta: "casa a schiera"/"villetta a schiera" deve vincere su
 * "villetta"/"casa indipendente" generici, altrimenti una vera villetta a
 * schiera viene classificata come casa indipendente (bug osservato su un
 * annuncio reale: "Villetta a schiera" catturato dal pattern generico).
 */
const TYPE_KEYWORDS = [
  ['Appartamento', /\bappartament[oi]\b/i],
  ['Casa a schiera', /\b(?:casa|villetta) a schiera\b|\bschiera\b/i],
  ['Casa indipendente', /\bcasa indipendente\b|\bvilletta\b/i],
  ['Villa', /\bvilla\b/i],
  ['Rustico', /\brustico\b|\bcasale\b/i],
  ['Terreno', /\bterreno\b/i],
  ['Locale commerciale', /\blocale commerciale\b/i],
  ['Ufficio', /\bufficio\b/i],
  ['Capannone', /\bcapannone\b/i],
];

const HEATING_KEYWORDS = [
  ['Pompa di calore', /\bpompa di calore\b/i],
  ['Centralizzato', /\bcentralizzat[oa]\b/i],
  ['Autonomo', /\briscaldamento autonomo\b|\bautonomo\b/i],
];

function firstMatch(text, pairs) {
  for (const [label, re] of pairs) {
    if (re.test(text)) return label;
  }
  return null;
}

function numberNear(text, ...regexes) {
  for (const re of regexes) {
    const m = text.match(re);
    if (m) {
      const n = Number(m[1].replace(/\./g, '').replace(',', '.'));
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

/** Cerca sia una menzione affermativa sia una negativa: usato per il conflict-check. */
function boolSignal(text, positiveRe, negativeRe) {
  const positive = positiveRe.test(text);
  const negative = negativeRe ? negativeRe.test(text) : false;
  return { positive, negative };
}

export function parseListingText(rawText, { sourceMode = 'paste' } = {}) {
  const text = cleanText(rawText);

  const title = (text.split('\n').find((l) => l.trim().length > 8) ?? '').trim() || null;

  const propertyType = firstMatch(text, TYPE_KEYWORDS);
  const comune = findComune(text);
  const provincia = comune ? 'PN' : null; // tutti i comuni noti sono in provincia di Pordenone

  const isRent = /\/\s*mese\b|\bin affitto\b|\baffitto\b/i.test(text) && !/\bin vendita\b/i.test(text);
  const transaction = isRent ? 'affitto' : 'vendita';

  const priceRaw = numberNear(
    text,
    /€\s?([\d.,]+)\s*\/\s*mese/i,
    /€\s?([\d.,]+)/,
    /([\d.,]+)\s?€/
  );
  const priceOnRequest = /prezzo su richiesta|trattativa riservata/i.test(text);

  const surface = numberNear(text, /(\d+(?:[.,]\d+)?)\s*m²/i, /(\d+(?:[.,]\d+)?)\s*mq\b/i);
  // "locali" (vani totali, es. "13 locali") NON è lo stesso dato di "camere"
  // (camere da letto, es. "3 camere da letto"): confonderli è un bug reale
  // osservato — non trattarli come sinonimi.
  const bedrooms = numberNear(text, /(\d+)\s*camere(?:\s+da letto)?\b/i);
  const bathrooms = numberNear(text, /(\d+)\s*bagn[oi]\b/i);
  const buildingFloors = numberNear(text, /(\d+)\s*piani(?:\s+edificio)?\b/i);
  const constructionYear = numberNear(text, /anno (?:di )?costruzione[:\s]*([12]\d{3})/i, /costruit[oa] nel ([12]\d{3})/i);

  const floorMatch = text.match(/\bpiano\s+(terra|rialzato|attico|primo|secondo|terzo|quarto|quinto|\d+)\b/i);
  const floor = floorMatch ? `Piano ${floorMatch[1]}`.replace(/^Piano terra$/i, 'Piano terra') : null;

  const energyClassMatch = text.match(/classe energetica[:\s]*([A-G][1-4]?)\b/i);
  const energyClass = energyClassMatch ? energyClassMatch[1].toUpperCase() : null;
  // La lettera di classe è spesso un'icona colorata che non sopravvive al
  // copia-incolla testuale: il valore IPE resta comunque leggibile tra
  // parentesi accanto a "classe energetica" ("(5,83 kWh/m² anno)").
  const ipe = numberNear(
    text,
    /ipe[:\s]*([\d.,]+)/i,
    /epgl,?\s*nren[:\s]*([\d.,]+)/i,
    /classe energetica[:\s]*\(([\d.,]+)\s*kwh/i
  );

  const heating = firstMatch(text, HEATING_KEYWORDS);

  const garageTypeMatch = text.match(/garage\s+(doppio|singolo)/i) ?? text.match(/box\s+(doppio|singolo)/i);
  const garage = /\bgarage\b|\bbox auto\b/i.test(text);
  const garageType = garageTypeMatch ? garageTypeMatch[1][0].toUpperCase() + garageTypeMatch[1].slice(1).toLowerCase() : null;

  const parkingSpot = /\bposto auto\b/i.test(text);
  const parkingSpotCovered = parkingSpot && /\bposto auto coperto\b/i.test(text);

  const gardenSurface = numberNear(text, /giardin[oi][^.\n]{0,20}?(\d+(?:[.,]\d+)?)\s*m²/i);
  const terraceSurface = numberNear(text, /terrazz[oi][^.\n]{0,20}?(\d+(?:[.,]\d+)?)\s*m²/i);
  const porchSurface = numberNear(text, /porticat[oi][^.\n]{0,20}?(\d+(?:[.,]\d+)?)\s*m²/i);

  const signals = {
    // Radice, non solo singolare: un annuncio reale ha usato "terrazzi" (plurale
    // in prosa) mentre solo l'elenco puntato aveva la forma singolare "Terrazzo".
    garden: boolSignal(text, /\bgiardin[oi]\b/i, /\bsenza giardino\b/i),
    terrace: boolSignal(text, /\bterrazz[oi]\b/i, /\bsenza terrazz/i),
    balcony: boolSignal(text, /\bbalcon[ei]\b/i, /\bsenza balcon/i),
    porch: boolSignal(text, /\bporticat[oi]\b/i, null),
    elevator: boolSignal(text, /\bascensor[ei]\b/i, /\bsenza ascensore\b|\bassenza di ascensore\b/i),
    cellar: boolSignal(text, /\bcantin[ae]\b/i, null),
    airConditioning: boolSignal(text, /\bclimatizzat[oa]\b|\baria condizionata\b/i, /\bsenza (?:aria condizionata|climatizzazione)\b/i),
    furnished: boolSignal(text, /\barredat[oa]\b/i, /\bnon arredat[oa]\b|\bda arredare\b|\bsenza mobili\b/i),
    photovoltaic: boolSignal(text, /\bfotovoltaic[oa]\b/i, null),
    pool: boolSignal(text, /\bpiscina\b/i, null),
  };

  const otherCandidates = [
    [/\bingresso indipendente\b/i, 'Ingresso indipendente'],
    [/\blavanderia\b/i, 'Lavanderia'],
    [/\bloggia\b/i, 'Loggia'],
    [/\bfiniture di pregio\b/i, 'Finiture di pregio'],
    [/\bdoppia esposizione\b/i, 'Doppia esposizione'],
    [/\bultimo piano\b/i, 'Ultimo piano'],
    [/\bdomotica\b/i, 'Domotica'],
    [/\bda ristrutturare\b/i, 'Da ristrutturare'],
  ];
  const otherFeatures = [...new Set(otherCandidates.filter(([re]) => re.test(text)).map(([, label]) => label))];

  return {
    sourceMode,
    title,
    propertyType,
    comune,
    provincia,
    transaction,
    price: transaction === 'vendita' ? priceRaw : null,
    monthlyRent: transaction === 'affitto' ? priceRaw : null,
    priceOnRequest,
    surface,
    bedrooms,
    bathrooms,
    floor,
    buildingFloors,
    constructionYear,
    energyClass,
    ipe,
    heating,
    garage,
    garageType,
    parkingSpot,
    parkingSpotCovered,
    gardenSurface,
    terraceSurface,
    porchSurface,
    signals,
    otherFeatures,
    fullText: text,
  };
}
