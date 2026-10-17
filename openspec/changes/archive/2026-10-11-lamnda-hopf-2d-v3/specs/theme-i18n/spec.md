# Delta for theme-i18n

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: WCAG AA Contrast

Body text and primary CTA text MUST meet WCAG AA contrast (4.5:1) in both themes, including hero copy over themed bg, scrims, and poster; corporate blue hex (locked in design) SHALL NOT ship if it fails on either theme.

(Previously: body and CTA pairs only; hero scrim coverage implicit)

#### Scenario: Contrast gate

- GIVEN both themes rendered
- WHEN body, CTA, and hero pairs are measured
- THEN every pair passes AA, verified in `sdd-verify`.
