# Delta for site-structure

## Requirements

### Requirement: Single-Page Marketing Structure

The system MUST render a static single-page site with sections `hero`, `pillars`, `services`, `vision-mission`, `contact` plus header nav and footer, in that order.

#### Scenario: Section order and anchors

- GIVEN a visitor loads `/`
- WHEN the page renders
- THEN sections appear in order hero → pillars → services → vision-mission → contact, each with a stable `id` anchor.

#### Scenario: Header navigation

- GIVEN a visitor on desktop or mobile
- WHEN they use the header nav (Home, Solutions, Data Science, Cybersecurity, Automations, About + `Get in touch`)
- THEN each link scrolls to its anchor; Home carries `aria-current="page"` with a blue underline; `Get in touch` is an outline pill (transparent bg, blue border, `→` `aria-hidden`) meeting AA in both themes and scrolling to `contact`.

### Requirement: Hero CTA Scrolls to Services

The hero primary CTA `Explore our solutions` MUST render as a filled pill with arrow and smooth-scroll to `#services` without a route change.

#### Scenario: CTA scroll

- GIVEN a visitor in the hero
- WHEN they activate `Explore our solutions`
- THEN the viewport scrolls to `#services` and focus moves to the services heading.

#### Scenario: No-JS CTA fallback

- GIVEN JavaScript is disabled
- WHEN the visitor clicks the CTA
- THEN the native anchor jump lands on `#services`.

#### Scenario: Filled pill with arrow

- GIVEN a visitor in the hero
- WHEN the CTA renders
- THEN it is a filled pill with `→` (`aria-hidden`) and AA-passing text in both themes.

### Requirement: Footer and SEO Baseline

The system MUST render a footer with tag `SCIENCE x TECHNOLOGY x IMPACT` plus a 24px shield mark, and per-page SEO meta (title, description, og tags, canonical) where `og:image` points at the new beauty poster.

#### Scenario: Footer brand mark

- GIVEN any page render
- WHEN the footer is visible
- THEN it shows the shield `alt="Lamnda"`, the tag, and contact entry points with no white box on dark surfaces.

#### Scenario: SEO meta with new poster

- GIVEN a crawler requests `/`
- WHEN headers/body are inspected
- THEN title, description, og:title/description/image (beauty poster), and canonical are present and non-empty.

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

### Requirement: Hero Reference-Fidelity Strips

The hero MUST render reference strips as static HTML reusing theme tokens and the ES pillars collection; `#pillars` MUST stay the source of truth and keep its section; tag `right` MUST sync to `1280px` wrap (`max(0.9rem, calc((100% - 1280px)/2 + 0.9rem))`).

#### Scenario: Mono eyebrow

- GIVEN any visitor loads `/`
- WHEN the hero renders
- THEN a mono eyebrow `DATA / SECURITY / AUTOMATION` shows in `--primary-text` above the H1.

#### Scenario: Two-tone pinned headline

- GIVEN the `es` homepage renders
- WHEN the H1 is inspected
- THEN text is exactly `Complex problems. Elegant solutions.` in two spans (line 1 `--text`, line 2 `--primary-text`) with the EN-exception marker intact.

#### Scenario: Pillars echo strip

- GIVEN any visitor loads `/`
- WHEN the hero-bottom strip renders
- THEN 3 items reuse `orderedPillars` ES data with inline icons and `border-left` dividers; `#pillars` stays in place below.

#### Scenario: Hero tag synced

- GIVEN desktop loads `/`
- WHEN hero renders
- THEN tag bottom-right at wrap `right`; hidden `≤900px`, no overflow `390px`.

### Requirement: Hero Layout Grid

System MUST use `.wrap 1280px/0.9rem`, `.hero-copy 32rem`, equations/tag `right 0.9rem/1280`, glow `75% 38%`, no overflow at `390px`.

#### Scenario: Layout tokens

- GIVEN desktop renders
- WHEN styles inspected
- THEN wrap/copy/glow/right match tokens above.

#### Scenario: Screenshot matrix

- GIVEN change ships
- WHEN checked `390/768/1024/1440px` × light/dark
- THEN ring right unclipped, copy legible, RM zero-rAF, no overflow.
