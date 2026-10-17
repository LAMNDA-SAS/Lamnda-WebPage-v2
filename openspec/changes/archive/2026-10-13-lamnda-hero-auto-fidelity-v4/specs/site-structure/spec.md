# Delta for site-structure

## ADDED Requirements

### Requirement: Hero Reference-Fidelity Strips

The hero MUST render reference strips as static HTML reusing theme tokens and the ES pillars collection; `#pillars` MUST stay the source of truth and keep its section.

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

#### Scenario: Hero tag

- GIVEN a desktop visitor loads `/`
- WHEN the hero renders
- THEN a bottom-right mono tag shows; it hides at `≤900px` with no overflow at 390px.

## MODIFIED Requirements

### Requirement: Single-Page Marketing Structure

The system MUST render a static single-page site with sections `hero`, `pillars`, `services`, `vision-mission`, `contact` plus header nav and footer, in that order.
(Previously: nav had no active state; header CTA style was unspecified.)

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
(Previously: filled pill with no arrow.)

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
