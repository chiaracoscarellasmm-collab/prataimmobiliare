#!/usr/bin/env node
/**
 * Test di connessione Cloudflare R2 — SOLA LETTURA.
 *
 * Autentica con le credenziali R2, esegue ListObjectsV2 sul bucket e conta
 * gli oggetti presenti. Non carica, non crea, non cancella, non sovrascrive
 * nulla — un solo tipo di richiesta (List), mai Put/Delete.
 *
 *   npm run r2:test
 */
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

function line() {
  console.log('─'.repeat(24));
}

function missing(varsToCheck) {
  return varsToCheck.filter((name) => !process.env[name]);
}

async function main() {
  console.log('CLOUDFLARE R2 CONNECTION (sola lettura)');
  line();

  const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'];
  const missingVars = missing(required);
  if (missingVars.length > 0) {
    console.log(`\n✕ Mancano in .env.local: ${missingVars.join(', ')}.`);
    console.log('  Compilale e rilancia npm run r2:test.');
    process.exitCode = 1;
    return;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  // Le chiavi non vengono mai loggate — solo lunghezza, per confermare che
  // siano state lette senza rivelarne il contenuto.
  console.log(`Bucket:     ${bucket}`);
  console.log(`Account ID: ${accountId}`);
  console.log(`Access Key: ${'*'.repeat(Math.min(accessKeyId.length, 20))} (${accessKeyId.length} caratteri)`);
  console.log(`Secret Key: ${'*'.repeat(Math.min(secretAccessKey.length, 20))} (${secretAccessKey.length} caratteri)`);
  line();

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  try {
    let objectCount = 0;
    let ContinuationToken;
    let pages = 0;

    do {
      const res = await client.send(
        new ListObjectsV2Command({ Bucket: bucket, ContinuationToken })
      );
      objectCount += res.Contents?.length ?? 0;
      pages += 1;
      ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (ContinuationToken);

    console.log('✓ Autenticazione riuscita');
    console.log(`✓ Bucket "${bucket}" raggiungibile`);
    console.log(`✓ ${objectCount} oggetti trovati${pages > 1 ? ` (${pages} pagine)` : ''}`);
  } catch (err) {
    console.log('\n✕ Connessione fallita:', err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

main();
