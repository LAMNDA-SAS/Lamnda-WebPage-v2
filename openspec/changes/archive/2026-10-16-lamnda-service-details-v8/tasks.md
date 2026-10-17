# Tasks: lamnda-service-details-v8

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~450-550 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR (exception pre-granted) |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Detail template + 8 demos + SEO/CTA | PR 1 | `astro build` | Serve `dist/servicios/notificaciones-inteligentes/index.html` | Delete `src/pages/servicios/` |
| 2 | Card rewrite + hints + e2e/build | PR 1 | `astro build` | Serve `/` + 1 detail page at 390px | Revert `src/pages/index.astro` |

## Phase 1: Foundation

- [x] 1.1 Create `src/pages/servicios/[slug].astro` with `getStaticPaths` + `Base.astro` SEO shell + breadcrumb `nav[aria-label=breadcrumb]`.
- [x] 1.2 Implement compact hero (pill + `h1` + sub + DRAFT badge) and bullets: full 3+1 body-derived, summary 1+body+2 generic rows.

## Phase 2: Core Implementation

- [x] 2.1 Build 8 static `ejemplo` figures in `[slug].astro` (CSS/SVG, `role="img"`, caption `Mock ilustrativo — sin datos reales`).
- [x] 2.2 Add ≤1 `<script is:inline>` island full-only (RM early-return, no deps) + dual CTA (`/#contact`, `/#services`) + canonical SEO ≤155ch.
- [x] 2.3 Rewrite `#services` card CSS in `src/pages/index.astro`: icon-box 40×40, padding 1.6–1.75rem, gap 1.25rem, order pill→icon→title→summary→bullets→outcome→CTA.
- [x] 2.4 Restyle outcome strip (3px `var(--primary-text)`) + arrow-chip CTA (`→` shifts 4px) + hover lift `translateY(-4px)` + RM guard + 390px single column.

## Phase 3: Integration

- [x] 3.1 Retarget 8 `.example-hint` hrefs to `/servicios/{slug}` in `src/pages/index.astro`; add arrow-chip CTA to 3 summary cards.
- [x] 3.2 Enforce guards: zero `#services` hints, zero numeric KPIs, token-only CSS, Hopf/motion/`tokens.css` untouched.

## Phase 4: Testing

- [x] 4.1 Build 9 pages: run `astro build`, assert `dist/servicios/` has 8 HTML + index.
- [x] 4.2 E2E detail: 8 routes show breadcrumb/hero/bullets/demo/dual CTA; summary pages show 4 rows; SEO/canonical/DRAFT correct.
- [x] 4.3 E2E quality: no-KPI regex (`%`, `\d+%`), AA light/dark, keyboard focus, RM no-lift, 390px `scrollWidth` no overflow.
