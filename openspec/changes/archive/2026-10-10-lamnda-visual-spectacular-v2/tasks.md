# Tasks: Lamnda Visual Spectacular v2

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 550–700 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Single PR size:exception |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Brand shell: logos, header/footer/Base, hero CSS | PR 1 | `playwright test -g "logo\|favicon"` | `npm run dev`, dark hero, no white box | `public/logos/*`, `Header/Footer/Base.astro` |
| 2 | Dense scene + poster pipeline | PR 1 | `vitest run hopf; node scripts/generate-poster.mjs` | `build && preview`, torus right, poster <100KB | `hopf-scene.ts`, `scripts/*`, `hero-poster.webp` |
| 3 | Motion + tests + gates | PR 1 | `playwright test -g "zero rAF"` | `npm run dev` reduced-motion single frame | `HopfHero.astro`, `reveal.ts`, `tokens.css` |

## Phase 1: Brand + Shell

- [x] 1.1 Copy shield `Logos/` → `public/logos/`; never ship white-bg lockup
- [x] 1.2 Wire `Header.astro`: 32px shield `alt="Lamnda"` + wordmark, `.scrolled`
- [x] 1.3 Wire `Footer.astro`: 24px shield + tag, contact links
- [x] 1.4 Wire `Base.astro`: favicons, `theme-color`, OG → `hero-poster.webp`
- [x] 1.5 Overlay hero in `index.astro`; add `data-reveal`/`data-magnetic`, keep `HERO_HEADLINE` EN
- [x] 1.6 Add hero/reveal/parallax/magnetic classes + dark glow + motion guards to `tokens.css`

## Phase 2: Scene + Poster

- [x] 2.1 Export `HOPF_SCALE=0.62, CAM_Z=3.4, GROUP_X=0.9`, counts 260/120/64 in `hopf-scene.ts`
- [x] 2.2 Build merged fibers 260/120/64×96, gradient `#EAF1FB`→`#2E8CFF` 0.85
- [x] 2.3 Add halo 1.04×/0.18 (desktop-only), dust 0.035, 600-pt starfield
- [x] 2.4 Clamp DPR 1.5/2 floor 1; enforce 4 draws desktop / 3 mobile
- [x] 2.5 Rework `generate-poster.mjs`: dense torus + blur halo + dust, assert <100KB
- [x] 2.6 Create `capture-poster.mjs`: fixed-angle capture → Sharp compress (dev-only)
- [x] 2.7 Regenerate `public/hero-poster.webp` 1600×1000; preload `fetchpriority=high`

## Phase 3: Hero + Motion

- [x] 3.1 Add `renderOnce()` + `setPaused()` to `HopfSceneHandle`; stop rAF at rest
- [x] 3.2 Rework `HopfHero.astro`: single frame + 1 frame/pointermove, delete banner, sr-only status
- [x] 3.3 Keep poster-first hydrate: idle+visible, dynamic `three` import, zero CLS
- [x] 3.4 Create `reveal.ts`: `initReveals()` IO 24px→0/0.7s once; `initHeroParallax()` 0.12 fade 60vh
- [x] 3.5 Add `initMagnetic()` ≤6px rAF-throttled fine-pointer + `initHeaderState()` >24px

## Phase 4: Tests + Gates

- [x] 4.1 Vitest `hopf.test.ts`: counts, buffers, draws 4/3, DPR, `renderOnce`
- [x] 4.2 Playwright `site.spec.ts`: full-bleed, zero rAF, pointer frames, no banner, EN pin, logo, overflow
- [x] 4.3 Assert poster <100KB resemblance; update freeze-to-poster test
- [x] 4.4 Verify build: sync JS <15KB gzip, async three exempt, `PUBLIC_HOPF_ENABLED=false` rollback
