# Delta for services-content

## Requirements

### Requirement: Collections-Backed Services

The system MUST load service, pillar, vision, and mission content from content collections (`title, pillar, priority, summary, bullets, lang`) plus optional `outcome` and `draftLabel` so official texts swap via md files with no code change. `priority` MUST allow 1–8.

#### Scenario: Content swap without code

- GIVEN an editor replaces `src/content/services/*.md` including `outcome`
- WHEN the static build reruns
- THEN updated titles/summaries/outcomes render with zero source-code edits.

#### Scenario: Priority 8 accepted

- GIVEN `agendamiento-automatico.md` declares `priority: 8`
- WHEN collections validate
- THEN the build succeeds without schema error.

### Requirement: Priority Full Cards and Summary Cards

The system MUST render 5 full cards (Notificaciones [1], Documentación [2], Lead Scoring [5], Dashboards [7], Agendamiento [8, DRAFT]) and 3 summary cards (Bots CRM, Tele-Agentes IA, Marketing Bots). Every card MUST render `<a class="example-hint" href="/servicios/{slug}">`. Full cards MUST also render `<p class="card-outcome">` from `outcome`. DRAFT MUST render badge from `draftLabel`. Dashboards MUST use CSS/SVG mock only.

#### Scenario: Card inventory 5+3

- GIVEN `/` renders `#services`
- WHEN cards are counted (5 `.card-full` + 3 `.card-summary`)
- THEN titles, pillars, DRAFT match inventory.

#### Scenario: Hints deep-link, never self-anchor

- GIVEN all 8 cards render hints
- WHEN each hint `href` is read
- THEN it equals `/servicios/{slug}` and zero point to `#services`.

#### Scenario: Outcome full-only, CTA on all

- GIVEN a full and a summary card render
- WHEN outcome and CTA rows are inspected
- THEN full shows outcome + CTA; summary shows CTA without outcome.

#### Scenario: Mock dashboard

- GIVEN Dashboards card renders
- WHEN its visual is inspected
- THEN it is CSS/SVG mock with no fetch.

### Requirement: Pillars Strip and Vision/Mission Placeholders

The system MUST render the 3-pillar strip (Data Science / Cybersecurity / Automations) and vision/mission sections with explicit TBD placeholders that MUST NOT block build or deploy.

#### Scenario: Placeholders visible, build green

- GIVEN official vision/mission texts are still pending
- WHEN the site builds and renders
- THEN vision/mission show labeled TBD copy and the build succeeds.

#### Scenario: Secondary contact CTA

- GIVEN the services closing block renders
- WHEN the visitor reads `Tu aliado en la transformación digital`
- THEN a secondary `Solicita una demo` CTA linking to `#contact` is present.

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

### Requirement: Service Detail Routes

The system MUST generate 8 static routes `/servicios/{slug}` via `getStaticPaths` from `services` collection (`output:"static"`). Each page MUST render: breadcrumb (`Servicios › {Title}`, `aria-label="breadcrumb"`); compact hero (pill + `h1` + outcome-as-sub on full / summary-as-sub on summary + DRAFT badge); value bullets (full: 3 frontmatter + 1 body-derived; summary: 1 bullet + body + 2 generic practice rows, no invented features/KPIs); static CSS/SVG `ejemplo` figure (`role="img"`, caption `Mock ilustrativo — sin datos reales`, token-only, zero external assets; full pages MAY add ≤1 `<script is:inline>` island, summaries MUST have zero); dual CTA (`Solicita una demo → /#contact` + `Volver a servicios → /#services`); per-page SEO (`{Service} — Lamnda` title, derived description ≤155 chars, canonical `/servicios/{slug}`). Pages MUST contain zero numeric KPI patterns.

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
- THEN SEO is page-specific, Agendamiento keeps DRAFT, zero KPI matches exist.

### Requirement: Service Card Redesign

The system MUST restyle `#services .card*` with hierarchy pill → icon-box → title → summary → bullets → outcome → CTA. Icon-box MUST be 40×40 CSS tile (`var(--surface)`, `1px var(--border)`, 10–12px radius, glyph, `aria-hidden`). Cards MUST use padding 1.6–1.75rem, gap 1.25rem, title ~1.15rem/`1.3`, summary `var(--muted)`/`1.65`, outcome as strip (3px border or inset box). Hover MUST lift via transform/shadow/border only (`translateY(-4px)`, `var(--shadow)`) with `prefers-reduced-motion` guard. CTA MUST be arrow-chip link (pill + `→` chip, 4px hover shift, focusable), never plain text. Styles MUST be token-only, AA both themes, scoped `#services`, 1 column at 390px, no scroll.

#### Scenario: Hierarchy, icon-box, and comfort

- GIVEN `#services` cards render
- WHEN DOM order and styles are inspected
- THEN order, icon-box, padding, and type values match spec.

#### Scenario: Hover lift with motion guard

- GIVEN a card is hovered
- WHEN transform and motion prefs are checked
- THEN lift is transform/shadow only and disabled under reduced motion.

#### Scenario: Chip CTA, tokens, AA, 390px

- GIVEN cards render light/dark at 390px
- WHEN CTA, colors, contrast, and layout are checked
- THEN chip CTA links correctly, tokens only, AA holds, no horizontal scroll.
