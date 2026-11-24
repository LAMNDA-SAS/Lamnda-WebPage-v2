# Delta for services-content (lamnda-old-demos-port-v9)

## MODIFIED Requirements

### Requirement: Service Detail Routes

The system MUST generate 8 static routes `/servicios/{slug}` via `getStaticPaths` from `services` collection (`output:"static"`). Each page MUST render: breadcrumb (`Servicios › {Title}`, `aria-label="breadcrumb"`); compact hero (pill + `h1` + outcome-as-sub on full / summary-as-sub on summary + DRAFT badge); value bullets (full: 3 frontmatter + 1 body-derived; summary: 1 bullet + body + 2 generic practice rows, no invented features/KPIs); `ejemplo` section: for the 7 old-demo slugs (`notificaciones-inteligentes`, `documentacion-automatizada`, `dashboards-dinamicos`, `lead-scoring`, `bots-crm`, `tele-agentes-ia`, `marketing-bots`) the ported demo component per `service-demos` as content of `figure.demo-figure` (caption kept, demo subtree freed of `role="img"`), while `agendamiento-automatico` (DRAFT) keeps its static CSS/SVG mock (`role="img"`, token-only, zero external assets); dual CTA (`Solicita una demo → /#contact` + `Volver a servicios → /#services`); per-page SEO (`{Service} — Lamnda` title, derived description ≤155 chars, canonical `/servicios/{slug}`). Every page MUST hold ≤1 inline script total (component scripts count, incl. summary demos); the superseded notif tabs-filter page script MUST be removed; `agendamiento-automatico` carries zero. Page copy outside demo bodies MUST contain zero numeric KPI patterns (sample-labeled demo bodies exempt).
(Previously: static mock everywhere; fulls MAY one island, summaries zero; page-wide KPI scan.)

#### Scenario: Eight static paths build

- GIVEN 8 collection entries exist
- WHEN `getStaticPaths` builds
- THEN 8 HTML files exist at `/servicios/{slug}`.

#### Scenario: Breadcrumb, hero, and dual CTA

- GIVEN any detail page renders
- WHEN hero and CTA blocks are read
- THEN breadcrumb, `h1`, sub, and both CTAs exist.

#### Scenario: Thin-summary fallback without invention

- GIVEN a summary page (1 bullet, 1-line body) renders
- WHEN the value list is read
- THEN 4 rows appear with no invented features or KPIs.

#### Scenario: SEO, DRAFT, and no-KPI guard

- GIVEN any detail page head and body are scanned
- WHEN title/description/canonical and KPI patterns are checked
- THEN SEO is page-specific, Agendamiento keeps DRAFT and zero scripts, and KPI matches exist only inside sample-labeled demo bodies.

#### Scenario: Ported demo island replaces static mock

- GIVEN the 7 old-demo slugs render
- WHEN each ejemplo figure is inspected
- THEN the mapped component's old-root DOM replaces the mock with no `role="img"` and unchanged figcaption; `agendamiento-automatico` keeps its static mock.

#### Scenario: One inline script per page including components

- GIVEN all 8 built pages
- WHEN inline scripts are counted per page
- THEN the 7 demo pages show exactly 1 each (their component's script), `agendamiento-automatico` shows 0, and `notificaciones-inteligentes` carries no residual tabs-filter page script.

### Requirement: No Numeric KPI Claims

Services `#services` DOM, `src/content/services/*.md`, and detail-page copy outside ported demo bodies (`h1`, outcomes, bullets, captions, CTAs, SEO/meta, incl. all new copy) MUST NOT contain numeric KPI patterns (`[+-]?%`, `\d+%`, `x\d`, standalone `%` claims). Ported demo bodies are the only exemption: numeric chips and sample values are allowed ONLY when the demo body carries its visible "Datos de muestra" note (per service-demos). Outcome lines MUST be qualitative, with no counts as results.
(Previously: page-wide ban, no demo-body carve-out.)

#### Scenario: KPI patterns absent outside demo bodies

- GIVEN `#services` DOM, services md sources, and detail-page copy outside demo bodies
- WHEN scanned for `[+-]?%|\d+%|x\d` and standalone `%` claims
- THEN zero matches exist.

#### Scenario: Qualitative outcomes

- GIVEN each full card renders its outcome
- WHEN its text is read
- THEN it states a qualitative benefit with no numbers.

#### Scenario: Sample label gates the exemption

- GIVEN a ported demo body contains numeric chips or values
- WHEN its subtree and visible note are checked
- THEN every numeric occurrence sits inside a demo body showing the "Datos de muestra" note; bodies with numbers but no note fail.

#### Scenario: Exemption ends at the demo body

- GIVEN the figcaption, hero block, and dual CTA render around a demo
- WHEN they are scanned
- THEN they contain zero numeric KPI patterns.
