#!/usr/bin/env node
/**
 * Test di connessione Google Sheets — SOLA LETTURA.
 *
 * Autentica il Service Account, apre lo spreadsheet, trova il foglio
 * "Immobili", legge l'intestazione e conta le righe. Non scrive, non
 * aggiunge, non modifica, non cancella nulla.
 *
 *   npm run sheets:test
 */
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function line() {
  console.log('─'.repeat(24));
}

async function main() {
  console.log('GOOGLE SHEETS CONNECTION');
  line();

  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    console.log('\n✕ Manca GOOGLE_SHEETS_SPREADSHEET_ID. Inseriscilo in .env.local e rilancia npm run sheets:test.');
    process.exitCode = 1;
    return;
  }

  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFile) {
    console.log('\n✕ Manca GOOGLE_APPLICATION_CREDENTIALS. Inseriscilo in .env.local e rilancia npm run sheets:test.');
    process.exitCode = 1;
    return;
  }

  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Immobili';

  try {
    const auth = new GoogleAuth({ keyFile, scopes: SCOPES });
    const authClient = await auth.getClient();
    console.log('✓ Service Account authenticated');

    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    console.log('✓ Spreadsheet found');

    const tab = meta.data.sheets?.find((s) => s.properties?.title === sheetName);
    if (!tab) {
      const found = (meta.data.sheets ?? []).map((s) => s.properties?.title).filter(Boolean);
      throw new Error(
        `Foglio "${sheetName}" non trovato. Fogli presenti: ${found.join(', ') || '(nessuno)'}`
      );
    }
    console.log(`✓ Sheet "${sheetName}" found`);

    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });
    const headers = headerRes.data.values?.[0] ?? [];
    console.log(`✓ ${headers.length} columns detected`);

    const allRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });
    const totalRows = allRes.data.values?.length ?? 0;
    const propertyRows = Math.max(totalRows - 1, 0); // meno l'intestazione
    console.log(`✓ ${propertyRows} property rows detected`);

    console.log('\nHeader trovati:');
    headers.forEach((h, i) => console.log(`  ${i + 1}. ${h}`));
  } catch (err) {
    // Il messaggio dell'errore Google API non contiene mai la chiave privata,
    // ma non stampiamo comunque l'oggetto errore grezzo per prudenza.
    console.log('\n✕ Connessione fallita:', err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

main();
