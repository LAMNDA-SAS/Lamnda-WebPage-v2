# Design: Lamnda Visual Spectacular v2

## Technical Approach

Scale the proven merged-geometry pattern (no shaders, no EffectComposer): dense fibers + halo copy + sprite dust + starfield in `hopf-scene.ts`, full-bleed overlay hero in `index.astro`/`HopfHero.astro`, `renderOnce()` API for reduced-motion, Sharp beauty poster sharing camera constants with the scene, vanilla `reveal.ts` for scroll/magnetic/header motion, transparent-shield logo wiring. Directly implements proposal approach and `hero-hopf` / `hero-motion` / `site-structure` / `theme-i18n` specs.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Layered additive (core+halo+dust+starfield) vs ShaderMaterial vs UnrealBloom | Shader: most control, GLSL upkeep; Bloom: +80–150KB, breaks hero budget, halves mobile fps | Layered additive: 4 draws desktop / 3 mobile, deterministic, no deps |
| 260/120/64 fibers × 96 segs (was 48/24 × 128) | 49.9k line verts in 1 draw; halo ~1.2MB GPU (OK); mobile fill-rate risk | 260 desktop / 120 mobile / 64 reduced-motion; mobile drops halo |
| Sharp procedural poster + optional Playwright capture vs capture-only | Capture pixel-perfect but needs GPU CI + fixed seed | Ship Sharp now (deterministic CI); `capture-poster.mjs` for release refresh |
| Single-frame beauty + 1 frame/pointermove vs poster-only vs slow drift | Drift violates WCAG 2.3.3; poster-only diverges from scene | Single frame, zero rAF at rest, input-only frames, banner deleted |
| Vanilla IO+CSS (~2KB) vs GSAP | GSAP +70KB gzip, CDN blocking risk | Vanilla `reveal.ts`, transform/opacity only, motion-gated |
| Transparent shield + text wordmark vs white-bg lockup chip | Lockup exact but white box on dark hero | Shield ≤32px + Space Grotesk wordmark; Sharp-generated favicons |

Single source of truth: `HOPF_SCALE=0.62, CAM_Z=3.4, GROUP_X=0.9` exported from `hopf-scene.ts`, imported by `generate-poster.mjs` and `capture-poster.mjs`.

## Data Flow

`fiberBaseDirections` (Fibonacci) → `buildFiberLinePositions`/`buildDustPositions` (pure math, once) → merged `BufferGeometry` ×4 objects → `renderer.render`. Poster: same constants → Sharp SVG ellipses + blur halo + dust → WebP. Motion: IO/scroll/pointer events → `transform`/`opacity` only (no layout).

### Sequence: load (poster-first, zero CLS)

```
Browser → Base.astro: preload poster, paint <img fetchpriority=high>
  → IO visible + requestIdleCallback → dynamic import(three)
  → createHopfScene → first frame → canvas unhide, poster opacity 0
```

### Sequence: reduced-motion interaction (zero rAF at rest)

```
matchMedia(reduce) → createHopfScene → renderOnce() → rAF stopped
  → pointermove → renderOnce() (one input-driven frame, no timers)
  → status <p> stays empty unless genuine failure
```

## Token / Glow Table

| Token | Value | Use |
|---|---|---|
| Core gradient | `#EAF1FB` center → `#2E8CFF` edge, opacity 0.85 | Vertex colors, `LineBasicMaterial` additive |
| Halo copy | Same positions, scale 1.04×, opacity 0.18 | Fake bloom (desktop only) |
| Fiber dust | Canvas radial sprite, size ~0.035, vertex colors | `Points`, additive |
| Starfield | 600 pts shell, size 0.015, opacity 0.5 | Static ambient `Points` |
| Poster | 1600×1000 WebP q~70, `<100KB`, blur halo + ~400 dust dots | Pre-hydration LCP + OG image |
| Reveal | `24px → 0`, 0.7s, transform/opacity | `data-reveal` IO, once |
| Parallax / magnetic | Copy `scrollY×0.12` fade by 60vh; CTA pull ≤6px, rAF-throttled | Fine-pointer + no-reduced-motion only |

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/hopf-scene.ts` | Modify | Counts 260/120/64×96, vertex gradient, halo, sprite dust, starfield, `renderOnce()`, shared camera constants, adaptive DPR (floor 1) |
| `src/lib/reveal.ts` | Create | IO reveals, hero scroll parallax, magnetic CTAs, header `.scrolled` — all motion-gated |
| `src/components/HopfHero.astro` | Modify | Full-bleed CSS, no-banner reduced-motion path (single frame + pointer frames), idle+visible hydrate, failure-only status |
| `src/pages/index.astro` | Modify | Overlay hero section, `data-reveal`/`data-magnetic` hooks; keep `HERO_HEADLINE` EN pin |
| `src/components/Header.astro` | Modify | Shield `<img>` 32px + wordmark, `.scrolled` style, dark-only drop-shadow glow |
| `src/components/Footer.astro` | Modify | 24px shield mark, keep tagline |
| `src/layouts/Base.astro` | Modify | Favicon/apple-touch/SVG links, `theme-color`, OG → beauty poster |
| `src/styles/tokens.css` | Modify | Reveal/parallax/magnetic classes + reduced-motion guards, hero tokens |
| `public/hero-poster.webp` | Modify | Regenerated dense beauty poster via Sharp |
| `public/logos/*`, `public/favicon-*` | Create | Copied shield + Sharp-resized favicon set (white-bg lockup never shipped) |
| `scripts/generate-poster.mjs` | Modify | Dense torus + blur halo + dust, shared constants, `<100KB` assert |
| `scripts/capture-poster.mjs` | Create | Optional Playwright fixed-angle WebGL capture → Sharp compress |

## Interfaces / Contracts

```ts
export const HOPF_SCALE = 0.62, CAM_Z = 3.4, GROUP_X = 0.9;
export const DESKTOP_FIBER_COUNT = 260, MOBILE_FIBER_COUNT = 120, RM_FIBER_COUNT = 64;
export interface HopfSceneHandle { dispose(): void; setPaused(p: boolean): void; renderOnce(): void; }
// reveal.ts: initReveals(), initHeroParallax(), initMagnetic(), initHeaderState() — each no-ops under reduced-motion.
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit (`hopf.test.ts`) | Counts 260/120/64×96, buffer sizes, draws 4/3, DPR clamp | Vitest asserts on constants + builders |
| Integration | `renderOnce()` single frame, IO pause, poster `<100KB` | Vitest + Sharp size assert in script |
| E2E (`site.spec.ts`) | Full-bleed composition, no banner + zero rAF at rest under reduced-motion, 1 frame/pointermove, EN headline pin, logo/favicon, no overflow | Playwright: reduced-motion context asserts canvas visible + rAF spy idle; update freeze-to-poster test |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary in runtime. Playwright capture is dev-time-only, never ships to the client.

## Migration / Rollout

No migration. `PUBLIC_HOPF_ENABLED=false` reverts to poster-only hero; else revert the single change commit (scene, hero, poster regenerate deterministically via `generate-poster.mjs`).

## Open Questions

- [ ] Verify-time ruling: measure `dist/` async three chunk gzip — confirm exempt (LCP-safe) or trim imports.
