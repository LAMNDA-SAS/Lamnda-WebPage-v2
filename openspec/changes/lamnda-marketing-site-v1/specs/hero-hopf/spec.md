# Delta for hero-hopf

## ADDED Requirements

### Requirement: Hopf Hero Composition

The system MUST render the lobby hero with pinned EN headline `Complex problems. Elegant solutions.`, sub-copy, CTA `Explore our solutions`, and a Hopf-fibration canvas (fiber lines + dust points) with side annotation.

#### Scenario: Lobby matches reference

- GIVEN a desktop visitor loads `/`
- WHEN the hero renders
- THEN headline text is exactly `Complex problems. Elegant solutions.`, CTA and annotation are visible beside the canvas.

#### Scenario: Poster-first paint

- GIVEN any visitor loads `/`
- WHEN the hero paints before WebGL hydrates
- THEN a `hero-poster.webp` image (<100KB) is visible with zero layout shift.

### Requirement: Interaction Model

The system MUST apply damped mouse-parallax on desktop and auto-rotate only on touch/mobile viewports.

#### Scenario: Desktop parallax

- GIVEN a desktop pointer moves over the hero
- WHEN the pointer settles
- THEN the fiber group eases toward the target rotation without hiding headline text.

#### Scenario: Mobile fallback

- GIVEN `matchMedia('(max-width: 768px)')` matches or no hover/pointer-fine input
- WHEN the hero runs
- THEN it uses slow auto-rotate only with reduced fiber count and ignores mouse input.

### Requirement: Performance and Motion-Safety Budget

The hero JavaScript MUST stay under 200KB gzip with DPR clamped 1.5–2, fewer than 30 draw calls, pause when offscreen, and freeze to the poster frame under `prefers-reduced-motion`.

#### Scenario: Budget compliance

- GIVEN a production build
- WHEN hero JS gzip size, DPR, and draw calls are measured
- THEN JS <200KB gzip, DPR within 1.5–2, draws <30.

#### Scenario: Reduced-motion freeze

- GIVEN `prefers-reduced-motion: reduce` is set
- WHEN the hero loads
- THEN no animation loop runs and the static poster frame remains.

#### Scenario: Offscreen pause

- GIVEN the hero leaves the viewport
- WHEN observed via IntersectionObserver
- THEN the render loop pauses and resumes on re-entry.
