# Delta for hero-hopf

## MODIFIED Requirements

### Requirement: Hopf Hero Composition

System MUST render full-bleed hero, copy left, fibers right via `stroke()` x `W·GROUP_X` (`0.62` desktop, `0.50` mobile); `S` unchanged.
(Previously: centered at `W/2`.)

#### Scenario: 2D reference composition

- GIVEN desktop loads `/`
- WHEN hero renders
- THEN copy left, fibers at `W·0.62` clear of scrim.

#### Scenario: Zero CLS hydration

- GIVEN any load of `/`
- WHEN poster then canvas paints
- THEN no shift (fixed height, absolute canvas).

#### Scenario: Mobile centered

- GIVEN `390px` viewport
- WHEN hero renders
- THEN ring at `W·0.50` with no overflow.

### Requirement: Dense Fiber Appearance

All 36 fibers MUST stay equal blue-only via `fiberColor`; `hue`/highlight MUST NOT ship; MUST use `SPIN_DT 0.015`, `FREQS 0.33/0.21/0.28`, `RATE 0.6`, `AMP 0.65`; `CUR 0.06`/`PITCH 0.045`, `driftBase()` and RM zero-rAF MUST stay; `ph` stays inert; pointer MUST stay slow.
(Previously: `0.010`, `0.24/0.15/0.20`, `0.25/0.5`.)

#### Scenario: Blue-only without hue

- GIVEN either theme renders
- WHEN pixels sampled
- THEN only blue strokes via `fiberColor`.

#### Scenario: Visible calm pins

- GIVEN hero animates
- WHEN constants inspected
- THEN `0.015`, `0.33/0.21/0.28`, `0.06`/`0.045`, `0.6`/`0.65` hold, `driftBase()` unchanged.

#### Scenario: Equal fibers

- GIVEN any frame renders
- WHEN 36 fibers inspected
- THEN each `lw1.6`/`alpha0.7`, no highlight.

#### Scenario: Idle visible

- GIVEN non-RM idle, no input
- WHEN one second passes
- THEN shift visible (`th ≤0.39 rad/s`, `~1.1–1.35 rad/s`).

### Requirement: Beauty Poster Resemblance

Poster MUST match live canvas incl `GROUP_X 0.62` (`1600x1000`, WebP `<100KB`, `fetchpriority=high`); both variants MUST regen in same PR only if visibly shifted, else deferral MUST be documented.
(Previously: any `paint()` change regens both.)

#### Scenario: Poster looks like 2D scene

- GIVEN canvas disabled or pre-hydration
- WHEN poster visible
- THEN dense blue fibers, `<100KB`, zero CLS.

#### Scenario: Themed resemblance

- GIVEN light and dark themes
- WHEN variants inspected
- THEN bg matches theme or neutral, each `<100KB`.

#### Scenario: Conditional regen

- GIVEN shift `0.50→0.62`
- WHEN canvas vs poster reviewed
- THEN regen with same `GROUP_X` if shifted, else document deferral.
