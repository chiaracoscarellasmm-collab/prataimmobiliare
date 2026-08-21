#!/usr/bin/env node
/**
 * Ottimizzazione strutturale delle immagini in `public/`.
 *
 *   npm run images:optimize              genera i .webp ottimizzati
 *   npm run images:optimize -- --dry-run legge, calcola, stampa il report — non scrive nulla
 *   npm run images:optimize -- input.jpg elabora solo quel file (percorso relativo a public/ o assoluto)
 *
 * Per ogni immagine raster genera un `.webp` accanto all'originale, ridimensionato
 * al massimo utile per come viene realmente mostrata (vedi RULES sotto) e mai
 * ingrandito. L'originale non viene mai toccato: sostituire i riferimenti nel
 * codice resta una scelta deliberata, non un effetto collaterale di questo
 * script — vedi il README (sezione "Foto per il sito") per il workflow.
 *
 * Un file viene saltato se il suo `.webp` esiste già ed è più recente del
 * sorgente: rilanciare lo script non ricomprime (e quindi non degrada)
 * immagini già elaborate.
 */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const DRY_RUN = process.argv.includes('--dry-run');
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith('--'));

const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png']);

/**
 * Regole per categoria, verificate nell'ordine: la prima il cui `match` trova
 * il percorso (relativo a public/, sempre con `/`) vince. `skip: true` esclude
 * loghi e wordmark, che l'ottimizzatore lossy non deve toccare (sezione 13
 * del brief: niente compressione aggressiva sui marchi).
 */
const RULES = [
  { match: /^brand\//, skip: true },
  { match: /logo|wordmark|monogram/i, skip: true },
  // Planimetrie: linee e testo tecnico devono restare nitidi, qualità alta.
  { match: /images\/plans\//, maxWidth: 2000, quality: 92 },
  // Hero — above-the-fold, LCP: dimensione generosa, qualità alta ma non 100.
  { match: /hero/i, maxWidth: 2200, quality: 82 },
  // Editoriali grandi (about, home, usaf teaser).
  { match: /images\/(home|about|usaf)\//, maxWidth: 1800, quality: 80 },
  // Schede immobili/progetti/servizi: mostrate in griglia, mai a piena pagina.
  { match: /images\/(properties|projects|services)\//, maxWidth: 1200, quality: 76 },
];
const DEFAULT_RULE = { maxWidth: 1800, quality: 78 };

function ruleFor(relPath) {
  return RULES.find((r) => r.match.test(relPath)) ?? DEFAULT_RULE;
}

function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function fmtDelta(before, after) {
  const pct = before === 0 ? 0 : Math.round((1 - after / before) * 100);
  return `-${pct}%`;
}

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(full)));
    } else if (RASTER_EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function alreadyOptimized(srcPath, webpPath) {
  try {
    const [srcStat, webpStat] = await Promise.all([stat(srcPath), stat(webpPath)]);
    return webpStat.mtimeMs >= srcStat.mtimeMs;
  } catch {
    return false;
  }
}

async function processFile(srcPath) {
  const relPath = path.relative(PUBLIC_DIR, srcPath).split(path.sep).join('/');
  const rule = ruleFor(relPath);
  const webpPath = srcPath.replace(/\.[^.]+$/, '.webp');
  const name = path.basename(srcPath);

  if (rule.skip) {
    return { name, relPath, status: 'skipped', reason: 'logo/wordmark — invariato di proposito' };
  }

  if (await alreadyOptimized(srcPath, webpPath)) {
    return { name, relPath, status: 'skipped', reason: 'già ottimizzato' };
  }

  const before = (await stat(srcPath)).size;
  const image = sharp(srcPath);
  const metadata = await image.metadata();
  const targetWidth =
    metadata.width && metadata.width > rule.maxWidth ? rule.maxWidth : metadata.width;

  if (DRY_RUN) {
    return {
      name,
      relPath,
      status: 'would-write',
      before,
      targetWidth,
      quality: rule.quality,
    };
  }

  const pipeline =
    targetWidth && targetWidth !== metadata.width
      ? image.resize({ width: targetWidth, withoutEnlargement: true })
      : image;

  await pipeline.webp({ quality: rule.quality }).toFile(webpPath);
  const after = (await stat(webpPath)).size;

  return { name, relPath, status: 'written', before, after };
}

function line() {
  console.log('─'.repeat(48));
}

async function main() {
  console.log('IMAGE OPTIMIZATION');
  line();
  if (DRY_RUN) console.log('(dry-run: nessun file verrà scritto)\n');

  const targets = ONLY.length
    ? ONLY.map((p) => (path.isAbsolute(p) ? p : path.join(PUBLIC_DIR, p)))
    : await collectFiles(PUBLIC_DIR);

  const results = [];
  for (const file of targets) {
    results.push(await processFile(file));
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let writtenCount = 0;
  let wouldWriteCount = 0;
  let skippedCount = 0;

  for (const r of results) {
    if (r.status === 'written') {
      writtenCount += 1;
      totalBefore += r.before;
      totalAfter += r.after;
      console.log(`${r.name}\n  ${fmtKB(r.before)} → ${fmtKB(r.after)}  ${fmtDelta(r.before, r.after)}\n`);
    } else if (r.status === 'would-write') {
      wouldWriteCount += 1;
      console.log(`${r.name}\n  ${fmtKB(r.before)} → ~w${r.targetWidth}px @q${r.quality} (dry-run, non calcolato)\n`);
    } else {
      skippedCount += 1;
    }
  }

  line();
  console.log(
    DRY_RUN
      ? `Sarebbero elaborati: ${wouldWriteCount}  ·  saltati: ${skippedCount} (già ottimizzati o loghi)`
      : `File elaborati: ${writtenCount}  ·  saltati: ${skippedCount} (già ottimizzati o loghi)`
  );
  if (totalBefore > 0) {
    console.log(`TOTALE (solo file scritti)`);
    console.log(`${fmtKB(totalBefore)} → ${fmtKB(totalAfter)}`);
    console.log(`Risparmiati: ${fmtKB(totalBefore - totalAfter)} (${fmtDelta(totalBefore, totalAfter)})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
