import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FIBER_COUNT,
  FIBER_SEGMENTS,
  SPIN_DT,
  SPIN_FREQS,
  CUR_LERP,
  PITCH_LERP,
  AUTO_DRIFT_RATE,
  AUTO_DRIFT_AMP,
  GROUP_X_DESKTOP,
  GROUP_X_MOBILE,
  FIBER_HI_DARK,
  FIBER_HI_LIGHT,
  clampDpr,
  driftBase,
  fiber,
  fiberColor,
  aim,
} from "../src/lib/hopf-2d";

function parseRgb(s: string): [number, number, number] {
  const m = s.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (!m) throw new Error(`not an rgb() color: ${s}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

describe("hopf-2d budgets", () => {
  it("uses 36 fibers x 150 segments", () => {
    expect(FIBER_COUNT).toBe(36);
    expect(FIBER_SEGMENTS).toBe(150);
  });

  it("pins visible-calm constants", () => {
    expect(SPIN_DT).toBeCloseTo(0.015, 5);
    expect([...SPIN_FREQS]).toEqual([0.33, 0.21, 0.28]);
    expect(CUR_LERP).toBeCloseTo(0.06, 5);
    expect(PITCH_LERP).toBeCloseTo(0.045, 5);
    expect(AUTO_DRIFT_RATE).toBeCloseTo(0.6, 5);
    expect(AUTO_DRIFT_AMP).toBeCloseTo(0.65, 5);
  });

  it("exports numeric auto-drift sine constants for coarse pointers", () => {
    expect(typeof AUTO_DRIFT_RATE).toBe("number");
    expect(typeof AUTO_DRIFT_AMP).toBe("number");
    expect(AUTO_DRIFT_RATE).toBeGreaterThan(0);
    expect(AUTO_DRIFT_AMP).toBeGreaterThan(0);
    const src = readFileSync(join(__dirname, "../src/lib/hopf-2d.ts"), "utf8");
    expect(src).toContain("AUTO_DRIFT_RATE");
    expect(src).toContain("AUTO_DRIFT_AMP");
    expect(src).toContain("Math.sin");
  });

  it("clamps DPR to 1.5 mobile / 2 desktop with floor 1", () => {
    expect(clampDpr(3, true)).toBe(1.5);
    expect(clampDpr(3, false)).toBe(2);
    expect(clampDpr(0.5, true)).toBe(1);
    expect(clampDpr(0.5, false)).toBe(1);
    expect(clampDpr(1, false)).toBe(1);
  });
});

describe("hopf-2d blue-only palette", () => {
  it("fiberColor stays blue-only in both themes (no rainbow)", () => {
    for (const theme of ["dark", "light"] as const) {
      for (let k = 0; k < 36; k++) {
        const ph = (k / 36) * 2 * Math.PI;
        const [r, g, b] = parseRgb(fiberColor(ph, theme));
        expect(b, `${theme} ph=${ph}`).toBeGreaterThanOrEqual(g);
        expect(b, `${theme} ph=${ph}`).toBeGreaterThanOrEqual(r);
        expect(b, `${theme} ph=${ph}`).toBeGreaterThan(100);
      }
    }
  });

  it("light fibers stay deep-blue (#0A54C2 family, no white washout)", () => {
    for (let k = 0; k < 36; k++) {
      const ph = (k / 36) * 2 * Math.PI;
      const [r, g, b] = parseRgb(fiberColor(ph, "light"));
      // #2E8CFF (46,140,255) -> #0A54C2 (10,84,194): red stays low.
      expect(r, `light ph=${ph}`).toBeLessThan(80);
    }
    expect(FIBER_HI_LIGHT).toBe("#0A54C2");
    expect(FIBER_HI_DARK).toBe("#7AB3FF");
  });

  it("ships no hue() rainbow path", () => {
    const src = readFileSync(join(__dirname, "../src/lib/hopf-2d.ts"), "utf8");
    expect(src).not.toMatch(/\bhue\s*\(/);
    const island = readFileSync(join(__dirname, "../src/components/HopfHero.astro"), "utf8");
    expect(island).not.toMatch(/\bhue\s*\(/);
  });
});

describe("hopf-2d verbatim math gates", () => {
  it("fiber null-gates d<0.07 at the stereographic pole", () => {
    // th=PI puts b=1 so d hits 0 for some t -> null entries expected.
    const polar = fiber(Math.PI, 0);
    expect(polar.length).toBe(FIBER_SEGMENTS + 1);
    expect(polar.some((p) => p === null)).toBe(true);
    // Equatorial fiber never approaches the pole -> no nulls.
    const eq = fiber(Math.PI / 2, 0);
    expect(eq.some((p) => p === null)).toBe(false);
    for (const p of eq) {
      expect(p).not.toBeNull();
      expect(p!.length).toBe(3);
      for (const v of p!) expect(Number.isFinite(v)).toBe(true);
    }
  });

  it("stroke skips hypot>7 runaways (verbatim guard present)", () => {
    const src = readFileSync(join(__dirname, "../src/lib/hopf-2d.ts"), "utf8");
    expect(src).toContain("Math.hypot");
    expect(src).toMatch(/>\s*7/);
    expect(src).toContain("0.07");
  });

  it("pins GROUP_X ring offset (desktop right, mobile centered)", () => {
    expect(GROUP_X_DESKTOP).toBeCloseTo(0.62, 5);
    expect(GROUP_X_MOBILE).toBeCloseTo(0.5, 5);
    const src = readFileSync(join(__dirname, "../src/lib/hopf-2d.ts"), "utf8");
    expect(src).toContain("GROUP_X_DESKTOP");
    expect(src).toContain("GROUP_X_MOBILE");
    expect(src).toMatch(/isMobileViewport\(\)\s*\?\s*GROUP_X_MOBILE\s*:\s*GROUP_X_DESKTOP/);
  });

  it("AMP 0.65 th extremes stay clear of polar null-gates (no excess skips)", () => {
    for (const th of [Math.PI / 2 - AUTO_DRIFT_AMP, Math.PI / 2 + AUTO_DRIFT_AMP]) {
      const pts = fiber(th, 0);
      expect(pts.some((p) => p === null)).toBe(false);
      for (const p of pts) {
        expect(p).not.toBeNull();
        for (const v of p!) expect(Number.isFinite(v)).toBe(true);
      }
    }
  });

  it("aim keeps the verbatim pointer mapping", () => {
    const t = aim(0.5, 0.25);
    expect(t.th).toBeCloseTo(Math.PI * (0.1 + 0.8 * 0.5), 10);
    expect(t.ph).toBeCloseTo(0.25 * 2 * Math.PI, 10);
    expect(t.tp).toBeCloseTo(0.15 + 0.7 * 0.5, 10);
  });

  it("exposes renderOnce single-frame API with zero-rAF-at-rest path", () => {
    const src = readFileSync(join(__dirname, "../src/lib/hopf-2d.ts"), "utf8");
    expect(src).toContain("renderOnce");
    expect(src).toContain("setPaused");
    expect(src).toContain("zero rAF at rest");
  });
});

describe("hopf-2d additive drift (v4)", () => {
  it("driftBase(t=0) sits at the neutral viewpoint", () => {
    const b = driftBase(0);
    expect(b.th).toBeCloseTo(Math.PI / 2, 10);
    expect(b.ph).toBeCloseTo(0, 10);
  });

  it("driftBase(fixed t) follows the pinned sine formulas", () => {
    const t = 4.2;
    const b = driftBase(t);
    expect(b.th).toBeCloseTo(Math.PI / 2 + AUTO_DRIFT_AMP * Math.sin(t * AUTO_DRIFT_RATE), 10);
    expect(b.ph).toBeCloseTo(t * AUTO_DRIFT_RATE + AUTO_DRIFT_AMP * Math.sin(t * AUTO_DRIFT_RATE * 0.7), 10);
  });

  it("coarse path stays bit-identical to driftBase (zeroed offset)", () => {
    const src = readFileSync(join(__dirname, "../src/lib/hopf-2d.ts"), "utf8");
    expect(src).toContain("driftBase(driftT)");
    expect(src).toContain("pointerOffset");
    // Coarse branch composes the pure base with no offset.
    expect(src).toMatch(/if\s*\(coarse\)[\s\S]*?tg\.th\s*=\s*base\.th/);
    expect(src).toMatch(/tp\s*=\s*0\.45/);
  });

  it("wraps the ph delta to [-PI,PI] before CUR_LERP", () => {
    const src = readFileSync(join(__dirname, "../src/lib/hopf-2d.ts"), "utf8");
    expect(src).toContain("atan2");
    expect(src).toContain("CUR_LERP");
  });

  it("ships no foreground highlight (fg strokes + helpers deleted)", () => {
    const src = readFileSync(join(__dirname, "../src/lib/hopf-2d.ts"), "utf8");
    expect(src).not.toContain("foregroundColor");
    expect(src).not.toMatch(/FG_/);
    expect(src).not.toContain("fgRing");
    // All 36 fibers render equal via the single loop.
    expect(src).toContain("1.6, 0.7");
    expect(src).not.toMatch(/stroke\(ctx,\s*fiber\(cur\.th,\s*cur\.ph\)/);
  });

  it("poster script ships no fgRing highlight", () => {
    const script = readFileSync(join(__dirname, "../scripts/generate-poster.mjs"), "utf8");
    expect(script).not.toContain("fgRing");
  });
});
