/**
 * capture-poster.mjs (dev-only, never ships to the client).
 * Renders the real 2D Hopf hero frame at a fixed viewport via Playwright
 * Chromium, screenshots the canvas per theme, and Sharp-compresses to
 * hero-poster-dark.webp + hero-poster-light.webp.
 *
 * Usage: npm run build && npm run preview -- --port 4321 & node scripts/capture-poster.mjs
 *
 * Composition truth mirrors src/lib/hopf-2d.ts:
 * FIBER_COUNT=36, FIBER_SEGMENTS=150 (2D canvas has no camera constants).
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const URL = process.env.CAPTURE_URL || "http://127.0.0.1:4321/";

const targets = [
  { theme: "dark", out: join(here, "..", "public", "hero-poster-dark.webp") },
  { theme: "light", out: join(here, "..", "public", "hero-poster-light.webp") },
];

const browser = await chromium.launch();
try {
  for (const { theme, out } of targets) {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: 1,
    });
    // Seed the stored theme before first paint so readTheme() picks it up.
    await page.addInitScript((t) => {
      try {
        localStorage.setItem("lamnda-theme", t);
      } catch {}
    }, theme);
    await page.goto(URL, { waitUntil: "networkidle" });
    // Wait for the 2D canvas to hydrate and paint its first frame.
    // Falls back to the themed poster if canvas is disabled (flag off).
    const canvas = page.locator("[data-hopf-canvas]");
    const poster = page.locator("[data-hopf-poster]");
    try {
      await page.waitForSelector("[data-hopf-canvas]:not([hidden])", { timeout: 30000 });
    } catch {
      await poster.waitFor({ state: "visible", timeout: 30000 });
    }
    await page.waitForTimeout(1500);
    const target = (await canvas.isVisible().catch(() => false)) ? canvas : poster;
    await target.screenshot({ path: join(here, "..", `.capture-raw-${theme}.png`) });
    let quality = 70;
    let buf = await sharp(join(here, "..", `.capture-raw-${theme}.png`))
      .resize(1600, 1000, { fit: "cover" })
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (buf.length >= 100 * 1024) {
      quality = 60;
      buf = await sharp(join(here, "..", `.capture-raw-${theme}.png`))
        .resize(1600, 1000, { fit: "cover" })
        .webp({ quality, effort: 6 })
        .toBuffer();
    }
    const { writeFileSync } = await import("node:fs");
    writeFileSync(out, buf);
    const kb = statSync(out).size / 1024;
    console.log(`captured poster (${theme}): ${out} (${kb.toFixed(1)}KB, q${quality})`);
    if (statSync(out).size >= 100 * 1024) {
      console.error(`FAIL: captured ${theme} poster >= 100KB`);
      process.exit(1);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
