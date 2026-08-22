#!/usr/bin/env node
/**
 * Inserimento one-off di 3 immobili le cui foto sono già su R2
 * (attico-pordenone-at-593, negozio-in-vendita-nv-259, villa-v-69) ma di cui
 * non abbiamo ancora dati reali (prezzo, superficie, comune, descrizione...).
 * Scrive solo ciò che è certo: ID, Slug, Tipologia/Contratto dove il codice
 * lo conferma esplicitamente. Visibile=NO: restano fuori dal sito finché
 * qualcuno non completa i dati e li pubblica a mano.
 *
 * Stesso pattern di dedup/append di write-manual-property.mjs, ripetuto per
 * più righe: ogni riga è un append atomico a sé, non si tocca nulla se la
 * riga esiste già (per ID o Slug).
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

const records = [
  {
    [COLUMNS.id]: 'AT-593',
    [COLUMNS.slug]: 'attico-pordenone-at-593',
    // Tipologia/Contratto non nel legenda fornita — lasciati vuoti apposta.
  },
  {
    [COLUMNS.id]: 'NV-259',
    [COLUMNS.slug]: 'negozio-in-vendita-nv-259',
    [COLUMNS.propertyType]: 'Negozio',
    [COLUMNS.transaction]: 'Vendita',
  },
  {
    [COLUMNS.id]: 'V-69',
    [COLUMNS.slug]: 'villa-v-69',
    [COLUMNS.propertyType]: 'Villa',
    // Contratto (vendita/affitto) non specificato per "V" nella legenda.
  },
];

async function main() {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetName = getSheetName();

  console.log(`INSERIMENTO RIGHE — foglio "${sheetName}"`);
  console.log('─'.repeat(60));

  for (const record of records) {
    const id = record[COLUMNS.id];
    const slug = record[COLUMNS.slug];

    const byId = await findPropertyById(sheets, spreadsheetId, sheetName, id);
    const bySlug = await findPropertyBySlug(sheets, spreadsheetId, sheetName, slug);
    const existing = byId ?? bySlug;

    if (existing) {
      console.log(`○ ${id} — già presente (riga ${existing.rowNumber}), nessuna riga aggiunta.`);
      continue;
    }

    const fullRecord = { ...record, ...NEW_PROPERTY_DEFAULTS };
    const { rowNumber } = await appendPropertyRow(sheets, spreadsheetId, sheetName, fullRecord);
    console.log(`✓ ${id} → riga ${rowNumber} (Slug: ${slug}, Visibile: NO)`);
  }

  console.log('─'.repeat(60));
  console.log('Fatto. Righe minime: completa prezzo, superficie, comune, camere, descrizione');
  console.log('ecc. direttamente nel foglio prima di impostare Visibile = SI.');
}

main().catch((err) => {
  console.log(`\n✕ Errore: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
