/**
 * Client server-side per Google Sheets via Service Account.
 *
 * Solo lettura per ora: nessuna funzione di scrittura/append è esposta.
 * Non importare questo modulo da componenti client — legge un percorso di
 * file (`GOOGLE_APPLICATION_CREDENTIALS`) e non deve mai finire nel bundle
 * del browser.
 */
import 'server-only';

import { GoogleAuth } from 'google-auth-library';
import { google, sheets_v4 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} non configurato. Impostalo in .env.local.`);
  return value;
}

export function getSpreadsheetId(): string {
  return requiredEnv('GOOGLE_SHEETS_SPREADSHEET_ID');
}

export function getSheetName(): string {
  return process.env.GOOGLE_SHEETS_SHEET_NAME || 'Immobili';
}

let client: sheets_v4.Sheets | null = null;

/** Autentica una sola volta per processo e riusa il client. */
export async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  if (client) return client;

  const keyFile = requiredEnv('GOOGLE_APPLICATION_CREDENTIALS');
  const auth = new GoogleAuth({ keyFile, scopes: SCOPES });

  client = google.sheets({ version: 'v4', auth: await auth.getClient() as never });
  return client;
}
