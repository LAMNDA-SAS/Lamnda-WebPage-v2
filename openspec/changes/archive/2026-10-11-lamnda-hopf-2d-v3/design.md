# Design: 2D Hopf Hero Primary

## Technical Approach

Verbatim port of `Fibración de Hopf (2).html` math into `src/lib/hopf-2d.ts` + thin `HopfHero.astro` island. Only deltas: `hue()` → `fiberColor(ph,theme)`, slowed constants (~35%), reduced-motion gate, `data-theme` observer, parent-sized DPR `fit()`. Light fix via tokens; poster via live-canvas capture; `three` deleted after importer check.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Verbatim port + thin island vs patch Three.js vs iframe | Patch keeps 600KB chunk + wrong projection (`1-z1r` vs `1-b·sin`); iframe loses theming/DPR/pause | **Port**: `fiber`/`spin`/`rot`/`stroke`/`aim` line-for-line, 36×150, no WebGL |
| `fiberColor(ph,theme)` lerp vs HSL `hue()` vs per-vertex gradient | `hue()` violates blue-only; vertex gradient needs WebGL attrs | **Lerp canonical hexes**: `#EAF1FB→#2E8CFF`, hi `#7AB3FF` dark / `#0A54C2` light; fg `lw6` themed-fg + `lw3` `fiberColor` |
| Slowed constants vs verbatim speed | Verbatim `T+=0.016`/freqs `0.37/0.23/0.31` too frantic for corporate hero | **Slow ~35%**: `T+=0.010`, freqs `0.24/0.15/0.20`, `a=n·0.010`, `cur 0.06`, `pitch 0.045`; keep `aim` mapping |
| One neutral vs two themed posters | One risks bleed in opposite theme; two doubles gen but one loads | **Two themed captures** (`hero-poster-dark/light.webp`, each <100KB), JS swaps by `readTheme()`; neutral fallback = dark |
| Delete `hopf-scene.ts`+`three` vs archive | Archive leaves dead 511-line file + dep weight | **Delete after `grep` proves sole importer**; repoint both poster scripts atomically |

## Data Flow

`pointer → aim(tg,tp) → frame(cur/pitch lerp → spin(M) → clear → 36×stroke) → canvas`
`data-theme mutation → readTheme() → fiberColor switch → next frame`
`IO/visibility → setPaused → rAF gate; RM → renderOnce only`
`coarse/no-fine → auto-drift (slow sine on tg.th/ph at prior mobile pace, mouse ignored) → cur/pitch`

```
pointer ──aim──→ tg/tp ──lerp(0.06/0.045)──→ cur/pitch ──spin(M)──→ rot+project ──→ stroke ──→ canvas
data-theme ──MutationObserver──→ theme ──→ fiberColor ──┘
IO ──→ paused ──→ rAF on/off          RM ──→ single frame + per-move renderOnce
```

Seq 1 — hydrate (poster-first, zero CLS):

```
poster preload + fetchpriority=high (1600×1000) → paint → IO visible + idle → import hopf-2d (sync <15KB)
→ fit() → renderOnce → showCanvas (opacity swap, absolute, fixed dims)
```

Seq 2 — reduced-motion:

```
matchMedia(reduce) → renderOnce ×1, zero rAF → pointermove → aim → renderOnce ×1
→ status sr-only (no banner, no timers)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/hopf-2d.ts` | Create | `fiber/spin/rot/stroke/aim`, `fiberColor`, `fit/clampDpr`, `createHopf2D`, `readTheme`, `HOPF_ENABLED` read, coarse auto-drift (slow sine tg.th/ph, mouse ignored), RM/IO |
| `src/components/HopfHero.astro` | Modify | Swap to 2D import, themed bg (no `#14304f/#0a1628`), poster-first (preload + fetchpriority=high)/idle+visible/sr-only, JS `src` swap by `readTheme()`, `PUBLIC_HOPF_ENABLED` read (`false` → poster-only) |
| `src/pages/index.astro` | Modify | `.hero-overlay{background:var(--bg)}`; scrims → `var(--bg)`-derived gradients (desktop 90deg + mobile 180deg); keep EN/reveals/magnetic |
| `src/styles/tokens.css` | Modify | Add `--hero-scrim-*`; soften `h1` light shadow to `0 1px 12px rgb(16 26 43/.18)`; dark keeps `0 2px 24px black` |
| `scripts/capture-poster.mjs` | Modify | Screenshot 2D canvas ×2 themes → Sharp WebP q70→60, assert <100KB each |
| `scripts/generate-poster.mjs` | Modify | Retire or repoint constants to `hopf-2d`; capture is truth |
| `public/hero-poster-dark.webp` + `public/hero-poster-light.webp` | Create | Replace single `hero-poster.webp` (keep old file as fallback until cutover) |
| `src/lib/hopf-scene.ts`, `three`, `@types/three` | Delete | After importer `grep` passes |

## Interfaces / Contracts

```ts
export const FIBER_COUNT=36, FIBER_SEGMENTS=150;
export type Theme="light"|"dark";
export function fiber(th:number,ph:number,N?:number):Array<[number,number,number]|null>;
export function fiberColor(ph:number,theme:Theme):string; // lerp #EAF1FB→#2E8CFF; hi #7AB3FF/#0A54C2
export function readTheme():Theme; // documentElement[data-theme] ?? prefers-color-scheme
export function createHopf2D(c:HTMLCanvasElement,o?:{reducedMotion?:boolean}):{dispose():void;setPaused(b:boolean):void;renderOnce():void};
```

`fit()`: parent `clientWidth/Height`, `DPR=min(max(dpr,1),mobile?1.5:2)`, `setTransform(D,0,0,D,0,0)`, refit on resize. Fg wide stroke: `css('--text')` (dark `#EAF1FB`, light `#101A2B`).
`flags`: `HOPF_ENABLED` (module const kill-switch) + `PUBLIC_HOPF_ENABLED` env (`false` → poster-only, skip 2D import).

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit (vitest) | `fiber` null-gate `d<0.07`, `hypot>7` skip, slowed consts, `fiberColor` blue-only, `clampDpr`, no `hue` import | Pure-function asserts + `grep hue(` fails build |
| Integration | Island hydrate swap zero CLS, theme swap recolors, IO pause, RM zero-rAF + per-move frame, coarse auto-drift (sine drift, mouse ignored) | Playwright: IO mock, `matchMedia` emulate (incl. coarse pointer), rAF spy |
| E2E/visual | Both themes legible, no navy computed in light, poster <100KB + resembles canvas, AA ≥4.5:1 | Screenshots + pixel-sample + contrast + `stat` gate |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration. Flag `PUBLIC_HOPF_ENABLED=false` → poster-only. Single PR: port → island → light fix → posters → delete `three`. Rollback = revert commit (restores scene/island/styles/poster/dep).

## Open Questions

- [x] RESOLVED: JS `src` swap by `readTheme()` (no markup churn, no `<picture>`); dual `hero-poster-dark/light.webp` replace single, old file kept as fallback until cutover.
