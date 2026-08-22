#!/usr/bin/env node
/**
 * Prepara la galleria fotografica di un immobile per l'upload su R2 —
 * SOLA LETTURA sulla cartella sorgente, nessun upload, nessuna scrittura
 * fuori dalla cartella di output indicata.
 *
 *   node scripts/photos/prepare-property-photos.mjs <cartella-sorgente> <cartella-output>
 *
 * Legge JPG/JPEG/PNG/WebP dalla sorgente (ignora i file nascosti come
 * .DS_Store), li ordina in ordine naturale (1, 2, ... 10, non 1, 10, 2, ...),
 * stampa la corrispondenza nome-originale → NN.webp PRIMA di convertire, poi
 * per ciascuno: auto-orient da EXIF, resize solo se il lato maggiore supera
 * MAX_DIMENSION (mai crop, mai upscale, aspect ratio invariato), esporta in
 * WebP qualità 84. Non tocca luminosità/contrasto/saturazione/nitidezza, non
 * applica filtri. Gli originali non vengono mai scritti né cancellati.
 *
 * Se la cartella di output esiste già e contiene file, lo script si ferma
 * e chiede conferma esplicita (--force per sovrascrivere consapevolmente).
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 84;
const EXT_RE = /\.(jpe?g|png|webp)$/i;

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const FORCE = process.argv.includes('--force');
const [sourceDirArg, outputDirArg] = args;

function line() {
  console.log('─'.repeat(60));
}

function kb(bytes) {
  return Math.round(bytes / 1024);
}

/** Confronto "naturale": spezza il nome in blocchi di cifre/non-cifre così
    "2.jpg" ordina prima di "10.jpg" invece che dopo (ordine lessicografico
    puro darebbe 1, 10, 11, ..., 2, 20, ...). */
function naturalCompare(a, b) {
  const chunks = (s) => s.match(/\d+|\D+/g) ?? [];
  const ca = chunks(a);
  const cb = chunks(b);
  const len = Math.max(ca.length, cb.length);
  for (let i = 0; i < len; i += 1) {
    const x = ca[i] ?? '';
    const y = cb[i] ?? '';
    const bothNumeric = /^\d+$/.test(x) && /^\d+$/.test(y);
    if (bothNumeric) {
      const diff = Number(x) - Number(y);
      if (diff !== 0) return diff;
    } else if (x !== y) {
      return x < y ? -1 : 1;
    }
  }
  return 0;
}

async function main() {
  if (!sourceDirArg || !outputDirArg) {
    console.log('Uso: node scripts/photos/prepare-property-photos.mjs <cartella-sorgente> <cartella-output>');
    process.exitCode = 1;
    return;
  }

  const sourceDir = path.resolve(sourceDirArg);
  const outputDir = path.resolve(outputDirArg);

  console.log('PREPARAZIONE FOTO IMMOBILE (sola lettura sulla sorgente)');
  line();
  console.log(`Sorgente: ${sourceDir}`);
  console.log(`Output:   ${outputDir}`);
  line();

  let sourceEntries;
  try {
    sourceEntries = await readdir(sourceDir, { withFileTypes: true });
  } catch (err) {
    console.log(`\n✕ Cartella sorgente non trovata o non leggibile: ${sourceDir}`);
    process.exitCode = 1;
    return;
  }

  const files = sourceEntries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => !name.startsWith('.')) // .DS_Store e altri file nascosti
    .filter((name) => EXT_RE.test(name))
    .sort(naturalCompare);

  if (files.length === 0) {
    console.log('\n✕ Nessuna immagine JPG/JPEG/PNG/WebP trovata nella cartella sorgente.');
    process.exitCode = 1;
    return;
  }

  // Guardia anti-sovrascrittura: se la cartella di output esiste già e
  // contiene file, ci si ferma qui senza toccare nulla.
  let outputExists = false;
  try {
    const outEntries = await readdir(outputDir);
    outputExists = outEntries.length > 0;
  } catch {
    outputExists = false;
  }

  if (outputExists && !FORCE) {
    console.log(`✕ La cartella di output esiste già e contiene file:\n  ${outputDir}`);
    console.log('\nNon sovrascrivo automaticamente. Se vuoi rigenerarla, rilancia con --force');
    console.log('oppure svuota/rinomina la cartella e riprova.');
    process.exitCode = 1;
    return;
  }

  const digits = String(files.length).length < 2 ? 2 : String(files.length).length;
  const mapping = files.map((name, i) => ({
    original: name,
    output: `${String(i + 1).padStart(digits, '0')}.webp`,
  }));

  console.log(`${files.length} immagini trovate. Ordine e corrispondenza (verifica prima di procedere):\n`);
  mapping.forEach(({ original, output }) => {
    console.log(`  ${original} → ${output}`);
  });
  line();

  await mkdir(outputDir, { recursive: true });

  const results = [];
  for (const { original, output } of mapping) {
    const inputPath = path.join(sourceDir, original);
    const outputPath = path.join(outputDir, output);

    const originalStat = await stat(inputPath);
    const originalBytes = originalStat.size;

    const image = sharp(inputPath).rotate(); // auto-orient da EXIF, poi rimuove il tag
    const meta = await image.metadata();
    // .rotate() senza argomenti scambia width/height se l'EXIF indica una
    // rotazione di 90/270°: le dimensioni "vere" (post auto-orient) sono
    // quelle che servono per confrontare originale vs finale nel report.
    const swapped = meta.orientation && meta.orientation >= 5;
    const originalWidth = swapped ? meta.height : meta.width;
    const originalHeight = swapped ? meta.width : meta.height;

    await image
      // fit:'inside' + withoutEnlargement: riduce solo se il lato maggiore
      // supera MAX_DIMENSION, mantiene l'aspect ratio, non ingrandisce mai,
      // non ritaglia mai (nessun 'cover').
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    const finalMeta = await sharp(outputPath).metadata();
    const finalStat = await stat(outputPath);

    results.push({
      original,
      output,
      originalWidth,
      originalHeight,
      finalWidth: finalMeta.width,
      finalHeight: finalMeta.height,
      originalBytes,
      finalBytes: finalStat.size,
    });
  }

  // ---- report ----
  console.log('RISULTATO\n');
  console.log(`Immagini trovate:   ${files.length}`);
  console.log(`Immagini elaborate: ${results.length}`);
  line();

  let totalOriginal = 0;
  let totalFinal = 0;
  for (const r of results) {
    totalOriginal += r.originalBytes;
    totalFinal += r.finalBytes;
    const dimsChanged = r.originalWidth !== r.finalWidth || r.originalHeight !== r.finalHeight;
    const dims = dimsChanged
      ? `${r.originalWidth}×${r.originalHeight} → ${r.finalWidth}×${r.finalHeight}`
      : `${r.originalWidth}×${r.originalHeight} (invariata)`;
    const savedPct = r.originalBytes > 0 ? Math.round((1 - r.finalBytes / r.originalBytes) * 100) : 0;
    console.log(`${r.original} → ${r.output}`);
    console.log(`  dimensioni: ${dims}`);
    console.log(`  peso:       ${kb(r.originalBytes)} KB → ${kb(r.finalBytes)} KB  (-${savedPct}%)`);
  }

  line();
  const totalSavedPct = totalOriginal > 0 ? Math.round((1 - totalFinal / totalOriginal) * 100) : 0;
  console.log(`Peso totale originale: ${kb(totalOriginal)} KB`);
  console.log(`Peso totale finale:    ${kb(totalFinal)} KB`);
  console.log(`Risparmio totale:      -${totalSavedPct}%`);
  line();
  console.log(`Cartella finale: ${outputDir}`);
  console.log('\nGli originali non sono stati modificati né cancellati. Nessun upload effettuato.');
}

main();
