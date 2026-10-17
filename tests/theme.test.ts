import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Relative luminance per WCAG 2.1. */
function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

describe("theme AA pairs", () => {
  it("dark pair #7AB3FF on #0A1628 passes AA (>= 4.5:1)", () => {
    expect(contrast("#7AB3FF", "#0A1628")).toBeGreaterThanOrEqual(4.5);
  });

  it("light pair #0A54C2 on white passes AA (>= 4.5:1)", () => {
    expect(contrast("#0A54C2", "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("tokens.css locks the AA pairs", () => {
    const css = readFileSync(join(__dirname, "../src/styles/tokens.css"), "utf8");
    expect(css).toContain("#7ab3ff");
    expect(css).toContain("#0A54C2");
    expect(css).toContain("#0A1628");
  });
});

describe("CTA button inverse pairs (verify remediation: dark white-on-#7AB3FF was 2.16:1 FAIL)", () => {
  it("dark CTA pair #0A1628 on #7AB3FF passes AA (>= 4.5:1)", () => {
    expect(contrast("#0A1628", "#7AB3FF")).toBeGreaterThanOrEqual(4.5);
  });

  it("light CTA pair white on #0A54C2 passes AA (>= 4.5:1)", () => {
    expect(contrast("#FFFFFF", "#0A54C2")).toBeGreaterThanOrEqual(4.5);
  });

  it("dark CTA styles use #0A1628 text (not white) on --primary-text", () => {
    const index = readFileSync(join(__dirname, "../src/pages/index.astro"), "utf8");
    const header = readFileSync(join(__dirname, "../src/components/Header.astro"), "utf8");
    const base = readFileSync(join(__dirname, "../src/layouts/Base.astro"), "utf8");
    // Filled pills (hero CTA in index, Base CTA) keep dark #0a1628 text.
    for (const [name, src] of [["index.astro", index], ["Base.astro", base]] as const) {
      expect(src, `${name} must set dark CTA text to #0a1628`).toContain("#0a1628");
    }
    // v4 header CTA is an outline pill: transparent bg, primary-text border/text (AA both themes).
    expect(header, "Header.astro must use a transparent outline CTA").toContain("transparent");
    expect(header, "Header.astro CTA must border with --primary-text").toContain("1px solid var(--primary-text)");
    expect(header, "Header.astro CTA must set text to --primary-text").toContain("color: var(--primary-text)");
    // Light theme keeps white CTA text (6.86:1 on #0A54C2 passes).
    for (const [name, src] of [["index.astro", index], ["Header.astro", header], ["Base.astro", base]] as const) {
      expect(src, `${name} must keep light CTA override`).toContain('html[data-theme="light"]');
    }
  });
});

describe("EN headline exception", () => {
  const EN = "Complex problems. Elegant solutions.";

  it("index pins the exact EN headline", () => {
    const index = readFileSync(join(__dirname, "../src/pages/index.astro"), "utf8");
    expect(index).toContain(EN);
  });

  it("index carries the do-not-translate marker", () => {
    const index = readFileSync(join(__dirname, "../src/pages/index.astro"), "utf8");
    expect(index).toContain("EN exception: do not translate");
  });
});
