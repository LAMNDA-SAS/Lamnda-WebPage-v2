import { describe, expect, it } from "vitest";
import {
  DESKTOP_FIBER_COUNT,
  MOBILE_FIBER_COUNT,
  FIBER_SEGMENTS,
  DRAW_CALLS,
  MAX_DRAW_CALLS,
  DPR_MOBILE_MAX,
  DPR_DESKTOP_MAX,
  buildFiberLinePositions,
  buildDustPositions,
  clampDpr,
  getFiberCount,
} from "../src/lib/hopf-scene";

describe("hopf fiber budgets", () => {
  it("uses 48 desktop / 24 mobile fibers x 128 segments", () => {
    expect(DESKTOP_FIBER_COUNT).toBe(48);
    expect(MOBILE_FIBER_COUNT).toBe(24);
    expect(FIBER_SEGMENTS).toBe(128);
    expect(getFiberCount(false)).toBe(48);
    expect(getFiberCount(true)).toBe(24);
  });

  it("precomputes LineSegments pairs for every fiber segment", () => {
    const positions = buildFiberLinePositions(48, 128);
    expect(positions.length).toBe(48 * 128 * 2 * 3);
    // All coordinates finite (no NaN from stereographic pole).
    for (let i = 0; i < positions.length; i += 997) {
      expect(Number.isFinite(positions[i])).toBe(true);
    }
  });

  it("mobile build uses fewer fibers", () => {
    const desktop = buildFiberLinePositions(48, 128);
    const mobile = buildFiberLinePositions(24, 128);
    expect(mobile.length).toBeLessThan(desktop.length);
    expect(mobile.length).toBe(24 * 128 * 2 * 3);
  });

  it("dust points sample along fibers", () => {
    const dust = buildDustPositions(48, 128);
    expect(dust.length).toBeGreaterThan(0);
    expect(dust.length % 3).toBe(0);
  });

  it("stays under 30 draw calls (1 lines + 1 points)", () => {
    expect(DRAW_CALLS).toBe(2);
    expect(DRAW_CALLS).toBeLessThan(MAX_DRAW_CALLS);
  });

  it("clamps DPR to 1.5 mobile / 2 desktop", () => {
    expect(clampDpr(3, true)).toBe(DPR_MOBILE_MAX);
    expect(clampDpr(3, false)).toBe(DPR_DESKTOP_MAX);
    expect(clampDpr(1, false)).toBe(1);
  });
});
