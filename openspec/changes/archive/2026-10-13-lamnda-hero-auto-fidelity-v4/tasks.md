# Tasks: lamnda-hero-auto-fidelity-v4

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~280-320 authored (posters binary excluded) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR (size:exception pre-approved) |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Drift + equal fibers + posters + chrome + tests, single PR | PR 1 | `npx vitest run tests/hopf-2d.test.ts tests/poster.test.ts` | `npm run build && npm run preview` hero drift/offset/strips check | `PUBLIC_HOPF_ENABLED=false` to posters; full revert one commit |

## Phase 1: Motion Foundation (`src/lib/hopf-2d.ts`)

- [x] 1.1 Add pure exported `driftBase(t)` using `AUTO_DRIFT_RATE/AMP`; advance `driftT += dt` every non-RM frame all pointers.
- [x] 1.2 Store `pointerOffset = aim(nx,ny) - aim(0.5,0.5)` on fine-pointer move; compose `tg = driftBase(driftT) + offset`, coarse zeroed bit-identical.
- [x] 1.3 Wrap `ph` delta to `[-PI,PI]` before `CUR_LERP`; preserve `tp` 0.45 logic and slowed constants (`0.010`, `0.24/0.15/0.20`, `0.06/0.045`).
- [x] 1.4 Restate budget: 15KB gzip sync-only, DPR clamp (1.5/2, floor 1), `fit()` refit, IO pause/resume, `HOPF_ENABLED` escape untouched.

## Phase 2: Equal Fibers + Posters

- [x] 2.1 Delete `paint()` `lw6`+`lw3` fg strokes + `foregroundColor`/`FG_*` in `src/lib/hopf-2d.ts`; keep 36x150pts equal `lw1.6/alpha0.7` via `fiberColor`.
- [x] 2.2 Delete `fgRing` block + destructure in `scripts/generate-poster.mjs`; retune ring counts ONLY if dense-floor fails, never canvas.
- [x] 2.3 Regen `public/hero-poster-dark.webp` + `public/hero-poster-light.webp` atomically same PR: 1600x1000, each <100KB and >15KB.
- [x] 2.4 Keep `fetchpriority=high` preload + poster-first no-CLS in `src/components/HopfHero.astro`.

## Phase 3: Header + Hero Chrome

- [x] 3.1 `src/components/Header.astro`: Home `aria-current="page"` + blue underline; `Get in touch` outline pill (transparent bg, 1px border, `→` `aria-hidden`), AA both themes.
- [x] 3.2 `src/pages/index.astro`: mono eyebrow `DATA / SECURITY / AUTOMATION`; H1 exact `Complex problems. Elegant solutions.` two spans + EN-exception comment.
- [x] 3.3 Hero `Explore our solutions` filled pill + `→` scrolling to `#services` with focus to heading; native anchor no-JS fallback.
- [x] 3.4 Hero `aside` equations (Hopf Fibration S3→S2, fiber + `d = 1 - b·sin` lines), absolute top-right, tokens only, `display:none` ≤900px.
- [x] 3.5 Hero pillars echo: exactly 3 items from `orderedPillars` + inline icons + `border-left` dividers; `#pillars` section stays; tag bottom-right hidden ≤900px.
- [x] 3.6 `src/styles/tokens.css`: token-only strip styles, no new navy; section order hero→pillars→services→vision-mission→contact + anchors intact.

## Phase 4: Tests + Verification

- [x] 4.1 Vitest `tests/hopf-2d.test.ts`: `driftBase` t=0/fixed-t, coarse bit-identical, `ph` wrap, no `foregroundColor`/`FG_*`/`fgRing` exports.
- [x] 4.2 `tests/poster.test.ts`: both posters <100KB + >15KB dense floor after regen.
- [x] 4.3 Playwright e2e: idle drift no-mouse, pointer offset, RM zero-rAF single frame, `aside` desktop/none ≤900px, strips/tag/eyebrow/H1/CTA/header render, AA both themes, 390px no-overflow.
