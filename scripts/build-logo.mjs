/**
 * Prepares web assets from the supplied brand PDF.
 *
 * The PDF carries a transparent page and two ink tones (the script P heavier,
 * the column lighter). We keep that hierarchy but flatten it to a single
 * colour: every pixel takes the target ink, and its opacity combines the
 * source alpha with how dark the original stroke was. The mark then sits
 * correctly on any ground, light or dark.
 *
 * Outputs, in `dark` (for light grounds) and `light` (for dark grounds):
 *   logo-*      full lockup
 *   wordmark-*  "Prata Immobiliare / real estate" only
 *   monogram-*  the P/I monogram only
 *   icon.png    square favicon source
 *
 * Rasterise first, then run:
 *   sips -s format png --resampleWidth 2800 public/images/logo.pdf --out /tmp/logo.png
 *   node scripts/build-logo.mjs /tmp/logo.png
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = process.argv[2];
if (!SRC) {
  console.error('usage: node scripts/build-logo.mjs <rasterised-png>');
  process.exit(1);
}

const OUT = join(process.cwd(), 'public', 'brand');
mkdirSync(OUT, { recursive: true });

const INKS = {
  dark: [0x2b, 0x28, 0x25],
  light: [0xf4, 0xef, 0xe6],
  /* Beige di brand: usato per la wordmark di chiusura nel footer. */
  sand: [0xb8, 0xa0, 0x87],
};

/* One decode; every crop below is taken from this buffer. */
const { data: src, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const SW = info.width;
const SH = info.height;

/** Bounding box of everything the page actually draws. */
function contentBox() {
  let minX = SW, minY = SH, maxX = -1, maxY = -1;
  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      if (src[(y * SW + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Re-ink a region at a flat colour, preserving the original tonal weight. */
function ink(box, [r, g, b]) {
  const out = Buffer.alloc(box.width * box.height * 4);
  let o = 0;
  for (let y = box.top; y < box.top + box.height; y++) {
    for (let x = box.left; x < box.left + box.width; x++) {
      const i = (y * SW + x) * 4;
      const lum = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) / 255;
      // Darker strokes stay strong; the lighter column reads as a soft second tone.
      const weight = Math.min(1, Math.pow(1 - lum, 0.7) * 1.4);
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = Math.round((src[i + 3] / 255) * weight * 255);
      o += 4;
    }
  }
  return sharp(out, { raw: { width: box.width, height: box.height, channels: 4 } }).png();
}

const box = contentBox();
console.log(`artwork ${box.width}×${box.height} at ${box.left},${box.top}`);

/* The monogram sits above the wordmark. Measured on the supplied artwork —
   adjust if the brand file is ever re-exported. */
const SPLIT = 0.56;
const splitY = Math.round(box.height * SPLIT);
const region = (top, height) => ({ left: box.left, top: box.top + top, width: box.width, height });

for (const [tone, rgb] of Object.entries(INKS)) {
  await ink(region(0, box.height), rgb)
    .resize({ width: 1200, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, `logo-${tone}.png`));

  await ink(region(0, splitY), rgb)
    .trim({ threshold: 1 })
    .resize({ height: 600, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, `monogram-${tone}.png`));

  await ink(region(splitY, box.height - splitY), rgb)
    .trim({ threshold: 1 })
    .resize({ width: 1200, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, `wordmark-${tone}.png`));
}

await ink(region(0, splitY), INKS.dark)
  .trim({ threshold: 1 })
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(join(OUT, 'icon.png'));

console.log('brand assets written to public/brand');

/* -------------------------------------------------------------------------
   Wordmark col solo nome (senza "real estate"), fornita come PNG su fondo
   bianco: qui l'alpha va ricavata dalla luminanza, non dal canale alpha.
   Sorgente: public/Logo_prataimmobiliare_soloscritta.png
   ------------------------------------------------------------------------- */
/* Si preferisce la versione con sfondo trasparente: la sua alpha è già
   corretta, quindi non va dedotta dalla luminanza. */
const NAME_SRC = [
  join(process.cwd(), 'public', 'logo_prataimmobiliare.png'),
  join(process.cwd(), 'public', 'Logo_prataimmobiliare_soloscritta.png'),
].find((candidate) => existsSync(candidate));

if (NAME_SRC) {
  const probe = await sharp(NAME_SRC).metadata();
  const hasAlpha = Boolean(probe.hasAlpha);

  const { data: nd, info: ni } = await sharp(NAME_SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const NW = ni.width;
  const NH = ni.height;
  const CH = ni.channels;

  /* Con alpha reale la copertura è quella; altrimenti la si deduce dal grigio. */
  const coverAt = (x, y) => {
    const i = (y * NW + x) * CH;
    if (hasAlpha) return nd[i + 3] / 255;
    const lum = (nd[i] * 0.299 + nd[i + 1] * 0.587 + nd[i + 2] * 0.114) / 255;
    return Math.min(1, Math.pow(1 - lum, 0.72) * 1.25);
  };

  /* Riquadro di tutto ciò che è più scuro della carta. */
  let minX = NW, minY = NH, maxX = -1, maxY = -1;
  for (let y = 0; y < NH; y++) {
    for (let x = 0; x < NW; x++) {
      if (coverAt(x, y) > 0.06) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const nbox = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  console.log(`nome ${nbox.width}×${nbox.height}`);

  for (const [tone, [r, g, b]] of Object.entries(INKS)) {
    const out = Buffer.alloc(nbox.width * nbox.height * 4);
    let o = 0;
    for (let y = nbox.top; y < nbox.top + nbox.height; y++) {
      for (let x = nbox.left; x < nbox.left + nbox.width; x++) {
        const alpha = coverAt(x, y);
        out[o] = r; out[o + 1] = g; out[o + 2] = b;
        out[o + 3] = Math.round(alpha * 255);
        o += 4;
      }
    }
    await sharp(out, { raw: { width: nbox.width, height: nbox.height, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(join(OUT, `name-${tone}.png`));
  }
  console.log('wordmark col solo nome scritta in public/brand');
}
