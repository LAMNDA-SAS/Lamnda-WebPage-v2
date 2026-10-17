# Tasks: Services Showcase v7 — 5+3 Static Showcase

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120–180 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | 5+3 static showcase, single PR | PR 1 | `npm run build` + e2e `site.spec.ts` | Browser check `/` `#services` both themes or N/A (static only) | Revert single commit to 4+3 |

## Phase 1: Foundation — schema + content

- [x] 1.1 Bump `src/content/config.ts`: `priority` max 7→8, add `outcome?: string` (reuse `draftLabel?` as-is).
- [x] 1.2 Create `src/content/services/agendamiento-automatico.md`: priority 8, `card: full`, ES copy + `draftLabel` + `outcome`.
- [x] 1.3 Add `outcome` frontmatter line to 4 full md (`notificaciones-inteligentes`, `documentacion-automatizada`, `lead-scoring`, `dashboards-dinamicos`).

## Phase 2: Core Implementation — cards + strip + copy lines

- [x] 2.1 Render in `src/pages/index.astro` full cards: `draft-badge` + `<p class="card-outcome">` + `<a class="example-hint" href="#services">` with `{#if}` guards.
- [x] 2.2 Add static `div#showcase` strip in `#services` (summary grid → strip → ally): 3 CSS mocks with captions + "Se conecta con" chips (original grayscale inline SVG, `currentColor`).
- [x] 2.3 Update lede "Cuatro"→"Cinco…" + hero `<p class="hero-proof">` (`var(--muted)`) + ally ghost `Ver cómo se ve`→`#services` + `<p class="pillar-proof">` per pillar (security = practice framing).

## Phase 3: Testing / Verification

- [x] 3.1 Extend `tests/e2e/site.spec.ts:85-90`: counts 4→5 full + 3 summary, strip/chips/ghost/proof asserts, no-KPI regex (`[+-]?%|\d+%|x\d`), dashboard mock has no `<image>`/fetch.
- [x] 3.2 Run build + collections validation and visual check of `#services` in both themes (tokens only, zero JS).
