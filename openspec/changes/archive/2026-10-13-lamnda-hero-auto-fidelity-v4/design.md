# Design: lamnda-hero-auto-fidelity-v4

## Technical Approach

Additive idle drift on all pointers + equal-fiber cleanup + static reference strips. Zero-cost static only; slowed constants and AA pairs untouched.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Pure `driftBase(t)` helper vs inline sine in `step()` | Inline untestable; helper adds export | Pure helper returning `{th,ph}` from `AUTO_DRIFT_RATE/AMP`; `step()` composes |
| Pointer as absolute `tg` vs additive offset | Absolute kills drift on move (current desktop bug) | Store `pointerOffset = aim(nx,ny) − aim(0.5,0.5)`; `tg = driftBase(driftT) + offset` |
| Shortest-path `ph` lerp vs raw delta | Raw delta spins long way after wrap | Wrap delta to `[-PI,PI]` before `CUR_LERP` |
| Equations as static `aside` vs canvas overlay | Canvas overlay needs JS + breaks no-JS | Static HTML `aside`, `position:absolute` top-right, `pointer-events:none` |
| Pillars echo duplicates data vs reuses collection | Duplicate drifts from source | Reuse `orderedPillars` in hero strip; `#pillars` section stays |

## Data Flow

Idle drift (any pointer, non-RM):

```text
rAF frame(dt) → driftT += dt → base = driftBase(driftT) → tg = base + pointerOffset
  → cur/pitch lerp (ph wrapped) → spin(T) → paint 36× fiberColor → stroke
```

Pointer offset (fine pointers only):

```text
pointermove(nx,ny) → aim(nx,ny) − aim(0.5,0.5) → pointerOffset (stored)
  → next frame adds to base (base never stops); coarse ignores input
```

Poster regen (atomic, same PR):

```text
paint() fg delete → generate-poster.mjs fgRing delete → node script
  → dark+light webp (<100KB, >15KB) → poster.test.ts → commit all together
```

`driftBase` (non-obvious pattern only):

```ts
export function driftBase(t: number) {
  return {
    th: Math.PI / 2 + AUTO_DRIFT_AMP * Math.sin(t * AUTO_DRIFT_RATE),
    ph: t * AUTO_DRIFT_RATE + AUTO_DRIFT_AMP * Math.sin(t * AUTO_DRIFT_RATE * 0.7),
  };
}
// coarse: pointerOffset = {th:0,ph:0} → bit-identical to current formulas
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/lib/hopf-2d.ts` | Modify | Add `driftBase()`; `step()` always advances `driftT` (non-RM), additive `tg`; wrap `ph` delta; delete fg strokes + `foregroundColor`/`FG_*` |
| `scripts/generate-poster.mjs` | Modify | Delete `fgRing` block + destructure; retune ring counts for dense floor |
| `public/hero-poster-dark.webp` + `public/hero-poster-light.webp` | Modify | Regen both, each <100KB and >15KB |
| `src/components/Header.astro` | Modify | Home `aria-current="page"` + blue underline; CTA outline pill (transparent bg, 1px `var(--primary-text)` border, `→` span `aria-hidden`) |
| `src/pages/index.astro` | Modify | Eyebrow mono `DATA / SECURITY / AUTOMATION`; H1 two spans (line1 `--text`, line2 `--primary-text`); Explore pill + `→`; equations `aside` (title Hopf Fibration, S3→S2 sentence, fiber + stereographic lines); pillars echo (`orderedPillars` + `border-left` dividers); hero tag mono bottom-right |
| `src/styles/tokens.css` | Modify | Token-only hero strip styles; `display:none` ≤900px for `aside`/tag; no new navy |

Equations `aside` content: title `Hopf Fibration`, sentence mapping S3→S2, `(z1,z2) = (cos(θ/2)·e^(it), sin(θ/2)·e^(i(t+φ)))`, `d = 1 − b·sin(t+φ)`. Themed mono tokens, `absolute` top-right.

## Interfaces / Contracts

`driftBase(t: number): { th: number; ph: number }` — pure, no DOM. `pointerOffset` module state `{th,ph}`, zeroed on coarse. No new props; `HOPF_ENABLED`/RM/IO/`fit()` contracts unchanged.

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Unit (Vitest) | `driftBase` values at t=0/fixed-t; coarse bit-identical; `ph` wrap; no `foregroundColor`/`FG_*` export; poster script has no `fgRing` | Pure-function + grep assertions |
| Integration | Posters <100KB + >15KB (`poster.test.ts`); themed `fiberColor` blue-only | Existing poster test, regen in same PR |
| E2E (Playwright) | Idle drift with no mouse; pointer adds offset; RM zero-rAF; `aside` visible desktop / `display:none` ≤900px; 390px no-overflow; eyebrow/H1/CTA/header/pillars-echo/tag render; AA pairs computed both themes; `#pillars` intact | Static + headed runs |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration. Single PR; rollback via `PUBLIC_HOPF_ENABLED=false` (equal-fiber posters) or full revert of `hopf-2d.ts` + posters + markup.

## Open Questions

None.
