# Archive Report: lamnda-old-demos-port-v9

**Date**: 2026-10-17
**Project**: new webpage (Lamnda SAS marketing site)
**Repository**: github.com/LAMNDA-SAS/Lamnda-WebPage-v2
**Archived to**: `openspec/changes/archive/2026-10-17-lamnda-old-demos-port-v9/`
**Archived by**: sdd-archive (openspec mode)

## Change Summary

Faithful ("tal cual") port of the 7 old service demos into new self-contained v2 Astro components (`Demo*.astro` ×7) wired into `src/pages/servicios/[slug].astro`; superseded notif tabs-filter page script deleted; spec deltas: new `service-demos` capability + `services-content` modifications (`Service Detail Routes`, `No Numeric KPI Claims`). `agendamiento-automatico` (DRAFT) keeps its static mock. No runtime deps, no fetch, no `tokens.css` edits.

## Verdict (from verify-report)

**PASS WITH WARNINGS** — 0 blockers, 0 critical findings.

| Metric | Value |
|--------|-------|
| Requirements | 8/8 compliant |
| Scenarios | 13/13 compliant |
| Build | exit 0 — 9 pages (index + 8 servicios) |
| vitest | 87/87 (demo-port 56, theme 8, poster 4, hopf-2d 19) |
| Playwright | 72/72 (24.0s, 6 workers, desktop+mobile) |

- **W-1** (warning, non-blocking): apply's 4.3 `check-html` audit at 24/25 (known W1 baseline) was not re-executed in the fresh verify run (`check-html` is not an npm script); its substance is covered by the passing theme/site e2e AA suites and the demo-port status-contrast unit tests. Apply-recorded evidence accepted. ⇒ carried as follow-up (see Deferred).
- **S-1** (suggestion): `data-demo` values for DemoDocumentos (`gestion-documental`) and DemoDashboards (`dashboards`) use the old demo names rather than the routed slugs; implementation fully self-consistent; honored verbatim-fidelity rule; documented nuance.
- Known deltas acknowledged in verify-report (not re-litigated): CRM chips port as **6** (the delta text "7 CRMs" overcounts the old source; tal-cual favors implementation); figcaption on all 8 slugs reads "Mock ilustrativo — sin datos reales" unchanged per spec ("caption kept").

## Review Gate

- **lineage_id**: `review-f0ba52eab1ab9e2a`
- **terminal_state**: `approved` ✅
- **schema**: gentle-ai.review-receipt/v2 · generation 1 · risk_level: high
- **Receipt**: `.git/gentle-ai/review-transactions/v2/review-f0ba52eab1ab9e2a/review-receipt.json`
- base_tree `c1e82e9c…`; final_candidate_tree == initial_review_tree (`e637f7a8…`); fix_delta empty (sha256 of empty string) → zero-fix pre-approval.
- Lenses: review-risk, review-resilience, review-readability, review-reliability.
- Gate conditions at archive time: tasks 18/18 `[x]` (no stale checkboxes), verify verdict pass with 0 critical, receipt approved → **allow**. No override requested or needed.

## Spec Sync (Source of Truth Update)

### `openspec/specs/services-content/spec.md` — 2 MODIFIED requirements spliced

| Requirement | Change | Scenario delta |
|---|---|---|
| Service Detail Routes | Static mock everywhere → per-slug conditionals: 7 old-demo slugs render ported demo components (per `service-demos`) as content of the kept `figure.demo-figure` (free of `role="img"`); agendamiento keeps mock; ≤1 inline script total incl. component scripts; notif tabs-filter page script removed | 4 kept (3 verbatim + SEO THEN updated) + 2 new: "Ported demo island replaces static mock", "One inline script per page including components" |
| No Numeric KPI Claims | Page-wide ban → scopes to page copy; ported demo bodies exempt ONLY behind the visible "Datos de muestra" note | 2 kept (KPI scenario renamed/expanded, Qualitative outcomes verbatim) + 2 new: "Sample label gates the exemption", "Exemption ends at the demo body" |

Preservation proof: `git diff HEAD` vs the spliced file shows **31 insertions / 5 deletions, entirely confined to these two blocks**; the other 6 requirements (Collections-Backed Services, Priority Full Cards and Summary Cards, Pillars Strip and Vision/Mission Placeholders, Static Showcase Strip, Hero Proof/Lede/Ally, Service Card Redesign) are byte-untouched. Delta splice verified byte-identical for both replaced blocks (UTF-8 ordinal compare, incl. unicode glyphs `≤ › → — ·`). "(Previously: …)" provenance lines retained. Non-destructive merge (config rule: warn before destructive deltas — not triggered).

### `openspec/specs/service-demos/spec.md` — CREATED (new capability)

Full spec copied verbatim from the approved delta (6 requirements / 6 scenarios): island inventory & wiring; tal-cual fidelity; token-only scoped styling with component-scoped status colors (AA both themes); single inline island, zero external runtime; no old CTAs / vendor logos → text chips; sample-data rules (docs demo keeps real contact data tal cual).

## Artifacts Produced (this archive step)

1. `openspec/specs/service-demos/spec.md` (created)
2. `openspec/specs/services-content/spec.md` (2 requirements spliced in)
3. `openspec/changes/lamnda-old-demos-port-v9/archive-report.md` (this file)
4. `openspec/changes/archive/2026-10-17-lamnda-old-demos-port-v9/` (change folder move; target confirmed non-existent pre-move)

## Working Files (implementation, as delivered by apply; uncommitted)

| File | Status |
|---|---|
| `src/components/demos/DemoNotificaciones.astro` | New (~788 ln) |
| `src/components/demos/DemoDocumentos.astro` | New (~733 ln) |
| `src/components/demos/DemoDashboards.astro` | New (~1343 ln; container queries; autoplay/drift/tween engine) |
| `src/components/demos/DemoLeadScoring.astro` | New (~410 ln) |
| `src/components/demos/DemoBotsCrm.astro` | New (~666 ln; `example-inner-wide`; drag & drop) |
| `src/components/demos/DemoTeleAgentes.astro` | New (~658 ln; Web Speech 1:1) |
| `src/components/demos/DemoMarketingBots.astro` | New (~364 ln) |
| `src/pages/servicios/[slug].astro` | Modified (7 imports + conditionals; notif page-script deduped; `agendamiento` untouched) |
| `tests/demo-port.test.ts` | New (vitest static audits) |
| `tests/e2e/service-details.spec.ts` | Modified (14 test blocks ×2 projects) |
| `src/styles/tokens.css` | **Untouched** (`git diff` empty — guarantee held) |

## PO / Deferred Items (follow-ups, out of scope for v9)

1. **Container-query fallback warnings ×2** — D5 evergreen-browser assumption; the two `@container` blocks (CRM board, dashboards grids) have no fallback path for older browsers; two open warning items from review.
2. **Readability provenance items** — open items from the review-readability lens (provenance of readability findings; tracked by orchestrator).
3. **No keyboard/touch operation on the CRM kanban** — drag & drop is pointer-only (HTML5 dnd); assistive reordering/alternative interaction is a candidate for a future change.

## Delivery

**No git commits performed** — per explicit user order (the user will order the commit separately). All delivery is in the working tree; rollback plan stays filesystem-only (`git restore` of listed files / delete `Demo*.astro`) exactly as specced.

## Notes & Observations

- No `state.yaml` exists in this change folder (convention expects one from the orchestrator); noted as convention deviation from earlier phases — non-blocking, documented here instead of forcing a synthetic file.
- Main spec H1 still reads "# Delta for services-content" — pre-existing cosmetic legacy heading from the v8 archive cycle; left untouched per minimal-splice discipline ("only update what changed").
- Delta text "7 CRMs" is preserved verbatim in the synced service-demos spec; the acknowledged 6-chip reality is recorded in verify-report Known Deltas #1 (no code action taken).
- Engram record: topic_key `sdd/lamnda-old-demos-port-v9/archive-report` (observation saved after this move).

## Next Actions

1. User orders the commit (single-PR size-exception delivery was pre-approved: exception-ok; half-ports never ship — commit components + wiring together).
2. Follow-ups listed under PO/Deferred above (container-query fallback ×2, readability provenance, CRM kanban keyboard/touch).
3. Future ports: keep S-1 in mind — prefer routed-slug `data-demo` values unless tal-cual fidelity forces old names.
