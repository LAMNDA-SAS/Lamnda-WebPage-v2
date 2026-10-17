# Delta for site-structure

## ADDED Requirements

### Requirement: Single-Page Marketing Structure

The system MUST render a static single-page site with sections `hero`, `pillars`, `services`, `vision-mission`, `contact` plus header nav and footer, in that order.

#### Scenario: Section order and anchors

- GIVEN a visitor loads `/`
- WHEN the page renders
- THEN sections appear in order hero → pillars → services → vision-mission → contact, each with a stable `id` anchor.

#### Scenario: Header navigation

- GIVEN a visitor on desktop or mobile
- WHEN they use the header nav (Home, Solutions, Data Science, Cybersecurity, Automations, About + `Get in touch`)
- THEN each link scrolls to its anchor, and `Get in touch` scrolls to `contact`.

### Requirement: Hero CTA Scrolls to Services

The hero primary CTA `Explore our solutions` MUST smooth-scroll to `#services` without a route change.

#### Scenario: CTA scroll

- GIVEN a visitor in the hero
- WHEN they activate `Explore our solutions`
- THEN the viewport scrolls to `#services` and focus moves to the services heading.

#### Scenario: No-JS CTA fallback

- GIVEN JavaScript is disabled
- WHEN the visitor clicks the CTA
- THEN the native anchor jump lands on `#services`.

### Requirement: Footer and SEO Baseline

The system MUST render a footer with tag `SCIENCE x TECHNOLOGY x IMPACT` plus per-page SEO meta (title, description, og tags, canonical).

#### Scenario: Footer tag

- GIVEN any page render
- WHEN the footer is visible
- THEN it shows `SCIENCE x TECHNOLOGY x IMPACT` and contact entry points.

#### Scenario: SEO meta present

- GIVEN a crawler requests `/`
- WHEN headers/body are inspected
- THEN title, meta description, og:title/description/image, and canonical link are present and non-empty.
