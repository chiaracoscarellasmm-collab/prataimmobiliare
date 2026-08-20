#!/usr/bin/env node
/**
 * Google Sheet → validazione → discovery immagini R2 → data/generated/properties.json
 *
 *   npm run sync:properties            sincronizza e scrive il dataset
 *   npm run sync:properties -- --dry-run   legge, valida, controlla R2, stampa il
 *                                           report — non tocca il dataset pubblicato
 *
 * Il dataset generato viene sovrascritto solo se l'intero sync è valido: un
 * errore in qualunque fase lascia intatto l'ultimo dataset buono.
 */
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { normalizeRow } from './sync/normalize.mjs';
import { createR2Client, discoverImages, r2ConfigFromEnv } from './sync/r2.mjs';
import { loadPropertiesSource } from './sync/sheet.mjs';
import { validateDataset, validateImages } from './sync/validate.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'generated', 'properties.json');

function line() {
  console.log('─'.repeat(48));
}

function toPublicProperty({ property }) {
  return property;
}

async function main() {
  console.log('PROPERTY SYNC');
  line();

  const { rows: rawRows, source } = await loadPropertiesSource();
  console.log(`✓ sorgente: ${source}`);

  const records = rawRows.map((row, i) => normalizeRow(row, i + 2)); // +2: intestazione + 1-based
  const { errors: structuralErrors, warnings, rows } = validateDataset(records);
  console.log(`✓ ${rows.length} righe lette`);

  const visibleRows = rows.filter((r) => r.property.visible);
  const hiddenRows = rows.length - visibleRows.length;
  console.log(`✓ ${visibleRows.length} visibili`);
  console.log(`✓ ${hiddenRows} nascosti`);

  let imageErrors = [];
  let totalImages = 0;
  const r2Config = r2ConfigFromEnv();

  if (r2Config) {
    const client = createR2Client(r2Config);
    for (const record of visibleRows) {
      const { property } = record;
      const { coverImage, images } = await discoverImages(
        client,
        r2Config,
        property.slug,
        property.title ?? property.slug
      );
      property.coverImage = coverImage;
      property.images = images;
      totalImages += images.length;
    }
    console.log(`✓ ${totalImages} immagini trovate su R2`);
    imageErrors = validateImages(visibleRows);
  } else {
    warnings.push(
      'R2 non configurato (mancano R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY/R2_BUCKET_NAME/R2_PUBLIC_BASE_URL): discovery immagini saltata.'
    );
  }

  const errors = [...structuralErrors, ...imageErrors];

  if (warnings.length) {
    console.log('\nWARNINGS');
    warnings.forEach((w) => console.log(`⚠ ${w}`));
  }

  if (errors.length) {
    console.log('\nERRORS');
    errors.forEach((e) => console.log(`✕ ${e}`));
    console.log(`\n✕ Sync non valido: ${errors.length} errori. Dataset pubblicato non modificato.`);
    process.exitCode = 1;
    return;
  }

  if (!r2Config && !DRY_RUN) {
    console.log(
      '\n✕ R2 non configurato: un sync reale non può scrivere un dataset senza immagini. Usa --dry-run per test strutturali, oppure configura .env.local.'
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\n✓ Sync valido: ${visibleRows.length} immobili pubblicabili.`);

  if (DRY_RUN) {
    console.log('— dry-run: dataset non scritto.');
    return;
  }

  const dataset = visibleRows
    .map(toPublicProperty)
    .sort((a, b) => (a.homeOrder ?? Infinity) - (b.homeOrder ?? Infinity));

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  const tmpPath = `${OUTPUT_PATH}.tmp`;
  await writeFile(tmpPath, JSON.stringify(dataset, null, 2) + '\n', 'utf-8');
  await rename(tmpPath, OUTPUT_PATH); // scrittura atomica: mai un file a metà
  console.log(`✓ scritto ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('\n✕ Sync interrotto:', err.message);
  process.exitCode = 1;
});
