import { describe, expect, it } from "vitest";
import { statSync } from "node:fs";
import sharp from "sharp";

/** Beauty poster gate: 1600x1000 WebP <100KB resembling the 2D scene, per theme. */
describe("hero poster budget", () => {
  for (const [theme, path] of [
    ["dark", "public/hero-poster-dark.webp"],
    ["light", "public/hero-poster-light.webp"],
  ] as const) {
    it(`${theme} poster exists and stays under 100KB`, () => {
      const size = statSync(path).size;
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(100 * 1024);
    });

    it(`${theme} poster is a dense 1600x1000 beauty shot (not sparse)`, async () => {
      const meta = await sharp(path).metadata();
      expect(meta.width).toBe(1600);
      expect(meta.height).toBe(1000);
      expect(meta.format).toBe("webp");
      // A dense fiber shot compresses well above the old sparse floor (~9.7KB).
      const size = statSync(path).size;
      expect(size).toBeGreaterThan(15 * 1024);
    });
  }
});
