# Delta for hero-motion

## ADDED Requirements

### Requirement: Reduced-Motion Hopf Canvas

The 2D Hopf loop MUST render exactly one frame at rest under `prefers-reduced-motion: reduce` with zero rAF, sr-only status and no visible banner, plus exactly one `renderOnce` frame per pointermove.

#### Scenario: Single frame zero rAF

- GIVEN `prefers-reduced-motion: reduce`
- WHEN the hero rests with no input
- THEN one 2D frame is visible; no rAF loop, timers, or autoplay run.

#### Scenario: Pointer-driven frames

- GIVEN the reduced-motion frame is shown
- WHEN the pointer moves over the hero
- THEN the system SHALL render one frame per move via `renderOnce`.

#### Scenario: Screen-reader status only

- GIVEN the reduced-motion hero
- WHEN status is inspected
- THEN the message is sr-only; no visible banner overlays the hero.
