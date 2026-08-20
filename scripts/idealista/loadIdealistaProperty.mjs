import { readFile } from 'node:fs/promises';

import { extractIdealistaId, validateIdealistaUrl } from './idealistaId.mjs';
import { fetchListingHtml, IdealistaBlockedError } from './fetchListing.mjs';
import { parseListingText } from './parseListing.mjs';
import { ClipboardInvalidError, looksLikeIdealistaListing, openInBrowser, readClipboard, waitForEnter } from './clipboard.mjs';

function printManualImportInstructions() {
  console.log('IDEALISTA MANUAL IMPORT');
  console.log('─'.repeat(24));
  console.log("\nL'annuncio è stato aperto nel browser.\n");
  console.log('1. Attendi che la pagina sia caricata completamente');
  console.log('2. Premi CMD+A');
  console.log('3. Premi CMD+C');
  console.log('4. Torna qui');
  console.log('5. Premi INVIO\n');
  process.stdout.write('Waiting...');
}

/**
 * Unico punto di ingresso per acquisire un annuncio Idealista. Tre sorgenti
 * intercambiabili dietro la stessa interfaccia — nessuna business logic
 * duplicata a valle (stesso parseListingText, stesso normalizeIdealistaListing):
 *
 *   - clipboard: apre il browser (macOS `open`), aspetta INVIO, legge `pbpaste`
 *   - pasteFile: legge un file di testo salvato a mano
 *   - default: fetch diretto (bloccato da DataDome nella pratica)
 *
 * Il giorno in cui sarà disponibile l'API ufficiale, basta aggiungere una
 * quarta sorgente qui — Google Sheet, CLI e normalizzazione non cambiano.
 */
export async function loadIdealistaProperty(url, { pasteFile, clipboard } = {}) {
  validateIdealistaUrl(url);
  const idealistaId = extractIdealistaId(url);

  let rawText;
  let sourceMode;

  if (clipboard) {
    await openInBrowser(url);
    printManualImportInstructions();
    await waitForEnter();
    console.log();

    rawText = await readClipboard();
    if (!looksLikeIdealistaListing(rawText)) {
      throw new ClipboardInvalidError();
    }
    sourceMode = 'clipboard';
  } else if (pasteFile) {
    rawText = await readFile(pasteFile, 'utf-8');
    sourceMode = 'paste';
  } else {
    rawText = await fetchListingHtml(url); // lancia IdealistaBlockedError se bloccato
    sourceMode = 'fetch';
  }

  const raw = parseListingText(rawText, { sourceMode });
  return { idealistaId, url, sourceMode, raw };
}

export { ClipboardInvalidError, IdealistaBlockedError };
