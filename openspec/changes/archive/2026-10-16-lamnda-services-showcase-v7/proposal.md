# Proposal: Services Showcase v7 — 5+3 Static Showcase

## Intent

Grow `#services` 4+3→5+3 with qualitative proof. New DRAFT Agendamiento card, one outcome line per full card, static "Cómo se ve" strip. Zero JS, no numeric KPIs (owner veto).

## Scope

### In Scope

- New `agendamiento-automatico.md` (priority 8, `card: full`, DRAFT badge via `draftLabel`).
- `outcome?: string` on all 5 full cards (qualitative ES lines, no numbers).
- Schema bump: `priority` max 7→8 + optional `outcome`.
- Full-card rows: badge, `<p class="card-outcome">`, hint `<a href="#services">`.
- "Cómo se ve" strip (grid → strip → ally): 3 CSS mocks + chips (WhatsApp, Gmail, Slack, HubSpot).
- Lede "Cuatro"→"Cinco…"; ally ghost button→`#services`; hero proof line; pillar lines.
- E2E count 4→5.

### Out of Scope

- JS interactivity (tabs, filters); detail routes / `#ejemplo` anchors; numeric KPIs.
- Token changes; real screenshots, logo lifts, official Agendamiento copy.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `services-content`: 4+3→5+3; outcome/hint/DRAFT rows; strip+mocks+chips; hero/pillar lines; no-KPI rule.

## Approach

Frontmatter-driven static. Copy in md (`outcome`, `draftLabel`); `index.astro` renders with `{#if}` guards + static strip and scoped `<style>`. Card-split logic unchanged. Single PR.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/content/services/agendamiento-automatico.md` | New | DRAFT card, priority 8 |
| `src/content/services/*.md` (4 full) | Modified | Add `outcome` only |
| `src/content/config.ts` | Modified | Max 8; `outcome?` optional |
| `src/pages/index.astro` | Modified | Rows, strip, lede, buttons, proof lines |
| `tests/e2e/site.spec.ts:85-90` | Modified | Count 4→5 |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Schema side effects | Low | Build + collections tests |
| HubSpot glyph as logo | Med | Abstract grayscale mark, `currentColor` |
| Self-anchor confusion | Low | Deferred detail pages recorded |
| Security pillar overclaim | Low | Practice framing, not product claim |

## Rollback Plan

Revert single commit (`git revert <sha>`); schema, content, and template return to 4+3 atomically. No migration.

## Dependencies

- None. Static only.

## Success Criteria

- [ ] 5 full + 3 summary render; Agendamiento shows DRAFT badge.
- [ ] Each full card has outcome + hint→`#services`; zero numeric KPIs in DOM.
- [ ] Strip (3 mocks + 4 chips), "Cinco" lede, hero/ally/pillar lines present.
- [ ] Build + e2e green in both themes.
