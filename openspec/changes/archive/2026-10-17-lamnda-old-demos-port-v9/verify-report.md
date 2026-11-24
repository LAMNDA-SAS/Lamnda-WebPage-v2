```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:221a2b6dddcb7653bd09e5bd9ee10aeaa02a85a8716c7abf97dfbd5fca17d79c
verdict: pass
blockers: 0
critical_findings: 0
requirements: 8/8
scenarios: 13/13
test_command: npm run test
test_exit_code: 0
test_output_hash: sha256:2958a9aab88416c6fb2727197ffde7b459d440ca8d08e9ec560fdde7dc2da1a2
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:e100731eb5d63fdc5eb3ee7ef058c9463588bdd205a4dcda3ea691873efd0b98
e2e_command: npx playwright test --reporter=list
e2e_exit_code: 0
e2e_output_hash: sha256:6b169183577e20afa5550b6bf3f9830fd1ed48fe1d2c5e39f385588aa9a607f7
```

## Verification Report

**Change**: lamnda-old-demos-port-v9
**Version**: deltas @ openspec/changes/lamnda-old-demos-port-v9 (service-demos full set, services-content 2 modified reqs)
**Mode**: Standard (Strict TDD inactive; no runner/config)

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 18 |
| Tasks complete | 18 |
| Tasks incomplete | 0 |

All Phase 1–4 tasks `[x]`; full verification permitted. Notif dedupe and `agendamiento` mock verified as filesystem-only (no commits, per contract).

### Build & Tests Execution

**Build**: ✅ Passed — exit 0, `9 page(s) built in 1.53s`; all 8 `/servicios/{slug}` routes emitted incl. the 7 demo islands + `agendamiento-automatico` (build log route list).

**Tests (vitest)**: ✅ 87/87 passed — demo-port 56, theme 8, poster 4, hopf-2d 19.

**Tests (Playwright)**: ✅ 72/72 passed (24.0s, 6 workers, desktop+mobile), incl. `service-details.spec.ts` 14 test blocks × 2 projects = 28 — RM emulation, zero-cost network watcher, per-demo interaction smokes, script budgets.

**Coverage**: ➖ Not available / not gated (component audit suite is the coverage proxy; no coverage threshold configured).

### Spec Compliance Matrix

Legend: SD = service-demos delta, SC = services-content delta (modified).

| Requirement | Scenario | Test / evidence | Result |
|-------------|----------|-----------------|--------|
| SD-1 Inventory & wiring (7 islands, kept figure) | Seven islands wired | `tests/e2e/service-details.spec.ts:21` (7× `[data-demo]` in `.demo-figure`, `role="img"`=1 only on agendamiento) + `[slug].astro:74-114` | ✅ COMPLIANT |
| SD-2 Tal-cual fidelity | Port fidelity & restored interactivity | vitest per-component hooks + e2e smokes (sort/chat/crm/docs/dash/tel/notif), `DemoDashboards.astro:1159-1165` engine baseline mirrors static data; 9 old KPI chips verbatim (`-35%`..`2.000 clientes` at Notif:19-20, Lead:17-18, Marketing:18, Tele:21-23, Dash:29) | ✅ COMPLIANT |
| SD-3 Token-only styling (+ scoped status AA) | Token discipline & status AA | vitest `demo-port.test.ts:135-148` (old hexes only in `--demo-*`/`--pd-*` var lines), `html[data-theme="light"]` overrides ×7, `:140-148` no `[data-theme="dark"]`; AA `:224-246` (dark/light ≥4.5:1); `git diff src/styles/tokens.css` empty | ✅ COMPLIANT |
| SD-4 One inline island, zero external | One island, RM-guarded, offline | e2e `:58` main script count =1×7 / 0; e2e `:161` zero foreign requests; RM e2e `:186` static badge + tabs still filter | ✅ COMPLIANT |
| SD-5 No old CTAs; logos → chips | CTA and chip surface | e2e `:178-182` no old CTA text/links; vitest `:188-199` 8 channel chips + 6 CRM chips as `<span>` AA chips (BotsCrm:78-83, Notif:56-63); dual CTA intact (`[slug].astro:136-139`) | ✅ COMPLIANT |
| SD-6 Sample-data rules | Sample patterns & docs data | vitest `:176-186` docs contacts verbatim (NIT 902015091-8, +57 320 890 9792, operaciones@lamnda.com, Cra. 90 Bis #75-78 Bogotá — DemoDocumentos:712-713); notes ×7 (task 3.6: 6 chip pages + docs variant); e2e `:42-46` "Datos de muestra" visible in figure on all 7 | ✅ COMPLIANT |
| SC-6 Service Detail Routes | Eight static paths build | `npm run build` → 8 `/servicios/{slug}/index.html` files; `getStaticPaths` over `services` collection (`[slug].astro:15-18`) | ✅ COMPLIANT |
| SC-6 | Breadcrumb, hero, dual CTA | e2e `:21-55` ×8 | ✅ COMPLIANT |
| SC-6 | Thin-summary fallback without invention | e2e `:75-95` 4 rows incl. "Revisión humana" (1+body+2 generic, `[slug].astro:38-44`) | ✅ COMPLIANT |
| SC-6 | SEO, DRAFT, and no-KPI guard | e2e `:97-134` title "— Lamnda", desc ≤155, canonical per slug, DRAFT badge only agendamiento, KPI scan over cleaned `main` | ✅ COMPLIANT |
| SC-6 | Ported demo island replaces static mock | e2e `:38-47` mapped component root in kept figure, `role="img"` 0×7/1 agendamiento; figcaption literally unchanged on all 8 (`[slug].astro:76/82/88/94/100/106/112/131`) | ✅ COMPLIANT |
| SC-6 | One inline script per page incl. components | e2e `:58-73` exactly 1×7 (component), 0 agendamiento; notif dedupe proven by 0 `<script is:inline>` in `[slug].astro` (vitest `:213`) + page has no `data-filter`/`isNotif`/`notif-mock` residue (vitest `:206-208`) | ✅ COMPLIANT |
| SC-7 No Numeric KPI Claims | KPI patterns absent outside demo bodies | e2e scan strips `[data-demo]`+`script` nodes → 0 matches (`:117-128`); `#services` DOM in site.spec.ts:85 "qualitative only"; `src/content/services/*.md` sweep = 0 matches for `%`/`x\d` | ✅ COMPLIANT |
| SC-7 | Qualitative outcomes | outcomes qualitative (e.g. lead-scoring.md:12, notificaciones-inteligentes.md:12); site.spec.ts:85 passes | ✅ COMPLIANT |
| SC-7 | Sample label gates the exemption | numbers verified to sit only inside demo bodies carrying visible "Datos de muestra" note (e2e `:46` + vitest note assertions ×7) | ✅ COMPLIANT |
| SC-7 | Exemption ends at the demo body | figcaption/hero/CTA are outside `[data-demo]` roots yet inside the e2e cleaned-`main` scan → zero matches (e2e `:114-128`) | ✅ COMPLIANT |

**Compliance summary**: 13/13 scenarios compliant (16 matrix rows — 8 requirements).

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| SD-1..SD-6 | ✅ Implemented | All 7 component sources read line-by-line (Notif 788, Docs 733, Dash 1343, Lead 410, CRM 666, Tele 658, Marketing 364 lines); `tokens.css` untouched; `dist` emits 9 pages |
| SC-6/SC-7 | ✅ Implemented | `[slug].astro` rebuilt with 7 imports/conditionals, zero page-level scripts, notif dedupe complete |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| D1 `is:inline` IIFE per demo, root pivot | ✅ Yes | Exactly 1 `is:inline` ×7; roots as `[data-demo=...]`; 2 roots use old demo names (`gestion-documental`, `dashboards`) — see Suggestion S-1 |
| D2 RM guard + per-demo policy | ✅ Yes | matchMedia line ×7; dash full static early-return (`DemoDashboards:1339-1340` + static badge title), tele `scrollIntoView` auto (`:584`), event-driven 5 CSS-only; RM CSS blocks ported where old had them (Notif:719-734, Docs:247-251, Tele:488-491, Dash:1099-1107) |
| D3 `style is:global` + rebased selectors | ✅ Yes | All 7 use `<style is:global>` under `[data-demo]` roots; JS-injected DOM (gmail/chat markup strings) covered by root-attribute scoping |
| D4 try/catch containment | ✅ Yes | `try { boot; } catch (e) { console.warn('lamnda-demo', e); }` ×7; `if (!root) return` null-guards ×7 |
| D5 Container queries | ✅ Yes | `container-type: inline-size` (CRM:101, Dash:478478→478), `@container` blocks replacing old 1100px/768px media (CRM:580-587, Dash:1110-1130); CRM horizontal scroll preserved |
| D6 Chips not SVGs | ✅ Yes | `li.example-channel-item > span` chips ×8/×6; slogan strips kept as text |
| D7 Status vars + light overrides | ✅ Yes | `--demo-ok/warn/danger` dark+light ×7; `--pd-donut-*` series vars (Dash:471-487); AA unit tests |

### Known Deltas (acknowledged — recorded, not re-litigated)

1. **CRM chips 6, not 7**: upstream transcription (the delta's "7 CRMs" overcounts the old source). Implementation + vitest (`demo-port.test.ts:188`, test name documents the discrepancy) mirror the old file's 6 names (HubSpot, Salesforce, Zoho, Pipedrive, Freshsales, Monday CRM — BotsCrm:78-83). Tal-cual fidelity favors the implementation. **Acknowledged spec-text deviation, no code action.**
2. **Figcaption wording**: actual figcaption on all 8 slugs reads **"Mock ilustrativo — sin datos reales"** — unchanged per spec ("caption kept") and design open-question resolution (design.md:110). Demo-internal "Datos de muestra…" notes are separate and present ×7 ("con fines ilustrativos." on 6 chip pages; bare "Datos de muestra." docs variant). **Confirmed actual; per spec.**
3. Item 3 of the apply deviations list is embodied in the `demo-port`/e2e suites (KPI-scan script+root stripping, lead `#leadNombre` strong-element, CRM Marta=3/Ana=4 counts) — all re-verified passing this run.

### Issues Found

**CRITICAL**: None.

**WARNING**:
- W-1: The apply report cites the 4.3 `check-html` audit at 24/25 (known W1 baseline). `check-html` is not an npm script, so this audit was not re-executed in this fresh run; its substance (valid HTML + AA) is covered by the passing theme/site e2e AA suites and the demo-port status-contrast unit tests. Apply-recorded evidence accepted; noted for transparency.

**SUGGESTION**:
- S-1: `data-demo` values for DemoDocumentos (`gestion-documental`) and DemoDashboards (`dashboards`) use the old demo names rather than the routed slugs, deviating from the design contract's `data-demo="{slug}"` phrasing. Implementation is fully self-consistent (CSS roots, scripts, tests, e2e all use the same values) and honors the stronger verbatim-fidelity rule. No action; keep as documented nuance for future ports.

### Apply-Progress Accuracy

`mem` observation #66 matches verified reality on every checkable claim: 56 new vitest tests; `service-details.spec.ts` 14 test blocks (28 across projects); DemoDashboards split-class fix is present in source (`[data-demo] .pd-anim` descendant form, line 1059); 87/87 vitest, 9-page build, 72/72 Playwright (28 service-details), KPI chips + EN disclaimer verbatim (Dashboards:33), CRM filter counts. First fresh re-run performed by this verification (apply's third switch was not required).

### Verdict

**PASS WITH WARNINGS** — 8/8 requirements and 13/13 scenarios compliant with fresh runtime evidence (build 0, vitest 87/87, Playwright 72/72); zero critical findings; two acknowledged upstream deltas (CRM chip count, figcaption wording) and one non-blocking audit rerun limitation recorded as warnings.
