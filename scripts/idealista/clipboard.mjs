/**
 * Workflow "manuale assistito" per macOS: apriamo noi il browser sull'URL,
 * l'umano seleziona/copia la pagina con le sue mani (nessuna richiesta HTTP
 * automatica verso Idealista, nessun bypass di DataDome), noi leggiamo gli
 * appunti con `pbpaste` una volta che l'utente conferma di aver copiato.
 */
import { spawn } from 'node:child_process';
import readline from 'node:readline';

export function openInBrowser(url) {
  return new Promise((resolve, reject) => {
    const child = spawn('open', [url], { stdio: 'ignore' });
    child.on('error', (err) =>
      reject(new Error(`Impossibile aprire il browser (comando "open" — solo macOS): ${err.message}`))
    );
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Il comando "open" è uscito con codice ${code}.`));
    });
  });
}

export function waitForEnter() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('', () => {
      rl.close();
      resolve();
    });
  });
}

export function readClipboard() {
  return new Promise((resolve, reject) => {
    const child = spawn('pbpaste', [], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d.toString('utf-8')));
    child.stderr.on('data', (d) => (err += d.toString('utf-8')));
    child.on('error', (e) => reject(new Error(`Impossibile leggere gli appunti (pbpaste — solo macOS): ${e.message}`)));
    child.on('exit', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(`pbpaste è uscito con codice ${code}: ${err}`));
    });
  });
}

/**
 * Indizi che il testo copiato sia davvero la pagina di un annuncio, non una
 * pagina vuota, un messaggio, o — caso reale osservato in test — un pezzo
 * di conversazione che per coincidenza nomina "giardino"/"garage"/ecc.
 * Per questo il controllo non si accontenta di poche parole chiave: pretende
 * più segnali insieme, un testo lungo quanto una vera pagina, e l'assenza di
 * indizi tipici di prosa/istruzioni (che una pagina Idealista non ha mai).
 */
const SIGNALS = [
  /€\s?[\d.,]+/,
  /\d+(?:[.,]\d+)?\s*m²/i,
  /\bmq\b/i,
  /\b\d+\s*(?:camere|locali|stanze)\b/i,
  /\bbagn[oi]\b/i,
  /\bclasse energetica\b/i,
  /\bascensore\b|\bgiardino\b|\bterrazzo\b|\bbalcone\b|\bgarage\b/i,
];

/**
 * Presenti in prosa/istruzioni, mai nel testo reale di una pagina Idealista.
 * "Prata Immobiliare" NON va qui: è il nome dell'agenzia, compare come
 * "Professionista" su ogni annuncio reale che importeremo — un anti-segnale
 * su quella frase avrebbe rifiutato ogni singolo import reale.
 */
const ANTI_SIGNALS = [
  /```/, // code fence
  /^\s*\d+\.\s+.+\n\s*\d+\.\s+/m, // lista numerata di istruzioni su più righe
  /\bnpm run\b/i,
];

export function looksLikeIdealistaListing(text) {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length < 1500) return false;
  if (ANTI_SIGNALS.some((re) => re.test(trimmed))) return false;

  const hits = SIGNALS.filter((re) => re.test(trimmed)).length;
  return hits >= 5;
}

export class ClipboardInvalidError extends Error {
  constructor() {
    super(
      'Il contenuto copiato non sembra un annuncio Idealista.\nTorna nel browser, premi CMD+A → CMD+C e riprova.'
    );
    this.name = 'ClipboardInvalidError';
  }
}

/** Prompt y/N, default N: solo "y" esplicito autorizza la scrittura. */
export function confirmWrite(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}
