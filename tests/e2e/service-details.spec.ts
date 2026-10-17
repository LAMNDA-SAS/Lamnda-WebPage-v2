import { test, expect } from "@playwright/test";

const slugs = [
  "notificaciones-inteligentes",
  "documentacion-automatizada",
  "bots-crm",
  "tele-agentes-ia",
  "lead-scoring",
  "marketing-bots",
  "dashboards-dinamicos",
  "agendamiento-automatico",
];

const summarySlugs = ["bots-crm", "tele-agentes-ia", "marketing-bots"];

test.describe("service detail routes", () => {
  test("8 routes show breadcrumb, hero, bullets, demo, dual CTA", async ({
    page,
  }) => {
    for (const slug of slugs) {
      await page.goto(`/servicios/${slug}`);
      // Breadcrumb with accessible label.
      const crumb = page.locator('nav[aria-label="breadcrumb"]');
      await expect(crumb).toBeVisible();
      await expect(crumb).toContainText("Servicios");
      // Compact hero: pill + h1 + sub.
      await expect(page.locator(".detail-hero h1")).toBeVisible();
      await expect(page.locator(".detail-hero .pillar-tag")).toBeVisible();
      await expect(page.locator(".detail-sub")).not.toBeEmpty();
      // Value bullets: 4 rows on every page (full 3+1, summary 1+body+2 generic).
      await expect(page.locator(".value-list li")).toHaveCount(4);
      // Static ejemplo figure with illustrative caption.
      const fig = page.locator(".demo-figure");
      await expect(fig).toBeVisible();
      await expect(fig.locator('[role="img"]')).toHaveCount(1);
      await expect(fig).toContainText("Mock ilustrativo — sin datos reales");
      // Dual CTA: demo + back to services.
      await expect(
        page.getByRole("link", { name: "Solicita una demo" }),
      ).toHaveAttribute("href", "/#contact");
      await expect(
        page.getByRole("link", { name: "Volver a servicios" }),
      ).toHaveAttribute("href", "/#services");
    }
  });

  test("summary pages show 4 rows without invented features", async ({
    page,
  }) => {
    for (const slug of summarySlugs) {
      await page.goto(`/servicios/${slug}`);
      const items = page.locator(".value-list li");
      await expect(items).toHaveCount(4);
      // Generic practice fallbacks, no invented product claims.
      const text = (await page.locator(".value-list").textContent()) ?? "";
      expect(text).toContain("Revisión humana");
      // Summaries carry zero inline islands.
      expect(await page.locator("script").count()).toBeGreaterThanOrEqual(0);
      const inlineIslands = await page.evaluate(
        () =>
          Array.from(document.scripts).filter((s) =>
            (s.textContent ?? "").includes("data-filter"),
          ).length,
      );
      expect(inlineIslands).toBe(0);
    }
  });

  test("SEO canonical DRAFT and no-KPI guard", async ({ page }) => {
    for (const slug of slugs) {
      await page.goto(`/servicios/${slug}`);
      const title = await page.title();
      expect(title).toContain("— Lamnda");
      const desc =
        (await page.locator('meta[name="description"]').getAttribute("content")) ??
        "";
      expect(desc.length).toBeGreaterThan(0);
      expect(desc.length).toBeLessThanOrEqual(155);
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical).toBe(`https://lamnda.example.com/servicios/${slug}`);
      // Page copy carries zero numeric KPI patterns.
      const body =
        (await page.locator("main").textContent()) ?? "";
      expect(body).not.toMatch(/%/);
      expect(body).not.toMatch(/\d+%/);
    }
    // DRAFT badge kept on agendamiento only.
    await page.goto("/servicios/agendamiento-automatico");
    await expect(page.locator('.draft-badge:has-text("Borrador")')).toBeVisible();
    await page.goto("/servicios/notificaciones-inteligentes");
    await expect(page.locator(".draft-badge")).toHaveCount(0);
  });

  test("detail 390px has no horizontal overflow", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/servicios/notificaciones-inteligentes");
    await expect(page.locator(".detail-hero h1")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await context.close();
  });

  test("detail CTAs are keyboard focusable", async ({ page }) => {
    await page.goto("/servicios/lead-scoring");
    const demo = page.getByRole("link", { name: "Solicita una demo" });
    await demo.focus();
    await expect(demo).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Volver a servicios" }),
    ).toBeFocused();
  });
});
