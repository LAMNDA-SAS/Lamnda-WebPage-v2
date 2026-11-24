# Tasks: Port Old Service Demos (lamnda-old-demos-port-v9)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2,900 |
| 400-line budget risk | High |
| Suggested split | Single PR — size:exception approved (zero cost) |
| Delivery strategy | exception-ok |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

No work-unit split (single PR). Half-ports never ship; dashboards last.

## Phase 1: Demo Components

All 7 (contract design D1–D7): root `[data-demo="{slug}"]`, verbatim markup, used-selector remapped CSS, one guarded `is:inline` IIFE (per-demo RM policy), chips not SVGs, no old CTAs, sample note kept.

- [x] 1.1 `DemoLeadScoring.astro` — sort table + sellers; RM CSS-only; `#64748b` signal cells → scoped `.example-signal`; hook `#sortDir`×2 → first row 18↔92.
- [x] 1.2 `DemoMarketingBots.astro` — chat replay IIFE; avatar SVGs retokened; lead-card `opacity:.4`→scoped `is-idle`; hooks `#chatPlay`, `#leadText` "Fecha asesoría".
- [x] 1.3 `DemoNotificaciones.astro` — tab filter `[data-cat]` rows; CSS tooltips; 8 channel chips; hook `.example-tab[data-filter="soporte"]` hides ventas row.
- [x] 1.4 `DemoBotsCrm.astro` (`example-inner-wide`) — drag&drop + owner filter + `#crmTotal`/`#crmCount`; tooltips; 7 CRM chips; media→container queries; hook `crmFilter`="ana" → `#crmVisible`.
- [x] 1.5 `DemoTeleAgentes.astro` — Web Speech walk 1:1 (es voices, highlight + lead fill); RM `scrollIntoView`→`auto`; no-TTS swap + `#voiceSimulate` sim.
- [x] 1.6 `DemoDocumentos.astro` — ORDERS, search, COT (IVA 19%, due+30d), contact block verbatim per spec, Gmail Borrador→Enviado; hook `PED-301` → `#facturaBox` "COTIZACIÓN"; dead `tryHint` dropped.
- [x] 1.7 `DemoDashboards.astro` (last, heaviest) — `portfolio.css` `.pd-*` used selectors + local styles (theme-dark dropped); `--pd-donut-*` vars; 4 tabpanels + 4s autoplay/3s drift/count-up/reset/replay engine (pause hover/focus+hidden); RM = full static early-return (badge title, view 1); container queries; hook 2nd `.pd-tab` → `#pd-view-financial` + `#pdTitle`.

## Phase 2: Wiring ([slug].astro)
- [x] 2.1 +7 imports; 7 conditionals swap mock subtree → component inside kept figure (caption unchanged); `role="img"` dropped ×7; `agendamiento-automatico` untouched (mock + role kept).

- [x] 2.2 Delete superseded notif tabs-filter script + `isNotif` + notif-mock markup (zero residue; main script baseline stays 0).

## Phase 3: Tests & Audits

- [x] 3.1 New `tests/demo-port.test.ts`: 1 `is:inline`/component, guard+try/catch, no `fetch(`/`http`, old hexes only in `--demo-*`/`--pd-*` vars, no `[data-theme=`; "Datos de muestra"×7; docs contacts verbatim; 7 imports + zero notif/`isNotif`/`data-filter` residue; `tokens.css` no `--demo-`.
- [x] 3.2 Extend `tests/e2e/service-details.spec.ts`: demo presence ×7 in kept figure; `role="img"` 1 (agendamiento) / 0 (×7).
- [x] 3.3 Main-scoped script counts: demo pages 1×7, agendamiento 0; no tabs-filter residue.
- [x] 3.4 RM emulation (`reducedMotion: reduce`): dashboards static badge + view 1; notif tabs still filter.
- [x] 3.5 Zero non-same-origin requests on demo pages; no old CTA buttons; chips replace logos.
- [x] 3.6 "Datos de muestra" visible: 6 chip pages + docs variant; `%` scan excludes `[data-demo]` roots.

## Phase 4: Fidelity + Gates

- [x] 4.1 Spot-check: `example-*`/`pd-*` verbatim; KPI chips = old (-35%,+98%,+31%,-50%,3:24,92%,68%,+23%,2.000 clientes); EN disclaimer verbatim.
- [x] 4.2 Build: `npm run build` green, 9 pages (index + 8 servicios); CSS leak check dashboards↔notif both ways.
- [x] 4.3 A11y/AA: no new check-html violations beyond known W1 baseline; status vars ≥4.5:1 text / ≥3:1 indicators both themes; `tokens.css` diff empty.
