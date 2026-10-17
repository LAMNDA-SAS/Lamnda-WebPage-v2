# Apply Progress: lamnda-visual-spectacular-v2

Mode: Standard (strict_tdd false — no test runner gate for TDD; Vitest present but
`openspec/config.yaml` does not enforce strict TDD, so `strict-tdd.md` was NOT loaded).
Delivery: single PR, size:exception ACCEPTED (preflight: user pre-approved no-limit;
forecast 550–700 lines High risk; proceeded FULL scope, not sliced).

## Completed Tasks (22/22)

### Phase 1: Brand + Shell
- [x] 1.1 Copied transparent shield `Logos/` → `public/logos/lamnda-mark.png` (400×400, alpha); white-bg lockup NEVER shipped to `public/`.
- [x] 1.2 `Header.astro`: 32px shield `alt="Lamnda"` + text wordmark (`--text`), `data-site-header`, `.scrolled` style, dark-only drop-shadow glow.
- [x] 1.3 `Footer.astro`: 24px shield + tag `SCIENCE x TECHNOLOGY x IMPACT`, contact links.
- [x] 1.4 `Base.astro`: favicon-32/16 + SVG fallback + apple-touch-icon + `theme-color #0A1628`; OG/Twitter image → beauty `hero-poster.webp`; preload `fetchpriority=high`.
- [x] 1.5 `index.astro`: full-bleed overlay hero (`hero-overlay` + `hero-bg` + `data-hero-copy`), `data-reveal` on pillars/services/vision/contact, `data-magnetic` on CTAs; `HERO_HEADLINE` EN pin + do-not-translate markers kept.
- [x] 1.6 `tokens.css`: hero/reveal/parallax/magnetic classes + dark glow + reduced-motion guards; `overflow-x: clip` on body.

### Phase 2: Scene + Poster
- [x] 2.1 `hopf-scene.ts` exports `HOPF_SCALE=0.62, CAM_Z=3.4, GROUP_X=0.9`; counts 260/120/64, 96 segs.
- [x] 2.2 Merged core fibers 260/120/64×96 with per-vertex gradient `#EAF1FB`→`#2E8CFF`, opacity 0.85 (`buildFiberLineColors`).
- [x] 2.3 Halo 1.04×/0.18 desktop-only, sprite dust 0.035 with radial texture + vertex colors, 600-pt deterministic starfield 0.015/0.5.
- [x] 2.4 DPR clamp 1.5/2 floor 1 (`DPR_FLOOR`); `getDrawCalls()` 4 desktop / 3 mobile (halo dropped on mobile).
- [x] 2.5 `generate-poster.mjs` reworked: 220-ring dense torus + Screen-composited blur halo + 400 dust + 150 stars, shared constants, asserts <100KB (retry q60).
- [x] 2.6 `capture-poster.mjs` created: Playwright fixed-viewport WebGL canvas capture → Sharp WebP (dev-only, never ships).
- [x] 2.7 `public/hero-poster.webp` regenerated 1600×1000, 43.5KB; poster `width/height` 1600/1000 + `fetchpriority=high` in `HopfHero.astro`.

### Phase 3: Hero + Motion
- [x] 3.1 `HopfSceneHandle.renderOnce()` + `setPaused()` added; reduced-motion path renders one frame and starts NO rAF (zero rAF at rest).
- [x] 3.2 `HopfHero.astro` reworked: reduced-motion hydrates single frame + 1 frame/pointermove (input-only, no timers); visible banner DELETED; status is `sr-only` + empty unless genuine failure; full-bleed absolute CSS.
- [x] 3.3 Poster-first hydrate kept: idle+visible IO, dynamic `three` import, canvas `hidden` until first frame (zero CLS). Hero JS ruling noted in file comment (async three exempt from sync <15KB budget).
- [x] 3.4 `src/lib/reveal.ts` created: `initReveals()` IO (0.12 threshold, once), `initHeroParallax()` scrollY×0.12 fade by 60vh; both no-op under reduced-motion. Wired via bundled page script (Astro inlines as `script type=module`).
- [x] 3.5 `initMagnetic()` ≤6px rAF-throttled fine-pointer only + `initHeaderState()` >24px `.scrolled` (class toggle, works all modes).

### Phase 4: Tests + Gates
- [x] 4.1 `tests/hopf.test.ts`: counts 260/120/64×96, colors layout, dust+colors, starfield determinism, draws 4/3, DPR clamp+floor, `renderOnce`/`setPaused` API presence — 10/10 pass.
- [x] 4.2 `tests/e2e/site.spec.ts`: full-bleed overlay, brand/logo/favicon, reduced-motion single-frame + zero-rAF spy + sr-only empty + pointer frames, EN pin, overflow, AA, OG-beauty — 12×2 projects = 24/24 pass.
- [x] 4.3 `tests/poster.test.ts` (new): exists, <100KB, 1600×1000 WebP, dense (>15KB floor vs old 9.7KB sparse) — 2/2 pass. Old freeze-to-poster e2e replaced by single-frame test.
- [x] 4.4 Build verified: island sync JS 7.86KB raw / 3.38KB gzip (<15KB ✓); async three chunk 688KB / 177KB gzip recorded EXEMPT (dynamic import, LCP from poster); `PUBLIC_HOPF_ENABLED=false` poster-only path retained; `check-html.mjs` 25/25 PASS.

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npm test` → 3 files, 20/20 pass (hopf 10, poster 2, theme 8) |
| Focused test command and exact result | `npx playwright test` → 24/24 pass (desktop 12 + mobile 12) |
| Focused test command and exact result | `node scripts/check-html.mjs` → 25/25 PASS, html 18963 bytes |
| Runtime harness command/scenario and exact result | `npm run build` → success; `preview` serves e2e (Playwright webServer); reduced-motion live page shows WebGL canvas + 0 rAF over 1.2s |
| Rollback boundary | `PUBLIC_HOPF_ENABLED=false` → poster-only hero (no WebGL). Files: `src/lib/hopf-scene.ts`, `src/components/HopfHero.astro`, `src/lib/reveal.ts`, `src/pages/index.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/layouts/Base.astro`, `src/styles/tokens.css`, `scripts/generate-poster.mjs`, `scripts/capture-poster.mjs`, `public/hero-poster.webp`, `public/logos/*`, `public/favicon-*`, `tests/*`, `scripts/check-html.mjs`, `package.json` (capture:poster script). Revert single commit; poster regenerates via `npm run generate:poster`. |

## Deviations from Design
None — implementation matches design. Notes:
- Reveal/magnetic script is bundled by Astro as an inlined `script type=module` in `dist/index.html` (not a separate chunk); sync JS total stays ≈5KB gzip, well under 15KB.
- `getFiberCount(isMobile, reducedMotion=false)` gained an optional second param (backward compatible).
- `DRAW_CALLS` kept (=4 desktop default) plus `DESKTOP_DRAW_CALLS`/`MOBILE_DRAW_CALLS` + `getDrawCalls()` for the 4/3 split.
- e2e sr-only assertion uses 1px bounding-box (Playwright reports sr-only nodes as "visible", so `toBeHidden()` is the wrong assertion for clipped content).

## Issues Found
- `package.json` trailing comma from script edit broke `npm` parse — fixed immediately.
- Gradient unit-test expectation inverted (first vertex is fiber-end blue, not core white) — fixed to assert end-blue + middle-white.
- Playwright `toBeHidden()` fails on `sr-only` clipped nodes — switched to empty-text + ≤1px box assertion.

## Status
22/22 tasks complete. Ready for verify.
