# Proposal: Faithful Port of Old Service Demos (lamnda-old-demos-port-v9)

## Intent

v8's 8 detail pages carry generic hand-drawn CSS/SVG demo mocks. Replace those on the 7 old-demo services with faithful ("tal cual") ports — same content, structure, micro-interactions — restyled to v2 tokens and AA pairs. `agendamiento-automatico` (DRAFT, no old counterpart) keeps its mock.

## Scope

### In Scope
- 7 new components in `src/components/demos/`: `DemoNotificaciones`, `DemoDocumentos`, `DemoDashboards`, `DemoLeadScoring`, `DemoBotsCrm`, `DemoTeleAgentes`, `DemoMarketingBots` — each self-contained: scoped CSS + its single `is:inline` script, ported 1:1.
- Wire into `[slug].astro` conditionals (figure ownership: one choice in spec).
- Dedupe: remove the existing notif tabs-filter script from `[slug].astro` (superseded by `DemoNotificaciones`).
- Port only used selectors from old `demos.css`/`portfolio.css`; keep `example-*`/`pd-*` class names verbatim.
- Spec delta: relax "static CSS/SVG" wording to "ported demo islands"; scope the numeric-KPI ban.

### Out of Scope
- No `src/styles/tokens.css` edits.
- No backend/fetch; no agendamiento flow change.
- No Hopf hero changes.
- No git commits (user orders commits explicitly).

## Capabilities

### New Capabilities
- `service-demos`: faithful per-demo port islands for the 7 service pages — content tal cual, token/AA restyle, island cap, sample-data labeling rules.

### Modified Capabilities
- `services-content`: `Service Detail Routes` + `No Numeric KPI Claims` — ejemplo renders ported demo islands; KPI ban scoped to page copy (sample-labeled chips allowed inside demo bodies; standing ban unchanged for new copy).

## Approach

Option (b): per-demo Astro components imported by the existing slug conditionals; old markup + demo-scoped CSS + single IIFE → one component. Recorded decisions (user-ordered):
- KPI chips stay inside demo bodies, always with the "Datos de muestra" note.
- Real Lamnda contact data (NIT/phone/email/address) travels tal cual in the docs demo.
- Vendor SVG logo strips (channels + CRMs) → text chips (v2 chip-row pattern).
- Status colors → AA-checked token-based CSS vars scoped in demo components.
- Old demo-local CTA buttons dropped (v2 dual CTA sits below); informational strips/slogans kept as text chips.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/demos/Demo*.astro` ×7 | New | Self-contained ported demos |
| `src/pages/servicios/[slug].astro` | Modified | 7 imports + conditionals; notif script removed |
| `openspec/changes/…/specs/` | New | `service-demos` spec + `services-content` delta |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Dashboards port weight (~500 CSS + ~200 JS lines) | High | Used-selector discipline |
| Inline-script cap breach if notif dedupe missed | Medium | Build assertion: ≤1 script per page |
| Baked hexes in JS strings (`drift()`, avatars) | Medium | Remap to CSS vars; verify both themes |
| Web Speech variance; mobile tooltip overflow | Low | Port degradation + old responsive rules; e2e covers fallback |

## Rollback Plan

Delete the 7 demo components; revert `[slug].astro` import/conditional lines (restore the notif tabs block if removed). No commits performed — filesystem revert only.

## Dependencies

- Read-only source clone `C:\RTemp\opencode\Lamnda-WebPage-survey` — old pages, `demos.css`, `portfolio.css`.

## Success Criteria

- [ ] 7 detail pages render the faithful ported demo; `agendamiento-automatico` unchanged.
- [ ] Every page carries ≤1 inline script (build-asserted).
- [ ] Token-only CSS, AA holds in both themes; no `tokens.css` diff.
- [ ] `%`/KPI patterns appear only inside sample-labeled demo bodies.
- [ ] Build green; zero backend/fetch; zero new runtime deps.
