# Design: Lambda Hero Drift Layout v5

## Technical Approach

Apply exploration Approach 3 verbatim: constants-only motion fix in `hopf-2d.ts` plus token-only layout shift. `driftBase()` formula, `ph`-wrap, `CUR/PITCH` smoothing, and RM zero-rAF path untouched. Ring moves to open right space via `stroke()` x-origin only.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Full verbatim restore (`SPIN_DT 0.016`, freqs `0.37/0.23/0.31`, `cur 0.12/pitch 0.08`, drop drift) | Pixel-identical pace but pointer expand/contract goes fast, loses corporate-calm | Rejected |
| Drift-only boost (keep slow spin) | Smallest diff but rotation stays ~40% slow, reads as pulse not swirl | Rejected |
| Near-verbatim spin + boosted `th`-drift, smoothing locked | Visible idle each second, pointer stays slow, RM untouched; costs 4 constants + 1 offset + pin/poster sync | Adopted |

| Option | Tradeoff | Decision |
|---|---|---|
| Camera/parent offset (`fit()`/`HopfHero` wrapper transform) | Moves scrim/poster/copy coupling, risks CLS and poster divergence | Rejected |
| `GROUP_X` in `stroke()` x-origin (`W·0.62` desktop / `W·0.50` mobile) | One-line, `S`/gates/palette untouched, poster mirrors with same constant | Adopted |

## Data Flow

Idle frame with drift (non-RM, coarse or no-pointer):

```
rAF(frame) -> step(dt) -> driftBase(driftT) -> tg/cur lerp + spin(M) -> stroke(GROUP_X) -> paint
     |              |              |                      |                      |
   dt clamp    driftT+=dt    base.th/ph +            T+=0.015,           x=W*GROUP_X+r[0]*S*f
   0..0.05s    (0.60/0.65)  pointerOffset(0          w=0.33/0.21/0.28,    S=min(W,H)*0.17,
                               if coarse)           a=n*0.015            skip hypot>7/null
```

`cur.ph` ramp (`0.60 rad/s`, 2π/~10.5s) stays visually inert under equal-fibers loop (future hook, no highlight re-added).

## Constant Table (old → new)

| Constant | Old | New | Note |
|---|---|---|---|
| `SPIN_DT` | 0.01 | 0.015 | 94% verbatim 0.016; `T` 0.90/s, `a` ~1.1–1.35 rad/s |
| `SPIN_FREQS` | [0.24,0.15,0.20] | [0.33,0.21,0.28] | 90% verbatim |
| `AUTO_DRIFT_RATE` | 0.25 | 0.6 | `ph` 2π in ~10.5s |
| `AUTO_DRIFT_AMP` | 0.5 | 0.65 | `th` slope 0.125→0.39 rad/s |
| `GROUP_X` | implicit 0.50 | 0.62 desktop / 0.50 mobile | NEW exports |
| `stroke()` x | `W/2` | `W·(mobile?0.50:0.62)` | Only geometry change |
| KEEP | — | `CUR 0.06`, `PITCH 0.045`, `driftBase()` formula, `atan2` wrap, RM single-frame + zero-rAF | Unchanged |

## Layout Token Diffs

| Token | Old | New |
|---|---|---|
| `.wrap` (`index.astro`) | `1120px / 0 1.2rem` | `1280px / 0 0.9rem` |
| `.hero-copy` | `36rem` | `32rem` |
| `.hero-equations`, `.hero-tag` `right` (`tokens.css`) | `max(1.2rem, calc((100%-1120px)/2+1.2rem))` | `max(0.9rem, calc((100%-1280px)/2+0.9rem))` |
| `.hero-overlay` glow | `at 72% 38%` | `at 75% 38%` |
| `≤900px` guard, `overflow-x: clip` | — | Unchanged; 390px uses `GROUP_X 0.50` centered |

## Interfaces / Contracts

```ts
export const GROUP_X_DESKTOP = 0.62;
export const GROUP_X_MOBILE = 0.5;
// stroke(): x = W * (isMobileViewport() ? GROUP_X_MOBILE : GROUP_X_DESKTOP) + r[0]*S*f
```

Poster mirrors same constants (`cx = W*0.62` in `buildLayers`; glow `cx` synced). No other API change.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/hopf-2d.ts` | Modify | 6 constants + `GROUP_X_*` exports + `stroke()` x-origin |
| `src/pages/index.astro` | Modify | `.wrap` and `.hero-copy` widths |
| `src/styles/tokens.css` | Modify | `right` sync + glow `75% 38%` |
| `tests/hopf-2d.test.ts` | Modify | Pin updates (below) |
| `scripts/generate-poster.mjs` | Conditional modify | Same `GROUP_X` regen only if review shows shift |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Pins `0.015`/`[0.33,0.21,0.28]`/`0.6`/`0.65`, `CUR/PITCH` kept, `driftBase()` formula, `hypot>7` no excess skips | Vitest update `pins slowed corporate constants` block |
| Integration | RM single-frame + zero-rAF-at-rest (`renderOnce`, no rAF loop) | Re-run existing RM assertions + manual `matchMedia` check |
| E2E/visual | Matrix 390/768/1024/1440 × light/dark: ring right unclipped, copy legible, no overflow, poster-vs-canvas | Screenshots; regen posters (1600×1000 WebP <100KB) only if `0.50→0.62` visibly shifted, else document deferral |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Single PR, zero-cost static only. Rollback: revert constants commit (`hopf-2d.ts` + `index.astro` + `tokens.css` + pins); posters revert with commit.

## Open Questions

None. Poster regen deferred to visual-review decision in apply.
