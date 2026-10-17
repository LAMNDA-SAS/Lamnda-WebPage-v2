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

  test("hero is full-bleed with copy overlaid on the canvas", async ({
    page,
  }) => {
    await page.goto("/");
    const viewport = page.viewportSize() ?? { width: 1280, height: 800 };
    const hero = await page.locator("#top").boundingBox();
    expect(hero).not.toBeNull();
    expect(hero!.height).toBeGreaterThan(viewport.height * 0.9);
    // Poster/canvas fills the hero width (full-bleed, not a side card).
    const poster = await page.locator("[data-hopf-poster]").boundingBox();
    expect(poster).not.toBeNull();
    expect(poster!.width).toBeGreaterThan(viewport.width * 0.9);
    // Copy overlays the visual layer (overlapping boxes, copy starts left).
    const copy = await page.locator("[data-hero-copy]").boundingBox();
    expect(copy).not.toBeNull();
    expect(copy!.x).toBeLessThan(viewport.width * 0.5);
    expect(copy!.x + copy!.width).toBeGreaterThan(
      poster!.x + poster!.width * 0.2,
    );
  });

  test("brand: header/footer shield marks + favicon set, no white box", async ({
    page,
  }) => {
    await page.goto("/");
    const headerLogo = page.locator('header img[alt="Lamnda"]');
    await expect(headerLogo).toBeVisible();
    expect(await headerLogo.getAttribute("src")).toContain("/logos/");
    expect(await headerLogo.getAttribute("width")).toBe("32");
    const footerLogo = page.locator('footer img[alt="Lamnda"]');
    await expect(footerLogo).toBeVisible();
    expect(await footerLogo.getAttribute("width")).toBe("24");
    for (const sel of [
      'link[rel="icon"][href="/favicon-32.png"]',
      'link[rel="apple-touch-icon"]',
      'meta[name="theme-color"]',
    ]) {
      await expect(page.locator(sel)).toHaveCount(1);
    }
    // No white-background logo box on the dark hero.
    const bg = await headerLogo.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(["rgba(0, 0, 0, 0)", "transparent"].includes(bg)).toBe(true);
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

  test("5 full + 3 summary cards + static showcase strip, qualitative only", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".card-full")).toHaveCount(5);
    await expect(page.locator(".card-summary")).toHaveCount(3);
    const mock = page.locator(".dashboard-mock svg");
    await expect(mock).toBeVisible();
    // Mock dashboard fetches no external data.
    expect(await mock.evaluate((el) => el.querySelectorAll("image").length)).toBe(0);
    expect(await mock.evaluate((el) => el.innerHTML.includes("fetch"))).toBe(false);
    // Card comfort: icon-box 40px tile + arrow-chip CTA on every card.
    await expect(page.locator("#services .icon-box")).toHaveCount(8);
    await expect(page.locator("#services .arrow-chip")).toHaveCount(8);
    const iconBox = await page.locator("#services .icon-box").first().boundingBox();
    expect(iconBox).not.toBeNull();
    expect(Math.round(iconBox!.width)).toBe(40);
    expect(Math.round(iconBox!.height)).toBe(40);
    // Every full card renders a qualitative outcome + deep-link hint.
    for (const card of await page.locator(".card-full").all()) {
      await expect(card.locator(".card-outcome")).toHaveCount(1);
      const hint = card.locator("a.example-hint");
      await expect(hint).toHaveCount(1);
      const href = await hint.getAttribute("href");
      expect(href).toMatch(/^\/servicios\/[a-z-]+$/);
    }
    // Summary cards render CTA without outcome, deep-linked.
    for (const card of await page.locator(".card-summary").all()) {
      await expect(card.locator(".card-outcome")).toHaveCount(0);
      const hint = card.locator("a.example-hint");
      await expect(hint).toHaveCount(1);
      const href = await hint.getAttribute("href");
      expect(href).toMatch(/^\/servicios\/[a-z-]+$/);
    }
    // Zero hints self-anchor to #services.
    await expect(page.locator('a.example-hint[href="#services"]')).toHaveCount(0);
    expect(await page.locator("a.example-hint").count()).toBe(8);
    // DRAFT badge on the new Agendamiento card.
    await expect(
      page.locator('#services .draft-badge:has-text("Borrador")'),
    ).toBeVisible();
    // Lede, hero proof, ally ghost navigation, pillar lines.
    await expect(page.locator("#services .section-lede")).toContainText(
      "Cinco soluciones prioritarias",
    );
    await expect(page.locator(".hero-proof")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Ver cómo se ve" }),
    ).toHaveAttribute("href", "#services");
    await expect(page.locator(".pillar-proof")).toHaveCount(3);
    await expect(
      page.locator('[data-pillar="security"] .pillar-proof'),
    ).toContainText("Trazabilidad");
    // Static strip: 3 mocks + 4 chips + illustrative note.
    await expect(page.locator("#showcase")).toBeVisible();
    await expect(page.locator("#showcase .showcase-mock")).toHaveCount(3);
    await expect(page.locator("#showcase .showcase-chips li")).toHaveCount(4);
    for (const name of ["WhatsApp", "Gmail", "Slack", "HubSpot"]) {
      await expect(
        page.locator("#showcase .showcase-chips", { hasText: name }),
      ).toBeVisible();
    }
    await expect(page.locator("#showcase")).toContainText("Mock ilustrativo");
    // No numeric KPI claims anywhere inside #services.
    const servicesText =
      (await page.locator("#services").textContent()) ?? "";
    expect(servicesText).not.toMatch(/[+-]?%/);
    expect(servicesText).not.toMatch(/\d+%/);
    expect(servicesText).not.toMatch(/x\d/);
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

  test("reduced-motion: single frame, zero rAF at rest, no banner", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.addInitScript(() => {
      // Count rAF schedules to prove zero loop at rest.
      (window as any).__rafCount = 0;
      const orig = window.requestAnimationFrame.bind(window);
      (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
        (window as any).__rafCount++;
        return orig(cb);
      };
    });
    await page.goto("/");
    // Single WebGL beauty frame paints (canvas visible), not the sparse poster.
    await expect(page.locator("[data-hopf-canvas]")).toBeVisible({
      timeout: 30000,
    });
    // No visible banner: sr-only status stays empty unless genuine failure.
    await expect(page.locator("[data-hopf-status]")).toBeEmpty();
    const statusBox = await page.locator("[data-hopf-status]").boundingBox();
    // sr-only: 1px clipped, never a visible banner.
    expect(statusBox).not.toBeNull();
    expect(statusBox!.width).toBeLessThanOrEqual(1);
    expect(statusBox!.height).toBeLessThanOrEqual(1);
    // Zero rAF at rest (no loop, no timers).
    await page.waitForTimeout(1200);
    expect(await page.evaluate(() => (window as any).__rafCount)).toBe(0);
    // Pointer input renders on-demand frames without starting a loop.
    await page.mouse.move(800, 400);
    await page.waitForTimeout(400);
    await expect(page.locator("[data-hopf-canvas]")).toBeVisible();
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

  test("CTA computed-style pairs meet AA in both themes", async ({ page }) => {
    await page.goto("/");
    // Dark (default): #0A1628 text on #7AB3FF bg = 8.39:1 (white-on-#7AB3FF was 2.16:1 FAIL).
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const dark = await page.locator("#hero-cta").evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, backgroundColor: s.backgroundColor };
    });
    expect(dark.color).toBe("rgb(10, 22, 40)");
    expect(dark.backgroundColor).toBe("rgb(122, 179, 255)");
    // Light: white text on #0A54C2 bg = 6.86:1.
    await page.click("[data-theme-toggle]");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const light = await page.locator("#hero-cta").evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, backgroundColor: s.backgroundColor };
    });
    expect(light.color).toBe("rgb(255, 255, 255)");
    expect(light.backgroundColor).toBe("rgb(10, 84, 194)");
  });

  test("SEO meta present with beauty poster OG image", async ({ page }) => {
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
    const ogImage = await page
      .locator('meta[property="og:image"]')
      .getAttribute("content");
    expect(ogImage).toContain("hero-poster-dark.webp");
  });
});
