import { readFileSync } from "node:fs";

const s = readFileSync("dist/index.html", "utf8");
const checks = {
  "html non-empty": s.length > 5000,
  "preload poster": s.includes('rel="preload"') && s.includes("/hero-poster-dark.webp"),
  "poster light variant": s.includes("/hero-poster-light.webp"),
  "poster fixed size": s.includes('width="1600"') && s.includes('height="1000"'),
  "poster fetchpriority": s.includes('fetchpriority="high"'),
  "dark default": s.includes('data-theme="dark"'),
  "hero EN headline": s.includes("Complex problems. Elegant solutions."),
  "CTA hero": s.includes("Explore our solutions"),
  "footer tag": s.includes("SCIENCE x TECHNOLOGY x IMPACT"),
  "demo CTA": s.includes("Solicita una demo"),
  "ally block": s.includes("Tu aliado en la transformaci"),
  "SEO title": s.includes("<title>") && s.includes("Lamnda"),
  "SEO canonical": s.includes('rel="canonical"'),
  "SEO og": s.includes("og:title") && s.includes("hero-poster-dark.webp"),
  "header shield logo": s.includes("/logos/lamnda-mark.png") && s.includes('alt="Lamnda"'),
  "favicon set": s.includes("/favicon-32.png") && s.includes("apple-touch-icon"),
  "overlay hero": s.includes("hero-overlay") && s.includes("data-hero-copy"),
  "reveal hooks": s.includes("data-reveal"),
  "magnetic hooks": s.includes("data-magnetic"),
  "section order": ["top", "pillars", "services", "vision", "contact"]
    .map((k) => s.indexOf(`id="${k}"`))
    .every((v, i, a) => v > 0 && (i === 0 || v > a[i - 1])),
  "4 full cards": (s.match(/card-full/g) || []).length >= 4,
  "3 summary cards": (s.match(/card-summary/g) || []).length >= 3,
  "dashboard mock svg": s.includes("dashboard-mock") && s.includes("<svg"),
  "TBD placeholders": s.includes("TBD"),
  "no CLS canvas hidden": s.includes("data-hopf-canvas"),
};

let fail = 0;
for (const [k, v] of Object.entries(checks)) {
  console.log(v ? "PASS" : "FAIL", "-", k);
  if (!v) fail++;
}
console.log(`html bytes: ${s.length}`);
process.exit(fail ? 1 : 0);
