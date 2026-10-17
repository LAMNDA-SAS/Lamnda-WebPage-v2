# Exploration: lamnda-services-showcase-v7 — services showcase (5 full + 3 summary, no KPIs, static only)

## Current State

- `src/content/services/*.md` (7 files): 4 full (`notificaciones-inteligentes` p1, `documentacion-automatizada` p2, `lead-scoring` p5, `dashboards-dinamicos` p7) + 3 summary (`bots-crm` p3, `tele-agentes-ia` p4, `marketing-bots` p6). Tone: short ES summaries + 3 noun-phrase bullets + one body line. All `lang: "es"`.
- `src/content/config.ts`: service schema `priority` is `.min(1).max(7)` — an 8th service REQUIRES a schema bump. `draftLabel?: string` already exists in schema but is UNUSED in any template (confirmed via search) — ready-made home for the DRAFT badge.
- `src/pages/index.astro` `#services`: `fullCards`/`summaryCards` split is automatic via `card` field (no logic change needed for inventory). Full cards render pillar-tag + title + summary + bullets; only `dashboards-dinamicos` has a visual (inline SVG mock + caption). Section lede hardcodes "Cuatro soluciones prioritarias a fondo, tres capacidades resumidas." Hero CTAs: primary "Explore our solutions"→`#services`, ghost "Get in touch"→`#contact`. Ally block: "Tu aliado en la transformación digital" + primary "Solicita una demo"→`#contact`.
- `src/styles/tokens.css`: locked AA pairs (`--primary-text` `#7AB3FF` dark / `#0A54C2` light). Brand `--primary` is graphics-only, never body text. No new colors allowed.
- `openspec/specs/services-content/spec.md`: locks "4 full + 3 summary" + mock-dashboard + TBD rules — needs a delta spec for 5+3.
- `tests/e2e/site.spec.ts:85-90` asserts `.card-full` count 4 + `.card-summary` count 3 — MUST be updated to 5 + 3.
- Survey clone (`C:\RTemp\opencode\Lamnda-WebPage-survey\service-*.html`, `index.html`): structural IDEAS only — card grid with "Ver ejemplo en vivo →" hint rows, `live-example` section pattern (badge + outcome line + channel row + CTA row), tabbed/filtered notification mock, channel chips. **Do NOT port**: numeric KPI pills (`-35%`, `+98%`, etc. in every `service-*.html` `example-kpis` block — owner-vetoed), the JS tab/filter script, emoji icons, external `assets/images/lamnda-logo.png`, per-service detail pages. All fresh ES copy; never lift brand images.

## No-KPI Rule (owner veto, binding)

NO numeric KPI pills anywhere: no `-35%`, `+31%`, `+98%`, no percentages, no counts presented as results. Qualitative outcome lines only (one per full card). The survey's `example-kpis` pattern is explicitly excluded from porting. If a future owner approves metrics, that is a separate change with approved figures — not this one.

## Card Inventory (target: 5 full + 3 summary)

| # | Card | File | Pillar | Priority | Type |
|---|------|------|--------|----------|------|
| 1 | Notificaciones Inteligentes | `notificaciones-inteligentes.md` (exists) | automation | 1 | full |
| 2 | Documentación Automatizada | `documentacion-automatizada.md` (exists) | automation | 2 | full |
| 3 | Bots CRM | `bots-crm.md` (exists, unchanged) | automation | 3 | summary |
| 4 | Tele-Agentes IA | `tele-agentes-ia.md` (exists, unchanged) | automation | 4 | summary |
| 5 | Lead Scoring | `lead-scoring.md` (exists) | data | 5 | full |
| 6 | Marketing Bots | `marketing-bots.md` (exists, unchanged) | data | 6 | summary |
| 7 | Dashboards Dinámicos | `dashboards-dinamicos.md` (exists) | data | 7 | full |
| 8 | **Agendamiento Automático [DRAFT]** | `agendamiento-automatico.md` (NEW) | automation | 8 | full |

### New draft copy — Agendamiento Automático (DRAFT, owner approval pending)

Fresh didactic ES copy in the same tone as existing summaries. Frontmatter carries `draftLabel: "Borrador — texto oficial pendiente"` (schema field already exists, template will render it as a badge):

```markdown
---
title: "Agendamiento Automático"
pillar: "automation"
priority: 8
summary: "Tus citas se agendan solas: el asistente propone horarios, confirma y reprograma sin fricción."
bullets:
  - "Propuesta de horarios según disponibilidad real"
  - "Confirmación y recordatorios por WhatsApp y correo"
  - "Reprogramación automática sin llamadas de más"
lang: "es"
card: "full"
draftLabel: "Borrador — texto oficial pendiente"
---

Menos huecos vacíos, más visitas que sí ocurren: cada cita llega con contexto y recordatorio.
```

### Outcome lines (qualitative, one per full card — fresh copy, no numbers)

Rendered as a `<p class="card-outcome">` above the hint row. Recommended new optional frontmatter field `outcome?: string` (keeps copy in md files, zero code edits for future swaps):

1. **Notificaciones Inteligentes** — "Cada evento crítico llega a la persona correcta, por el canal correcto, sin perseguirlo."
2. **Documentación Automatizada** — "Del dato disperso al documento listo para firmar, con revisión humana incluida."
3. **Lead Scoring** — "Tu equipo llama primero a quien sí va a comprar."
4. **Dashboards Dinámicos** — "La respuesta ya está en el tablero antes de que la pregunta llegue a la reunión."
5. **Agendamiento Automático [DRAFT]** — "La agenda se llena sola y los huecos vacíos desaparecen."

### Hint rows (all 5 full cards)

`<a class="example-hint" href="#services">Ver ejemplo en vivo →</a>` — anchors to `#services` as the safe no-dead-link target until per-service detail pages exist (deferred, see below). Mirrors the survey's `example-hint` pattern; target is the future detail anchor.

## Placements

| Element | Placement | Notes |
|---------|-----------|-------|
| Outcome line + hint row | Inside each `.card-full`, after `<ul>` (before dashboard mock where present) | Static markup + optional `outcome` frontmatter field |
| DRAFT badge | Top of Agendamiento card, from existing `draftLabel` schema field | Same visual language as `.tbd-label` (vision/mission) |
| "Cómo se ve" strip | New static block in `#services` between summary grid and `.ally-block` | 3 CSS-only mini-mocks + chips row; one anchor home for hint rows |
| Mini-mock 1: notification row | Strip slot 1 | Bell dot + two text bars + channel tag; pure CSS, `role="img"` + `aria-label`, caption "Mock ilustrativo" |
| Mini-mock 2: score bar | Strip slot 2 | Three labeled bars (Alta/Media/Baja) via inline width; labels not color-alone (a11y); token colors only |
| Mini-mock 3: schedule card | Strip slot 3 | Mini agenda card with time chips (mirrors new Agendamiento card); pure CSS |
| Integration chips row | Inside strip, below mocks ("Se conecta con") | WhatsApp, Gmail, Slack, HubSpot — hand-drawn minimal inline SVG, `currentColor`/grayscale, no external assets, no copied logo paths |
| Hero proof line | New `<p class="hero-proof">` under `.hero-note` | Qualitative only, e.g. "Equipos que responden en minutos, documentos listos el mismo día, agendas que se llenan solas." — `var(--muted)` so AA holds in both themes |
| Ghost button "Ver cómo se ve" | `.ally-block`, next to "Solicita una demo", `href="#services"` | Native anchor (no-JS fallback free); hero primary already targets `#services`, so the ally block is the non-duplicative home |
| Pillar concrete lines | New `<p class="pillar-proof">` in each `.pillar-card` | Data: "Del historial disperso a la lista priorizada: cada lead llega con contexto." / Automation: "Lo repetitivo se hace solo; tu equipo solo decide lo importante." / Security: "Trazabilidad y revisión humana en cada flujo automatizado." (derived from notif/docs bullets — no service maps to `security` today, flagged honestly, not a product claim) |
| Section lede | Update "Cuatro…" → "Cinco soluciones prioritarias a fondo, tres capacidades resumidas." | Hardcoded string in `index.astro:122` |

## Affected Areas

- `src/content/services/agendamiento-automatico.md` (NEW) + `outcome` lines on the 4 existing full cards (frontmatter-only edits, new optional field)
- `src/content/config.ts` — `priority` max 7 → 8; add `outcome?: string` optional (both backward-compatible)
- `src/pages/index.astro` — full-card outcome + hint-row markup, `draftLabel` badge render, strip + mocks + chips markup + scoped `<style>`, lede "Cuatro"→"Cinco", ally ghost button, hero proof line
- `src/styles/tokens.css` — reuse only, no new tokens (strip/mocks/chips inherit `var(--card)/--border/--muted/--primary-text`)
- `openspec/specs/services-content/spec.md` — delta: 5 full + 3 summary, no-KPI rule, strip/chips/hero-line requirements
- `tests/e2e/site.spec.ts:85-90` — `.card-full` 4 → 5

## Approaches

1. **Frontmatter-driven static (RECOMMENDED)** — `outcome` as optional md field, `draftLabel` reused as-is; `index.astro` renders both with `{#if}` guards; strip/mocks/chips are static HTML+CSS in the `#services` section; zero JS, zero deps, zero network.
   - Pros: copy swaps stay code-free (spec's core promise); no JS to test; theme/RM-safe by construction; smallest diff.
   - Cons: none material.
   - Effort: Low.
2. **Hardcoded outcomes in `index.astro`** — outcome strings live in the template keyed by slug.
   - Pros: no schema touch.
   - Cons: breaks the collections-swap promise (copy edit = code edit); slug-keyed conditionals rot.
   - Effort: Low (but wrong trade).
3. **Interactive strip (JS tabs/filters like survey)** — port the survey's tab/filter script.
   - Pros: visual parity with survey draft.
   - Cons: violates ZERO-cost static-only preflight; JS needs tests + RM handling; heavier review.
   - Effort: Medium. DEFER.

## Recommendation

Approach 1. Single PR (size exception granted): new md file + 4 md outcome lines, schema bump (max 8 + `outcome?`), `index.astro` markup + scoped styles, lede fix, e2e count fix, delta spec. Everything token-bound, AA inherited, no JS.

## Risks

- **Schema bump side effects**: trivial (`.max(7)`→`.max(8)`); existing files unaffected. Mitigation: build + existing collections tests.
- **HubSpot glyph**: must be an original minimal mark, not the lifted brand path — keep it abstract (node/hub motif) in grayscale so it reads as a label, not a logo.
- **Hint-row target confusion**: `href="#services"` self-anchors until detail pages exist; acceptable per "no dead links" rule, but MUST be recorded as deferred so a later change re-points them.
- **Security pillar line overclaim**: no `security`-pillar service exists; the line is framed as a practice (trazabilidad/revisión), not a product. Do not harden into a feature claim.

## Deferred (ZERO-cost preflight: defer-if-blocked, no JS/network)

- Per-service detail pages / `#ejemplo` anchors (hint rows re-point then).
- Real product screenshots or live embeds (CSS/SVG mocks only in v7).
- JS interactivity in the strip (tabs, filters).
- Official Agendamiento copy (DRAFT badge stays until owner approves).
- Approved numeric metrics (a separate change IF the KPI veto is ever lifted).

## Ready for Proposal

Yes. Scope is fully bounded: inventory fixed (5+3), copy drafted, placements pinned, no-KPI rule explicit, static-only constraint compatible with every element. Proposal should lock the `outcome` field name and the strip's exact position (summary-grid → strip → ally-block).
