# Apply Progress: lamnda-hero-auto-fidelity-v4

Retry full-scope run (prior run aborted with all boxes unchecked). No prior
apply-progress found — this artifact is the single cumulative record.
Mode: Standard (strict_tdd not active). Single PR, size:exception pre-approved.
ZERO-cost static only; no paid services used.

## Task Status (17/17 complete)

### Phase 1: Motion Foundation (`src/lib/hopf-2d.ts`)
- [x] 1.1 `driftBase(t)` pure export (`AUTO_DRIFT_RATE=0.25/AMP=0.5`); `driftT += dt` every non-RM frame, all pointers.
- [x] 1.2 `pointerOffset = aim(nx,ny) - aim(0.5,0.5)` on fine-pointer move; `tg = driftBase(driftT) + offset`, coarse zeroed bit-identical, `tp = 0.45 + offset.tp`.
- [x] 1.3 `ph` delta wrapped via `atan2(sin,cos)` to `[-PI,PI]` before `CUR_LERP`; `tp` 0.45 base + slowed constants intact (`0.010`, `0.24/0.15/0.20`, `0.06/0.045`).
- [x] 1.4 Budget restated: hero island sync JS 6.62kB (gzip 2.89kB < 15kB, build-verified); DPR clamp 1.5/2 floor 1; `fit()` refit; IO pause/resume; `HOPF_ENABLED` escape untouched.

### Phase 2: Equal Fibers + Posters
- [x] 2.1 No `foregroundColor`/`FG_*`/`lw6`/`lw3` in `hopf-2d.ts`; single 36-loop equal `lw1.6/alpha0.7` via `fiberColor`.
- [x] 2.2 No `fgRing` in `scripts/generate-poster.mjs`; dense floor held without retune (no canvas change).
- [x] 2.3 Regenerated atomically this run (`npm run generate:poster`): dark 46,932 B (45.8KB), light 19,660 B (19.2KB); 1600x1000 WebP, each <100KB and >15KB.
- [x] 2.4 `fetchpriority="high"` poster + dual preload in `Base.astro` + `hidden` canvas swap (no CLS); e2e preload+CLS gate passes.

### Phase 3: Header + Hero Chrome
- [x] 3.1 Header: Home `aria-current="page"` + blue underline (`--primary-text`, 2px, 4px offset); Get-in-touch outline pill (transparent bg, 1px `--primary-text` border, `→` `aria-hidden`); AA both themes (e2e-computed: dark `rgb(122,179,255)`, light `rgb(10,84,194)`).
- [x] 3.2 Eyebrow mono `DATA / SECURITY / AUTOMATION`; H1 exact `Complex problems. Elegant solutions.` two spans + EN-exception comment intact.
- [x] 3.3 Explore pill + `→`, smooth-scroll to `#services` with focus to heading; native anchor no-JS fallback (e2e no-JS test passes).
- [x] 3.4 Equations `aside` absolute top-right, tokens only, `pointer-events:none`, `display:none` ≤900px (e2e desktop + narrow).
- [x] 3.5 Pillars echo exactly 3 from `orderedPillars` + inline SVG icons + `border-left` dividers; `#pillars` section stays; tag `HOPF FIELD · 36 FIBERS · LIVE` bottom-right hidden ≤900px.
- [x] 3.6 Token-only strip styles, no new navy; section order hero→pillars→services→vision-mission→contact + anchors intact (e2e order test passes).

### Phase 4: Tests + Verification
- [x] 4.1 `tests/hopf-2d.test.ts` (17 tests): driftBase t=0/fixed-t, coarse bit-identical, ph wrap, no fg exports, poster script no fgRing.
- [x] 4.2 `tests/poster.test.ts` (4 tests): both posters <100KB + >15KB dense floor.
- [x] 4.3 New `tests/e2e/hero-fidelity-v4.spec.ts` (6 tests x desktop/mobile): idle drift no-mouse, pointer offset + drift persists, aside desktop/hidden ≤900px, strips/header states, header CTA AA both themes, 390px no-overflow. Full e2e 44/44 green.

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command + exact result | `npx vitest run` → 3 files, 29/29 passed (hopf-2d 17, poster 4, theme 8) |
| Runtime harness + exact result | `npm run build` → Complete, 1 page; hero island `6.62 kB / gzip 2.89 kB` (<15kB). `npx playwright test` (12 existing + 12 new, desktop+mobile) → 44/44 passed |
| Rollback boundary | One commit: `src/lib/hopf-2d.ts` + posters + header/hero markup + `tokens.css` + tests; instant poster-only rollback via `PUBLIC_HOPF_ENABLED=false` |

## Environment Notes (for verify phase)
- Bundled `chromium_headless_shell` (`ms-playwright/.../chrome-headless-shell.exe`) fails to spawn on this Windows host (`spawn UNKNOWN`). E2E was run against system Chrome via a temp `channel: "chrome"` config (deleted after the run to keep the PR clean); `npm run preview -- --port 4321` served fine with `reuseExistingServer`. Re-create the channel override if verify needs to re-run e2e here.
- Preview server stopped after the run; `pw-chrome-tmp.config.ts` removed. New spec file `tests/e2e/hero-fidelity-v4.spec.ts` is part of the PR.
- One self-found test bug fixed in-run: aside visibility assertion now branches on viewport width (mobile project hides aside by design).

## Deviations from Design
None — implementation matches design.

## Deferred
None. All 17 tasks complete; no paid/blocked subtask remained (e2e browser-block worked around at zero cost).
