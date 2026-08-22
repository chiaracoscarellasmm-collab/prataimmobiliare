import { readFile } from 'node:fs/promises';
import path from 'node:path';

import Papa from 'papaparse';

import { getAllRecords, getSheetName, getSheetsClient, getSpreadsheetId } from './googleSheetsWrite.mjs';

const FALLBACK_PATH = path.join(process.cwd(), 'data', 'immobili.csv');

/** Mai stampare l'ID per intero: solo i primi/ultimi caratteri, il resto mascherato. */
export function maskSpreadsheetId(id) {
  if (!id) return '(non impostato)';
  if (id.length <= 10) return '*'.repeat(id.length);
  return `${id.slice(0, 6)}${'*'.repeat(Math.min(id.length - 10, 24))}${id.slice(-4)}`;
}

/**
 * Carica le righe grezze del foglio "Immobili".
 *
 * Sorgente di default: lo stesso Google Sheet reale, letto con lo stesso
 * Service Account già usato per scriverlo (getSheetsClient/getAllRecords in
 * googleSheetsWrite.mjs) — nessuna seconda implementazione di autenticazione,
 * nessun export CSV pubblico, il foglio resta privato.
 *
 * Il CSV locale (data/immobili.csv) esiste solo per sviluppo/test e va
 * richiesto esplicitamente con `{ source: 'csv' }` — non è mai un fallback
 * automatico: se le credenziali Google mancano o la lettura fallisce, la
 * funzione lancia e il sync si ferma, invece di scivolare silenziosamente
 * su dati locali obsoleti.
 */
export async function loadPropertiesSource({ source } = {}) {
  if (source === 'csv') {
    const csv = await readFile(FALLBACK_PATH, 'utf-8');
    return { rows: parseCsv(csv), sourceType: 'csv', csvPath: FALLBACK_PATH };
  }

  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetName = getSheetName();

  const { headers, records } = await getAllRecords(sheets, spreadsheetId, sheetName);
  if (headers.length === 0) {
    throw new Error(
      `Foglio "${sheetName}" risulta vuoto o non trovato nello spreadsheet ${maskSpreadsheetId(spreadsheetId)}.`
    );
  }

  // Stessa forma (oggetto piatto header→valore) che parseCsv produce, così
  // normalizeRow a valle non deve sapere da dove arrivano le righe.
  const rows = records.map((record) => Object.fromEntries(headers.map((h) => [h, record.get(h)])));

  return { rows, sourceType: 'sheets-api', spreadsheetId, sheetName };
}

function parseCsv(csv) {
  const { data, errors } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  const fatal = errors.filter((e) => e.type !== 'FieldMismatch');
  if (fatal.length) {
    throw new Error(`Errore di parsing CSV: ${fatal[0].message} (riga ${fatal[0].row})`);
  }
  return data;
}
