# Delta for theme-i18n

## ADDED Requirements

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

Body text and primary CTA text MUST meet WCAG AA contrast (4.5:1) in both themes; corporate blue hex (locked in design) SHALL NOT ship if it fails on either theme.

#### Scenario: Contrast gate

- GIVEN both themes rendered
- WHEN body/CTA pairs are measured
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
