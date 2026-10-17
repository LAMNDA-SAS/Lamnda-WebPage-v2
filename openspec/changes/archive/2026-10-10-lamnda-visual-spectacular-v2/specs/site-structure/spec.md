# Delta for site-structure

## MODIFIED Requirements

### Requirement: Footer and SEO Baseline

The system MUST render a footer with tag `SCIENCE x TECHNOLOGY x IMPACT` plus a 24px shield mark, and per-page SEO meta (title, description, og tags, canonical) where `og:image` points at the new beauty poster.
(Previously: text-only footer; OG pointed at the sparse poster.)

#### Scenario: Footer brand mark

- GIVEN any page render
- WHEN the footer is visible
- THEN it shows the shield `alt="Lamnda"`, the tag, and contact entry points with no white box on dark surfaces.

#### Scenario: SEO meta with new poster

- GIVEN a crawler requests `/`
- WHEN headers/body are inspected
- THEN title, description, og:title/description/image (beauty poster), and canonical are present and non-empty.

## ADDED Requirements

### Requirement: Brand Logo and Favicon Wiring

The system MUST wire the transparent shield from `Logos/` as header mark (32px) with styled-text wordmark, plus favicon set and `theme-color` in Base layout. The white-bg lockup MUST NOT appear on dark surfaces.

#### Scenario: Header shield

- GIVEN any page render
- WHEN the header is visible
- THEN a 32px shield `alt="Lamnda"` plus selectable wordmark appears, crisp on dark hero.

#### Scenario: Favicon set

- GIVEN a visitor loads any page
- WHEN head links are inspected
- THEN `favicon-32.png`, `apple-touch-icon.png`, SVG fallback, and `theme-color` are present.

#### Scenario: No white-box logo

- GIVEN dark theme hero/header
- WHEN logos paint
- THEN no white-background box is visible around any mark.
