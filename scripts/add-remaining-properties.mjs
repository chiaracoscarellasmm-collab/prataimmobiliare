#!/usr/bin/env node
/**
 * Inserimento one-off delle 36 proprietà le cui foto sono già su R2 (batch
 * caricato dopo AT-593/NV-259/V-69). Stesso pattern di
 * add-photo-batch-properties.mjs: solo ID, Slug, Tipologia/Contratto dove
 * il codice lo conferma in modo inequivocabile, Visibile=NO su tutte.
 *
 * Tipologia scritta SOLO se è un valore ammesso dal menu a tendina reale
 * del foglio (Liste!D2:D11 — verificato via API, non assunto):
 *   Appartamento, Casa indipendente, Villa, Casa a schiera, Rustico,
 *   Terreno, Locale commerciale, Ufficio, Capannone, Altro.
 * Dove il codice utente non mappa in modo pulito su uno di questi valori
 * (Attico, Casa "generica", Casa bifamiliare, Casa in linea, Garage, e i
 * codici ancora senza legenda: AG, PV, VB, VS, NL) la Tipologia resta
 * vuota apposta — vedi il report finale dello script per l'elenco.
 */
import { COLUMNS } from './sync/columns.mjs';
import {
  appendPropertyRow,
  findPropertyById,
  findPropertyBySlug,
  getSheetsClient,
  getSpreadsheetId,
  getSheetName,
} from './sync/googleSheetsWrite.mjs';

const NEW_PROPERTY_DEFAULTS = {
  [COLUMNS.visible]: 'NO',
  [COLUMNS.featuredHome]: '0',
  [COLUMNS.homeOrder]: '0',
  [COLUMNS.usaf]: '0',
  [COLUMNS.newDevelopment]: '0',
  [COLUMNS.projectName]: '0',
};

// slug = codice in minuscolo, identico al prefisso già usato su R2
// (immobili/<slug>/) nel batch upload precedente.
function slugFor(code) {
  return code.toLowerCase();
}

// Tipologia/Contratto solo dove il codice la conferma senza ambiguità E il
// valore è tra quelli ammessi dal menu a tendina reale del foglio.
const TYPE_MAP = {
  A: { propertyType: 'Appartamento' },
  CS: { propertyType: 'Casa a schiera' },
  CSL: { propertyType: 'Casa a schiera', transaction: 'Affitto' },
  CL: { propertyType: 'Capannone', transaction: 'Affitto' },
  T: { propertyType: 'Terreno' },
  V: { propertyType: 'Villa' },
  // AA (Attico), C (Casa), CB (Casa bifamiliare), CC (Casa in linea) e
  // G (Garage) non hanno un corrispettivo esatto nel menu a tendina —
  // lasciati vuoti di proposito, vedi commento in testa al file.
};

const codes = [
  'A-123', 'A-351', 'A-353', 'A-354', 'A-355', 'A-356', 'A-357', 'A-399',
  'A-589', 'A-683', 'A-821', 'A-858',
  'AA-299', 'AG-595',
  'C-287', 'C-369', 'C-484', 'CC-491', 'CL-23', 'CSL-378', 'CSL-380',
  'G-125', 'G-147', 'G-316', 'G-325', 'G-326',
  'NL-108', 'NL-350', 'PV-495',
  'T-03', 'T-296', 'T-400', 'T-799', 'T-99',
  'V-283', 'VB-496', 'VS-499',
];

function prefixOf(code) {
  return code.split('-')[0];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetName = getSheetName();

  console.log(`INSERIMENTO RIGHE — foglio "${sheetName}"`);
  console.log('─'.repeat(70));

  const noType = [];

  for (const code of codes) {
    const slug = slugFor(code);
    const prefix = prefixOf(code);
    const typeInfo = TYPE_MAP[prefix] ?? {};
    if (!typeInfo.propertyType) noType.push(code);

    const byId = await findPropertyById(sheets, spreadsheetId, sheetName, code);
    const bySlug = await findPropertyBySlug(sheets, spreadsheetId, sheetName, slug);
    const existing = byId ?? bySlug;

    if (existing) {
      console.log(`○ ${code} — già presente (riga ${existing.rowNumber}), nessuna riga aggiunta.`);
      await sleep(1000);
      continue;
    }

    const record = {
      [COLUMNS.id]: code,
      [COLUMNS.slug]: slug,
      ...(typeInfo.propertyType ? { [COLUMNS.propertyType]: typeInfo.propertyType } : {}),
      ...(typeInfo.transaction ? { [COLUMNS.transaction]: typeInfo.transaction } : {}),
      ...NEW_PROPERTY_DEFAULTS,
    };

    const { rowNumber } = await appendPropertyRow(sheets, spreadsheetId, sheetName, record);
    const typeLabel = typeInfo.propertyType
      ? `${typeInfo.propertyType}${typeInfo.transaction ? ' / ' + typeInfo.transaction : ''}`
      : '(tipologia non assegnata)';
    console.log(`✓ ${code} → riga ${rowNumber} (Slug: ${slug}, ${typeLabel})`);

    // Il foglio ha un limite di richieste/minuto: una pausa tra le righe
    // evita di sforarlo (ogni riga fa diverse chiamate di lettura+scrittura).
    await sleep(4000);
  }

  console.log('─'.repeat(70));
  console.log(`Fatto. Tipologia lasciata vuota per: ${noType.join(', ')}`);
  console.log('Tutte con Visibile = NO: completa i dati mancanti nel foglio prima di pubblicare.');
}

main().catch((err) => {
  console.log(`\n✕ Errore: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
