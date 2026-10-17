# Proposal: Lamnda Visual Spectacular v2

## Intent

Match the reference hero (full-viewport dark scene, dense torus right, copy overlaid left) and fix the ugly paused/poster fallback so every state looks stunning.

## Scope

### In Scope
- Full-bleed hero: canvas fills viewport, torus ~50% right (`scale ~0.62`, `camera z ~3.4`, `x +0.9`), copy overlaid left.
- Dense fibers: 260 desktop / 120 mobile / 64 reduced-motion x 96 segments; vertex gradient (`#EAF1FB`→`#2E8CFF`), halo layer, sprite dust, 600-pt starfield (4 draws).
- Beauty poster pipeline: Sharp procedural dense torus + blur halo (`1600x1000`, WebP `<100KB`) + optional Playwright capture script.
- Reduced-motion: single WebGL frame + one frame per pointermove; DELETE visible "en pausa" banner (sr-only failure text only).
- Vanilla motion: `data-reveal` IO reveals, hero scroll parallax, magnetic CTAs, header `.scrolled`.
- Real brand: transparent shield in header (32px) / footer (24px), favicon set, OG update; request SVG master later.

### Out of Scope
- UnrealBloomPass / EffectComposer postprocessing.
- Backend, CMS, analytics, or real dashboards.
- Full EN translation; hero EN strings only.
- GSAP or any animation library.

## Capabilities

### New Capabilities
- `hero-motion`: scroll reveals, hero scroll-parallax, magnetic CTAs, header scroll state (all motion-gated).

### Modified Capabilities
- `hero-hopf`: full-bleed layout, dense counts, 4-draw budget, single-frame reduced-motion, beauty poster.
- `site-structure`: logo/favicons/OG asset wiring in header, footer, Base layout.

## Approach

Scale the proven merged-geometry pattern (no shaders, no bloom): share camera constants between `hopf-scene.ts` and `generate-poster.mjs`, add `renderOnce()` API, ship procedural poster now with capture script for release refresh.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/hopf-scene.ts` | Modified | Counts, gradient, halo, sprite, starfield, `renderOnce`, adaptive DPR |
| `src/components/HopfHero.astro` | Modified | Full-bleed, no-banner path, idle+visible hydrate |
| `src/pages/index.astro`, `src/lib/reveal.ts`, `tokens.css` | Modified | Overlay hero, reveals, parallax, magnetic |
| `Header/Footer/Base.astro`, `public/logos/*` | Modified | Shield logo, favicons, OG |
| `scripts/generate-poster.mjs`, `capture-poster.mjs` | New/Modified | Dense poster + optional capture |
| `openspec/specs/hero-hopf/spec.md` | Modified | Delta scenarios |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Three async chunk >200KB gzip | Med | Keep dynamic import; verify-time ruling (exempt async, LCP-safe) |
| Halo overdraw on mobile | Med | Drop halo on mobile; DPR floor 1, low-power |
| Poster/scene divergence | Low | Shared camera constants; capture script closes gap |
| Pointer frames read as autoplay | Low | Input-only frames, no timers; e2e asserts zero rAF at rest |

## Rollback Plan

`PUBLIC_HOPF_ENABLED=false` reverts to poster-only hero; else revert the single change commit (scene, hero, poster regenerate deterministically).

## Dependencies

- `Logos/` transparent shield source; brand SVG master (follow-up request).
- Playwright Chromium only for optional capture script.

## Success Criteria

- [ ] Hero matches reference composition on desktop; poster `<100KB`, zero CLS.
- [ ] Reduced-motion shows dense torus frame, no visible banner, zero rAF at rest.
- [ ] 4 draws desktop / 3 mobile; hero JS async, LCP from poster.
- [ ] Real logo/favicon live; no white-box logo on dark surfaces.
