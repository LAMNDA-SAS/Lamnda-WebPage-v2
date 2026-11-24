# service-demos Specification (new capability — lamnda-old-demos-port-v9)

## Purpose

Faithful ("tal cual") port of the 7 old service demos into self-contained v2 components: same content, structure, micro-interactions; v2 tokens + AA, 1 inline script per demo, zero network calls, zero new runtime deps, zero `tokens.css` edits.

## Requirements

### Requirement: Demo island inventory and wiring

The system MUST provide exactly 7 components in `src/components/demos/`, wired 1:1 into `servicios/[slug].astro`: `DemoNotificaciones`·`notificaciones-inteligentes`, `DemoDocumentos`·`documentacion-automatizada`, `DemoDashboards`·`dashboards-dinamicos`, `DemoLeadScoring`·`lead-scoring`, `DemoBotsCrm`·`bots-crm`, `DemoTeleAgentes`·`tele-agentes-ia`, `DemoMarketingBots`·`marketing-bots`. Figure ownership: the template keeps `h2 "Ejemplo"` + `figure.demo-figure`/figcaption on all 8 slugs; demo subtrees render inside the figure; `agendamiento-automatico` (DRAFT) keeps its static mock.

#### Scenario: Seven islands wired in the template shell

- GIVEN the 8 built service pages
- WHEN each ejemplo section is inspected
- THEN the 7 slugs render their mapped component's subtree in the kept figure (caption unchanged, no `role="img"` on demos) and `agendamiento-automatico` keeps mock + `role="img"`.

### Requirement: Tal-cual content fidelity

Markup, Spanish copy, sample data, and interactivity MUST port 1:1 tal cual. Old class names (`example-*`, `pd-*`) MUST stay verbatim. Dashboards' English panel labels MUST carry the old disclaimer note; no new EN copy outside demo bodies (EN headline pin untouched).

#### Scenario: Port fidelity and restored interactivity

- GIVEN an old demo page, its port, and each old interaction (filter, generate, sort, drag, walkthrough, replay, tabs/drift)
- WHEN classes, copy, and data are compared and interactions run
- THEN content matches verbatim except directed drops (old CTAs, vendor SVGs→chips) and behavior matches the old page under keyboard and pointer.

### Requirement: Token-only scoped styling with component-scoped status colors

Demo CSS MUST live scoped in the component, port only used selectors from old `demos.css`/`portfolio.css` (incl. `.pd-*`; no wholesale import), and use v2 token vars only; `tokens.css` MUST NOT change. Status/success/warning colors MUST be CSS custom props declared inside the demo component, AA-checked in both themes. Old `[data-theme="dark"]` blocks MUST NOT be ported; baked hexes in JS MUST remap to scoped vars.

#### Scenario: Token discipline and status AA

- GIVEN demo styles, scripts, tokens.css, and both themes' renders
- WHEN old-palette hexes are scanned, tokens.css diffed, and status var contrast computed
- THEN no old raw hex survives outside scoped status vars, the tokens.css diff is empty, and status text holds ≥4.5:1 (indicators ≥3:1) in both themes.

### Requirement: Single inline island, zero external runtime

Each component MUST embed ≤1 `<script is:inline>`: one vanilla IIFE — no imports, no libraries, no external assets, zero network calls. Each IIFE MUST keep the old `prefers-reduced-motion` degradation path (motion → old static render). Page-level cap: ≤1 total incl. component scripts, notif dedupe — see services-content.

#### Scenario: One island, RM-guarded, offline

- GIVEN a built demo page in either theme
- WHEN scripts are counted, reduced motion is emulated, and the network log is read
- THEN ≤1 inline script exists, motion matches the old RM static output, and zero external calls occur.

### Requirement: No old CTAs; vendor logos become text chips

Old per-demo CTA buttons MUST NOT be ported; the v2 dual CTA remains the page's CTA. Vendor SVG logo strips (8 channels; 7 CRMs) MUST become v2 text chips; informational strips/slogans stay as text.

#### Scenario: CTA and chip surface

- GIVEN ported demo bodies
- WHEN old CTA buttons and logo SVGs are checked
- THEN zero remain, names render as AA chips, and the v2 dual CTA is unmodified.

### Requirement: Sample-data rules

Numeric KPI chips and sample percentages/prices/dates MAY appear only inside ported demo bodies carrying the old visible "Datos de muestra" note; the standing no-KPI ban applies elsewhere (new copy, headings, captions, meta/SEO). The docs demo MUST keep real Lamnda contact data tal cual (NIT 902015091-8, +57 320 890 9792, operaciones@lamnda.com, Cra. 90 Bis #75-78 Bogotá).

#### Scenario: Sample patterns and docs data

- GIVEN any detail page and the docs quotation
- WHEN KPI patterns and NIT/phone/email/address are checked
- THEN numerals appear only inside demo bodies with the visible "Datos de muestra" note and contact data matches the old demo exactly.
