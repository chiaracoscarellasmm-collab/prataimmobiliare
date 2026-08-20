#!/usr/bin/env node
/**
 * SOLO PER ANTEPRIMA LOCALE — non è il sync di produzione.
 *
 * Genera data/generated/properties.json dal CSV di fallback usando la stessa
 * normalizzazione del sync reale, ma con fotografie segnaposto (Picsum) al
 * posto della discovery R2 — utile per vedere il sito con dati realistici
 * prima di avere un bucket R2 configurato. Il prossimo `npm run
 * sync:properties` (con R2 configurato) sovrascrive questo file con quello
 * vero: nessuno stato "fixture" resta nel dataset pubblicato.
 *
 *   node scripts/dev-seed-fixture.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { normalizeRow } from './sync/normalize.mjs';
import { loadPropertiesSource } from './sync/sheet.mjs';
import { validateDataset } from './sync/validate.mjs';

const OUTPUT_PATH = path.join(process.cwd(), 'data', 'generated', 'properties.json');

// Stessi ID Picsum già vagliati in public/images/CREDITS.md (inquadrature europee/neutre).
const PICSUM_IDS = [946, 625, 307, 622, 444, 936, 290, 322, 308, 942, 945];

function placeholderImages(slug, count = 3) {
  const start = Math.abs(hash(slug)) % PICSUM_IDS.length;
  return Array.from({ length: count }, (_, i) => {
    const id = PICSUM_IDS[(start + i) % PICSUM_IDS.length];
    const [w, h] = i === 0 ? [1600, 1100] : [1400, 1000];
    return {
      src: `https://picsum.photos/id/${id}/${w}/${h}`,
      alt: `${slug} — fotografia segnaposto`,
      width: w,
      height: h,
    };
  });
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return h;
}

async function main() {
  const { rows: rawRows } = await loadPropertiesSource();
  const records = rawRows.map((row, i) => normalizeRow(row, i + 2));
  const { errors, rows } = validateDataset(records);

  if (errors.length) {
    console.error('✕ CSV non valido, correggi prima di generare la fixture:');
    errors.forEach((e) => console.error(`  ${e}`));
    process.exitCode = 1;
    return;
  }

  const visible = rows.filter((r) => r.property.visible);
  for (const { property } of visible) {
    const images = placeholderImages(property.slug);
    property.coverImage = images[0];
    property.images = images;
  }

  const dataset = visible
    .map((r) => r.property)
    .sort((a, b) => (a.homeOrder ?? Infinity) - (b.homeOrder ?? Infinity));

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(dataset, null, 2) + '\n', 'utf-8');
  console.log(`✓ fixture scritta: ${dataset.length} immobili con foto segnaposto in ${OUTPUT_PATH}`);
  console.log('  Ricorda: non è dataset reale. npm run sync:properties (con R2 configurato) lo sostituisce.');
}

main();
