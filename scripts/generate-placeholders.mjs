/**
 * Generates placeholder photography.
 *
 * These are procedural stand-ins, not stock: a warm sky gradient, building
 * masses with cast shadows and window grids, atmospheric haze, film grain and
 * a vignette. They read as architectural photography at a glance, which is
 * what the layouts need in order to be judged, while staying obviously
 * replaceable — drop a real .jpg at the same path and nothing else changes.
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const OUT = join(process.cwd(), 'public', 'images');

const rng = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
const clamp = (v, lo = 0, hi = 255) => (v < lo ? lo : v > hi ? hi : v);

/* Warm, desaturated grounds — stone, plaster, timber, dusk. */
const MOODS = {
  day:   { skyTop: [176, 186, 194], skyLow: [226, 219, 206], sun: [255, 248, 232], mass: [214, 205, 191], shade: [120, 110, 99] },
  warm:  { skyTop: [150, 152, 152], skyLow: [230, 214, 190], sun: [255, 238, 206], mass: [206, 190, 168], shade: [104, 92, 79] },
  dusk:  { skyTop: [58, 60, 66],    skyLow: [148, 121, 92],  sun: [242, 200, 148], mass: [86, 75, 65],   shade: [32, 28, 24] },
  night: { skyTop: [26, 27, 30],    skyLow: [62, 56, 50],    sun: [226, 188, 138], mass: [46, 41, 36],   shade: [18, 16, 14] },
  pale:  { skyTop: [206, 208, 208], skyLow: [242, 237, 228], sun: [255, 252, 244], mass: [228, 220, 207], shade: [148, 138, 126] },
};

/* ------------------------------------------------------------------ scenes */

/** Sky, ground plane, a few masses with windows — an exterior. */
function exterior(w, h, r, m, buf) {
  const horizon = h * (0.62 + r() * 0.1);
  const sunX = w * (0.2 + r() * 0.6);
  const sunY = horizon * (0.25 + r() * 0.4);

  for (let y = 0; y < h; y++) {
    const t = Math.min(1, y / horizon);
    for (let x = 0; x < w; x++) {
      let c;
      if (y < horizon) {
        c = mix(m.skyTop, m.skyLow, Math.pow(t, 0.75));
        // Soft light source bloom.
        const d = Math.hypot((x - sunX) / w, (y - sunY) / h);
        const glow = Math.max(0, 1 - d * 2.6) ** 2.2;
        c = mix(c, m.sun, glow * 0.55);
      } else {
        const g = (y - horizon) / (h - horizon);
        c = mix(mix(m.mass, m.shade, 0.35), m.shade, g * 0.6);
      }
      const i = (y * w + x) * 3;
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
    }
  }

  // Building masses, near to far.
  const blocks = 3 + Math.floor(r() * 3);
  for (let b = 0; b < blocks; b++) {
    const depth = b / blocks;
    const bw = w * (0.14 + r() * 0.26);
    const bh = h * (0.16 + r() * 0.34) * (1 - depth * 0.3);
    const bx = w * (-0.05 + r() * 1.0);
    const by = horizon - bh;
    const face = mix(m.mass, m.skyLow, depth * 0.45);
    const side = mix(face, m.shade, 0.42);
    const sideW = bw * (0.12 + r() * 0.16);

    for (let y = Math.max(0, by | 0); y < Math.min(h, (by + bh) | 0); y++) {
      for (let x = Math.max(0, bx | 0); x < Math.min(w, (bx + bw) | 0); x++) {
        const local = (x - bx) / bw;
        const vy = (y - by) / bh;
        let c = local > 1 - sideW / bw ? side : face;
        c = mix(c, m.shade, vy * 0.18);
        const i = (y * w + x) * 3;
        buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
      }
    }

    // Openings.
    const cols = 3 + Math.floor(r() * 5);
    const rows = 2 + Math.floor(r() * 4);
    const pad = bw * 0.1;
    const ow = (bw - pad * 2) / cols * 0.58;
    const oh = (bh - pad * 2) / rows * 0.52;
    for (let cx = 0; cx < cols; cx++) {
      for (let cy = 0; cy < rows; cy++) {
        if (r() < 0.12) continue;
        const ox = bx + pad + ((bw - pad * 2) / cols) * cx;
        const oy = by + pad + ((bh - pad * 2) / rows) * cy;
        const lit = r() < 0.35;
        const glass = lit ? mix(m.sun, m.mass, 0.35) : mix(m.shade, m.skyTop, 0.3);
        for (let y = Math.max(0, oy | 0); y < Math.min(h, (oy + oh) | 0); y++) {
          for (let x = Math.max(0, ox | 0); x < Math.min(w, (ox + ow) | 0); x++) {
            const i = (y * w + x) * 3;
            const c = mix(glass, [buf[i], buf[i + 1], buf[i + 2]], 0.25);
            buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
          }
        }
      }
    }
  }
  return horizon;
}

/** A room: floor, back wall, a bright opening and the light it throws. */
function interior(w, h, r, m, buf) {
  const floorY = h * (0.68 + r() * 0.08);
  const wall = mix(m.mass, m.sun, 0.25);
  const floor = mix(m.mass, m.shade, 0.45);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = y < floorY
        ? mix(wall, m.shade, (1 - y / floorY) * 0.22 + Math.abs(x / w - 0.5) * 0.18)
        : mix(floor, m.shade, (y - floorY) / (h - floorY) * 0.4);
      const i = (y * w + x) * 3;
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
    }
  }

  const ox = w * (0.12 + r() * 0.36);
  const ow = w * (0.24 + r() * 0.22);
  const oy = h * (0.08 + r() * 0.08);
  const oh = floorY - oy - h * 0.04;

  for (let y = oy | 0; y < (oy + oh) | 0; y++) {
    for (let x = ox | 0; x < (ox + ow) | 0; x++) {
      const t = (y - oy) / oh;
      const c = mix(m.sun, m.skyLow, t * 0.7);
      const i = (y * w + x) * 3;
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
    }
  }

  // Light pooling on the floor, widening as it falls.
  for (let y = floorY | 0; y < h; y++) {
    const g = (y - floorY) / (h - floorY);
    const spread = ow * (0.5 + g * 1.1);
    const cx = ox + ow / 2;
    for (let x = Math.max(0, (cx - spread) | 0); x < Math.min(w, (cx + spread) | 0); x++) {
      const fall = 1 - Math.abs(x - cx) / spread;
      const i = (y * w + x) * 3;
      const c = mix([buf[i], buf[i + 1], buf[i + 2]], m.sun, fall * 0.3 * (1 - g * 0.8));
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
    }
  }
  return floorY;
}

/** Long horizon, low masses, layered haze — territory. */
function landscape(w, h, r, m, buf) {
  const horizon = h * (0.55 + r() * 0.12);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = y < horizon
        ? mix(m.skyTop, m.skyLow, Math.pow(y / horizon, 0.8))
        : mix(mix(m.mass, m.shade, 0.3), m.shade, (y - horizon) / (h - horizon) * 0.75);
      const i = (y * w + x) * 3;
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
    }
  }
  // Ridges receding into haze.
  for (let layer = 3; layer >= 1; layer--) {
    const t = layer / 4;
    const base = horizon - h * 0.02 * layer;
    const amp = h * 0.05 * layer;
    const freq = 0.6 + r() * 1.6;
    const phase = r() * 10;
    const col = mix(mix(m.mass, m.shade, 0.5), m.skyLow, t * 0.72);
    for (let x = 0; x < w; x++) {
      const n = Math.sin((x / w) * freq * 6.28 + phase) * 0.5
              + Math.sin((x / w) * freq * 13.1 + phase * 2) * 0.25;
      const top = base - amp * (0.5 + n);
      for (let y = Math.max(0, top | 0); y < horizon; y++) {
        const i = (y * w + x) * 3;
        buf[i] = col[0]; buf[i + 1] = col[1]; buf[i + 2] = col[2];
      }
    }
  }
  return horizon;
}

const SCENES = { exterior, interior, landscape };

/* ------------------------------------------------------------------ finish */

function finish(w, h, buf, r, m) {
  const cx = w / 2, cy = h / 2;
  const maxD = Math.hypot(cx, cy);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      // Vignette.
      const d = Math.hypot(x - cx, y - cy) / maxD;
      const vig = 1 - Math.pow(d, 2.1) * 0.34;
      // Film grain.
      const n = (r() - 0.5) * 11;
      buf[i] = clamp(buf[i] * vig + n);
      buf[i + 1] = clamp(buf[i + 1] * vig + n);
      buf[i + 2] = clamp(buf[i + 2] * vig + n);
    }
  }
}

async function build({ path, w, h, scene, mood, seed }) {
  const r = rng(seed);
  const m = MOODS[mood];
  const buf = new Uint8ClampedArray(w * h * 3);
  SCENES[scene](w, h, r, m, buf);
  finish(w, h, buf, r, m);

  const full = join(OUT, path);
  mkdirSync(dirname(full), { recursive: true });
  await sharp(Buffer.from(buf.buffer), { raw: { width: w, height: h, channels: 3 } })
    // A touch of blur keeps the geometry from reading as vector art.
    .blur(0.6)
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(full);
}

const ASSETS = [
  ['home/hero.jpg', 2400, 1400, 'exterior', 'dusk'],
  ['home/manifesto.jpg', 1200, 1560, 'interior', 'warm'],
  ['home/valutazione.jpg', 2000, 1330, 'interior', 'day'],
  ['home/territorio.jpg', 2400, 1350, 'landscape', 'warm'],
  ['home/usaf.jpg', 1200, 1500, 'exterior', 'day'],
  ['home/finale.jpg', 2400, 1400, 'exterior', 'night'],
  ['home/split.jpg', 1600, 1800, 'exterior', 'warm'],

  ['properties/casa-indipendente-prata-01.jpg', 1400, 1750, 'exterior', 'day'],
  ['properties/casa-indipendente-prata-02.jpg', 1600, 1100, 'interior', 'pale'],
  ['properties/casa-indipendente-prata-03.jpg', 1600, 1100, 'interior', 'warm'],
  ['properties/attico-pordenone-01.jpg', 1800, 1100, 'exterior', 'dusk'],
  ['properties/attico-pordenone-02.jpg', 1400, 1000, 'interior', 'day'],
  ['properties/attico-pordenone-03.jpg', 1200, 1500, 'exterior', 'warm'],
  ['properties/villa-collina-01.jpg', 1900, 1200, 'exterior', 'warm'],
  ['properties/villa-collina-02.jpg', 1300, 1000, 'interior', 'warm'],
  ['properties/villa-collina-03.jpg', 1300, 1000, 'exterior', 'day'],
  ['properties/appartamento-aviano-01.jpg', 1200, 1500, 'exterior', 'pale'],
  ['properties/appartamento-aviano-02.jpg', 1500, 1050, 'interior', 'day'],
  ['properties/rustico-pedemontana-01.jpg', 1700, 1150, 'exterior', 'dusk'],
  ['properties/rustico-pedemontana-02.jpg', 1300, 1500, 'exterior', 'warm'],
  ['properties/casa-schiera-fontanafredda-01.jpg', 1500, 1150, 'exterior', 'day'],
  ['properties/casa-schiera-fontanafredda-02.jpg', 1400, 1000, 'interior', 'pale'],
  ['properties/bifamiliare-porcia-01.jpg', 1600, 1200, 'exterior', 'warm'],
  ['properties/bifamiliare-porcia-02.jpg', 1300, 1000, 'interior', 'warm'],

  ['projects/residenze-a-hero.jpg', 2400, 1450, 'exterior', 'day'],
  ['projects/residenze-a-01.jpg', 1600, 1100, 'interior', 'warm'],
  ['projects/residenze-a-02.jpg', 1200, 1500, 'interior', 'pale'],
  ['projects/residenze-b-hero.jpg', 2400, 1450, 'exterior', 'dusk'],
  ['projects/residenze-b-01.jpg', 1600, 1100, 'exterior', 'warm'],
  ['projects/residenze-b-02.jpg', 1200, 1500, 'interior', 'day'],
  ['projects/residenze-c-hero.jpg', 2400, 1450, 'interior', 'warm'],
  ['projects/residenze-c-01.jpg', 1600, 1100, 'landscape', 'pale'],
  ['projects/residenze-c-02.jpg', 1200, 1500, 'exterior', 'dusk'],

  ['about/hero.jpg', 2400, 1400, 'exterior', 'warm'],
  ['about/studio.jpg', 1300, 1650, 'interior', 'day'],
  ['about/territorio.jpg', 2000, 1200, 'landscape', 'pale'],
  ['about/dettaglio.jpg', 1400, 1000, 'interior', 'day'],
  ['about/vendi-wide.jpg', 2400, 1030, 'interior', 'day'],

  ['usaf/hero.jpg', 2400, 1350, 'exterior', 'day'],
  ['usaf/owners.jpg', 1500, 1100, 'exterior', 'warm'],
  ['usaf/personnel.jpg', 1500, 1100, 'interior', 'pale'],

  ['placeholder.jpg', 1600, 1100, 'exterior', 'day'],
];

for (const [i, [path, w, h, scene, mood]] of ASSETS.entries()) {
  await build({ path, w, h, scene, mood, seed: 101 + i * 37 });
}

console.log(`Generated ${ASSETS.length} placeholder photographs in public/images`);
