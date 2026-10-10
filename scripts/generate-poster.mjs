/**
 * Generate public/hero-poster.webp (<100KB) — radial deep-blue field
 * with soft fiber-like arcs. Pure Sharp, no external assets.
 */
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "public", "hero-poster.webp");
mkdirSync(dirname(out), { recursive: true });

const W = 1200;
const H = 800;

// Base gradient (SVG) + grain arcs, then WebP encode tuned for <100KB.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g" cx="68%" cy="30%" r="90%">
      <stop offset="0%" stop-color="#1B3A5F"/>
      <stop offset="45%" stop-color="#12294A"/>
      <stop offset="100%" stop-color="#0A1628"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g fill="none" stroke="#2E8CFF" stroke-width="2.5" opacity="0.5">
    <ellipse cx="760" cy="380" rx="300" ry="130"/>
    <ellipse cx="760" cy="380" rx="240" ry="100"/>
    <ellipse cx="760" cy="380" rx="180" ry="76"/>
    <ellipse cx="760" cy="380" rx="120" ry="52"/>
    <ellipse cx="420" cy="480" rx="220" ry="90" opacity="0.6"/>
    <ellipse cx="420" cy="480" rx="150" ry="62" opacity="0.6"/>
  </g>
  <g fill="#7AB3FF" opacity="0.75">
    <circle cx="620" cy="330" r="3"/><circle cx="700" cy="300" r="2.4"/>
    <circle cx="790" cy="330" r="3"/><circle cx="860" cy="400" r="2.2"/>
    <circle cx="540" cy="420" r="2.6"/><circle cx="470" cy="360" r="2"/>
    <circle cx="830" cy="470" r="2.8"/><circle cx="680" cy="450" r="2"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .resize(W, H)
  .webp({ quality: 72, effort: 6 })
  .toFile(out);

const kb = statSync(out).size / 1024;
console.log(`poster: ${out} (${kb.toFixed(1)}KB)`);
if (statSync(out).size >= 100 * 1024) {
  console.error("FAIL: poster >= 100KB");
  process.exit(1);
}
