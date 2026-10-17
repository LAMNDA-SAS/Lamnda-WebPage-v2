# Archive Report: lamnda-service-details-v8

- Change: `lamnda-service-details-v8` (per-service detail routes + `#services` card redesign)
- Date (UTC): 2026-10-16
- Mode: openspec (filesystem) — preflight auto / single-PR / unlimited / **zero-cost static**
- Tasks: **11/11 checked** in `tasks.md` (1.1–4.3 — zero unchecked, zero reconciliation needed)
- Verify verdict: **PASS WITH WARNINGS** (3 requirements / 11 scenarios all COMPLIANT; build 9 pages exit 0; vitest 31/31; Playwright 54/54; check-html 24/25 with the sole FAIL = known stale W1 gate; **0 CRITICAL**)
- Commit: **not performed** per orchestrator instruction (do NOT git-commit)
- Task Completion Gate: **passes** — persisted `tasks.md` is the source of truth and shows all 11 implementation tasks `[x]`. No stale-checkbox reconciliation performed and none required.

## Review gate (native receipt gate — explicit record)

```yaml
reviewGate:
  result: pending-verify-pass
  allowed: false
  reason: "Native gentle-ai review receipt NOT created — no openspec/changes/lamnda-service-details-v8/reviews/ artifacts (verified: no reviews/ directory; grep for reviewGate|receipt|ledger shows only prior archive reports). Archive proceeds in openspec file mode per explicit orchestrator directive (preflight auto / zero-cost) and the project convention established across v1–v7 archives. This is NOT an `allow` receipt."
  override_basis: "Explicit orchestrator instruction; same intentional-with-warnings pattern recorded in archive reports for 2026-10-16-lamnda-services-showcase-v7, -hero-motion-toggle-v6, -hero-drift-layout-v5, -hero-auto-fidelity-v4, -hopf-2d-v3, -visual-spectacular-v2, -marketing-site-v1."
  critical_override_possible: false
```

- The sdd-archive contract's **Native Review Receipt Gate** mandates `reviewGate.result: allow` with exact transaction / frozen ledger / approved terminal receipt / post-apply gate-context before sync or move. No such artifacts exist for this change.
- The **CRITICAL-override ban** is NOT triggered: the verify report contains **0 CRITICAL** issues, so no CRITICAL verification issue is being overridden.
- The orchestrator's release gate MUST validate or create the native receipt before tag/push if the native review pipeline requires it. This archive does **not** claim native receipt coverage.
- Archive classification: **intentional-with-warnings**.

## Specs synced

| Domain | Action | Details |
|--------|--------|---------|
| services-content | Updated | **1 MODIFIED** merged (Priority Full Cards and Summary Cards: hint target `#services` → `/servicios/{slug}`, all 8 cards render hints, outcome full-only + CTA on all, "self-anchor" scenario replaced by "Hints deep-link, never self-anchor") + **2 ADDED** merged (Service Detail Routes — 4 scenarios; Service Card Redesign — 3 scenarios). |

- **Preserved untouched** (not mentioned in the delta): Collections-Backed Services, Pillars Strip and Vision/Mission Placeholders, No Numeric KPI Claims, Static Showcase Strip, Hero Proof / Lede / Ally Navigation / Pillar Lines.
- Merge shape: MODIFIED block replaced in place by name; ADDED requirements appended at the end of the Requirements section; delta-only `(Previously: …)` annotation stripped; RFC 2119 keywords + Given/When/Then preserved.
- No REMOVED and no RENAMED requirements → nothing destructive.
- `rules.archive` from `openspec/config.yaml` = "Warn before merging destructive deltas" → **not triggered**; merge is one scoped replacement + two pure additions.

### Resulting main spec

`openspec/specs/services-content/spec.md` — **8 requirements / 21 scenarios**:

1. Collections-Backed Services (2)
2. Priority Full Cards and Summary Cards (4) — *updated*
3. Pillars Strip and Vision/Mission Placeholders (2)
4. No Numeric KPI Claims (2)
5. Static Showcase Strip (2)
6. Hero Proof, Lede, Ally Navigation and Pillar Lines (2)
7. Service Detail Routes (4) — *new*
8. Service Card Redesign (3) — *new*

## Delta coverage

- Delta requirements: 3 (1 MODIFIED + 2 ADDED) → all merged.
- Delta scenarios: 11 (4 + 4 + 3) → all present in the main spec.
- Verify compliance: 11/11 scenarios COMPLIANT (per `verify-report.md`).

## Archive contents

- proposal.md ✅
- exploration.md ✅
- specs/services-content/spec.md (delta: 1 MODIFIED + 2 ADDED) ✅
- design.md ✅ (corrected — 40×40 icon-box, card DOM order)
- tasks.md ✅ (11/11 complete, zero unchecked)
- verify-report.md ✅ (PASS WITH WARNINGS, hashes recorded, 0 CRITICAL)
- archive-report.md ✅ (this file)

## Verify-touched summary (fold into the change PR, uncommitted)

- **Detail routes**: `src/pages/servicios/[slug].astro` — `getStaticPaths` over `services` collection → 8 static routes; breadcrumb `nav[aria-label=breadcrumb]`, compact hero (pill + `h1` + sub + DRAFT badge), value bullets (full 3 frontmatter + 1 body-derived; summary 1 + body + 2 generic practice rows), 8 static CSS/SVG `ejemplo` figures, ≤1 `<script is:inline>` island (full + notificaciones only, reduced-motion early-return, no deps), dual CTA (`/#contact`, `/#services`), per-page SEO (title `{Service} — Lamnda`, desc ≤155 ch, canonical `/servicios/{slug}`).
- **Card redesign**: `src/pages/index.astro` — hierarchy pill → icon-box → title → summary → bullets → outcome → CTA; icon-box 40×40 CSS tile; outcome strip 3px `var(--primary-text)`; arrow-chip CTA (`→`, 4px hover shift); hover lift `translateY(-4px)` + `prefers-reduced-motion` guard; token-only, AA both themes, 1 column at 390px.
- **Integration**: 8 `.example-hint` hrefs retargeted to `/servicios/{slug}` (zero `#services` self-anchors), arrow-chip CTA added to the 3 summary cards.
- **Evidence**: `npm run build` → 9 pages exit 0; `npx vitest run` → 31/31; `npx playwright test` → 54/54; `node scripts/check-html.mjs` → 24/25.
- **Untouched by design**: Hopf/motion code, `src/styles/tokens.css` (reuse only, no new tokens).

## Follow-ups (non-blocking, recorded for the next change)

- **F1** — `Header.astro` / `Footer.astro` use **relative** hash hrefs (`#top`, `#services`, `#pillars`, `#vision`, `#contact`). On `/servicios/*` subpaths these resolve in-subpath where the targets do not exist → header/footer nav links are effectively dead on all 8 detail routes. Fix = absolute `/#…` in shared chrome or per-page nav override. **Deliberately not fixed in v8** (would be scope creep); the detail template's own breadcrumb/CTA already use absolute `/#services` / `/#contact`.
- **S1** — `scripts/check-html.mjs` `hero EN headline` gate is stale: it requires the contiguous string `Complex problems. Elegant solutions.`, but the approved two-tone hero renders two spans (`h1-line1` / `h1-line2`). The requirement itself is runtime-verified (Playwright `toHaveText` both projects + `theme.test.ts` EN pin, all green). Fix = assert `HERO_LINE1` / `HERO_LINE2` halves separately → check-html returns to exit 0. Pre-existing since v4.
- **W1** — the WARNING that produces the single check-html FAIL (24/25). Non-blocking; identical root cause as S1.
- Deferred-by-rule (no follow-up required): lead-scoring sort toggle, dashboards filter-chip toggle, summary-body md enrichment — shipped static per design, spec-compliant.

## Zero-cost confirmation

- No paid/remote/external services invoked; no new dependencies added; no network fetches introduced.
- Archive mechanics were filesystem-only: one main-spec merge edit, one archive-report write, one folder move. No build/test rerun during archive (verify evidence reused from `verify-report.md`).
- Implementation remained static-first (`output: "static"`, zero external assets, ≤1 inline island on a single page).
- No commit, no push, no tag performed.

## Verification (Step 4)

- [x] Main specs updated correctly (1 MODIFIED replaced by name, 2 ADDED appended, 4 untouched requirements preserved, 21 scenarios total)
- [x] Change folder moved to `openspec/changes/archive/2026-10-16-lamnda-service-details-v8/`
- [x] Archive contains all artifacts (proposal, exploration, specs, design, tasks, verify-report, archive-report)
- [x] Archived `tasks.md` has zero unchecked implementation tasks (11/11, no reconciliation)
- [x] Active changes directory no longer has this change
- [x] No commit performed (per instruction)
- [x] No CRITICAL verification issues (0 critical)

## Source of truth updated

- `openspec/specs/services-content/spec.md` (8 requirements / 21 scenarios — detail routes + card redesign now canonical)

## Section D envelope

```yaml
change: lamnda-service-details-v8
verdict: PASS_WITH_WARNINGS
tasks_complete: 11/11
requirements: 3/3
scenarios: 11/11
critical: 0
warnings: 2   # W1 stale check-html gate; F1 header/footer relative hash hrefs on /servicios/*
suggestions: 1   # S1 fix stale check-html headline assertion
reviewGate: pending-verify-pass
reviewGate_allowed: false
intentional_with_warnings: true
partial_archive_reason: none — full 11/11 archive; reviewGate recorded as pending-verify-pass per explicit zero-cost orchestrator directive (native receipt deferred to orchestrator release gate)
followups: [F1, S1, W1]
zero_cost: confirmed
commit: none
archived_to: openspec/changes/archive/2026-10-16-lamnda-service-details-v8/
```
