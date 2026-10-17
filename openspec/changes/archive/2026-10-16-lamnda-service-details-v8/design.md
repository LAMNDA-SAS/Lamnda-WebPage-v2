# Design: lamnda-service-details-v8

## Technical Approach

Collections-driven `[slug].astro` + `getStaticPaths` renders 8 static pages from the existing `services` collection. One template, max 2 branches (full vs summary; DRAFT conditional). Card redesign is CSS/markup-only in `index.astro`, scoped `#services`, token-only. Static CSS/SVG demos; ≤1 inline script on full pages only.

## Architecture Decisions

| Option A | Option B (tradeoff) | Decision + rationale |
|---|---|---|
| Collections `getStaticPaths` template | 8 handwritten pages (8× boilerplate, md drift, larger PR) | **A**: one template, md-only edits, consistent SEO/CTA, zero-cost. |
| Static CSS/SVG mocks, islands only if trivial | Per-page JS widgets (island creep, export risk) | **Static-first, ≤1 inline `<script is:inline>` on full pages, zero on summaries**. |
| Token-only CSS (`tokens.css` vars) | New tokens (breaks locked AA contract) | **Token-only**: lift derives from `--shadow`. No Hopf/motion/tokens edits. |
| 40×40 icon-box | 44px alt (off-spec size) | **40×40**: matches spec, token surface. |

## Data Flow

Build-time only; no runtime sequence (static export, hence no sequence diagram).

```
services/*.md ──→ getCollection("services") ──→ getStaticPaths ──→ [slug].astro × 8
                                                        │                    │
Base.astro (SEO shell) ◄── title/desc/canonical ────────┘                    ├──→ /servicios/{slug}.html
index.astro cards ──→ hint href /servicios/{slug} ───────────────────────────┘
```

Value derivation: full = bullets(3) + 1 body-derived row; summary = bullet(1) + body + 2 generic practice rows (no invented features/KPIs, `%`-pattern ban).

## Demo Mapping (ejemplo per slug)

| Slug | Mock (static CSS/SVG, `role="img"` + caption) | Island |
|---|---|---|
| notificaciones-inteligentes | Notification center: featured alert + 3 rows + channel chips | 1 tabs filter, RM-guarded |
| documentacion-automatizada | Source→template→PDF 3-step pipeline + "Revisión humana" chip | None |
| bots-crm | Rule→assignment: 2-card mock + chip row | None |
| tele-agentes-ia | Call-script card + audit ticks + human-oversight badge | None |
| lead-scoring | Prioritized list: Alta/Media/Baja bars (no scores) | Maybe 1 sort toggle |
| marketing-bots | Segment chips → message preview card | None |
| dashboards-dinamicos | Trend SVG + qualitative tiles + donut + static chips | Maybe 1 chip toggle |
| agendamiento-automatico | Schedule chips + confirm/reminder flow + DRAFT badge | None |

Islands: `<script is:inline>` enhancement, RM early-return, no deps; deferred if threatening export.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/pages/servicios/[slug].astro` | Create | Template: paths, breadcrumb, hero, bullets `ul`, ejemplo `figure`, dual CTA, Base SEO |
| `src/pages/index.astro` | Modify | Card markup order + scoped CSS; hint `href` → `/servicios/{slug}`; summary CTA |
| `src/layouts/Base.astro` | Reuse | Per-page `title/description/canonical` props; no edit |
| `src/styles/tokens.css` | Reuse | No new tokens |
| `src/content/services/*.md` | Optional | Only if SEO/demo frontmatter needed; else derive |

Card CSS (scoped `#services`): icon-box 40×40 (`--surface`, 1px `--border`, glyph, `aria-hidden`); padding 1.6–1.75rem, gap 1.25rem; order pill/icon-box/title/summary/bullets/outcome-strip/CTA; outcome 3px `--primary-text` strip; hover `translateY(-4px)` + shadow + border, RM guard; arrow-chip CTA (`→` shifts 4px); 390px single column.

## Interfaces / Contracts

```astro
export async function getStaticPaths() {
  const all = await getCollection("services");
  return all.map((e) => ({ params: { slug: e.slug }, props: { entry: e } }));
}
// SEO: title `{title} — Lamnda`, desc ≤155ch from summary/outcome,
// canonical `https://lamnda.example.com/servicios/{slug}`, lang="es"
// Breadcrumb: <nav aria-label="breadcrumb"> Servicios (/#services) › {title}
// CTA: [Solicita una demo → /#contact] + [Volver a servicios → /#services]
```

## Testing Strategy

| Layer | What to test | Approach |
|---|---|---|
| Build | 9 pages (index + 8 slugs) | `astro build`; assert 8 HTML files, zero `#services` hints |
| E2E hints | Card hrefs → `/servicios/{slug}` | DOM scan: 8 hints, zero self-anchor |
| E2E detail | Breadcrumb, hero, bullets, demo, dual CTA | Per-slug render checks; summary fallback = 4 rows |
| E2E SEO | Title/desc/canonical/og, DRAFT, no-KPI | Head scan; regex ban `%`, `\d+%` |
| E2E AA/motion | Contrast, focus, RM guard, 390px | Light/dark AA, keyboard, `scrollWidth` check |

## Threat Matrix

Web-route addition only; shell/VCS/PR rows all N/A:

| Boundary | Applicability | Design response |
|---|---|---|
| Documentation-like paths | N/A — no executable docs added | No task |
| Git repository selection | N/A — no git automation | No task |
| Commit state | N/A — single-PR revert only | No task |
| Push state | N/A — no push logic | No task |
| PR commands | N/A — no PR automation | No task |

Slugs reuse collection slugs → no redirects; `/#contact` + `/#services` hash-anchors work from subpaths.

## Migration / Rollout

No migration required. Single-PR; rollback via `git revert`.

## Open Questions

None blocking. If summary fallback rows read thin, enrich via md frontmatter in apply.
