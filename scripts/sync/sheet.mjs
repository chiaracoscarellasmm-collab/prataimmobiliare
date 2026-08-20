import { readFile } from 'node:fs/promises';
import path from 'node:path';

import Papa from 'papaparse';

const FALLBACK_PATH = path.join(process.cwd(), 'data', 'immobili.csv');

/**
 * URL diretto se fornito, altrimenti costruito da ID + nome foglio (così il
 * link punta sempre e solo alla tab "Immobili", mai a Liste/Esempio/Istruzioni).
 */
function resolveSheetUrl() {
  if (process.env.GOOGLE_SHEET_CSV_URL) return process.env.GOOGLE_SHEET_CSV_URL;
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) return null;
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Immobili';
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

/**
 * Carica le righe grezze del foglio "Immobili". Sorgente: Google Sheet (URL
 * diretto o ID+nome) se configurato, altrimenti il CSV locale di fallback —
 * stesso parser, stessa business logic a valle, quale che sia la sorgente.
 */
export async function loadPropertiesSource() {
  const url = resolveSheetUrl();

  if (url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Sheet ha risposto ${res.status} ${res.statusText}`);
    }
    const csv = await res.text();
    return { rows: parseCsv(csv), source: url };
  }

  const csv = await readFile(FALLBACK_PATH, 'utf-8');
  return { rows: parseCsv(csv), source: `fallback locale: ${FALLBACK_PATH}` };
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
