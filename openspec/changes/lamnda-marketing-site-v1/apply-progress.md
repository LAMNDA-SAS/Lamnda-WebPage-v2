# Apply Progress: Lamnda Marketing Site v1

**Mode**: Standard (strict_tdd false — no TDD module loaded)
**Scope**: ALL tasks (Phase 1–4, 18/18 complete)
**Date**: 2026-10-10
**Delivery**: single PR, size:exception accepted (unlimited review budget, greenfield initial build)

## Completed Tasks

- [x] 1.1 `git init` + `.gitignore` + initial commit
- [x] 1.2 `astro.config.mjs` (static), `package.json` (three), `tsconfig.json`, `README.md`
- [x] 1.3 `src/styles/tokens.css` — locked pairs `--primary-text #7AB3FF` (dark) / `#0A54C2` (light)
- [x] 1.4 `src/layouts/Base.astro` — SEO shell + head anti-FOUC
- [x] 1.5 Vitest + Playwright configs + `tests/` scaffolding
- [x] 2.1 `src/content/config.ts` — Zod `service/pillar/vision/mission` schemas
- [x] 2.2 7 service `.md` (4 full + 3 summary), 3 pillars, TBD `vision/` + `mission/`
- [x] 2.3 `Header.astro`, `Footer.astro` (`SCIENCE x TECHNOLOGY x IMPACT`), `index.astro` hero→pillars→services→vision→contact
- [x] 2.4 Full/summary cards, CSS/SVG mock dashboard, `Solicita una demo` → `#contact`
- [x] 2.5 Theme toggle (`data-theme` + `localStorage`), SEO title/description/og/canonical
- [x] 2.6 EN headline pinned with `/* EN exception: do not translate */`
- [x] 3.1 `HopfHero.astro` + `public/hero-poster.webp` (9.6KB, `fetchpriority=high`, 1200×800, no CLS)
- [x] 3.2 `src/lib/hopf-scene.ts` — 48/24×128 fibers, 2 draw calls, DPR clamp 1.5–2
- [x] 3.3 Damped parallax (fine-pointer) + auto-rotate-only mobile (`max-width:768px`)
- [x] 3.4 `IntersectionObserver` pause + reduced-motion freeze + `PUBLIC_HOPF_ENABLED=false` flag
- [x] 4.1 Vitest: `tests/hopf.test.ts` (6), `tests/theme.test.ts` (5)
- [x] 4.2 Playwright: `tests/e2e/site.spec.ts` (9 tests × desktop/mobile)
- [x] 4.3 Verify gates (see evidence table)

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `npx vitest run` — 2 files, 11/11 passed |
| E2E command and exact result | `npx playwright test` — 18/18 passed (desktop + mobile) |
| Static HTML checks | `node scripts/check-html.mjs` — 20/20 PASS (order, cards, SEO, poster attrs, TBD) |
| Runtime harness | `npm run preview` + `npm run dev` load `/` — page renders, hero hydrates on idle+visible |
| Rollback boundary | Revert initial commit(s); hero escape hatch `PUBLIC_HOPF_ENABLED=false` → poster-only |

## Verify Gates (measured)

| Gate | Budget | Measured | Status |
|---|---|---|---|
| Poster size | <100KB | 9,782 B (`public/hero-poster.webp`) | PASS |
| Hero JS gzip | <200KB | 177.02 kB (three chunk) + 2.59 kB (island) = ~179.6 kB | PASS |
| AA dark `#7AB3FF` on `#0A1628` | ≥4.5:1 | ~7.0:1 (vitest computed) | PASS |
| AA light `#0A54C2` on white | ≥4.5:1 | ~7.5:1 (vitest computed) | PASS |
| LCP poster-first | preload + fixed size, canvas hidden | `rel=preload` + `fetchpriority=high` + 1200×800 + `hidden` canvas | PASS |
| Draw calls | <30 | 2 (1 LineSegments + 1 Points, by construction + unit assert) | PASS |
| DPR clamp | 1.5–2 | `clampDpr` unit-tested (mobile 1.5 / desktop 2) | PASS |

## Deviations from Design

1. **Astro 4 → Astro 5** (`astro@5.18.2`, Vite 6 for the Astro pipeline).
   Why: `astro@4.16.19` + Vite 5.4.21 cannot build ANY `client:` hydrated component —
   the `\0astro-entry:` virtual id is fed to `transformWithEsbuild` → tsconfck `find()`
   rejects the null-byte path (`ERR_INVALID_ARG_VALUE` ≠ `ENOENT`) and the client build
   fails. Verified the failure is in the toolchain (not project code); downgrading the
   transitive `tsconfck` cannot help (Vite bundles its own copy; 3.0.x is equally strict).
   Astro 5 builds clean. No spec impact.
2. **`client:idle` directive dropped** (`<HopfHero />` instead of `<HopfHero client:idle />`).
   Why: `client:` directives only apply to framework components; Astro components are
   server-only (Astro 5 errors on this). The lazy-hydration contract is preserved by the
   component's own bundled script: poster paints first → hydrate on idle+visible via
   dynamic `import("three")` (code-split chunk, no LCP cost). All hero-hopf scenarios
   (poster-first, parallax, mobile fallback, pause, motion-freeze, flag) implemented as designed.
3. **Pillar schema field `slug` → `key`**.
   Why: Astro reserves `slug` in collection schemas (`ContentSchemaContainsSlugError`).
   Same enum values, same behavior; `data-pillar` attributes unchanged.
4. **Theme default is unconditionally dark** (dropped `prefers-color-scheme` fallback).
   Why: theme-i18n spec scenario requires first-time visitors to get `data-theme="dark"`.
   Headless-Chromium (light OS scheme) exposed the conflict; spec wins over proposal text.
   Toggle + `localStorage` persistence unchanged.

## Issues Found

- Mobile 390px horizontal overflow (110px): `hopf-hero` `min-height:320px` + `aspect-ratio:3/2`
  forced 480px min-width, blowing out the hero grid. Fixed with `min-width:0` on grid
  children + responsive `aspect-ratio:4/3`, `min-height:0` ≤900px. E2E asserts zero overflow.
- `foto lamnda web/` reference PNGs left untouched in place (OneDrive space-path quoted
  everywhere; no bloat added to the build).

## Remaining Tasks

None — 18/18 complete. Ready for verify.

## Workload / PR Boundary

- Mode: single PR, size:exception (unlimited review budget accepted)
- Work units from tasks.md implemented in one run (scaffold / content+sections / hero island / e2e+verify)
- Estimated review budget impact: ~1600–2200 lines greenfield (single initial commit); rollback = revert commit or poster-only flag
