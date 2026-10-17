# Delta for hero-hopf

## ADDED Requirements

### Requirement: Equations Aside

The system MUST render a static themed `aside` with Hopf reference equations at hero top-right, hidden at `≤900px`.

#### Scenario: Desktop equations panel

- GIVEN desktop `/` loads, JS on or off
- WHEN the hero renders
- THEN an `aside` shows "Hopf Fibration — S3→S2 mapping", `(z1,z2) = (cos(θ/2)·e^(it), sin(θ/2)·e^(i(t+φ)))`, `d = 1 − b·sin(t+φ)` in mono theme tokens with `pointer-events:none`.

#### Scenario: Hidden on narrow viewports

- GIVEN a viewport `≤900px`
- WHEN the hero renders
- THEN the `aside` has `display:none` and no horizontal overflow occurs.

## MODIFIED Requirements

### Requirement: Interaction Model

The system MUST run additive idle drift every non-RM frame on all pointers via pure `driftBase(t)` plus pointer offset; coarse behavior MUST stay bit-identical; reduced-motion MUST stay single-frame zero-rAF.
(Previously: drift ran only for coarse pointers; desktop viewpoint was pointer-only.)

#### Scenario: Always-on idle drift

- GIVEN non-RM mode on any pointer with no input
- WHEN frames advance
- THEN `driftT` advances and the viewpoint follows `driftBase(t)` continuously.

#### Scenario: Pointer offset on top

- GIVEN drift running on desktop
- WHEN the pointer moves
- THEN `tg = driftBase(t) + pointerOffset`; base motion never stops; `ph` delta wraps to `[-PI,PI]`.

#### Scenario: Desktop 2D parallax

- GIVEN a desktop pointer moves over the hero
- WHEN the pointer settles
- THEN fibers ease via `cur`/`pitch` lerp; headline stays legible.

#### Scenario: Mobile auto-drift

- GIVEN `(max-width: 768px)` or coarse pointer
- WHEN the hero runs
- THEN slow auto-drift runs, ignoring mouse.

#### Scenario: Single frame, no banner

- GIVEN `prefers-reduced-motion: reduce`
- WHEN the hero rests with no input
- THEN one 2D frame shows, zero rAF, sr-only only.

#### Scenario: Pointer single frames

- GIVEN the reduced-motion frame is shown
- WHEN the user moves the pointer over the hero
- THEN the system SHALL render one `renderOnce` frame per move, no timers.

### Requirement: Performance and Motion-Safety Budget

The 2D island MUST stay under 15KB gzip with DPR clamp (1.5 mobile / 2 desktop, floor 1), `fit()` refit, IO pause, and `HOPF_ENABLED` escape; WebGL draws and async three chunks SHALL NOT apply.
(Previously: fiber budget required a foreground double-stroke.)

#### Scenario: 2D fiber budget

- GIVEN a production build
- WHEN hero is measured
- THEN 36x150 equal fibers render with no fg highlight; resize refits via `fit()`.

#### Scenario: Sync-only gzip ruling

- GIVEN `sdd-verify` audits `dist/` chunks
- WHEN hero JS is measured
- THEN sync JS meets budget; no exempt async chunk exists.

#### Scenario: Offscreen pause

- GIVEN the hero leaves the viewport
- WHEN observed via IntersectionObserver
- THEN loop pauses and resumes on re-entry in all modes.

### Requirement: Dense Fiber Appearance

All 36 fibers MUST render equal via blue-only `fiberColor(ph,theme)`; `hue()` and any fg highlight stroke MUST NOT ship.
(Previously: one foreground fiber carried a themed fg double-stroke.)

#### Scenario: Blue-only without hue

- GIVEN either theme renders
- WHEN pixels are sampled
- THEN no non-blue hue appears; all strokes route via `fiberColor`.

#### Scenario: Slowed corporate motion

- GIVEN the hero animates
- WHEN constants are inspected
- THEN `T += 0.010`, freqs `0.24/0.15/0.20`, `cur 0.06`, `pitch 0.045`.

#### Scenario: Equal fibers

- GIVEN any frame renders
- WHEN all 36 fibers are inspected
- THEN each uses `lw1.6`/`alpha0.7` with no `lw6`/`lw3` highlight pass.

### Requirement: Beauty Poster Resemblance

Poster MUST be captured from the live 2D canvas (1600x1000, WebP <100KB), matching the equal-fiber scene, preloaded `fetchpriority=high`, one neutral or two theme variants; any `paint()` change MUST regen both posters in the same PR.
(Previously: posters baked an `fgRing` highlight; no atomic-regen rule.)

#### Scenario: Poster looks like the 2D scene

- GIVEN canvas disabled or pre-hydration
- WHEN the poster is visible
- THEN dense blue fibers on themed bg show at <100KB with zero CLS.

#### Scenario: Themed resemblance

- GIVEN light and dark themes
- WHEN poster variant(s) inspected
- THEN bg matches theme (or neutral fits both); each variant <100KB.

#### Scenario: Atomic poster regen

- GIVEN `paint()` changes in a PR
- WHEN the PR ships
- THEN both posters are regenerated and `poster.test.ts` (each <100KB, dense floor >15KB) passes.

## REMOVED Requirements

### Requirement: Foreground double-stroke scenario (under Dense Fiber Appearance)

(Reason: one highlighted fiber breaks the reference's equal-fiber field.)
(Migration: delete `paint()` fg strokes, `foregroundColor`/`FG_*`, poster `fgRing`.)
