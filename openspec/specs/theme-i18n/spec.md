# Delta for theme-i18n

## Requirements

### Requirement: CSS-Variable Dual Theme

The system MUST implement dark (default) and light themes via `data-theme` tokens `--bg/--surface/--text/--primary/--muted`, persisted in `localStorage` with `prefers-color-scheme` fallback and a head anti-FOUC script.

#### Scenario: Dark default, persisted toggle

- GIVEN a first-time visitor with no stored preference
- WHEN the page loads
- THEN `data-theme="dark"` applies; toggling persists the choice across reloads.

#### Scenario: No theme flash

- GIVEN a returning visitor with stored `light`
- WHEN the document head executes
- THEN the correct theme applies before first paint (no FOUC).

### Requirement: WCAG AA Contrast

Body text and primary CTA text MUST meet WCAG AA contrast (4.5:1) in both themes, including hero copy over themed bg, scrims, and poster; corporate blue hex (locked in design) SHALL NOT ship if it fails on either theme.

#### Scenario: Contrast gate

- GIVEN both themes rendered
- WHEN body, CTA, and hero pairs are measured
- THEN every pair passes AA, verified in `sdd-verify`.

### Requirement: Spanish Default with Pinned EN Exception

The default locale MUST be `es`; the lobby headline `Complex problems. Elegant solutions.` MUST remain EN verbatim, marked with an explicit code comment, and MUST NOT be translated by future i18n work.

#### Scenario: EN exception pinned

- GIVEN the `es` homepage renders
- WHEN the hero headline is inspected
- THEN its text is exactly `Complex problems. Elegant solutions.` with a `/* EN exception: do not translate */` marker.

#### Scenario: Full EN deferred

- GIVEN v1 scope
- WHEN an EN route is requested
- THEN the system MAY return 404/es fallback; full EN translation is out of scope.

### Requirement: Brand Glow Theme Adaptation

The header shield MAY carry a blue drop-shadow glow in dark theme only, and the wordmark MUST inherit `--text` so it stays legible in both themes.

#### Scenario: Dark-only glow

- GIVEN `data-theme="dark"`
- WHEN the header logo renders
- THEN a soft blue drop-shadow appears; in light theme no glow is present.

#### Scenario: Wordmark inherits theme text

- GIVEN a theme toggle
- WHEN the wordmark is inspected
- THEN its color follows `--text` with WCAG AA contrast in both themes.

### Requirement: Light Hero Contract

The hero background, overlay, scrims, and copy MUST derive from theme tokens in light mode; navy literals (`#0a1628`, `rgb(10 22 40 / ...)`, `#14304f`) SHALL NOT appear outside dark selectors; light fibers MUST use `#0A54C2` to `#2E8CFF`; hero copy and CTA MUST pass AA.

#### Scenario: No navy bleed

- GIVEN `data-theme="light"`
- WHEN hero bg, overlay, and scrims are inspected
- THEN all resolve to light tokens; no navy literal is computed.

#### Scenario: Light fiber legibility

- GIVEN the light hero renders
- WHEN fibers are sampled
- THEN strokes are deep-blue family with no rainbow and no white-on-white washout.

#### Scenario: Hero AA gate

- GIVEN both themes rendered
- WHEN hero body and CTA pairs are measured
- THEN every pair passes 4.5:1; `h1` shadow is softened in light.
