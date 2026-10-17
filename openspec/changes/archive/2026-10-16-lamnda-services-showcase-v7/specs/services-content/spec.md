# Delta for services-content

## MODIFIED Requirements

### Requirement: Collections-Backed Services

The system MUST load service, pillar, vision, and mission content from content collections (`title, pillar, priority, summary, bullets, lang`) plus optional `outcome` and `draftLabel` so official texts swap via md files with no code change. `priority` MUST allow 1–8.
(Previously: collections without outcome; priority max 7.)

#### Scenario: Content swap without code

- GIVEN an editor replaces `src/content/services/*.md` including `outcome`
- WHEN the static build reruns
- THEN updated titles/summaries/outcomes render with zero source-code edits.

#### Scenario: Priority 8 accepted

- GIVEN `agendamiento-automatico.md` declares `priority: 8`
- WHEN collections validate
- THEN the build succeeds without schema error.

### Requirement: Priority Full Cards and Summary Cards

The system MUST render 5 full cards (Notificaciones Inteligentes [1], Documentación Automatizada [2], Lead Scoring [5], Dashboards Dinámicos [7], Agendamiento Automático [8, DRAFT]) and 3 summary cards (Bots CRM, Tele-Agentes IA, Marketing Bots). Each full card MUST render `<p class="card-outcome">` from `outcome` plus `<a class="example-hint" href="#services">`; summary cards MUST NOT render outcomes. The DRAFT card MUST render a badge from `draftLabel`. Dashboards Dinámicos MUST use CSS/SVG mock only.
(Previously: 4 full + 3 summary; no outcome/hint/DRAFT rows.)

#### Scenario: Card inventory 5+3

- GIVEN `/` renders `#services`
- WHEN cards are counted (e2e asserts 5 `.card-full` + 3 `.card-summary`)
- THEN titles and pillar labels match inventory and DRAFT badge is visible.

#### Scenario: Outcome full-only and hint self-anchor

- GIVEN all full cards define `outcome`
- WHEN a full card and a summary card render
- THEN full shows outcome + hint to `#services`; summary shows neither.
- AND no hint points outside `#services`.

#### Scenario: Mock dashboard

- GIVEN the Dashboards Dinámicos card renders
- WHEN its visual is inspected
- THEN it is pure CSS/SVG mock with no external data fetch.

## ADDED Requirements

### Requirement: No Numeric KPI Claims

Services `#services` DOM and `src/content/services/*.md` MUST NOT contain numeric KPI patterns (`[+-]?%`, `\d+%`, `x\d`, standalone `%` claims). Outcome lines MUST be qualitative, with no counts as results.

#### Scenario: KPI patterns absent

- GIVEN `#services` DOM and services md sources
- WHEN scanned for `[+-]?%|\d+%|x\d` and standalone `%` claims
- THEN zero matches exist.

#### Scenario: Qualitative outcomes

- GIVEN each full card renders its outcome
- WHEN its text is read
- THEN it states a qualitative benefit with no numbers.

### Requirement: Static Showcase Strip

The system MUST render a static "Cómo se ve" strip between summary grid and `.ally-block` with 3 CSS-only mocks (notification row, score bar, schedule card) plus a "Se conecta con" chips row (WhatsApp, Gmail, Slack, HubSpot). Mocks/chips MUST use token colors, `role="img"` + `aria-label`, "Mock ilustrativo" captions, grayscale original inline SVG, and zero external assets or JS.

#### Scenario: Strip placement and static mocks

- GIVEN `/` renders `#services`
- WHEN the strip is inspected
- THEN 3 CSS mocks appear in order with captions and no fetch or script.

#### Scenario: Original grayscale chips

- GIVEN the chips row renders
- WHEN icons are inspected
- THEN 4 abstract grayscale marks render inline with `currentColor`, no copied logo paths.

### Requirement: Hero Proof, Lede, Ally Navigation and Pillar Lines

Section lede MUST read "Cinco soluciones prioritarias a fondo, tres capacidades resumidas." Hero MUST render qualitative `<p class="hero-proof">` in `var(--muted)` preserving AA in both themes. `.ally-block` MUST add ghost "Ver cómo se ve" → `#services` beside the existing demo CTA. Each `.pillar-card` MUST render qualitative `<p class="pillar-proof">`; the security line MUST frame practice, not product claim.

#### Scenario: Lede, hero proof and ghost navigation

- GIVEN `/` renders hero, `#services` lede, and ally block
- WHEN text and links are read
- THEN "Cinco…" lede, qualitative hero-proof, and ghost button to `#services` exist.

#### Scenario: Pillar lines without overclaim

- GIVEN pillar cards render
- WHEN the security pillar-proof is read
- THEN it states trazabilidad/revisión practice with no feature claim.
