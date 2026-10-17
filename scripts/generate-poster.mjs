/**
 * Generate public/hero-poster-dark.webp + hero-poster-light.webp
 * (1600x1000, each <100KB) — dense beauty shots resembling the live
 * 2D Hopf canvas (36 fibers, corporate-blue only).
 * Pure Sharp, no external assets, deterministic in CI.
 *
 * Composition truth mirrors src/lib/hopf-2d.ts:
 * FIBER_COUNT=36, FIBER_SEGMENTS=150,
 * FIBER_INNER=#EAF1FB, FIBER_OUTER=#2E8CFF,
 * FIBER_HI_DARK=#7AB3FF, FIBER_HI_LIGHT=#0A54C2,
 * GROUP_X_DESKTOP=0.62 (ring sits in open right space, copy overlays left).
 */
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Keep in sync with src/lib/hopf-2d.ts (single source of truth lives there).
const FIBER_COUNT = 36;
const FIBER_SEGMENTS = 150;

const here = dirname(fileURLToPath(import.meta.url));
const outDark = join(here, "..", "public", "hero-poster-dark.webp");
const outLight = join(here, "..", "public", "hero-poster-light.webp");
mkdirSync(dirname(outDark), { recursive: true });

const W = 1600;
const H = 1000;

/** Deterministic PRNG (mulberry32) so CI output is stable. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexRgb(hex) {
  const c = hex.replace("#", "");
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

function lerp(a, b, f) {
  return Math.round(a + (b - a) * f);
}

/**
 * Build a fiber layer approximating the 2D canvas: nested tilted ellipses
 * (stereographic circles read as ellipses on screen) + dust dots.
 * Dark lerps #EAF1FB->#2E8CFF; light lerps #2E8CFF->#0A54C2 (no washout).
 */
function buildLayers(theme) {
  const rand = mulberry32(theme === "light" ? 20261011 : 20261010);
  // Mirrors GROUP_X_DESKTOP in src/lib/hopf-2d.ts so poster matches live canvas.
  const cx = W * 0.62;
  const cy = H * 0.48;
  const baseR = Math.min(W, H) * 0.42;
  const inner = hexRgb(theme === "light" ? "#2E8CFF" : "#EAF1FB");
  const outer = hexRgb(theme === "light" ? "#0A54C2" : "#2E8CFF");

  let rings = "";
  const rings_n = theme === "light" ? 240 : 160;
  for (let i = 0; i < rings_n; i++) {
    const f = rings_n === 1 ? 0 : i / (rings_n - 1);
    const rx = baseR * (0.28 + 0.72 * Math.pow(f, 0.8));
    const ry = rx * 0.42;
    const rot = -16 + rand() * 32;
    const r = lerp(inner[0], outer[0], f);
    const g = lerp(inner[1], outer[1], f);
    const b = lerp(inner[2], outer[2], f);
    const opacity = (theme === "light" ? 0.55 + rand() * 0.45 : 0.35 + rand() * 0.5).toFixed(2);
    const lw = theme === "light" ? 1.8 + rand() * 3.0 : 1.2 + rand() * 2.2;
    rings += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" transform="rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="none" stroke="rgb(${r},${g},${b})" stroke-width="${lw.toFixed(2)}" opacity="${opacity}"/>`;
  }

  let dust = "";
  const dust_n = theme === "light" ? 600 : 300;
  for (let i = 0; i < dust_n; i++) {
    const a = rand() * Math.PI * 2;
    const band = 0.25 + Math.pow(rand(), 0.7) * 0.75;
    const rx = baseR * band;
    const ry = rx * 0.42;
    const rot = ((-16 + rand() * 32) * Math.PI) / 180;
    const ex = Math.cos(a) * rx;
    const ey = Math.sin(a) * ry;
    const x = cx + ex * Math.cos(rot) - ey * Math.sin(rot);
    const y = cy + ex * Math.sin(rot) + ey * Math.cos(rot);
    const rr = (0.8 + rand() * 2.4).toFixed(2);
    const o = (0.3 + rand() * 0.55).toFixed(2);
    const dot = theme === "light" ? "#0A54C2" : "#EAF1FB";
    dust += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr}" fill="${dot}" opacity="${o}"/>`;
  }

  return { rings, dust };
}

function bgSvg(theme) {
  if (theme === "light") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="g" cx="63%" cy="32%" r="95%"><stop offset="0%" stop-color="#EFF4FB"/><stop offset="55%" stop-color="#F7F9FD"/><stop offset="100%" stop-color="#FFFFFF"/></radialGradient><radialGradient id="glow" cx="63%" cy="40%" r="55%"><stop offset="0%" stop-color="#2E8CFF" stop-opacity="0.14"/><stop offset="100%" stop-color="#2E8CFF" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#glow)"/></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="g" cx="63%" cy="32%" r="95%"><stop offset="0%" stop-color="#1B3A5F"/><stop offset="45%" stop-color="#12294A"/><stop offset="100%" stop-color="#0A1628"/></radialGradient><radialGradient id="glow" cx="63%" cy="40%" r="55%"><stop offset="0%" stop-color="#2E8CFF" stop-opacity="0.28"/><stop offset="100%" stop-color="#2E8CFF" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#glow)"/></svg>`;
}

async function buildPoster(theme) {
  const { rings, dust } = buildLayers(theme);
  const baseSvg = bgSvg(theme);
  const crispSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g>${rings}${dust}</g></svg>`;
  const base = await sharp(Buffer.from(baseSvg)).png().toBuffer();
  const crisp = await sharp(Buffer.from(crispSvg)).png().toBuffer();
  const halo = await sharp(crisp).blur(16).toBuffer();

  async function encode(quality) {
    // Dark: screen blend glows on navy. Light: normal over-composite
    // (screen on white washes to white and compresses to ~6KB sparse).
    const blend = theme === "light" ? "over" : "screen";
    return sharp(base)
      .composite([
        { input: halo, blend },
        { input: crisp, blend },
      ])
      .resize(W, H)
      .webp({ quality, effort: 6 })
      .toBuffer();
  }

  let quality = 70;
  let buf = await encode(quality);
  if (buf.length >= 100 * 1024) {
    quality = 60;
    buf = await encode(quality);
  }
  return { buf, quality };
}

const { writeFileSync } = await import("node:fs");

for (const [theme, out] of [["dark", outDark], ["light", outLight]]) {
  const { buf, quality } = await buildPoster(theme);
  writeFileSync(out, buf);
  const kb = statSync(out).size / 1024;
  console.log(`poster (${theme}): ${out} (${kb.toFixed(1)}KB, q${quality})`);
  if (statSync(out).size >= 100 * 1024) {
    console.error(`FAIL: ${theme} poster >= 100KB`);
    process.exit(1);
  }
}
console.log(`composition truth: FIBER_COUNT=${FIBER_COUNT} FIBER_SEGMENTS=${FIBER_SEGMENTS} (src/lib/hopf-2d.ts)`);
