/**
 * Client Google Sheets con capacità di scrittura, per gli script CLI
 * (import Idealista, futuri strumenti di gestione). Separato da
 * lib/googleSheets.ts — quel file resta la configurazione di sola lettura
 * già verificata e funzionante per l'app Next.js, non va toccata.
 *
 * Ogni funzione lavora sugli header REALI del foglio "Immobili": nessun
 * indice di colonna hardcoded, tutto passa da una mappa nome→indice letta
 * a runtime.
 */
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export const IDEALISTA_COLUMN = 'Fonte Idealista URL';

/** Campi editoriali: mai scritti da un import, né in modalità normale né con --force. */
export const EDITORIAL_FIELDS = [
  'Visibile',
  'Featured home',
  'Ordine home',
  'USAF',
  'Nuova realizzazione',
  'Nome progetto',
];

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} non configurato. Impostalo in .env.local.`);
  return value;
}

export function getSpreadsheetId() {
  return requiredEnv('GOOGLE_SHEETS_SPREADSHEET_ID');
}

export function getSheetName() {
  return process.env.GOOGLE_SHEETS_SHEET_NAME || 'Immobili';
}

let cachedClient = null;

export async function getSheetsClient() {
  if (cachedClient) return cachedClient;
  const keyFile = requiredEnv('GOOGLE_APPLICATION_CREDENTIALS');
  const auth = new GoogleAuth({ keyFile, scopes: SCOPES });
  cachedClient = google.sheets({ version: 'v4', auth: await auth.getClient() });
  return cachedClient;
}

let cachedSheetId = null;

/** ID numerico interno della tab (richiesto dalle batchUpdate request, diverso dallo spreadsheetId). */
export async function getNumericSheetId(sheets, spreadsheetId, sheetName) {
  if (cachedSheetId !== null) return cachedSheetId;
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const tab = (meta.data.sheets ?? []).find((s) => s.properties?.title === sheetName);
  if (!tab) throw new Error(`Foglio "${sheetName}" non trovato.`);
  cachedSheetId = tab.properties.sheetId;
  return cachedSheetId;
}

/** 1-based column index → lettera A1 (1→A, 26→Z, 27→AA…). */
export function columnLetter(index1Based) {
  let n = index1Based;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export async function getHeaderMap(sheets, spreadsheetId, sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });
  const headers = res.data.values?.[0] ?? [];
  const index = {};
  headers.forEach((h, i) => {
    index[h] = i;
  });
  return { headers, index };
}

/**
 * Aggiunge "Fonte Idealista URL" come ultima colonna solo se non esiste già.
 * Scrive una singola cella (l'header), non tocca nient'altro: non cambia
 * l'ordine delle colonne esistenti, non modifica altri header.
 */
export async function ensureIdealistaColumn(sheets, spreadsheetId, sheetName) {
  const { headers } = await getHeaderMap(sheets, spreadsheetId, sheetName);
  if (headers.includes(IDEALISTA_COLUMN)) {
    return { added: false, columnIndex: headers.indexOf(IDEALISTA_COLUMN), totalColumns: headers.length };
  }
  const newIndex = headers.length;
  const colLetter = columnLetter(newIndex + 1);

  // La griglia del foglio può avere esattamente 54 colonne fisiche (non solo
  // dati): prima di scrivere nella 55ª va allargata di una colonna.
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const tab = (meta.data.sheets ?? []).find((s) => s.properties?.title === sheetName);
  const gridColumns = tab?.properties?.gridProperties?.columnCount ?? 0;
  if (gridColumns <= newIndex) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            appendDimension: {
              sheetId: tab.properties.sheetId,
              dimension: 'COLUMNS',
              length: newIndex + 1 - gridColumns,
            },
          },
        ],
      },
    });
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!${colLetter}1`,
    valueInputOption: 'RAW',
    requestBody: { values: [[IDEALISTA_COLUMN]] },
  });
  return { added: true, columnIndex: newIndex, totalColumns: newIndex + 1 };
}

/** Legge tutte le righe dati (esclusa l'intestazione) con accesso per nome colonna. */
export async function getAllRecords(sheets, spreadsheetId, sheetName) {
  const { headers, index } = await getHeaderMap(sheets, spreadsheetId, sheetName);
  if (headers.length === 0) return { headers, index, records: [] };

  const lastCol = columnLetter(headers.length);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:${lastCol}`,
  });
  const rows = res.data.values ?? [];
  const records = rows.map((row, i) => ({
    rowNumber: i + 2, // riga 1 = header, i dati iniziano da riga 2
    values: row,
    get(name) {
      const idx = index[name];
      return idx === undefined ? '' : row[idx] ?? '';
    },
  }));
  return { headers, index, records };
}

export async function findPropertyById(sheets, spreadsheetId, sheetName, id) {
  const { records } = await getAllRecords(sheets, spreadsheetId, sheetName);
  return records.find((r) => r.get('ID') === id) ?? null;
}

export async function findPropertyBySlug(sheets, spreadsheetId, sheetName, slug) {
  const { records } = await getAllRecords(sheets, spreadsheetId, sheetName);
  return records.find((r) => r.get('Slug') === slug) ?? null;
}

export async function findPropertyByIdealistaUrl(sheets, spreadsheetId, sheetName, url) {
  const { records } = await getAllRecords(sheets, spreadsheetId, sheetName);
  return records.find((r) => r.get(IDEALISTA_COLUMN) === url) ?? null;
}

/** Stile standard di ogni riga immobile: sfondo bianco, testo scuro. Mai il marrone dell'header. */
const ROW_BACKGROUND = { red: 1, green: 1, blue: 1 };
const ROW_TEXT_COLOR = { red: 0, green: 0, blue: 0 };

/**
 * Forza sfondo bianco e testo nero su un intervallo di righe, senza toccare
 * numberFormat, bordi, data validation o i valori delle celle: il campo
 * `fields` della richiesta limita l'effetto a background+colore testo.
 */
export async function applyStandardRowStyle(sheets, spreadsheetId, sheetId, startRowIndex0, endRowIndex0, columnCount) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: startRowIndex0,
              endRowIndex: endRowIndex0,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: ROW_BACKGROUND,
                textFormat: { foregroundColor: ROW_TEXT_COLOR },
              },
            },
            fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat.foregroundColor',
          },
        },
      ],
    },
  });
}

/** Legge solo il numberFormat di ogni cella di una riga (niente altro: non il colore, non i bordi). */
async function getRowNumberFormats(sheets, spreadsheetId, sheetName, rowNumber, columnCount) {
  const lastCol = columnLetter(columnCount);
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: [`${sheetName}!A${rowNumber}:${lastCol}${rowNumber}`],
    fields: 'sheets.data.rowData.values.userEnteredFormat.numberFormat',
  });
  const values = res.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values ?? [];
  return values.map((v) => v.userEnteredFormat?.numberFormat ?? null);
}

/** Applica dei numberFormat già letti a una riga — solo quel campo, nient'altro. */
async function applyRowNumberFormats(sheets, spreadsheetId, sheetId, rowIndex0, numberFormats) {
  if (!numberFormats.some(Boolean)) return; // niente da copiare (es. riga sorgente senza formati particolari)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateCells: {
            rows: [{ values: numberFormats.map((nf) => (nf ? { userEnteredFormat: { numberFormat: nf } } : {})) }],
            fields: 'userEnteredFormat.numberFormat',
            range: {
              sheetId,
              startRowIndex: rowIndex0,
              endRowIndex: rowIndex0 + 1,
              startColumnIndex: 0,
              endColumnIndex: numberFormats.length,
            },
          },
        },
      ],
    },
  });
}

/**
 * Aggiunge una nuova riga in fondo al foglio (append atomico: una singola
 * chiamata values.append). Se esiste una riga precedente, ne copia SOLO
 * data validation (dropdown) e formati numerici/data — mai lo sfondo: ogni
 * riga immobile riceve sempre e comunque sfondo bianco e testo scuro,
 * indipendentemente da cosa avesse la riga precedente.
 */
export async function appendPropertyRow(sheets, spreadsheetId, sheetName, record) {
  const { headers } = await getHeaderMap(sheets, spreadsheetId, sheetName);
  const rowValues = headers.map((h) => (record[h] !== undefined ? record[h] : ''));

  const append = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [rowValues] },
  });

  const updatedRange = append.data.updates?.updatedRange ?? '';
  const match = updatedRange.match(/![A-Z]+(\d+):/);
  const newRowNumber = match ? Number(match[1]) : null;

  if (newRowNumber) {
    const sheetId = await getNumericSheetId(sheets, spreadsheetId, sheetName);
    const columnCount = headers.length;
    const rowIndex0 = newRowNumber - 1;

    if (newRowNumber > 2) {
      // C'è una riga precedente: copiamo solo dropdown e formati numerici/data.
      const sourceRowNumber = newRowNumber - 1;
      const source = {
        sheetId,
        startRowIndex: sourceRowNumber - 1,
        endRowIndex: sourceRowNumber,
        startColumnIndex: 0,
        endColumnIndex: columnCount,
      };
      const destination = {
        sheetId,
        startRowIndex: rowIndex0,
        endRowIndex: newRowNumber,
        startColumnIndex: 0,
        endColumnIndex: columnCount,
      };
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ copyPaste: { source, destination, pasteType: 'PASTE_DATA_VALIDATION' } }],
        },
      });

      const numberFormats = await getRowNumberFormats(sheets, spreadsheetId, sheetName, sourceRowNumber, columnCount);
      await applyRowNumberFormats(sheets, spreadsheetId, sheetId, rowIndex0, numberFormats);
    }

    // Sempre per ultimo, così vince su qualunque cosa sia stata copiata sopra.
    await applyStandardRowStyle(sheets, spreadsheetId, sheetId, rowIndex0, newRowNumber, columnCount);
  }

  return { rowNumber: newRowNumber };
}

/**
 * Aggiorna una riga esistente. Di default scrive solo le celle vuote/0 tra
 * quelle richieste; con `force: true` sovrascrive anche celle già compilate
 * — ma mai i campi editoriali, che restano sempre esclusi. Una singola
 * chiamata values.batchUpdate indipendentemente dal numero di celle.
 */
export async function updatePropertyRow(sheets, spreadsheetId, sheetName, rowNumber, updates, { force = false } = {}) {
  const { headers, index } = await getHeaderMap(sheets, spreadsheetId, sheetName);
  const lastCol = columnLetter(headers.length);
  const currentRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A${rowNumber}:${lastCol}${rowNumber}`,
  });
  const currentRow = currentRes.data.values?.[0] ?? [];

  const data = [];
  const written = [];
  const skippedEditorial = [];
  const skippedFilled = [];

  for (const [field, value] of Object.entries(updates)) {
    if (EDITORIAL_FIELDS.includes(field)) {
      skippedEditorial.push(field);
      continue;
    }
    const colIndex = index[field];
    if (colIndex === undefined) continue; // colonna non esistente nel foglio: ignorata silenziosamente

    const current = (currentRow[colIndex] ?? '').toString().trim();
    const isBlank = current === '' || current === '0';
    if (!isBlank && !force) {
      skippedFilled.push(field);
      continue;
    }

    data.push({ range: `${sheetName}!${columnLetter(colIndex + 1)}${rowNumber}`, values: [[value]] });
    written.push(field);
  }

  if (data.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: 'USER_ENTERED', data },
    });
  }

  return { written, skippedEditorial, skippedFilled };
}
