import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const IMAGE_RE = /\.(webp|jpe?g|png|avif)$/i;

export function r2ConfigFromEnv() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

export function createR2Client(config) {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

async function listObjects(client, bucket, prefix) {
  const keys = [];
  let ContinuationToken;
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken })
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key && obj.Key !== prefix && IMAGE_RE.test(obj.Key)) keys.push(obj.Key);
    }
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);

  // Natural sort: 01, 02, 10 — mai 1, 10, 2.
  return keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

async function probeDimensions(client, bucket, key) {
  const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const chunks = [];
  for await (const chunk of res.Body) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  const meta = await sharp(buffer).metadata();
  return { width: meta.width ?? 1600, height: meta.height ?? 1100 };
}

/**
 * Scopre le fotografie di un immobile sotto immobili/{slug}/ su R2.
 * La prima immagine in ordine naturale (tipicamente 01.webp) diventa
 * coverImage; tutte diventano la gallery.
 */
export async function discoverImages(client, config, slug, alt) {
  const prefix = `immobili/${slug}/`;
  const keys = await listObjects(client, config.bucket, prefix);

  const images = [];
  for (const key of keys) {
    const { width, height } = await probeDimensions(client, config.bucket, key);
    images.push({
      src: `${config.publicBaseUrl.replace(/\/$/, '')}/${key}`,
      alt,
      width,
      height,
    });
  }

  return { coverImage: images[0] ?? null, images };
}
