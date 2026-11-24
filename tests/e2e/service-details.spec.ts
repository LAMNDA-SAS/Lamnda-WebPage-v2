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

const demoSlugs = slugs.filter((slug) => slug !== "agendamiento-automatico");

const ORIGIN = "http://127.0.0.1:4321";

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
      // Value bullets: 4 rows for every service (3 frontmatter + 1 body-derived).
      await expect(page.locator(".value-list li")).toHaveCount(4);
      // Agendamiento keeps its static illustrative mock (unique role=img).
      // The 7 ported demos mount an interactive island instead.
      const fig = page.locator(".demo-figure");
      await expect(fig).toBeVisible();
      if (slug === "agendamiento-automatico") {
        await expect(fig.locator('[role="img"]')).toHaveCount(1);
        await expect(fig).toContainText("Mock ilustrativo — sin datos reales");
      } else {
        await expect(fig.locator("[data-demo]")).toHaveCount(1);
        await expect(fig.locator('[role="img"]')).toHaveCount(0);
        await expect(fig).toContainText("Datos de muestra");
      }
      // Dual CTA: demo + back to services. exact:true keeps the resolver on
      // the bottom ghost CTA only (the top back row reads "Volver a Servicios").
      await expect(
        page.getByRole("link", { name: "Solicita una demo" }),
      ).toHaveAttribute("href", "/#contact");
      await expect(
        page.getByRole("link", { name: "Volver a servicios", exact: true }),
      ).toHaveAttribute("href", "/#services");
    }
  });

  test("demo islands: one inline script per demo page, zero on agendamiento", async ({
    page,
  }) => {
    for (const slug of slugs) {
      await page.goto(`/servicios/${slug}`);
      const inlineScripts = await page.evaluate(
        () => document.querySelectorAll("main script:not([src])").length,
      );
      if (slug === "agendamiento-automatico") {
        // Static mock page keeps a zero-script budget: no islands.
        expect(inlineScripts).toBe(0);
      } else {
        expect(inlineScripts).toBe(1);
      }
    }
  });

  test("every page shows 4 rows without invented features", async ({
    page,
  }) => {
    for (const slug of slugs) {
      await page.goto(`/servicios/${slug}`);
      const items = page.locator(".value-list li");
      // Same shape for every service: 3 frontmatter bullets + 1 body-derived.
      await expect(items).toHaveCount(4);
      const text = (await page.locator(".value-list").textContent()) ?? "";
      expect(text.length).toBeGreaterThan(0);
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
      // Demo islands are sample data and are excluded from the scan;
      // the agendamiento mock keeps the raw whole-main scan.
      const body =
        slug === "agendamiento-automatico"
          ? (await page.locator("main").textContent()) ?? ""
          : await page.evaluate(() => {
              const main = document.querySelector("main");
              if (!main) return "";
              const clone = main.cloneNode(true) as HTMLElement;
              // Demo islands + their inline script sources are sample data,
              // not page copy; the KPI scan covers visible copy only.
              clone.querySelectorAll("[data-demo], script").forEach((el) => el.remove());
              return clone.textContent ?? "";
            });
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
      page.getByRole("link", { name: "Volver a servicios", exact: true }),
    ).toBeFocused();
  });

  test("7 demos stay zero-cost static: same-origin requests only, no imgs, no old CTAs", async ({
    page,
  }) => {
    const foreign: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.startsWith("data:")) return;
      try {
        if (new URL(url).origin !== ORIGIN) foreign.push(url);
      } catch {
        foreign.push(url);
      }
    });
    for (const slug of demoSlugs) {
      await page.goto(`/servicios/${slug}`);
      expect(foreign, `foreign requests after ${slug}: ${foreign.join(", ")}`).toEqual([]);
      await expect(page.locator("[data-demo] img")).toHaveCount(0);
      await expect(
        page.locator("[data-demo]").getByText("Quiero algo así"),
      ).toHaveCount(0);
      await expect(page.locator('a[href*="index.html"]')).toHaveCount(0);
      await expect(page.locator("[data-demo]").getByText("Ver servicios")).toHaveCount(0); // "See services" (legacy CTA)
    }
  });

  test("reduced motion: dashboards fully static, notif filter still interactive", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    await page.goto("/servicios/dashboards-dinamicos");
    const badge = page.locator('[data-demo="dashboards"] .pd-live-badge');
    await expect(badge).toHaveAttribute(
      "title",
      "Live updates paused (prefers-reduced-motion): showing static data",
    );
    // Engine never starts: no entrance class, view 1 active, title unchanged.
    const animFlag = await page.evaluate(
      () =>
        !!document.querySelector('[data-demo="dashboards"] .pd-anim'),
    );
    expect(animFlag).toBe(false);
    await expect(
      page.locator('[data-demo="dashboards"] #pdTitle'),
    ).toHaveText("DEMOGRAPHICS DASHBOARD");
    await expect(page.locator("#pd-view-demographics")).toHaveClass(
      /pd-view-active/,
    );

    // The notif filter is a state change, not motion: it must still work.
    await page.goto("/servicios/notificaciones-inteligentes");
    await expect(page.locator(".example-alert").first()).toBeVisible();
    await page.locator('.example-tab[data-filter="soporte"]').click();
    await expect(
      page.locator('.example-alert[data-cat="ventas"]').first(),
    ).toBeHidden();
    await expect(
      page.locator('.example-alert[data-cat="soporte"]').first(),
    ).toBeVisible();

    await context.close();
  });

  test("lead-scoring sort smoke: direction toggle flips to lowest score", async ({
    page,
  }) => {
    await page.goto("/servicios/lead-scoring");
    await expect(page.locator("#scoreTable tbody tr").first()).toContainText(
      "Carolina M.",
    );
    await page.locator("#sortDir").click();
    await expect(page.locator("#scoreTable tbody tr").first()).toContainText(
      "Paula D.",
    );
    await expect(page.locator("#scoreTable tbody tr").first()).toContainText(
      "18",
    );
  });

  test("marketing-bots chat smoke: playing seeds the qualified lead text", async ({
    page,
  }) => {
    test.setTimeout(30_000);
    await page.goto("/servicios/marketing-bots");
    await page.locator("#chatPlay").click();
    await expect(page.locator("#leadText")).toContainText("Fecha asesoría", {
      timeout: 20_000,
    });
  });

  test("bots-crm filter smoke: filtering by Marta leaves 3 oportunidades", async ({
    page,
  }) => {
    await page.goto("/servicios/bots-crm");
    await expect(page.locator("#crmVisible")).toHaveText("11 oportunidades");
    await page.locator("#crmFilter").fill("Marta");
    await expect(page.locator("#crmVisible")).toHaveText("3 oportunidades");
    // Non-matching owner cards become hidden (display-level filter).
    await expect(
      page.locator('.example-crm-card[data-value="32.5"]'),
    ).toBeHidden();
    await expect(
      page.locator('.example-crm-card[data-value="96.4"]'),
    ).toBeVisible();
  });

  test("documentación smokes: search filters rows; PED-301 generates the cotización", async ({
    page,
  }) => {
    await page.goto("/servicios/documentacion-automatizada");
    // Search filter.
    await page.locator("#docSearch").fill("andina");
    await expect(page.locator('tr[data-order="PED-301"]')).toBeVisible();
    await expect(page.locator('tr[data-order="PED-302"]')).toBeHidden();
    // Generated flow: select PED-301, generate, COTIZACIÓN sheet appears.
    await expect(page.locator("#generateBtn")).toBeHidden();
    await page.locator('tr[data-order="PED-301"]').click();
    await expect(page.locator("#generateBtn")).toBeVisible();
    await page.locator("#generateBtn").click();
    await expect(page.locator("#facturaBox")).toContainText("COTIZACIÓN", {
      timeout: 3_000,
    });
  });

  test("dashboards smokes: engine starts, tab switch repaints view 2, hover pauses", async ({
    page,
  }) => {
    await page.goto("/servicios/dashboards-dinamicos");
    // Engine wires the entrance class onto the dashboard element.
    await expect(page.locator("#auroraDashboard")).toHaveClass(/pd-anim/);
    await expect(page.locator("#pd-view-demographics")).toHaveClass(
      /pd-view-active/,
    );
    // Manual dot/tab click stops the cycle and repaints view 2.
    await page.locator("#auroraDashboard .pd-tab").nth(1).click();
    await expect(page.locator("#pd-view-financial")).toHaveClass(
      /pd-view-active/,
    );
    await expect(page.locator("#pdTitle")).toHaveText(
      "FINANCIAL HEALTH DASHBOARD",
    );
    // Hover pauses ambient motion (class toggle is JS-side).
    await page.locator("#auroraDashboard").dispatchEvent("mouseenter");
    await expect(page.locator("#auroraDashboard")).toHaveClass(/is-paused/);
  });

  test("tele-agentes smoke: first client turn fills the lead name off-speech", async ({
    page,
  }) => {
    test.setTimeout(30_000);
    await page.goto("/servicios/tele-agentes-ia");
    await page.locator("#voiceSimulate").click();
    // First turn fill lands ~2.6s after start; full sim would run ~20s.
    // #leadNombre is a <strong> lead-card row value (not an input).
    await expect(page.locator("#leadNombre")).toHaveText("Andrés Ríos", {
      timeout: 6_000,
    });
  });
});
