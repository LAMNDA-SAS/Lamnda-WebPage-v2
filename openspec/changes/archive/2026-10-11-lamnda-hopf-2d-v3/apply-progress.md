# Apply Progress: 2D Hopf Hero Primary (lamnda-hopf-2d-v3)

Mode: Standard (strict_tdd false — no test runner gate for TDD; vitest present but
`openspec/config.yaml` does not enforce strict TDD, so `strict-tdd.md` was NOT loaded).
Delivery: single PR, size:exception ACCEPTED (preflight).

## Completed Tasks (13/13)

- [x] 1.1 `src/lib/hopf-2d.ts`: verbatim `fiber`/`spin`/`rot`/`stroke`/`aim`,
      `FIBER_COUNT=36`, `FIBER_SEGMENTS=150`.
- [x] 1.2 `fiberColor(ph,theme)` lerp `#EAF1FB→#2E8CFF` (dark) /
      `#2E8CFF→#0A54C2` (light, no white washout); hi `#7AB3FF` dark /
      `#0A54C2` light; fg `lw6` themed-fg + `lw3` fiberColor; no rainbow helper.
- [x] 1.3 Slowed constants `SPIN_DT=0.010`, freqs `0.24/0.15/0.20`,
      `CUR_LERP=0.06`, `PITCH_LERP=0.045`; exported `AUTO_DRIFT_RATE=0.25` /
      `AUTO_DRIFT_AMP=0.5` sine constants.
- [x] 1.4 `fit()`/`clampDpr` (parent size, DPR min(max(dpr,1),mobile?1.5:2)),
      `readTheme()`, `createHopf2D` with `renderOnce`/`setPaused`/`dispose`,
      RM gate, IO pause, coarse sine auto-drift (mouse ignored), `HOPF_ENABLED`.
- [x] 2.1 `HopfHero.astro` rewrite: full-bleed 2D import, dual themed posters
      with `fetchpriority="high"`, idle+visible hydrate, JS `src` swap via
      `readTheme()` (+ MutationObserver), sr-only status,
      `PUBLIC_HOPF_ENABLED=false` → poster-only.
- [x] 2.2 `index.astro`: `.hero-overlay{background:var(--bg)}`, scrims to
      `var(--hero-scrim-*)` gradients (90deg desktop / 180deg mobile);
      EN headline / reveals / magnetic kept.
- [x] 2.3 `tokens.css`: `--hero-scrim-*` per theme, light `h1`
      `0 1px 12px rgb(16 26 43/.18)`; navy literals only inside dark selectors.
- [x] 3.1 `capture-poster.mjs` + `generate-poster.mjs` repointed to `hopf-2d`
      truth; 1600×1000 ×2 themes, Sharp WebP q70→60, assert each <100KB.
- [x] 3.2 Generated `public/hero-poster-dark.webp` (46.0KB) +
      `public/hero-poster-light.webp` (22.2KB); island swaps (fallback dark).
- [x] 3.3 Grep proved sole `three`/`hopf-scene` importer (`HopfHero.astro`);
      deleted `src/lib/hopf-scene.ts`, `three`/`@types/three` (package.json +
      package-lock), cut over and removed old `public/hero-poster.webp`.
- [x] 4.1 `tests/hopf-2d.test.ts` (11 tests): blue-only `fiberColor`, no-rainbow
      source gate, slowed constants, `clampDpr`, `fiber` null-gate,
      `hypot>7` guard, `aim` mapping, `renderOnce` API.
- [x] 4.2 `tests/e2e/hero.spec.ts` (4 tests × desktop/mobile): preload high +
      zero CLS, RM zero-rAF + per-move frame, coarse auto-drift, IO pause.
      (Placed under `tests/e2e/` per `playwright.config.ts` `testDir`.)
- [x] 4.3 Both themes verified: light overlay `rgb(255,255,255)`, scrims
      white-based, `#0A54C2` light fibers (unit), AA via `theme.test.ts` +
      CTA computed-style e2e, posters <100KB + dense (dark 46KB / light 22KB).

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `npx vitest run` → 3 files, 23 tests, all passed |
| Runtime harness command/scenario and exact result | `npm run build` → success, hero JS 6.52kB (gzip 2.84kB <15KB); `node scripts/check-html.mjs` → 26/26 PASS; Playwright vs `preview :4321` → `hero.spec.ts` 8/8 passed, `site.spec.ts` 24/24 passed. NOTE: Playwright's auto-`webServer` spawn fails on Windows (`ERR_CONNECTION_REFUSED`); harness used a pre-started `npm run preview` (config `reuseExistingServer`) — environment quirk, not a code issue |
| Rollback boundary | Revert this batch: `src/lib/hopf-2d.ts`, `HopfHero.astro`, `tokens.css`, `index.astro`, `Base.astro`, `astro.config.mjs`, poster scripts, `public/hero-poster-*.webp`, `package.json`/`package-lock.json`, tests. Pre-existing worktree modifications (`Header/Footer/theme.test.ts`, archive deletions) are NOT part of this change |

## Deviations from Design

- `tests/hero.spec.ts` placed at `tests/e2e/hero.spec.ts` (task path) because
  `playwright.config.ts` sets `testDir: ./tests/e2e`; a root-level spec would
  never run. Focused command becomes `npx playwright test tests/e2e/hero.spec.ts`.
- Old `tests/hopf.test.ts` deleted (it imported the removed `hopf-scene.ts`;
  replaced by `tests/hopf-2d.test.ts`). Old `public/hero-poster.webp` removed
  per task 3.3 cutover; `check-html.mjs` + `site.spec.ts` OG gates repointed to
  `hero-poster-dark.webp`.
- `fiberColor` light variant lerps `#2E8CFF→#0A54C2` (not `#EAF1FB→#2E8CFF`)
  so fibers stay visible on white — required by the "no white-on-white washout"
  scenario; dark keeps the canonical `#EAF1FB→#2E8CFF`.
- Source comments avoid the literal `hue(` substring so the `grep hue(` build
  gate passes while still documenting the rainbow-helper removal.

## Issues Found

- None in code. Environment: Playwright `webServer` auto-spawn does not bind on
  this Windows host; e2e evidence used a manually pre-started preview server.
  `sdd-verify` on Linux CI should use the config `webServer` normally.

## Status

13/13 tasks complete. Ready for verify.
