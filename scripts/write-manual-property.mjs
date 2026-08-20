#!/usr/bin/env node
/**
 * Inserimento one-off di un immobile con dati già rivisti e confermati a
 * mano (non passa dal parser Idealista): controlla i duplicati su
 * ID/Slug/Fonte Idealista URL, poi scrive una riga sola in un'unica
 * operazione atomica. Nessuna fotografia, nessun altro foglio toccato.
 */
import { COLUMNS, SHEET_NAME } from './sync/columns.mjs';
import {
  appendPropertyRow,
  ensureIdealistaColumn,
  findPropertyById,
  findPropertyByIdealistaUrl,
  findPropertyBySlug,
  getSheetsClient,
  getSpreadsheetId,
  IDEALISTA_COLUMN,
} from './sync/googleSheetsWrite.mjs';

// Indirizzo esatto rimosso per regola privacy: niente via/civico in Indirizzo,
// Titolo o Slug. Comune/Zona restano gli unici dati di posizione pubblici.
const record = {
  [COLUMNS.id]: 'CSL-380',
  [COLUMNS.slug]: 'villetta-schiera-porcia',
  [COLUMNS.title]: 'Villetta a schiera in affitto a Porcia',
  [COLUMNS.status]: 'Disponibile',
  [COLUMNS.transaction]: 'Affitto',
  [COLUMNS.propertyType]: 'Casa a schiera',
  [COLUMNS.publicationDate]: '0',
  [COLUMNS.comune]: 'Porcia',
  [COLUMNS.provincia]: '0',
  [COLUMNS.zona]: '0',
  [COLUMNS.address]: '0',
  [COLUMNS.showAddress]: 'NO',
  [COLUMNS.price]: '0',
  [COLUMNS.priceOnRequest]: 'NO',
  [COLUMNS.monthlyRent]: '1600',
  [COLUMNS.monthlyCondoFees]: '0',
  [COLUMNS.surface]: '150',
  [COLUMNS.bedrooms]: '3',
  [COLUMNS.bathrooms]: '2',
  [COLUMNS.floor]: '3 livelli: piano rialzato, primo piano e piano seminterrato',
  [COLUMNS.buildingFloors]: '3',
  [COLUMNS.constructionYear]: '2026',
  [COLUMNS.energyClass]: 'A4',
  [COLUMNS.ipe]: '5.83',
  [COLUMNS.garage]: '0',
  [COLUMNS.garageType]: '0',
  [COLUMNS.parkingSpot]: 'SI',
  [COLUMNS.parkingSpotCovered]: 'SI',
  [COLUMNS.garden]: 'SI',
  [COLUMNS.gardenSurface]: '0',
  [COLUMNS.terrace]: 'SI',
  [COLUMNS.terraceSurface]: '0',
  [COLUMNS.balcony]: '0',
  [COLUMNS.porch]: '0',
  [COLUMNS.porchSurface]: '0',
  [COLUMNS.elevator]: '0',
  [COLUMNS.cellar]: 'SI',
  [COLUMNS.airConditioning]: 'SI',
  [COLUMNS.furnished]: '0', // conflitto descrizione/caratteristiche: "0", non indovinato
  [COLUMNS.photovoltaic]: 'SI',
  [COLUMNS.pool]: '0',
  [COLUMNS.heating]: 'Pompa di calore',
  [COLUMNS.otherFeatures]:
    'Ingresso indipendente|Loggia|Cucina abitabile|Ripostiglio|Doppio posto auto chiuso|Doppio parcheggio esterno|Finiture di pregio|Primo ingresso|Disponibilità immediata|Massimo 4 persone',
  [COLUMNS.shortDescription]:
    "Villetta a schiera di testa di nuova costruzione a Porcia, sviluppata su tre livelli, con giardino privato, tre camere, terrazzi, cantina e posti auto coperti.",
  [COLUMNS.description]:
    "AFFITTASI CASA SCHIERA DI TESTA NUOVA, PORCIA, PRIMO INGRESSO, CON GIARDINO. Inserita in un'elegante e tranquilla zona residenziale a Porcia, proponiamo in locazione una moderna casa a schiera di testa di nuova costruzione, anno 2026, inserita in un contesto esclusivo immerso nel verde e vicino alle caratteristiche risorgive della zona. L'immobile si presenta ideale come casa per dirigenti e profili corporate, per un massimo di 3 o 4 persone, richiedendo contratti a tempo indeterminato e referenze dimostrabili. La disposizione interna si sviluppa su 3 livelli collegati da scala fissa: al piano rialzato troviamo ingresso indipendente con loggia, ampio e luminoso soggiorno, disimpegno, wc, ripostiglio e cucina abitabile con ulteriore zona pranzo; al primo piano sono presenti 3 camere da letto, 2 bagni completi, disimpegno con ripostiglio e terrazzi; al piano seminterrato si trovano un doppio posto auto chiuso e una cantina, oltre a un doppio parcheggio esterno disponibile per ospiti o terza auto. Classe energetica A4, impianti tecnologici di nuova generazione, fotovoltaico, aria condizionata ad ogni livello, finiture di pregio e giardino privato. Disponibilità immediata. Canone richiesto: € 1.600 mensili oltre IVA al 10%.",
  [COLUMNS.videoUrl]: '0',
  [COLUMNS.metaTitle]: 'Villetta a schiera in affitto a Porcia | Prata Immobiliare',
  [COLUMNS.metaDescription]:
    'Villetta a schiera di nuova costruzione in affitto a Porcia: 150 m², 3 camere, giardino, terrazzi, cantina e posti auto coperti.',
  [IDEALISTA_COLUMN]: 'https://www.idealista.it/36324591',
};

const NEW_PROPERTY_DEFAULTS = {
  [COLUMNS.visible]: 'NO',
  [COLUMNS.featuredHome]: '0',
  [COLUMNS.homeOrder]: '0',
  [COLUMNS.usaf]: '0',
  [COLUMNS.newDevelopment]: '0',
  [COLUMNS.projectName]: '0',
};

function isMeaningful(v) {
  return v !== undefined && v !== null && v !== '' && v !== '0';
}

async function main() {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetName = SHEET_NAME;

  await ensureIdealistaColumn(sheets, spreadsheetId, sheetName);

  const byId = await findPropertyById(sheets, spreadsheetId, sheetName, record[COLUMNS.id]);
  const bySlug = await findPropertyBySlug(sheets, spreadsheetId, sheetName, record[COLUMNS.slug]);
  const byUrl = await findPropertyByIdealistaUrl(sheets, spreadsheetId, sheetName, record[IDEALISTA_COLUMN]);
  const existing = byId ?? bySlug ?? byUrl;

  if (existing) {
    console.log('PROPERTY ALREADY EXISTS — nessuna riga aggiunta.');
    console.log(`Row: ${existing.rowNumber}`);
    console.log(`ID: ${existing.get('ID')}`);
    console.log(`Slug: ${existing.get('Slug')}`);
    return;
  }

  const fullRecord = { ...record, ...NEW_PROPERTY_DEFAULTS };
  const { rowNumber } = await appendPropertyRow(sheets, spreadsheetId, sheetName, fullRecord);

  const filledCount = Object.values(fullRecord).filter(isMeaningful).length;

  console.log('✓ Riga scritta nel Google Sheet "Immobili"');
  console.log(`\nRow: ${rowNumber}`);
  console.log(`ID: ${fullRecord[COLUMNS.id]}`);
  console.log(`Slug: ${fullRecord[COLUMNS.slug]}`);
  console.log(`Titolo: ${fullRecord[COLUMNS.title]}`);
  console.log(`Campi valorizzati (diversi da 0/vuoto): ${filledCount} / ${Object.keys(fullRecord).length}`);
  console.log(`Visibile: ${fullRecord[COLUMNS.visible]}`);
}

main().catch((err) => {
  console.log(`\n✕ Errore: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
