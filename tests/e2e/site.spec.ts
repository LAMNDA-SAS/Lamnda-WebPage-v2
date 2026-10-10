import { test, expect } from "@playwright/test";

test.describe("marketing site", () => {
  test("sections render in order with anchors", async ({ page }) => {
    await page.goto("/");
    for (const id of ["#top", "#pillars", "#services", "#vision", "#contact"]) {
      await expect(page.locator(id)).toBeVisible();
    }
    const order = await page.evaluate(() => {
      const ids = ["top", "pillars", "services", "vision", "contact"];
      return ids.map((id) => document.getElementById(id)?.offsetTop ?? -1);
    });
    const sorted = [...order].sort((a, b) => a - b);
    expect(order).toEqual(sorted);
  });

  test("hero headline pinned + CTA scrolls to services", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#hero-heading")).toHaveText(
      "Complex problems. Elegant solutions.",
    );
    await page.click("#hero-cta");
    await expect(page).toHaveURL(/#services/);
    await expect(page.locator("#services")).toBeInViewport();
  });

  test("no-JS fallback: native anchor jump lands on #services", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    // Poster must still render without JS (LCP-safe fallback).
    await expect(page.locator("[data-hopf-poster]")).toBeVisible();
    await page.click("#hero-cta");
    await expect(page).toHaveURL(/#services/);
    await context.close();
  });

  test("4 full + 3 summary cards + CSS/SVG mock dashboard", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".card-full")).toHaveCount(4);
    await expect(page.locator(".card-summary")).toHaveCount(3);
    const mock = page.locator(".dashboard-mock svg");
    await expect(mock).toBeVisible();
    // Mock dashboard fetches no external data.
    expect(await mock.evaluate((el) => el.querySelectorAll("image").length)).toBe(0);
  });

  test("Solicita una demo links to #contact + footer tag", async ({ page }) => {
    await page.goto("/");
    const demo = page.getByRole("link", { name: "Solicita una demo" });
    await expect(demo).toHaveAttribute("href", "#contact");
    await expect(
      page.getByText("SCIENCE x TECHNOLOGY x IMPACT"),
    ).toBeVisible();
  });

  test("theme toggle persists across reloads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.click("[data-theme-toggle]");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("reduced-motion freezes hero to poster", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-hopf-poster]")).toBeVisible();
    await expect(page.locator("[data-hopf-canvas]")).toBeHidden();
    await context.close();
  });

  test("mobile 390px hero has no horizontal overflow", async ({ browser }) => {
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

  test("SEO meta present", async ({ page }) => {
    await page.goto("/");
    expect(await page.title()).toBeTruthy();
    const desc = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(desc).toBeTruthy();
    for (const sel of [
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:image"]',
      'link[rel="canonical"]',
    ]) {
      await expect(page.locator(sel)).toHaveCount(1);
    }
  });
});
