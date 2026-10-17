# Delta for hero-hopf

## MODIFIED Requirements

### Requirement: Hopf Hero Composition

The system MUST render a full-bleed hero with 2D Canvas2D Hopf fibers filling the section, copy left, fiber mass right ~50%.

(Previously: WebGL torus at scale 0.62, camera z 3.4, x +0.9)

#### Scenario: 2D reference composition

- GIVEN a desktop visitor loads `/`
- WHEN the hero renders
- THEN canvas fills the section, copy left, fibers right ~50%.

#### Scenario: Zero CLS hydration

- GIVEN any visitor loads `/`
- WHEN poster paints then 2D canvas hydrates
- THEN no shift (fixed height, absolute canvas, preset dims).

### Requirement: Interaction Model

The system MUST map pointer via `aim()` (`tg.th=PI*(0.1+0.8*x)`, `tg.ph=y*2PI`, `tp=0.15+0.7*x`) with `cur` `0.06` / `pitch` `0.045`; coarse pointers MUST auto-drift; reduced-motion MUST show one frame plus one per move, zero rAF at rest.

(Previously: damped parallax plus auto-rotate plus WebGL single frame)

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

(Previously: 4 draws desktop / 3 mobile with async three chunk exempt)

#### Scenario: 2D fiber budget

- GIVEN a production build
- WHEN hero is measured
- THEN 36x150 fibers, foreground double-stroke; resize refits via `fit()`.

#### Scenario: Sync-only gzip ruling

- GIVEN `sdd-verify` audits `dist/` chunks
- WHEN hero JS is measured
- THEN sync JS meets budget; no exempt async chunk exists.

#### Scenario: Offscreen pause

- GIVEN the hero leaves the viewport
- WHEN observed via IntersectionObserver
- THEN loop pauses and resumes on re-entry in all modes.

### Requirement: Dense Fiber Appearance

All fibers MUST use blue-only `fiberColor(ph,theme)` (`#EAF1FB`→`#2E8CFF`; `#7AB3FF` dark / `#0A54C2` light) with themed fg double-stroke; `hue()` MUST NOT ship.

(Previously: per-vertex gradient plus halo copy plus dust plus starfield)

#### Scenario: Blue-only without hue

- GIVEN either theme renders
- WHEN pixels are sampled
- THEN no non-blue hue appears; fg thin stroke routes via `fiberColor`.

#### Scenario: Slowed corporate motion

- GIVEN the hero animates
- WHEN constants are inspected
- THEN `T += 0.010`, freqs `0.24/0.15/0.20`, `cur 0.06`, `pitch 0.045`.

#### Scenario: Foreground double-stroke

- GIVEN a foreground fiber
- WHEN stroked
- THEN `lw6` themed-fg plus `lw3` `fiberColor` passes render.

### Requirement: Beauty Poster Resemblance

Poster MUST be captured from the live 2D canvas (1600x1000, WebP <100KB), resembling the scene, preloaded `fetchpriority=high`; one neutral or two theme variants.

(Previously: procedural poster mirroring WebGL camera constants)

#### Scenario: Poster looks like the 2D scene

- GIVEN canvas disabled or pre-hydration
- WHEN the poster is visible
- THEN dense blue fibers on themed bg show at <100KB with zero CLS.

#### Scenario: Themed resemblance

- GIVEN light and dark themes
- WHEN poster variant(s) inspected
- THEN bg matches theme (or neutral fits both); each variant <100KB.

## REMOVED Requirements

### Requirement: Three.js WebGL Renderer

(Reason: 2D Canvas2D is the primary renderer; removes ~600KB async chunk)
(Migration: delete `src/lib/hopf-scene.ts`, drop `three` dep after importer check; repoint poster scripts to `hopf-2d` truth)
