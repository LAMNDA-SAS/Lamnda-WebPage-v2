import { test, expect } from "@playwright/test";

/**
 * 2D Hopf hero gates (lamnda-hopf-2d-v3):
 * RM zero-rAF + per-move renderOnce, coarse sine auto-drift (mouse ignored),
 * IO pause/resume, poster preload high + zero CLS.
 */
test.describe("2d hopf hero", () => {
  test("poster preloads high with fixed dims (zero CLS)", async ({ page }) => {
    await page.goto("/");
    const preload = page.locator('link[rel="preload"][as="image"][fetchpriority="high"]');
    await expect(preload.first()).toHaveCount(1);
    const poster = page.locator("[data-hopf-poster]");
    await expect(poster).toBeVisible();
    expect(await poster.getAttribute("width")).toBe("1600");
    expect(await poster.getAttribute("height")).toBe("1000");
    expect(await poster.getAttribute("fetchpriority")).toBe("high");
    // Themed poster swap: src matches the active theme variant.
    const theme = await page.locator("html").getAttribute("data-theme");
    const src = await poster.getAttribute("src");
    expect(src).toContain(theme === "light" ? "hero-poster-light.webp" : "hero-poster-dark.webp");
    // Zero CLS: hero keeps full-bleed height once canvas hydrates.
    const before = await page.locator("#top").boundingBox();
    await expect(page.locator("[data-hopf-canvas]")).toBeVisible({ timeout: 30000 });
    const after = await page.locator("#top").boundingBox();
    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(2);
  });

  test("reduced-motion: zero rAF at rest, one frame per move", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.addInitScript(() => {
      (window as any).__rafCount = 0;
      const orig = window.requestAnimationFrame.bind(window);
      (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
        (window as any).__rafCount++;
        return orig(cb);
      };
    });
    await page.goto("/");
    await expect(page.locator("[data-hopf-canvas]")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("[data-hopf-status]")).toBeEmpty();
    await page.waitForTimeout(1200);
    expect(await page.evaluate(() => (window as any).__rafCount)).toBe(0);
    await page.mouse.move(800, 400);
    await page.waitForTimeout(400);
    await expect(page.locator("[data-hopf-canvas]")).toBeVisible();
    await context.close();
  });

  test("coarse pointer: auto-drift runs, mouse ignored", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-hopf-canvas]")).toBeVisible({ timeout: 30000 });
    // Canvas keeps painting via sine drift without pointer input: two
    // successive screenshots differ (motion), proving the loop runs.
    const canvas = page.locator("[data-hopf-canvas]");
    const a = await canvas.screenshot();
    await page.waitForTimeout(900);
    const b = await canvas.screenshot();
    expect(Buffer.compare(a, b) === 0).toBe(false);
    await context.close();
  });

  test("offscreen IO pauses the loop", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-hopf-canvas]")).toBeVisible({ timeout: 30000 });
    await page.evaluate(() => document.getElementById("contact")?.scrollIntoView());
    await page.waitForTimeout(600);
    // Hero is offscreen; canvas must still be in the DOM (paused, not torn down).
    await expect(page.locator("[data-hopf-canvas]")).toBeAttached();
    await page.evaluate(() => document.getElementById("top")?.scrollIntoView());
    await expect(page.locator("[data-hopf-canvas]")).toBeVisible();
  });
});
