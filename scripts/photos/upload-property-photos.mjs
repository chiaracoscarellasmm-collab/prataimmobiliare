#!/usr/bin/env node
/**
 * Carica su Cloudflare R2 la galleria di un immobile già preparata da
 * prepare-property-photos.mjs (cartella locale di soli file NN.webp).
 *
 *   node --env-file=.env.local scripts/photos/upload-property-photos.mjs <cartella-locale> <slug> --dry-run
 *   node --env-file=.env.local scripts/photos/upload-property-photos.mjs <cartella-locale> <slug>
 *
 * Carica ogni NN.webp su `immobili/<slug>/NN.webp` con PutObjectCommand.
 * Nessun'altra operazione di scrittura esiste in questo file: niente
 * DeleteObjectCommand, niente sovrascrittura implicita di un bucket diverso
 * da quello in R2_BUCKET_NAME.
 *
 * Se sul bucket esistono già oggetti sotto `immobili/<slug>/`, lo script si
 * ferma e li elenca invece di sovrascriverli: serve `--force` per procedere
 * consapevolmente (comunque solo overwrite dei file con lo stesso nome, mai
 * delete di quelli che restano nel prefisso ma non hanno un corrispettivo
 * locale).
 *
 * --dry-run: stampa esattamente cosa verrebbe caricato (percorso locale →
 * chiave R2, dimensione) senza eseguire nessuna PutObjectCommand.
 */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const [localDirArg, slugArg] = args;

function line() {
  console.log('─'.repeat(60));
}

function kb(bytes) {
  return Math.round(bytes / 1024);
}

async function main() {
  console.log(`CARICAMENTO FOTO SU R2${DRY_RUN ? ' — DRY RUN (nessuna scrittura)' : ''}`);
  line();

  if (!localDirArg || !slugArg) {
    console.log('Uso: node scripts/photos/upload-property-photos.mjs <cartella-locale> <slug> [--dry-run] [--force]');
    process.exitCode = 1;
    return;
  }

  const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
  const missingVars = required.filter((name) => !process.env[name]);
  if (missingVars.length > 0) {
    console.log(`✕ Mancano in .env.local: ${missingVars.join(', ')}.`);
    process.exitCode = 1;
    return;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  const localDir = path.resolve(localDirArg);
  const slug = slugArg;
  const prefix = `immobili/${slug}/`;

  let entries;
  try {
    entries = await readdir(localDir, { withFileTypes: true });
  } catch {
    console.log(`✕ Cartella locale non trovata: ${localDir}`);
    process.exitCode = 1;
    return;
  }

  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => /^\d+\.webp$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    console.log(`✕ Nessun file NN.webp trovato in ${localDir}.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Bucket:   ${bucket}`);
  console.log(`Prefisso: ${prefix}`);
  console.log(`Sorgente: ${localDir}`);
  line();

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  // Verifica cosa esiste già sotto questo prefisso prima di scrivere.
  let existingKeys = [];
  try {
    let ContinuationToken;
    do {
      const res = await client.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken })
      );
      existingKeys.push(...(res.Contents ?? []).map((o) => o.Key));
      ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (ContinuationToken);
  } catch (err) {
    console.log('✕ Connessione a R2 fallita:', err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
    return;
  }

  console.log(`✓ Connessione a R2 riuscita (${existingKeys.length} oggetti già presenti sotto questo prefisso)`);

  if (existingKeys.length > 0 && !FORCE) {
    console.log(`\n✕ Esistono già oggetti su R2 sotto "${prefix}":`);
    existingKeys.forEach((k) => console.log(`  ${k}`));
    console.log('\nNon sovrascrivo automaticamente. Rilancia con --force se vuoi procedere comunque');
    console.log('(sovrascrive solo i file con lo stesso nome, non cancella quelli in più presenti su R2).');
    process.exitCode = 1;
    return;
  }

  const manifest = [];
  for (const name of files) {
    const localPath = path.join(localDir, name);
    const { size } = await stat(localPath);
    manifest.push({ localPath, key: `${prefix}${name}`, size });
  }

  console.log(`\n${manifest.length} file da caricare:\n`);
  manifest.forEach((m) => console.log(`  ${m.localPath} → ${m.key}  (${kb(m.size)} KB)`));
  line();

  if (DRY_RUN) {
    console.log('Dry run: nessun file è stato caricato su R2.');
    return;
  }

  let uploaded = 0;
  let totalBytes = 0;
  for (const m of manifest) {
    const { readFile } = await import('node:fs/promises');
    const body = await readFile(m.localPath);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: m.key,
        Body: body,
        ContentType: 'image/webp',
      })
    );
    uploaded += 1;
    totalBytes += m.size;
    console.log(`✓ ${m.key}`);
  }

  line();
  console.log(`Caricati ${uploaded}/${manifest.length} file, ${kb(totalBytes)} KB totali su bucket "${bucket}".`);
}

main();
