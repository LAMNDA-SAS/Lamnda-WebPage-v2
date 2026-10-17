# Design: lamnda-hero-motion-toggle-v6

## Technical Approach

Island-only change in `HopfHero.astro`. Resolve tri-state mode to the existing `reducedMotion` boolean at the island boundary; `src/lib/hopf-2d.ts` stays untouched. Toggle persists mode, disposes the live handle, and re-creates it synchronously. Default `auto` path is byte-identical to today.

## Architecture Decisions

| Option | Tradeoff | Decision |
|---|---|---|
| Recreate (`dispose()` + `createHopf2D`) vs live-flip (`setReducedMotion`) | Recreate resets `driftT` (one frame); live-flip needs rAF lifecycle surgery (`raf`/`paused`/`disposed` disambiguation) | **Recreate**: negligible visual cost, zero lib risk |
| Island-resolved boolean vs lib `motionMode` param | Lib param spreads mode semantics into renderer; boolean keeps lib pure | **Island resolves**, lib signature unchanged |
| Native `<button>` vs custom div control | Custom needs manual keyboard/role work | **Native button**: Tab/Enter/Space free, `aria-pressed` built in |

## Data Flow

`localStorage[lamnda-hero-motion]` → `readMode()` → `resolveEffective(osRM, mode)` → `createHopf2D(canvas, { reducedMotion: effectiveRM })` → button `aria-pressed = !effectiveRM`. Click → `writeMode(next)` → `recreate()` → repaint + announce.

```
readMode ──→ resolveEffective ──→ hydrate(effectiveRM) ──→ canvas
    ↑               │                       │
  storage      matchMedia(auto-only)    dispose/recreate
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/components/HopfHero.astro` | Modify | Mode helpers, pill button + island `<style>`, dispose/recreate, auto-only `matchMedia` handler, sr-only announce |
| `src/lib/hopf-2d.ts` | Untouched | Reuse `createHopf2D`, `dispose`, `prefersReducedMotion`; no edit |
| Tests | Verify-only | No runner in repo; static truth-table + manual e2e matrix (see below) |

## Interfaces / Contracts

```ts
type MotionMode = "auto" | "on" | "off";
const KEY = "lamnda-hero-motion";
function readMode(): MotionMode { try { const v = localStorage.getItem(KEY); return v === "on" || v === "off" ? v : "auto"; } catch { return "auto"; } }
function writeMode(m: MotionMode): void { try { localStorage.setItem(KEY, m); } catch { /* private-mode: session-only */ } }
function resolveEffective(osRM: boolean, mode: MotionMode): boolean {
  return mode === "on" ? false : mode === "off" ? true : osRM;
}
// effectiveRM=false → animating; button: aria-pressed = String(!effectiveRM)
```

Button: `<button type="button" data-hopf-toggle hidden>` absolute bottom-left (`left:0.9rem; bottom:1.2rem; z-index:2`), min 44×44px, labels `Pausar motion` (animating) / `Animar motion` (still), themed `var(--surface)/--text/--border` AA pairs, global `:focus-visible` ring. Stays `hidden` when `HOPF_ENABLED=false` and pre-hydration (poster-first: poster paints for LCP, canvas/button appear only after `hydrate()` succeeds). Announce via existing `data-hopf-status role="status"`: hero-state text only, never implying OS changed.

Truth table (`effectiveRM`; `false` = drift):

| Mode | OS RM on | OS RM off |
|---|---|---|
| `auto` | `true` (still) | `false` (drift) |
| `on` | `false` (drift) | `false` (drift) |
| `off` | `true` (still) | `true` (still) |

Init/dispose/recreate: `init` reads mode once, hydrates lazily (idle + visible, unchanged). `recreate(next)` disposes `root._hopfHandle`, calls `createHopf2D` with new flag, flips `aria-pressed`/label, announces. `matchMedia("(prefers-reduced-motion: reduce)")` `change` listener re-resolves only if `readMode() === "auto"`, else ignores.

```text
sequence (toggle flip):
User --click/Enter--> Button --mode--> Island: writeMode(next)
Island --dispose()--> OldHandle --createHopf2D(newFlag)--> NewHandle
Island --aria-pressed+label--> Button --text--> status[role=status]
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Truth table (6 cells) + corrupt/throw → `auto` | Static assert script / console snippet, zero-cost |
| E2E (manual) | `aria-pressed` flips; drift/still per cell; reload persists; `hidden` when HOPF off | OS RM × mode × theme matrix + 390px no-overlap, screenshots |
| Build | No size/behavior regression | `astro build` clean; island sync import <15KB; `grep` drift constants unchanged |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Absent key = `auto` (current behavior). Rollback: delete pill + mode logic, pass `prefersReducedMotion()` directly.

## Open Questions

None. Scope locked to island-only; drift constants, posters, and CSS RM rules out of scope.
