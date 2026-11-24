import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/* Relative luminance + contrast per WCAG 2.1 (same helpers as theme.test.ts). */
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

const DEMOS: { slug: string; dataDemo: string; file: string; sampleNote: string }[] = [
  {
    slug: "lead-scoring",
    dataDemo: "lead-scoring",
    file: "DemoLeadScoring.astro",
    sampleNote: "Datos de muestra con fines ilustrativos.",
  },
  {
    slug: "marketing-bots",
    dataDemo: "marketing-bots",
    file: "DemoMarketingBots.astro",
    sampleNote: "Datos de muestra con fines ilustrativos.",
  },
  {
    slug: "notificaciones-inteligentes",
    dataDemo: "notificaciones-inteligentes",
    file: "DemoNotificaciones.astro",
    sampleNote: "Datos de muestra",
  },
  {
    slug: "bots-crm",
    dataDemo: "bots-crm",
    file: "DemoBotsCrm.astro",
    sampleNote: "Datos de muestra",
  },
  {
    slug: "tele-agentes-ia",
    dataDemo: "tele-agentes-ia",
    file: "DemoTeleAgentes.astro",
    sampleNote: "Datos de muestra",
  },
  {
    slug: "documentacion-automatizada",
    dataDemo: "gestion-documental",
    file: "DemoDocumentos.astro",
    sampleNote: "Datos de muestra.",
  },
  {
    slug: "dashboards-dinamicos",
    dataDemo: "dashboards",
    file: "DemoDashboards.astro",
    sampleNote: "Datos de muestra con fines ilustrativos.",
  },
];

/* Old static-site palette: must never leak into the new components except
   inside --demo-* / --pd-* variable declaration lines (AA-tuned role sets). */
const OLD_HEXES = [
  "#0e2a5c",
  "#2e5a9a",
  "#64748b",
  "#94a3b8",
  "#475569",
  "#334155",
  "#0f172a",
  "#e2e8f0",
  "#f1f5f9",
  "#f3f5f9",
  "#f542b3",
  "#f59e0b",
  "#38bdf8",
  "#22c55e",
  "#fcd34d",
  "#ecfdf5",
  "#fef3c7",
  "#92400e",
  "#be185d",
  "#b45309",
  "#0284c7",
];

const VAR_DECL = /--(demo|pd)-[a-z0-9-]+\s*:\s*[^;]*#/i;

function componentPath(file: string): string {
  return join(__dirname, "../src/components/demos/", file);
}

function violationsForOldHexes(src: string): string[] {
  // Comments may reference old values for provenance; only scan effective CSS/JS.
  const effective = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: string[] = [];
  for (const line of effective.split("\n")) {
    if (VAR_DECL.test(line)) continue;
    for (const old of OLD_HEXES) {
      if (line.toLowerCase().includes(old)) out.push(line.trim().slice(0, 120));
    }
  }
  return out;
}

describe("demo port: per-component invariants", () => {
  for (const demo of DEMOS) {
    describe(demo.file, () => {
      const src = readFileSync(componentPath(demo.file), "utf8");

      it("mounts exactly one guarded inline IIFE", () => {
        expect((src.match(/<script is:inline>/g) ?? []).length).toBe(1);
        expect(src).toContain('matchMedia("(prefers-reduced-motion: reduce)")');
        expect(src).toContain("try {");
        expect(src).toContain("catch (e)");
        expect(src).toContain("console.warn('lamnda-demo'");
      });

      it("scopes to its own data-demo root and carries the sample-data note", () => {
        expect(src).toContain(`data-demo="${demo.dataDemo}"`);
        expect(src).toContain(demo.sampleNote);
      });

      it("is zero-cost static: no fetch, no remote http(s) URLs", () => {
        expect(src).not.toContain("fetch(");
        expect(src).not.toMatch(/https?:\/\//);
      });

      it("does not leak old palette hexes outside --demo-*/--pd-* var lines", () => {
        const bad = violationsForOldHexes(src);
        expect(bad, `Old hexes found in: ${bad.join(" | ")}`).toEqual([]);
      });

      it("keeps theme coupling tokenized (html[data-theme=light] overrides, no legacy dark block)", () => {
        // Comments may document the dropped legacy dark block; scan effective CSS/JS only.
        const effective = src.replace(/\/\*[\s\S]*?\*\//g, "");
        expect(src).toContain('html[data-theme="light"]');
        expect(effective, "legacy dark-theme block must be absent (always tokenized)").not.toContain(
          '[data-theme="dark"]'
        );
        // Old-hex gate already covers raw palette leakage anywhere in effective source.
      });

      it("has no role=img, no old CTAs, no old index.html links", () => {
        expect(src).not.toContain('role="img"');
        expect(src).not.toContain("Quiero algo así");
        expect(src).not.toContain("Ver servicios");
        expect(src).not.toContain("index.html");
      });

      it("keeps hook ids verbatim for the e2e ledger", () => {
        const hooks: Record<string, string[]> = {
          "DemoLeadScoring.astro": ["#sortDir", "id=\"scoreTable\""],
          "DemoMarketingBots.astro": ["#chatPlay", 'id="leadText"'],
          "DemoNotificaciones.astro": ['data-filter="soporte"'],
          "DemoBotsCrm.astro": ['id="crmFilter"', 'id="crmVisible"', 'id="crmBoard"'],
          "DemoTeleAgentes.astro": ['id="voiceSimulate"'],
          "DemoDocumentos.astro": ['id="generateBtn"', 'id="facturaBox"', "PED-301"],
          "DemoDashboards.astro": ['id="pdTitle"'],
        };
        for (const hook of hooks[demo.file]) {
          expect(src, `${demo.file} missing hook ${hook}`).toContain(hook);
        }
      });
    });
  }
});

describe("demo port: directed content requirements", () => {
  it("DemoDocumentos carries the verbatim contact block", () => {
    const src = readFileSync(componentPath("DemoDocumentos.astro"), "utf8");
    for (const contact of [
      "NIT 902015091-8",
      "+57 320 890 9792",
      "operaciones@lamnda.com",
      "Cra. 90 Bis #75-78 Bogotá",
    ]) {
      expect(src, `missing contact ${contact}`).toContain(contact);
    }
  });

  it("DemoBotsCrm renders exactly 6 CRM chips (old source had 6, not the 7 claimed upstream)", () => {
    const src = readFileSync(componentPath("DemoBotsCrm.astro"), "utf8");
    expect((src.match(/class="example-channel-item"/g) ?? []).length).toBe(6);
    for (const chip of ["HubSpot", "Salesforce", "Zoho", "Pipedrive", "Freshsales", "Monday CRM"]) {
      expect(src).toContain(chip);
    }
  });

  it("DemoNotificaciones renders exactly 8 channel chips (old source verbatim)", () => {
    const src = readFileSync(componentPath("DemoNotificaciones.astro"), "utf8");
    expect((src.match(/class="example-channel-item"/g) ?? []).length).toBe(8);
  });

  it("services page: 7 imports wired, notif residue zero, agendamiento mock intact", () => {
    const page = readFileSync(join(__dirname, "../src/pages/servicios/[slug].astro"), "utf8");
    for (const demo of DEMOS) {
      expect(page, `missing import ${demo.file}`).toContain(`${demo.file.replace(".astro", "")} from`);
    }
    expect(page).not.toContain("isNotif");
    expect(page).not.toContain("data-filter");
    expect(page).not.toContain("notif-mock");
    // Unit kept: agendamiento mock still illustrative with its role=img.
    expect(page).toContain("Mock ilustrativo — sin datos reales");
    expect((page.match(/role="img"/g) ?? []).length).toBe(1);
    // No tabs-filter fallback script left; no is:inline outside components.
    expect((page.match(/<script is:inline>/g) ?? []).length).toBe(0);
  });

  it("tokens.css stays untouched by demo vars", () => {
    const css = readFileSync(join(__dirname, "../src/styles/tokens.css"), "utf8");
    expect(css).not.toContain("--demo-");
    expect(css).not.toContain("--pd-");
  });
});

describe("demo port: status color AA (both themes)", () => {
  it("dark status vars >= 4.5:1 on card/surface (text role; automatically >= 3:1 for indicators)", () => {
    for (const [name, fg] of [
      ["--demo-ok", "#4ade80"],
      ["--demo-warn", "#fbbf24"],
      ["--demo-danger", "#f87171"],
    ] as const) {
      for (const bg of ["#0f2038", "#12233d"]) {
        expect(contrast(fg, bg), `dark ${name} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("light status vars >= 4.5:1 on card/surface (text role; automatically >= 3:1 for indicators)", () => {
    for (const [name, fg] of [
      ["--demo-ok", "#15803d"],
      ["--demo-warn", "#b45309"],
      ["--demo-danger", "#b91c1c"],
    ] as const) {
      for (const bg of ["#ffffff", "#f3f6fb"]) {
        expect(contrast(fg, bg), `light ${name} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
