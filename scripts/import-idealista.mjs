#!/usr/bin/env node
/**
 * Import di un annuncio Idealista nel Google Sheet "Immobili".
 *
 *   npm run import:idealista -- --url "..." --clipboard             workflow assistito macOS
 *   npm run import:idealista -- --url "..." --clipboard --dry-run   solo preview, non scrive
 *   npm run import:idealista -- --url "..." --paste testo.txt       da file salvato a mano
 *   npm run import:idealista -- --url "..." --force                sovrascrive campi già compilati
 *
 * Idealista blocca il fetch HTTP diretto (DataDome): non tentiamo di
 * aggirarlo. --clipboard apre il browser, l'umano seleziona e copia la
 * pagina, noi leggiamo gli appunti — nessuna richiesta automatica al sito.
 *
 * Non gestisce fotografie, non pubblica mai automaticamente (Visibile=NO su
 * ogni creazione), non sovrascrive campi editoriali né dati già compilati a
 * mano (a meno di --force, che comunque non tocca i campi editoriali), e non
 * scrive mai senza conferma esplicita "y".
 */
import { COLUMNS, SHEET_NAME } from './sync/columns.mjs';
import {
  appendPropertyRow,
  ensureIdealistaColumn,
  getAllRecords,
  getSheetsClient,
  getSpreadsheetId,
  findPropertyByIdealistaUrl,
  IDEALISTA_COLUMN,
  updatePropertyRow,
} from './sync/googleSheetsWrite.mjs';
import { confirmWrite } from './idealista/clipboard.mjs';
import { ClipboardInvalidError, IdealistaBlockedError, loadIdealistaProperty } from './idealista/loadIdealistaProperty.mjs';
import { NEW_PROPERTY_DEFAULTS, normalizeIdealistaListing } from './idealista/normalize.mjs';

function parseArgs(argv) {
  const args = { dryRun: false, force: false, clipboard: false, url: null, paste: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a === '--clipboard') args.clipboard = true;
    else if (a === '--url') args.url = argv[++i];
    else if (a === '--paste') args.paste = argv[++i];
  }
  return args;
}

function line() {
  console.log('─'.repeat(24));
}

const bool01 = (v) => (v === 'SI' ? 'SI' : '0');

function printPreview({ idealistaId, normalized, action, existing }) {
  const r = normalized.record;
  const isRent = r[COLUMNS.transaction] === 'Affitto';
  const priceLine = isRent ? r[COLUMNS.monthlyRent] : r[COLUMNS.price];

  console.log('IDEALISTA IMPORT PREVIEW');
  line();
  console.log();
  console.log(`Idealista ID: ${idealistaId}`);
  console.log(`Titolo: ${r[COLUMNS.title]}`);
  console.log(`Contratto: ${r[COLUMNS.transaction]}`);
  console.log(`Tipologia: ${r[COLUMNS.propertyType]}`);
  console.log(`Comune: ${r[COLUMNS.comune]}`);
  console.log(`Provincia: ${r[COLUMNS.provincia]}`);
  console.log(`Canone / Prezzo: ${priceLine}`);
  console.log(`Superficie: ${r[COLUMNS.surface]}`);
  console.log(`Camere: ${r[COLUMNS.bedrooms]}`);
  console.log(`Bagni: ${r[COLUMNS.bathrooms]}`);
  console.log(`Piano: ${r[COLUMNS.floor]}`);
  console.log(`Anno: ${r[COLUMNS.constructionYear]}`);
  console.log(`Classe energetica: ${r[COLUMNS.energyClass]}`);
  console.log(`IPE: ${r[COLUMNS.ipe]}`);
  console.log(`Garage: ${bool01(r[COLUMNS.garage])}${r[COLUMNS.garageType] !== '0' ? ` (${r[COLUMNS.garageType]})` : ''}`);
  console.log(`Posto auto: ${bool01(r[COLUMNS.parkingSpot])}`);
  console.log(`Giardino: ${bool01(r[COLUMNS.garden])}${r[COLUMNS.gardenSurface] !== '0' ? ` (${r[COLUMNS.gardenSurface]} m²)` : ''}`);
  console.log(`Terrazzo: ${bool01(r[COLUMNS.terrace])}${r[COLUMNS.terraceSurface] !== '0' ? ` (${r[COLUMNS.terraceSurface]} m²)` : ''}`);
  console.log(`Ascensore: ${bool01(r[COLUMNS.elevator])}`);
  console.log(`Cantina: ${bool01(r[COLUMNS.cellar])}`);
  console.log(`Climatizzazione: ${bool01(r[COLUMNS.airConditioning])}`);
  console.log(`Fotovoltaico: ${bool01(r[COLUMNS.photovoltaic])}`);
  console.log(`Riscaldamento: ${r[COLUMNS.heating]}`);

  if (normalized.warnings.length) {
    console.log();
    normalized.warnings.forEach((w) => console.log(w));
  }

  console.log('\nACTION:');
  if (action === 'update') {
    console.log(`UPDATE EXISTING PROPERTY (riga ${existing.rowNumber}, ID ${existing.get('ID')}, slug ${existing.get('Slug')})`);
  } else {
    console.log('CREATE NEW PROPERTY');
    console.log(`  ID: ${normalized.id}`);
    console.log(`  Slug: ${normalized.slug}`);
    console.log('  Visibile: NO (mai pubblicato automaticamente)');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.url) {
    console.log('✕ Manca --url. Esempio: npm run import:idealista -- --url "https://www.idealista.it/36324591" --clipboard');
    process.exitCode = 1;
    return;
  }

  let idealistaId;
  let raw;
  try {
    const loaded = await loadIdealistaProperty(args.url, { pasteFile: args.paste, clipboard: args.clipboard });
    idealistaId = loaded.idealistaId;
    raw = loaded.raw;
  } catch (err) {
    if (err instanceof ClipboardInvalidError) {
      console.log(`\n✕ ${err.message}`);
    } else if (err instanceof IdealistaBlockedError) {
      console.log('IDEALISTA IMPORT');
      line();
      console.log(`\n✕ ${err.message}`);
    } else {
      console.log('IDEALISTA IMPORT');
      line();
      console.log(`\n✕ ${err instanceof Error ? err.message : String(err)}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('✓ Listing loaded');

  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = getSpreadsheetId();
    const sheetName = SHEET_NAME;

    // La colonna si crea solo in scrittura reale: il dry-run resta di sola lettura, punto e basta.
    if (!args.dryRun) {
      const { added: columnAdded } = await ensureIdealistaColumn(sheets, spreadsheetId, sheetName);
      if (columnAdded) console.log('✓ Colonna "Fonte Idealista URL" aggiunta al foglio');
    }

    const { records } = await getAllRecords(sheets, spreadsheetId, sheetName);
    const existingSlugs = new Set(records.map((r) => r.get('Slug')).filter(Boolean));

    const normalized = normalizeIdealistaListing({ idealistaId, url: args.url, raw }, { existingSlugs });
    console.log('✓ Data normalized');

    const existing = await findPropertyByIdealistaUrl(sheets, spreadsheetId, sheetName, args.url);
    console.log('✓ Existing records checked');

    if (existing) {
      console.log('\nPROPERTY ALREADY EXISTS');
      console.log(`Row: ${existing.rowNumber}`);
      console.log(`ID: ${existing.get('ID')}`);
      console.log(`Slug: ${existing.get('Slug')}`);
    }

    const action = existing ? 'update' : 'create';

    printPreview({ idealistaId, normalized, action, existing });

    if (args.dryRun) {
      console.log('\nNo data has been written.');
      return;
    }

    const confirmed = await confirmWrite('\nScrivere questo immobile nel Google Sheet? (y/N) ');
    if (!confirmed) {
      console.log('\nAnnullato. Nessun dato è stato scritto.');
      return;
    }

    if (action === 'create') {
      const fullRecord = { ...normalized.record, ...NEW_PROPERTY_DEFAULTS };
      const { rowNumber } = await appendPropertyRow(sheets, spreadsheetId, sheetName, fullRecord);
      console.log('\n✓ Google Sheet updated');
      console.log('\nACTION: CREATED');
      console.log(`\nRow: ${rowNumber}`);
      console.log(`ID: ${normalized.id}`);
      console.log(`Slug: ${normalized.slug}`);
      console.log('Visibile: NO — controllo umano richiesto prima della pubblicazione.');
    } else {
      const { written, skippedFilled } = await updatePropertyRow(
        sheets,
        spreadsheetId,
        sheetName,
        existing.rowNumber,
        normalized.record,
        { force: args.force }
      );
      console.log('\n✓ Google Sheet updated');
      console.log('\nACTION: UPDATED');
      console.log('\nFields:');
      if (written.length) written.forEach((f) => console.log(`- ${f}`));
      else console.log('(nessun campo aggiornato: tutti già compilati — rilancia con --force per sovrascriverli)');
      if (skippedFilled.length) {
        console.log(`\nCampi già compilati, non toccati (usa --force per sovrascriverli): ${skippedFilled.join(', ')}`);
      }
    }
  } catch (err) {
    // Mai il dump grezzo dell'errore Gaxios: solo il messaggio, mai credenziali.
    console.log(`\n✕ Errore Google Sheets: ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.log(`\n✕ Errore inatteso: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
});
