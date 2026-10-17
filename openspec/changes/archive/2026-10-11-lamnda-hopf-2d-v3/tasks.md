# Tasks: 2D Hopf Hero Primary

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~650–800 (incl. -511 scene deletion) |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | Single PR (exception approved) |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | 2D lib + island + tokens | PR 1 (single) | `npx vitest run tests/hopf-2d.test.ts` | `npm run dev` hero both themes | `src/lib/hopf-2d.ts`, `HopfHero.astro`, tokens |
| 2 | Posters + three removal + gates | PR 1 (single) | `npx playwright test tests/hero.spec.ts` | `npm run preview` with `PUBLIC_HOPF_ENABLED=false` poster-only | `public/hero-poster-*.webp`, `hopf-scene.ts`, `package.json` |

## Phase 1: Core 2D library

- [x] 1.1 Create `src/lib/hopf-2d.ts`: verbatim `fiber`/`spin`/`rot`/`stroke`/`aim`, `FIBER_COUNT=36`, `FIBER_SEGMENTS=150`.
- [x] 1.2 Add `fiberColor(ph,theme)` lerp `#EAF1FB→#2E8CFF`, hi `#7AB3FF` dark / `#0A54C2` light; fg `lw6` themed-fg + `lw3` fiberColor; no `hue()`.
- [x] 1.3 Pin slowed constants `T+=0.010`, freqs `0.24/0.15/0.20`, `cur 0.06`, `pitch 0.045`; export `AUTO_DRIFT_RATE`/`AUTO_DRIFT_AMP` sine constants for testability.
- [x] 1.4 Add `fit()`/`clampDpr` (parent size, DPR min(max(dpr,1),mobile?1.5:2)), `readTheme()`, `createHopf2D` with `renderOnce`/`setPaused`/`dispose`, RM gate, IO pause, coarse auto-drift (sine `tg.th/ph`, mouse ignored), `HOPF_ENABLED` read.

## Phase 2: Island + light contract

- [x] 2.1 Rewrite `src/components/HopfHero.astro`: full-bleed 2D import, poster-first dual themed preload `fetchpriority="high"`, idle+visible hydrate, JS `src` swap via `readTheme()`, sr-only status, `PUBLIC_HOPF_ENABLED=false` → poster-only.
- [x] 2.2 Edit `src/pages/index.astro`: `.hero-overlay{background:var(--bg)}`, scrims to `var(--bg)` gradients (90deg desktop / 180deg mobile); keep EN/reveals/magnetic.
- [x] 2.3 Edit `src/styles/tokens.css`: add `--hero-scrim-*`, soften light `h1` to `0 1px 12px rgb(16 26 43/.18)`; remove navy literals outside dark selectors.

## Phase 3: Posters + Three removal

- [x] 3.1 Repoint `scripts/capture-poster.mjs` + `scripts/generate-poster.mjs` to `hopf-2d` truth; capture 1600×1000 ×2 themes, Sharp WebP q70→60, assert each <100KB.
- [x] 3.2 Generate `public/hero-poster-dark.webp` + `public/hero-poster-light.webp`; wire island swap (fallback dark); keep old `hero-poster.webp` until cutover.
- [x] 3.3 Grep `three`/`hopf-scene` importers to prove sole use, delete `src/lib/hopf-scene.ts` + `three`/`@types/three`, cutover then remove old `hero-poster.webp`.

## Phase 4: Tests + verification

- [x] 4.1 Vitest `tests/hopf-2d.test.ts`: blue-only `fiberColor`, `grep hue(` fails, slowed constants, `clampDpr`, `fiber` null-gate `d<0.07`/`hypot>7`.
- [x] 4.2 Playwright `tests/hero.spec.ts`: zero-rAF at rest + one `renderOnce`/move (RM), coarse auto-drift sine with mouse ignored, IO pause/resume, preload `fetchpriority=high` + zero CLS.
- [x] 4.3 Verify both themes: no navy computed in light, `#0A54C2` fibers, AA ≥4.5:1 body/CTA/hero, posters <100KB + resemble canvas (`stat` + pixel-sample).
