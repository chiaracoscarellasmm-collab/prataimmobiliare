/**
 * Floor-plan placeholders: thin-line drawings on paper, in the brand greys.
 * Kept separate from the photographic placeholders because a plan is a
 * drawing, not a photograph — and the layouts treat it that way.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const OUT = join(process.cwd(), 'public', 'images', 'plans');
mkdirSync(OUT, { recursive: true });

const rng = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

function plan(w, h, seed) {
  const r = rng(seed);
  const m = Math.min(w, h) * 0.1;
  const iw = w - m * 2;
  const ih = h - m * 2;
  const stroke = '#3a352e';

  let s = `<rect x="${m}" y="${m}" width="${iw}" height="${ih}" fill="none" stroke="${stroke}" stroke-width="3"/>`;

  // Two dividing walls, then a few room subdivisions.
  const vx = m + iw * (0.34 + r() * 0.26);
  const hy = m + ih * (0.42 + r() * 0.2);
  s += `<line x1="${vx}" y1="${m}" x2="${vx}" y2="${m + ih}" stroke="${stroke}" stroke-width="3"/>`;
  s += `<line x1="${m}" y1="${hy}" x2="${vx}" y2="${hy}" stroke="${stroke}" stroke-width="3"/>`;
  s += `<line x1="${vx}" y1="${m + ih * 0.62}" x2="${m + iw}" y2="${m + ih * 0.62}" stroke="${stroke}" stroke-width="3"/>`;

  // Door swings.
  for (let i = 0; i < 3; i++) {
    const dx = m + iw * (0.15 + r() * 0.6);
    const dy = m + ih * (0.15 + r() * 0.6);
    const rad = Math.min(iw, ih) * 0.08;
    s += `<path d="M${dx} ${dy} L${dx + rad} ${dy} A${rad} ${rad} 0 0 1 ${dx} ${dy + rad}" fill="none" stroke="${stroke}" stroke-width="1.6" opacity="0.6"/>`;
  }

  // Dimension lines.
  s += `<line x1="${m}" y1="${m * 0.55}" x2="${m + iw}" y2="${m * 0.55}" stroke="${stroke}" stroke-width="1" opacity="0.45"/>`;
  s += `<line x1="${m * 0.55}" y1="${m}" x2="${m * 0.55}" y2="${m + ih}" stroke="${stroke}" stroke-width="1" opacity="0.45"/>`;

  // Fixture blocks.
  for (let i = 0; i < 4; i++) {
    const bx = m + iw * (0.08 + r() * 0.8);
    const by = m + ih * (0.08 + r() * 0.78);
    s += `<rect x="${bx}" y="${by}" width="${iw * 0.1}" height="${ih * 0.07}" fill="${stroke}" opacity="0.12"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect width="${w}" height="${h}" fill="#efe9dd"/>${s}</svg>`;
}

const PLANS = [
  ['floor-plan.jpg', 1600, 1100, 11],
  ['plan-a.jpg', 1600, 1100, 47],
  ['plan-b.jpg', 1600, 1100, 83],
];

for (const [name, w, h, seed] of PLANS) {
  await sharp(Buffer.from(plan(w, h, seed)))
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(join(OUT, name));
}

console.log(`Generated ${PLANS.length} floor-plan placeholders`);
