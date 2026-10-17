# Delta for hero-hopf

## MODIFIED Requirements

### Requirement: Hopf Hero Composition

The system MUST render a full-bleed hero: WebGL canvas fills the viewport section, copy overlays left, torus fills ~50% at right (`scale ~0.62`, `camera z ~3.4`, `x +0.9`).
(Previously: two-column grid, canvas confined to a small card.)

#### Scenario: Reference composition

- GIVEN a desktop visitor loads `/`
- WHEN the hero renders
- THEN canvas fills the viewport, headline overlays left, torus sits right at ~50% width.

#### Scenario: Zero CLS hydration

- GIVEN any visitor loads `/`
- WHEN poster paints then canvas hydrates
- THEN no layout shift occurs (fixed height, absolute canvas, preset dimensions).

### Requirement: Interaction Model

The system MUST use damped mouse-parallax on desktop, slow auto-rotate only on touch/mobile, and under reduced-motion render exactly one frame with zero rAF at rest plus one frame per pointermove.
(Previously: parallax + auto-rotate only; reduced-motion froze to poster.)

#### Scenario: Desktop parallax

- GIVEN a desktop pointer moves over the hero
- WHEN the pointer settles
- THEN the group eases toward target rotation; headline stays legible.

#### Scenario: Mobile auto-rotate

- GIVEN `(max-width: 768px)` or no hover/pointer-fine input
- WHEN the hero runs
- THEN it uses slow auto-rotate with 120 fibers, ignoring mouse input.

#### Scenario: Single frame, no banner

- GIVEN `prefers-reduced-motion: reduce`
- WHEN the hero rests with no input
- THEN one WebGL frame shows, no rAF loop runs, no visible banner appears (sr-only status, empty unless failure).

#### Scenario: Pointer single frames

- GIVEN the reduced-motion frame is shown
- WHEN the user moves the pointer over the hero
- THEN the system SHALL render one frame per move, with no timers or autoplay.

### Requirement: Performance and Motion-Safety Budget

The island code MUST stay under 15KB gzip with DPR clamped (1.5 mobile / 2 desktop, floor 1), 4 draws desktop / 3 mobile, offscreen pause, and three.js as an async import that never blocks LCP. The 200KB gzip rule covers sync/LCP JS; the async three chunk is EXEMPT but MUST be measured at verify time.
(Previously: hero JS <200KB flat, DPR 1.5–2, draws <30, freeze to poster.)

#### Scenario: Draw and fiber budget

- GIVEN a production build
- WHEN draws and counts are measured
- THEN draws = 4 desktop / 3 mobile (halo dropped on mobile); fibers = 260 / 120 / 64 reduced-motion x 96 segments.

#### Scenario: Async gzip ruling

- GIVEN `sdd-verify` audits `dist/` chunks
- WHEN hero JS is measured
- THEN sync/LCP JS meets budget with LCP from the poster; async three chunk is recorded exempt.

#### Scenario: Offscreen pause

- GIVEN the hero leaves the viewport
- WHEN observed via IntersectionObserver
- THEN the loop pauses and resumes on re-entry in all modes.

## ADDED Requirements

### Requirement: Dense Fiber Appearance

The system MUST render per-vertex gradient (`#EAF1FB` → `#2E8CFF`, opacity ~0.85), a 1.04x halo copy (~0.18), sprite dust (~0.035), and a 600-pt starfield (~0.015, opacity 0.5).

#### Scenario: Glow without postprocessing

- GIVEN the desktop frame
- WHEN pixels are inspected
- THEN fibers show white-core-to-blue-edge gradient with halo glow; no EffectComposer is used.

### Requirement: Beauty Poster Resemblance

The system MUST ship a procedural beauty poster (`1600x1000`, WebP <100KB) resembling the scene (dense torus + blur halo + dust), sharing camera constants, preloaded with `fetchpriority=high`.

#### Scenario: Poster looks like the scene

- GIVEN WebGL disabled or pre-hydration
- WHEN the poster is visible
- THEN it shows a dense torus with halo and dust at <100KB with zero CLS.
