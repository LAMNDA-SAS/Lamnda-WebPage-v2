# Apply Progress: lamnda-hero-motion-toggle-v6

**Mode**: Standard (strict TDD not enabled; zero-cost static verification only)
**Batch**: single PR, island-only (`src/components/HopfHero.astro`); `src/lib/hopf-2d.ts` READ ONLY, unmodified
**Date**: 2026-10-16

## Completed Tasks

- [x] 1.1 `readMode`/`writeMode`/`resolveEffective` + truth table in `HopfHero.astro`
- [x] 1.2 `dispose()` + `createHopf2D` recreate on toggle + auto-only `matchMedia` listener
- [x] 2.1 Native pill `<button type="button" data-hopf-toggle>` + island `<style>` (44px, `aria-pressed`, `:focus-visible`, hidden states)
- [x] 2.2 State flips announced via existing `data-hopf-status role="status"` sr-only node (hero-only wording)
- [x] 3.1 Static truth-table assert: 10/10 PASS (6 cells + corrupt/empty/null/throw to `auto`), node console snippet, no runner
- [x] 3.3 `astro build` clean; drift constants untouched; island `7.77 kB` raw / `3.30 kB` gzip (<15KB); vitest 31/31 pass; `data-hopf-toggle` in SSR HTML; storage key in built island JS

## Deferred (not blocked on code — needs human + browser)

- [ ] 3.2 Manual e2e matrix: `aria-pressed` flips, drift/still per truth-table cell, reload persists mode, `hidden` when HOPF off, AA sampling both themes, 390px no-overlap. Reason: matrix requires a live browser, OS `prefers-reduced-motion` control, and human observation (drift vs still, overlap, focus ring). No browser harness run in this batch per zero-cost static-only preflight. Static proxies done instead: token reuse (`--surface`/`--text` give body-level AA pairs dark `#eaf1fb/#12233d`, light `#101a2b/#f3f6fb`), 44px min target + 3px `:focus-visible` ring in island CSS, `hidden` until post-hydrate success and never revealed on the `HOPF_ENABLED=false` early-return path.

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and exact result | `node -e <truth-table + storage-fallback snippet>` → exit 0, ALL 10 ASSERTS PASS (6 truth cells + corrupt/empty/null/throw→auto) |
| Focused test command and exact result | `npx vitest run` → 3 files, 31 tests passed (theme 8, hopf-2d 19, poster 4) |
| Runtime harness command and exact result | `npx astro build` → Complete, 1 page, island `HopfHero…js 7.77 kB / gzip 3.30 kB`; SSR HTML contains `data-hopf-toggle`; island JS contains `lamnda-hero-motion` |
| Rollback boundary | Revert `src/components/HopfHero.astro` to `prefersReducedMotion()`-only (delete pill markup, mode helpers, `swap`/listeners, toggle CSS). `src/lib/hopf-2d.ts` untouched — nothing to revert there. |

## Deviations from Design

- Net file delta is ~+127 lines (216→343) vs the 60–100 forecast, from pre-hydration guards (`!started` branches in click + `matchMedia` handlers) and comments. Single-PR, island-only scope unchanged; no chain strategy needed (Low budget risk stands).
- `matchMedia` uses `addEventListener("change")` with `addListener` fallback (older Safari), per design intent.
- OS-change recreate announces hero state via the same sr-only node (design silent on this; hero-only wording, no OS implication).
- Pre-existing Spanish failure string (`No se pudo iniciar…`) left untouched; new strings English per contract.

## Issues Found

- None. `git diff --numstat` vs HEAD for `HopfHero.astro` (240/55) includes unrelated prior uncommitted work in the tree; this batch's own delta is the 216→343 line change confined to the toggle feature.

## Remaining

- 3.2 manual e2e matrix (deferred, see above) → then verify/archive.
