# Delta for site-structure

## MODIFIED Requirements

### Requirement: Hero Reference-Fidelity Strips

Hero MUST render static strips reusing theme tokens and ES pillars; `#pillars` MUST stay source of truth; tag `right` MUST sync to `1280px` wrap (`max(0.9rem, calc((100% - 1280px)/2 + 0.9rem))`).
(Previously: `1120px`/`1.2rem`.)

#### Scenario: Mono eyebrow

- GIVEN any load of `/`
- WHEN hero renders
- THEN eyebrow `DATA / SECURITY / AUTOMATION` shows above H1.

#### Scenario: Two-tone headline

- GIVEN `es` homepage renders
- WHEN H1 inspected
- THEN `Complex problems. Elegant solutions.` in two spans intact.

#### Scenario: Pillars echo strip

- GIVEN any load of `/`
- WHEN bottom strip renders
- THEN 3 `orderedPillars` items show; `#pillars` stays below.

#### Scenario: Hero tag synced

- GIVEN desktop loads `/`
- WHEN hero renders
- THEN tag bottom-right at wrap `right`; hidden `≤900px`, no overflow `390px`.

## ADDED Requirements

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
