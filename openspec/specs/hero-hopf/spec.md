# Delta for hero-hopf

## Requirements

### Requirement: Hopf Hero Composition

System MUST render full-bleed hero, copy left, fibers right via `stroke()` x `W·GROUP_X` (`0.62` desktop, `0.50` mobile); `S` unchanged.

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

### Requirement: Interaction Model

The system MUST run additive idle drift every non-RM frame on all pointers via pure `driftBase(t)` plus pointer offset; coarse behavior MUST stay bit-identical; reduced-motion MUST stay single-frame zero-rAF.

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

All 36 fibers MUST stay equal blue-only via `fiberColor`; `hue`/highlight MUST NOT ship; MUST use `SPIN_DT 0.015`, `FREQS 0.33/0.21/0.28`, `RATE 0.6`, `AMP 0.65`; `CUR 0.06`/`PITCH 0.045`, `driftBase()` and RM zero-rAF MUST stay; `ph` stays inert; pointer MUST stay slow.

#### Scenario: Blue-only without hue

- GIVEN either theme renders
- WHEN pixels are sampled
- THEN no non-blue hue appears; all strokes route via `fiberColor`.

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

### Requirement: Hero Motion Mode Resolution

The system MUST resolve tri-state mode `auto|on|off` from key `lamnda-hero-motion`, default `auto`; absent/corrupt/unavailable storage MUST fall back to `auto` without throwing. The system MUST compute `effectiveRM` as `on→false, off→true, auto→prefersReducedMotion()` and pass it as existing `reducedMotion` boolean.

#### Scenario: Default auto follows OS

- GIVEN no stored mode on first visit
- WHEN island resolves mode
- THEN mode is `auto` and `effectiveRM` equals OS `prefers-reduced-motion`.

#### Scenario: EffectiveRM truth table

- GIVEN modes `auto|on|off` crossed with OS RM on/off
- WHEN `effectiveRM` is computed
- THEN `auto+RM→still`, `auto+noRM→drift`, `on→drift always`, `off→still always`.

#### Scenario: Corrupt storage falls back

- GIVEN stored value is corrupt or `localStorage` throws
- WHEN island reads mode
- THEN mode is `auto` and hydration continues.

#### Scenario: OS change re-resolves auto-only

- GIVEN `matchMedia("(prefers-reduced-motion: reduce)")` changes
- WHEN mode is `auto` vs `on|off`
- THEN `auto` re-resolves and recreates; `on|off` ignores the change.

#### Scenario: Explicit consent is gesture-only

- GIVEN mode is `auto`
- WHEN user clicks toggle to `on`
- THEN drift runs under OS RM as per-site choice; system MUST never auto-select `on`.

### Requirement: Hero Motion Toggle Control

The system MUST render a native `<button type="button">` pill bottom-left of `.hopf-hero`, with `aria-pressed` equal to animating, min 44px target, AA contrast both themes, visible `:focus-visible`. Toggle MUST persist mode and `dispose()`+recreate synchronously (one-frame repaint acceptable). Button MUST be `hidden` when `HOPF_ENABLED=false` or poster-only. Announcements MUST state hero state via existing sr-only `role="status"`, never implying OS setting changed.

#### Scenario: Toggle flips motion

- GIVEN hero canvas is live
- WHEN user activates pill via click/Enter/Space
- THEN mode persists, canvas recreates, and `aria-pressed` reflects animating state.

#### Scenario: Keyboard and contrast

- GIVEN pill is visible in either theme
- WHEN Tab reaches it and contrast is sampled
- THEN focus ring is visible, target ≥44px, contrast ≥4.5:1, no overlap at 390px.

#### Scenario: Hidden without canvas

- GIVEN `HOPF_ENABLED=false` or poster-only pre-hydration
- WHEN hero renders
- THEN pill is `hidden` and no layout shift occurs.

#### Scenario: State announcement

- GIVEN toggle changes state
- WHEN sr-only `role="status"` updates
- THEN it announces hero state without mentioning OS setting.
