import { test, expect } from "@playwright/test";

/**
 * lamnda-hero-auto-fidelity-v4 gates:
 * additive idle drift (all pointers) + pointer offset, RM single frame,
 * equations aside desktop/hidden <=900px, reference strips + header states,
 * AA both themes, 390px no-overflow.
 */
test.describe("hero auto-fidelity v4", () => {
  test("desktop idle drift runs with no mouse", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("[data-hopf-canvas]");
    await expect(canvas).toBeVisible({ timeout: 30000 });
    // No pointer input at all: two successive frames differ (drift runs).
    const a = await canvas.screenshot();
    await page.waitForTimeout(900);
    const b = await canvas.screenshot();
    expect(Buffer.compare(a, b) === 0).toBe(false);
  });

  test("pointer adds offset without stopping drift", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("[data-hopf-canvas]");
    await expect(canvas).toBeVisible({ timeout: 30000 });
    await page.mouse.move(200, 300);
    await page.waitForTimeout(500);
    const a = await canvas.screenshot();
    await page.mouse.move(1000, 500);
    await page.waitForTimeout(500);
    const b = await canvas.screenshot();
    expect(Buffer.compare(a, b) === 0).toBe(false);
    // Drift base never stops: frames keep changing after the pointer settles.
    await page.waitForTimeout(900);
    const c = await canvas.screenshot();
    expect(Buffer.compare(b, c) === 0).toBe(false);
  });

  test("equations aside visible desktop, hidden <=900px", async ({
    page,
    browser,
  }) => {
    await page.goto("/");
    const aside = page.locator(".hero-equations");
    const vp = page.viewportSize();
    if (!vp || vp.width > 900) {
      await expect(aside).toBeVisible();
      await expect(aside).toContainText("Hopf Fibration");
      await expect(aside).toContainText("d = 1");
    } else {
      // Narrow project viewports (e.g. Pixel 5 393px) hide the aside by design.
      await expect(aside).toBeHidden();
    }

    const narrow = await browser.newContext({
      viewport: { width: 800, height: 800 },
    });
    const small = await narrow.newPage();
    await small.goto("/");
    await expect(small.locator(".hero-equations")).toBeHidden();
    await expect(small.locator(".hero-tag")).toBeHidden();
    const overflow = await small.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await narrow.close();
  });

  test("reference strips + header states render", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero-eyebrow")).toHaveText(
      "DATA / SECURITY / AUTOMATION",
    );
    await expect(page.locator("#hero-heading")).toHaveText(
      "Complex problems. Elegant solutions.",
    );
    await expect(page.locator("#hero-cta")).toContainText(
      "Explore our solutions",
    );
    await expect(page.locator(".hero-tag")).toContainText("HOPF FIELD");
    // Pillars echo: exactly 3 items reusing the collection data.
    await expect(page.locator("[data-hero-pillar]")).toHaveCount(3);
    // #pillars section stays in place below the hero.
    await expect(page.locator("#pillars")).toBeVisible();
    // Header: Home active + Get in touch outline pill with arrow.
    const home = page.locator('.site-header nav a[aria-current="page"]');
    await expect(home).toHaveText("Home");
    const cta = page.locator(".site-header .cta-small");
    await expect(cta).toContainText("Get in touch");
    await expect(cta.locator('span[aria-hidden="true"]')).toHaveText("→");
  });

  test("header CTA meets AA in both themes", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const dark = await page.locator(".site-header .cta-small").evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, borderColor: s.borderColor };
    });
    // Dark: --primary-text #7AB3FF text/border on dark navy bg.
    expect(dark.color).toBe("rgb(122, 179, 255)");
    await page.click("[data-theme-toggle]");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const light = await page.locator(".site-header .cta-small").evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, borderColor: s.borderColor };
    });
    // Light: --primary-text #0A54C2 text/border on white bg.
    expect(light.color).toBe("rgb(10, 84, 194)");
  });

  test("390px hero has no horizontal overflow", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("#hero-heading")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await context.close();
  });
});
