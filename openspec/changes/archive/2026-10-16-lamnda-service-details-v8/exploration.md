# Exploration: lamnda-service-details-v8 — per-service detail routes + card redesign

> Change: `lamnda-service-details-v8` | Mode: openspec (static files) | Date: 2026-10-16
> Preflight: ZERO-cost static only (no backend, no paid); vanilla JS islands OK if still static export; single-PR unlimited (exception granted).

## Complaints addressed

1. **Dead hints:** every `Ver ejemplo en vivo →` on full cards is `<a class="example-hint" href="#services">` (self-anchor placeholder, `src/pages/index.astro:162`). No detail route exists — `src/pages/` has only `index.astro` (no `servicios/` dir). Every hint must navigate to a real URL.
2. **Flat/cramped cards:** current `.card` = `var(--card)` + `1px var(--border)` + `padding: 1.3rem`, no icon-box, flat hierarchy (pill→h3→summary→ul→outcome→hint all same rhythm, `index.astro:454-511`), no hover lift, plain text-link CTA. Must match reference comfort: icon-box, generous padding, clear hierarchy, hover lift + arrow-chip, comfortable line-height/spacing, token-bound, AA + light/dark.

## Current state (verified in code)

- **Collections:** `src/content/config.ts` defines `service` schema (`title, pillar[dara|security|automation], priority 1–8, summary, bullets max 5, lang, card[full|summary], draftLabel?, outcome?`). 8 md files: 5 full (notificaciones-inteligentes p1, documentacion-automatizada p2, lead-scoring p5, dashboards-dinamicos p7, agendamiento-automatico p8+DRAFT) + 3 summary (bots-crm p3 1 bullet, tele-agentes-ia p4 1 bullet, marketing-bots p6 1 bullet). Bodies are 1-line teasers; bullets on summaries are thin (1 each) — detail pages will need body/extra frontmatter or shared template fallback.
- **Routing/build:** `astro.config.mjs` = `output: "static"`, no adapters, no `servicios/` routes. `Base.astro` SEO shell accepts `title/description/canonical/ogImage/lang` — reusable per detail page. Static export keeps ZERO-cost (any static host).
- **Index cards:** `fullCards`/`summaryCards` split in `index.astro:21-22`; full cards render outcome + hint-to-`#services`; summaries render pill+title+summary only. Showcase strip (`#showcase`) already proves the CSS-only mock idiom (notification row, score bars, schedule chips) with `role="img"` + captions + token colors.
- **Tokens (locked):** `tokens.css` — `--bg/--surface/--text/--muted/--primary-text/--border/--card/--shadow/--radius(14px)` + AA pairs (`#7AB3FF` on `#0A1628` dark; `#0A54C2` on white light). Hopf/motion (`HopfHero`, `reveal.ts`, `[data-reveal]`, hero scrim) must stay untouched.
- **Reference sample (structure ideas only, no verbatim copy):** `service-notifications.html` = compact hero (title+subtitle) → value list (`about-list`) → `#ejemplo` live-example block (badge + outcome-h3 + sub + frame with tabs/filter + channel chips + dual CTA `Quiero algo así→#contact` / `Ver servicios`) → footer. Banned for us: numeric KPI chips (`-35%`, `+98%`), emoji icons, vendor-color brand SVGs, external `styles.css/demos.css/script.js`, multi-filter JS beyond one tiny island.

## Affected areas

- `src/pages/servicios/[slug].astro` (NEW) — collections-driven detail template + `getStaticPaths`.
- `src/pages/index.astro` (EDIT, cards block + `<style>` only) — card redesign + hint `href` → `/servicios/{slug}`; summary cards gain CTA too; Hopf/motion/ally/showcase untouched.
- `src/layouts/Base.astro` (REUSE, no edit expected) — per-page `title/description/canonical`.
- `src/styles/tokens.css` (REUSE ONLY — no new tokens; card styles consume existing vars; if a lift shadow is needed, derive from existing `--shadow`).
- `src/content/services/*.md` (OPTIONAL minimal) — only if proposal adds per-page `seoTitle/seoDescription/demo` frontmatter; else template derives from existing fields.
- `openspec/specs/services-content/spec.md` (DELTA in propose/spec) — hint target changes from `#services` to `/servicios/{slug}`; new routes/SEO/breadcrumb/demo requirements.

## Approaches (routing)

1. **Collections-driven `src/pages/servicios/[slug].astro` + `getStaticPaths` (RECOMMENDED)**
   - `getStaticPaths` from `getCollection("services")` → 8 static HTML files at build, zero runtime cost, `output: "static"` compatible.
   - Pros: single template for all 8; content editors add/fix pages via md only; SEO/breadcrumb/CTA consistent; scales to future services free.
   - Cons: summaries have thin bodies (1 bullet) — template needs graceful fallback (summary + generic value row) or small frontmatter enrichment.
   - Effort: Low.
2. **8 hand-written static pages (`src/pages/servicios/<slug>.astro` × 8)**
   - Pros: full per-page bespoke control; no template conditionals.
   - Cons: 8× duplicated hero/demo/CTA/SEO boilerplate; every copy fix touches code; drifts from collections (violates "swap via md, no code change" requirement); larger PR, harder review.
   - Effort: Medium (more code, more drift).
3. **Single `servicios.astro` index + in-page anchors (no per-service URLs)**
   - Pros: smallest diff.
   - Cons: does NOT fix complaint (hints still go nowhere meaningful; no deep-linkable SEO URLs); rejected outright.
   - Effort: Low but fails requirements.

**Decision: Option 1.** Rationale: collections-driven is preferred per brief, preserves static export + ZERO-cost, honors existing `services` collection contract, and turns the 5+3 inventory into 8 deep links with one template.

## Detail template (all 8 pages, Astro static)

```
Breadcrumb: Servicios (/ #services) › {Title}   [aria-label="breadcrumb", Spanish neutral]
Hero (compact): pillar pill + <h1>{title}> + outcome-as-sub (full) or summary-as-sub (summary)
  + DRAFT badge if draftLabel (Agendamiento only)
Value: 4-bullet list — full pages use frontmatter bullets(3)+1 derived from body;
  summary pages use bullet(1)+body+2 template-generic practice lines (no invented features/KPIs)
Ejemplo (static CSS/SVG mini-demo, "ejemplo", zero-JS first):
  <figure role="img" aria-label> + <figcaption>Mock ilustrativo — sin datos reales</figcaption>
  + optional ONE tiny vanilla island (full pages only, if cheap): tabs OR filter via
    <script is:inline> progressive enhancement, no deps, still static export
Dual CTA: [Solicita una demo → /#contact] (primary) + [Volver a servicios → /#services] (ghost)
SEO: <Base title seoTitle description seoDesc canonical https://lamnda.example.com/servicios/{slug}> lang="es"
Footer/Header reuse; no Hopf canvas on detail pages (keep hero cheap); reveal/motion optional reuse.
```

- **Keep:** no numeric KPIs anywhere (ban stands — template must not render `%`, `\d+%`, `x\d`); DRAFT badge on Agendamiento; EN headline pin (detail copy stays ES; no new EN strings); Hopf/motion/tokens untouched.
- **Copy language:** page copy Spanish neutral/professional; artifacts English.

## Card redesign (index only, token-bound, AA + light/dark)

- **Hierarchy (strict order):** `pill → icon-box → title → summary → bullets → outcome → CTA row`.
  - Pill: existing `.pillar-tag` (keep).
  - Icon-box (NEW, pure CSS/SVG): 40×40 rounded (`var(--radius)`-derived 10–12px) tile with `background: var(--surface); border: 1px solid var(--border)`, per-pillar abstract glyph (`currentColor`, reuse hero-pillar strokes: bars/shield/cycle — no vendor logos). `aria-hidden="true"`.
  - Title: `font-display`, ~1.15rem, `line-height 1.3`; summary `color: var(--muted)`, `line-height 1.65`; bullets `line-height 1.6`, custom marker via `::marker { color: var(--primary-text) }`.
  - Outcome: keep `.card-outcome` but restyle as highlighted strip (left `3px var(--primary-text)` border or `var(--surface)` inset box) so it reads as result, not 5th bullet.
  - CTA row: replace text-link `.example-hint` with arrow-chip button: pill button (`border: 1px solid var(--border); border-radius: 999px; padding: .55rem 1rem`) + `→` in chip span that translates `4px` on hover; full keyboard focus via existing `:focus-visible`.
- **Comfort:** card `padding: 1.3rem → 1.6–1.75rem`; grid `gap: 1rem → 1.25rem`; section `line-height ≥1.6`; summary grid keeps 3-col desktop / 1-col ≤900px (existing breakpoint preserved).
- **Hover lift (transform/shadow only, no CLS):** `.card { transition: transform .25s, box-shadow .25s, border-color .25s } .card:hover { transform: translateY(-4px); border-color: var(--primary-text); }` reusing `var(--shadow)`; honor `prefers-reduced-motion` (no lift).
- **AA:** all text stays `var(--text)`/`var(--muted)` (locked pairs); `var(--primary)` never body text; verify muted-on-card in both themes (tokens already AA, redesign adds no new colors).
- **Scope guard:** styles scoped to `#services .card*`; do NOT touch Hopf/hero/reveal/tokens.

## Demo-per-page plan (static CSS/SVG "ejemplo", zero-JS first; ≤1 tiny island per FULL page only if cheap)

| # | Slug (card) | Demo concept (CSS/SVG, captioned mock) | Island? |
|---|-------------|----------------------------------------|---------|
| 1 | notificaciones-inteligentes (full) | Centro de notificaciones: featured alert + 3-row list w/ channel chips (pattern from reference, rebuilt token-only, qualitative only) | YES — 1 tabs filter (Todas/Ventas/Soporte), inline `<script>` progressive enhancement |
| 2 | documentacion-automatizada (full) | Fuente→plantilla→PDF pipeline: 3-step flow (CRM/hojas/APIs → plantilla → documento) + "Revisión humana" checkpoint chip | NO (static steps) |
| 3 | bots-crm (summary) | Regla→asignación: 2-card mock (nuevo contacto → responsable asignado) + chip row | NO |
| 4 | tele-agentes-ia (summary) | Guion supervisado: call-script card with audit ticks + "supervisión humana" badge | NO |
| 5 | lead-scoring (full) | Lista priorizada: Alta/Media/Baja bars (reuse showcase idiom, qualitative labels only, no scores/%) | MAYBE — 1 sort toggle if trivial, else static |
| 6 | marketing-bots (summary) | Segmento→mensaje: 2-segment chips → message preview card | NO |
| 7 | dashboards-dinamicos (full) | Tablero vivo: reuse existing card SVG idiom (trend line + KPI tiles w/o numbers + donut), extended with filter chips (sede/equipo/periodo as static chips) | MAYBE — 1 filter-chip toggle if trivial, else static |
| 8 | agendamiento-automatico (full, DRAFT) | Agenda de mañana: schedule chips (09:00/11:30/16:00 idiom) + confirm/reminder flow (WhatsApp/correo) + DRAFT badge retained | NO |

- Deferred-if-blocked: any island that threatens static export, adds deps, or needs backend → ship page static, list as deferred. Summary pages NEVER get islands (keep them light).
- All demos: token colors only, `role="img"` + `aria-label`, "Mock ilustrativo — sin datos reales", zero external assets/JS-libs, no numeric KPIs, no vendor logos.

## SEO per page (derived, ES neutral; final strings in spec)

- Pattern: title `{Service} — Lamnda`; desc from `summary`/`outcome` trimmed ≤155 chars, qualitative.
- Canonical `https://lamnda.example.com/servicios/{slug}`; breadcrumb + dual CTA anchors (`/#contact`, `/#services`) keep hash-nav working from subpaths.
- Slugs = existing collection slugs (8 URLs, no slug changes → no redirects needed).

## Risks

- Thin summary content (1 bullet, 1-line body) → detail pages risk looking empty; mitigate with shared fallback value-rows (practice-level, no invented features) or minimal frontmatter enrichment in proposal.
- Template conditional complexity (full vs summary vs DRAFT) → keep single template with 2 branches max; DRAFT badge already conditional.
- Card hover/lift regresses AA or motion prefs → scope to transform/shadow/border only + `prefers-reduced-motion` guard; no color changes.
- Island creep (tabs/filter per page) → cap enforced: ≤1 tiny inline script on full pages, none on summaries; static-first acceptance.
- Spec drift: current `services-content/spec.md` LOCKS hint→`#services` and "no hint points outside" — delta REQUIRED or verify fails; flag in proposal.

## Recommendation

Collections-driven `[slug].astro` + single detail template + token-bound card redesign; static CSS/SVG demos for all 8, islands only where trivially cheap on full pages. Preserves static/ZERO-cost, fixes both complaints, keeps all bans/pins.

## Ready for proposal

Yes — orchestrator can proceed to `sdd-propose`. Proposal must include: routing decision record, template wireframe, card CSS scope, demo-per-page table, SEO pattern, and the `services-content` spec delta (hint target + new routes). No user clarification needed; if proposal wants per-page SEO strings or summary-body enrichment, it may ask then.
