# Apply Progress: Services Showcase v7 — 5+3 Static Showcase

Mode: Standard (strict_tdd: false; no TDD module loaded).
Delivery: single PR (forecast ~120–180 lines, Low budget risk; actual batch ~320 lines incl. scoped CSS + e2e asserts — still one atomic commit, rollback = `git revert`).
No prior apply-progress existed — this artifact is the full cumulative record (8/8 tasks).

## Completed Tasks

- [x] 1.1 `src/content/config.ts`: `priority` max 7→8, added `outcome?: string` (`draftLabel?` reused as-is).
- [x] 1.2 Created `src/content/services/agendamiento-automatico.md`: priority 8, `card: full`, didactic ES bullets + body, `draftLabel: "Borrador — texto oficial pendiente"`, qualitative `outcome`.
- [x] 1.3 `outcome` frontmatter added to 4 existing full md (notificaciones-inteligentes, documentacion-automatizada, lead-scoring, dashboards-dinamicos). Qualitative ES, zero digits/percent claims.
- [x] 2.1 Full-card rows in `src/pages/index.astro`: `draft-badge` + `<p class="card-outcome">` (both `{... && ...}` guarded) + `<a class="example-hint" href="#services">Ver ejemplo en vivo →</a>`, placed after `<ul>`, before dashboard mock.
- [x] 2.2 Static `div#showcase` strip between summary grid and `.ally-block`: 3 CSS-only `<figure role="img">` mocks (notification row, score bar Alta/Media/Baja with text labels, schedule card) each with `Mock ilustrativo` caption + `Mock ilustrativo — sin datos reales` note; `Se conecta con` chips row (WhatsApp, Gmail, Slack, HubSpot) with ORIGINAL abstract grayscale inline SVG (`currentColor`, no vendor logo paths); zero JS, zero external assets, tokens only.
- [x] 2.3 Copy lines: lede → "Cinco soluciones prioritarias a fondo, tres capacidades resumidas."; `<p class="hero-proof">` under `.hero-note` (`var(--muted)`); ally ghost `<a class="cta-ghost" href="#services">Ver cómo se ve</a>` beside demo CTA; `<p class="pillar-proof">` per pillar, security framed as practice ("Trazabilidad y revisión humana en cada flujo automatizado.").
- [x] 3.1 `tests/e2e/site.spec.ts`: rewritten card test — 5 full + 3 summary, full-only outcome+hint asserts, summary-neither asserts, DRAFT badge, lede/hero-proof/ghost/pillar asserts, strip 3-mock + 4-chip asserts, no-KPI regex (`[+-]?%`, `\d+%`, `x\d`) over `#services` text, dashboard mock no `<image>`/fetch.
- [x] 3.2 `npm run build` + `npm test` green (collections validate, incl. priority 8). Browser visual check of `#services` in both themes DEFERRED (see Deferred).

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and exact result | `npm run build` → success, 1 page built (`/index.html`); `npm test` (vitest) → 3 files, 31 tests passed |
| Built-HTML spot check | `dist/index.html` has 8 `data-card` slugs in priority order (5 full + 3 summary), `Cinco soluciones prioritarias`, `Borrador`, `hero-proof`, `showcase-chips` present; `src/content/services/*.md` scan for `%\|x\d` → zero matches |
| Runtime harness command/scenario and exact result | N/A — static-only change, zero client JS added; browser e2e + both-themes visual check DEFERRED per ZERO-cost preflight (defer-if-blocked) |
| Rollback boundary | Single-commit revert to 4+3: `src/content/config.ts`, `src/content/services/agendamiento-automatico.md` (new), 4 full md `outcome` lines, `src/pages/index.astro`, `tests/e2e/site.spec.ts` — no migration, no token changes |

## Deviations from Design

None — implementation matches design.md interfaces (frontmatter `outcome`, guarded rows, strip placement summary-grid → strip → ally, token-only scoped CSS). Batch ran ~320 lines vs the ~120–180 forecast because scoped strip/mock/chip CSS and the extended e2e test are verbose; still a single atomic PR per the Low-risk forecast.

## Issues Found

None blocking. `git status` shows extensive pre-existing uncommitted changes from prior changes (v1–v6 work); this batch touched only its 7 scoped files and did not disturb the rest.

## Deferred (ZERO-cost preflight: defer-if-blocked, no JS/network)

- Playwright e2e browser run of the extended `site.spec.ts` (needs browsers/display; static build + vitest already green).
- Visual check of `#services` (strip, badge, outcomes) in dark + light themes.
- Design-deferred items (not this change): per-service detail pages / `#ejemplo` anchors (hint rows re-point then), real screenshots/embeds, strip JS interactivity, official Agendamiento copy (DRAFT badge stays), approved numeric metrics if the KPI veto is ever lifted.

## Status

8/8 tasks complete. Ready for verify (`sdd-verify`) once the deferred browser pass can run; static evidence is green.
