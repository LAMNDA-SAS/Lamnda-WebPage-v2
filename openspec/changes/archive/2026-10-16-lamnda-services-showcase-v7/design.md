# Design: Services Showcase v7 — 5+3 Static Showcase

## Technical Approach

Frontmatter-driven static growth of `#services` from 4+3 to 5+3. Copy lives in `src/content/services/*.md` (`outcome?`, reused `draftLabel?`); `src/pages/index.astro` renders with `{#if}` guards plus a static "Cómo se ve" strip and scoped `<style>`. Card-split logic, themes, and zero-JS constraint unchanged. No sequence diagram — no runtime flow exists; build-time data flow below.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `outcome` as optional frontmatter field vs hardcoded strings in `index.astro` | Frontmatter: copy swaps stay code-free, one schema line; Hardcode: no schema touch but slug-keyed conditionals rot and break the collections-swap promise | **Frontmatter** (`outcome?: string`, guarded render) |
| CSS/SVG-only mocks vs porting survey JS tabs/filters | CSS: zero JS/tests/RM handling, theme-safe by construction; Ported JS: visual parity but violates static-only preflight and needs interaction tests | **CSS mocks**, survey JS explicitly excluded |
| Hint `href="#services"` vs per-service detail anchors | Self-anchor: no dead links today, re-pointable later; Detail pages: out of scope for single PR | **Self-anchor**, deferred re-point recorded in tasks |

## Data Flow

```
*.md frontmatter ──→ Zod (config.ts) ──→ getCollection("services")
  ──→ sort by priority ──→ full/summary split (card field, unchanged)
  ──→ index.astro {#if} guards ──→ static HTML (no client JS)
```

Placement order inside `#services`: full grid → summary grid → strip (`#showcase`) → `.ally-block`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/content/config.ts` | Modify | `priority` max 7→8; add `outcome?: string` (`draftLabel?` reused as-is) |
| `src/content/services/agendamiento-automatico.md` | Create | Priority 8, `card: full`, ES title/bullets/body + `draftLabel` + `outcome` (copy §Interfaces) |
| `src/content/services/notificaciones-inteligentes.md`, `documentacion-automatizada.md`, `lead-scoring.md`, `dashboards-dinamicos.md` | Modify | Add `outcome` frontmatter line only |
| `src/pages/index.astro` | Modify | Card rows, strip, lede "Cinco…", hero proof, ally ghost, pillar-proof lines + scoped styles |
| `tests/e2e/site.spec.ts:85-90` | Modify | Counts 4→5; strip/chips/ghost/proof assertions |
| `src/styles/tokens.css` | Reuse only | No edits, no new tokens |

## Interfaces / Contracts

Zod diff (`config.ts`):

```ts
priority: z.number().int().min(1).max(8),
outcome: z.string().optional(),
```

Card markup (inside each `.card-full`, after `<ul>`, before dashboard mock where present):

```astro
{s.data.draftLabel && <p class="draft-badge">{s.data.draftLabel}</p>}
{s.data.outcome && <p class="card-outcome">{s.data.outcome}</p>}
<a class="example-hint" href="#services">Ver ejemplo en vivo →</a>
```

Strip (`#services`, between summary grid and ally; `div#showcase` to avoid nested-`<section>`): 3× `<figure role="img" aria-label="…">` (notification row, score bar, schedule card) + `<figcaption>Mock ilustrativo</figcaption>`, then "Se conecta con" chips row (WhatsApp, Gmail, Slack, HubSpot — original minimal inline SVG, `currentColor` grayscale). Hero: `<p class="hero-proof">` under `.hero-note` (`var(--muted)`). Ally: `<a class="cta-ghost" href="#services">Ver cómo se ve</a>` beside demo CTA. Pillars: `<p class="pillar-proof">` per card; security line = practice framing (trazabilidad/revisión), no product claim. New-card frontmatter per `exploration.md` (Agendamiento title/summary/3 bullets/body + `draftLabel: "Borrador — texto oficial pendiente"`); outcomes qualitative ES, zero numbers. CSS: scoped `<style>` in `index.astro` reusing `--muted/--surface/--border/--card/--primary-text` only.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (vitest) | Schema accepts priority 8, rejects 9; `outcome`/`draftLabel` optional; no-KPI regex (`[+-]?%\|\d+%\|x\d`) over `#services` DOM + md sources | Content/schema test, both themes via built HTML |
| Integration | 5 full + 3 summary render; DRAFT badge; full-only outcome+hint, summary neither | Collection render assertions |
| E2E | Counts 5+3; strip 3 mocks + 4 chips visible; ghost→`#services`; hero proof + pillar lines; dashboard mock has no `<image>`/fetch | Extend `site.spec.ts:85-90`, desktop + mobile |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Static content + anchor links only.

## Migration / Rollout

No migration required. Single PR; rollback = `git revert <sha>` (schema, content, template revert atomically to 4+3).

## Open Questions

None blocking. Deferred (not this change): detail pages/`#ejemplo` anchors, real screenshots, strip JS, official Agendamiento copy, numeric metrics.
