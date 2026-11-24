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

### Requirement: Uniform Service Cards

The system MUST render all 8 services as equal cards (Notificaciones [1], Documentación [2], Bots CRM [3], Tele-Agentes IA [4], Lead Scoring [5], Marketing Bots [6], Dashboards [7], Agendamiento [8, DRAFT]) in a single grid. Every card MUST render the same shape: pillar pill → icon-box → title → summary → 3 bullets → outcome → deep-link hint. There MUST be no card-size variants and no inline visual mock inside cards. DRAFT MUST render badge from `draftLabel`. Cards MUST NOT carry a `card` frontmatter field.

#### Scenario: Card inventory 8

- GIVEN `/` renders `#services`
- WHEN cards are counted (8 `.card-full`, 0 `.card-summary`)
- THEN titles, pillars, bullets, outcome, and DRAFT match inventory.

#### Scenario: Hints deep-link, never self-anchor

- GIVEN all 8 cards render hints
- WHEN each hint `href` is read
- THEN it equals `/servicios/{slug}` and zero point to `#services`.

#### Scenario: Same shape on every card

- GIVEN any card renders
- WHEN its rows are inspected
- THEN it shows 3 bullets, one outcome, and one hint — no card is thinner than another.

#### Scenario: No inline mock in cards

- GIVEN any card renders
- WHEN its visual is inspected
- THEN it carries no embedded mock; the demo lives on its detail page.

### Requirement: Pillars Strip and Vision/Mission Placeholders

The system MUST render the 2-pillar strip (Data Science / Automations) and vision/mission sections with explicit TBD placeholders that MUST NOT block build or deploy. The Cybersecurity pillar MUST NOT exist anywhere on the site (collection, hero echo, pillar grid, nav link).

#### Scenario: Placeholders visible, build green

- GIVEN official vision/mission texts are still pending
- WHEN the site builds and renders
- THEN vision/mission show labeled TBD copy and the build succeeds.

#### Scenario: Secondary contact CTA

- GIVEN the services closing block renders
- WHEN the visitor reads `Tu aliado en la transformación digital`
- THEN a secondary `Solicita una demo` CTA linking to `#contact` is present.

### Requirement: No Numeric KPI Claims

Services `#services` DOM, `src/content/services/*.md`, and detail-page copy outside ported demo bodies (`h1`, outcomes, bullets, captions, CTAs, SEO/meta, incl. all new copy) MUST NOT contain numeric KPI patterns (`[+-]?%`, `\d+%`, `x\d`, standalone `%` claims). Ported demo bodies are the only exemption: numeric chips and sample values are allowed ONLY when the demo body carries its visible "Datos de muestra" note (per service-demos). Outcome lines MUST be qualitative, with no counts as results.
(Previously: page-wide ban, no demo-body carve-out.)

#### Scenario: KPI patterns absent outside demo bodies

- GIVEN `#services` DOM, services md sources, and detail-page copy outside demo bodies
- WHEN scanned for `[+-]?%|\d+%|x\d` and standalone `%` claims
- THEN zero matches exist.

#### Scenario: Qualitative outcomes

- GIVEN each card renders its outcome
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

### Requirement: Lede, Hero Copy, Ally Navigation and Pillar Lines

Section lede MUST read "Ocho soluciones, el mismo estándar de calidad." The hero MUST NOT render `hero-proof` or `hero-note` copy. `.ally-block` MUST keep the "Solicita una demo" CTA linking to `#contact` and MUST NOT render a "Ver cómo se ve" link. Each `.pillar-card` MUST render a qualitative `<p class="pillar-proof">` for the 2 remaining pillars.

#### Scenario: Lede, lean hero and ally navigation

- GIVEN `/` renders hero, `#services` lede, and ally block
- WHEN text and links are read
- THEN "Ocho…" lede is present, zero `hero-proof`/`hero-note` nodes exist, and the ally block carries only the `#contact` CTA.

#### Scenario: Pillar lines without overclaim

- GIVEN pillar cards render
- WHEN each pillar-proof is read
- THEN it states a qualitative practice with no feature claim or KPI.

### Requirement: Service Detail Routes

The system MUST generate 8 static routes `/servicios/{slug}` via `getStaticPaths` from `services` collection (`output:"static"`). Each page MUST render: breadcrumb (`Servicios › {Title}`, `aria-label="breadcrumb"`); compact hero (pill + `h1` + outcome-as-sub + DRAFT badge); value bullets (3 frontmatter + 1 body-derived for every service, no card-size variants, no invented features/KPIs); `ejemplo` section: for the 7 old-demo slugs (`notificaciones-inteligentes`, `documentacion-automatizada`, `dashboards-dinamicos`, `lead-scoring`, `bots-crm`, `tele-agentes-ia`, `marketing-bots`) the ported demo component per `service-demos` as content of `figure.demo-figure` (caption kept, demo subtree freed of `role="img"`), while `agendamiento-automatico` (DRAFT) keeps its static CSS/SVG mock (`role="img"`, token-only, zero external assets); dual CTA (`Solicita una demo → /#contact` + `Volver a servicios → /#services`); per-page SEO (`{Service} — Lamnda` title, derived description ≤155 chars, canonical `/servicios/{slug}`). Every page MUST hold ≤1 inline script total (component scripts count); the superseded notif tabs-filter page script MUST be removed; `agendamiento-automatico` carries zero. Page copy outside demo bodies MUST contain zero numeric KPI patterns (sample-labeled demo bodies exempt).
(Previously: static mock everywhere; fulls MAY one island, summaries zero; page-wide KPI scan.)

#### Scenario: Eight static paths build

- GIVEN 8 collection entries exist
- WHEN `getStaticPaths` builds
- THEN 8 HTML files exist at `/servicios/{slug}`.

#### Scenario: Breadcrumb, hero, and dual CTA

- GIVEN any detail page renders
- WHEN hero and CTA blocks are read
- THEN breadcrumb, `h1`, sub, and both CTAs exist.

#### Scenario: Uniform value rows

- GIVEN any detail page renders
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
