# Delta for theme-i18n

## ADDED Requirements

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
