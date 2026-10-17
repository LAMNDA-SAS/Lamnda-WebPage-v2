# Delta for hero-hopf

## ADDED Requirements

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
