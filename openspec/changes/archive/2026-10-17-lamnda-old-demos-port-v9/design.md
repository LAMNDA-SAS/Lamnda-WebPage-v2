# Design: Faithful Port of Old Service Demos (lamnda-old-demos-port-v9)

## Technical Approach

Per-demo self-contained Astro components (proposal Option b): each `Demo*.astro` = verbatim old markup fragment (+ adapted root), demo CSS ported used-selectors-only to tokens, one vanilla IIFE `<script is:inline>` appended inside the component so DOM-query order matches the old page. `[slug].astro` keeps `h2 Ejemplo` + `figure.demo-figure`+`figcaption` on all 8 slugs; each conditional swaps its old mock subtree for the component; `agendamiento-automatico` untouched (`role="img"` kept).

## Architecture Decisions

| # | Choice | Alternatives | Rationale |
|---|---|---|---|
| D1 Script strategy | `<script is:inline>` inside component, one IIFE per demo, IDs kept verbatim; notif's `#ejemplo` pivot replaced by `[data-demo="{slug}"]` root selector | Bundled `<script>` (Astro-processing) | Bundled scripts hash/defer/hosted externally vs zero-cost static; `is:inline` preserves old 1:1 control flow, no processing, no exports. One node script per demo ships only on its page. |
| D2 RM guard (shared by 7) | Every IIFE opens with `var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;` then a per-demo **consumption policy**: dashboards = full early-return to static; voice = `scrollIntoView` behavior `auto`; the 5 event-driven demos = no script-level change (their RM path is CSS-only, as on the old site: port the old `@media (prefers-reduced-motion: reduce)` blocks 1:1) | `is:inline` without guard; CSS `@media` only | v8 island pattern parity + spec's "old RM degradation path". See code block below. |
| D3 CSS scoping | One `<style is:global>` per component; every selector rebased from `.live-example` to the demo root `[data-demo="{slug}"] …`; `example-*`/`pd-*` class names verbatim | Astro scoped `<style>` | Astro scoped selectors won't match JS-injected DOM (docs gmail/quotation cards, marketing chat bubbles/avatars build `innerHTML` at runtime — their elements never get the scoping attribute). `is:global` + root-attribute descendant scoping covers dynamic DOM, ships only on the importing page (Astro page-level CSS split), and no `example-*`/`pd-*` names exist elsewhere in v2 (verified `src/`). Dark-theme `[data-theme]` old rules are NOT ported; both themes verified via token vars. |
| D4 Error containment | Each IIFE body runs inside `try { boot(); } catch (e) { console.warn("lamnda-demo", e); }` + `if (!root) return;` style null-guards retained verbatim | Unwrapped old scripts | Old scripts are separate IIFEs; wrap adds "one broken demo can't break page JS" as an invariant, zero-behavior-change. Also: zero `window.*` globals. |
| D5 Dashboards layout fit | Convert the two container-width-dependent old media blocks (`@media (max-width:1100px)` pd-grid/CRM-board rules; CRM `min-width:1240px` scroll) to runtime-neutral **container queries** on the demo root (`container-type: inline-size`) | Keep viewport media queries; widen wrap | Wrap stays 860px (no wrap contract change): at desktop viewport >1100 the old queries would leave 6-col grids inside a ~816px container. Container queries replay the old responsive intent relative to the actual demo box; CRM board scrolls horizontally inside the figure as exploration planned. |
| D6 Vendor strips | Keep `ul.example-channels` + `li.example-channel-item` classes; delete SVGs; name `<span>` chips restyled to v2 chip pattern | Drop strips, brand SVGs v2 look | Spec: names as AA chips, classes verbatim keeps diffability. |
| D7 KPI/Badge/status color system | Scoped status vars (below), light override via `html[data-theme="light"]` | Monochrome status | Spec mandates AA-checked scoped pairs. |

Shared RM guard (verbatim, all 7):

```js
(function () {
  try {
    var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* per-demo body: dashboards begins with: if (REDUCED) { badge title=static notice; return; } */
  } catch (e) { if (window.console) console.warn("lamnda-demo", e); }
})();
```

Status vars (declared on each demo root; values AA-verified): `--demo-ok` dark `#4ade80` / light `#15803d`; `--demo-warn` dark `#fbbf24` / light `#b45309`; `--demo-danger` dark `#f87171` / light `#b91c1c`. Text `color: var(--demo-*)` ≥4.5:1 vs `--card`/`--surface`; indicators ≥3:1; tinted chip bg = `color-mix(in srgb, var(--demo-*) 12%, var(--card))`.

## Color remap (used selectors only; CSS + JS-baked strings)

| Old value | v2 replacement |
|---|---|
| `#0e2a5c` navy (text/heading/border) | `var(--text)` / filled bg: `var(--primary-text)` + `var(--bg)` text; borders `var(--border)` |
| `#2e5a9a` blue, CRM purple `#6d28d9/#8b5cf6/#4c1d95`, Excel `#217346` | text/chips/buttons: `var(--primary-text)` (filled pair `--primary-text` bg + `--bg` text) |
| `#f542b3` pink; blue→pink/`135deg` gradients | red/role text: `var(--primary-text)`; pure decor (dots, borders, rings): `var(--primary)`; bar/compare/progress fills: flat `var(--primary-text)` |
| `#f3f5f9` bg, `#fff` cards, `#e2e8f0/#eef2ff/#f1f5f9/#f8fafc/#f5f3ff/#ede9fe` mock fills | `var(--surface)` / `var(--card)` / `var(--surface)`; selected/hover tints: `color-mix(in srgb, var(--primary-text) 12%, var(--card))` |
| `rgba(15,23,42,.05–.2)` borders/shadows | `var(--border)` (1px); shadows `var(--shadow)` or none |
| `#0f172a` text; `#64748b/#475569/#334155`; `#94a3b8/#cbd5e1` | `var(--text)` / `var(--muted)` / `var(--muted)` |
| White-on-fill alphas (rgba(255,255,255,.x)) | decorative borders `color-mix(in srgb, var(--bg) 20%, transparent)`; label text `color-mix(in srgb, var(--bg) 85%, transparent)` (≥4.5:1 on both locked pairs) or plain `var(--bg)` |
| JS-baked: brand-shield SVG `#0e2a5c`, avatar SVGs `#0e2a5c/#f542b3`, `drift()`/rebuild strings `conic-gradient(#2e5a9a… #f542b3… #f59e0b… #e2e8f0…)` | SVG `fill="var(--primary-text)"` / component var; strings rebuilt as `conic-gradient(var(--pd-donut-1) …, var(--pd-donut-2) …, var(--pd-donut-3) …, var(--pd-rest) …)` — vars declared on `[data-demo="dashboards-dinamicos"]` root, both themes |
| Status greens/ambers/pinks (`#22c55e/#15803d/#16a34a/#065f46`/`#f59e0b/#92400e/#fef3c7`/`#be185d`, badge tints, tooltips border-top `#2563eb`) | `var(--demo-ok/--demo-warn/--demo-danger/--primary-text)` per semantics; tooltips border-top `var(--primary-text)` |

## Data Flow

```
old service-*.html (markup) ─┐
demos.css / portfolio.css  ──┼─ used-selector + hex-remap port → Demo{X}.astro
old page <script> IIFE ──────┘      (root[data-demo] + style is:global + script is:inline)
        → [slug].astro slug conditional (inside figure.demo-figure) ─→ 8 static pages
runtime: page JS touches only its data-demo root; zero fetch, zero network, zero deps.
```

## File Changes

| File | Action | Notes |
|---|---|---|
| `src/components/demos/DemoNotificaciones.astro` | Create | ~270 ln; tabs filter IIFE; tooltip CSS; channel chips |
| `src/components/demos/DemoDocumentos.astro` | Create | ~340 ln; ORDERS data + generator + gmail card IIFE (dead `tryHint` lookup dropped — no element exists, behavior identical) |
| `src/components/demos/DemoDashboards.astro` | Create | ~1,300 ln (≈50 KB rendered): header CSS + portfolio.css base (~330 ln) + page-local styles (theme-dark block dropped) + 4 tabpanels + ~200-ln autoplay engine (CYCLE_MS 4000, LIVE_MS 3000, drift/tween/reset/replay/pause-on-hover+`document.hidden` all kept) |
| `src/components/demos/DemoLeadScoring.astro` | Create | ~250 ln; sort IIFE; inline `style="color:#64748b;font-size:.75rem"` signals retokened to a `.example-signal` scoped rule |
| `src/components/demos/DemoBotsCrm.astro` | Create | ~370 ln; drag&drop + owner filter + recount IIFE; tooltips |
| `src/components/demos/DemoTeleAgentes.astro` | Create | ~300 ln; Web Speech engine 1:1 (es voice ranking, phrase pacing, `Simular sin audio` timer run, no-TTS note swap) |
| `src/components/demos/DemoMarketingBots.astro` | Create | ~240 ln; chat replay IIFE; avatar SVGs retokened; lead card `opacity:.4` → scoped `is-idle` style rule |
| `src/pages/servicios/[slug].astro` | Modify | +7 imports; 7 conditionals rebuilt (`<Demo*>` inside the kept figure); old mock subtrees for those 7 deleted incl. `isNotif` variable; **old notif `<script is:inline>` block deleted** (dedupe); `main script` baseline stays 0 |
| `tests/e2e/service-details.spec.ts` | Modify | see Testing |
| `tests/demo-port.test.ts` | Create | vitest static audits |

## Interfaces / Contracts

- Component contract (all 7): zero props; renders fragment `<div class="example-inner" data-demo="{slug}">…</div>` (`example-inner-wide` for CRM; dashboards root wrapper holds badge/outcome/sub/kpis/sample-note + `#auroraDashboard` without `example-frame`); ≤1 `<script is:inline>`; no `role="img"`; `figure.demo-figure`/figcaption stay in the template (captions unchanged — spec: "caption kept").
- Slug→component map: notificaciones-inteligentes→DemoNotificaciones, documentacion-automatizada→DemoDocumentos, dashboards-dinamicos→DemoDashboards, lead-scoring→DemoLeadScoring, bots-crm→DemoBotsCrm, tele-agentes-ia→DemoTeleAgentes, marketing-bots→DemoMarketingBots.
- Script counting rule (Base.astro ships 2 chrome `is:inline` scripts on every page, so page-global "≤1" must be scoped): island cap counts **inline scripts inside `<main id="main">`** — 7 pages = exactly 1, agendamiento = 0. Notif dedupe asserted separately (no `.notif-mock` markup, no `aria-pressed`+`data-filter` tabs-filter script residue).
- English dashboards labels stay with the old sample-note text "… Etiquetas del panel en inglés por diseño original" verbatim inside the demo body.

## Demos: interactivity port + hooks

| Demo | Old interactivity (port 1:1) | RM path | e2e hooks |
|---|---|---|---|
| Notificaciones | 3 tabs filter 4 `[data-cat]` rows (display flex/none, aria-selected) | CSS-only (alert entrance/feat glow killed) | `[data-demo]`, click `.example-tab[data-filter="soporte"]` → ventas row hidden |
| Documentos | search filter; row select→generate bar; render COT (IVA 19%, due+30d) → Borrador→✔ Enviado gmail | CSS-only (row pulse killed) | `[data-order="PED-301"]` click → `#facturaBox` contains "COTIZACIÓN" |
| Dashboards | tablist+progress dots activation, autoplay 4s, live drift 3s, count-up tween, entrance/breathe/shimmer, pause hover/focus+hidden, Replay/Reset | **full static** (early return; static badge title set; view 1 only) | click 2nd `.pd-tab` → `#pd-view-financial` visible + `#pdTitle` changes; RM context → static badge title |
| LeadScoring | 5 sort keys + `#sortDir` asc/desc re-append rows | CSS-only | click `#sortDir` then `#sortDir` → first row data-score flips 18↔92 |
| BotsCrm | HTML5 drag between columns + owner filter + live totals (`#crmTotal/#crmCount`) | CSS-only | type `crmFilter` "ana" → `#crmVisible` "3 oportunidades" |
| TeleAgentes | `speechSynthesis` best-es-voice walk, per-turn highlight+lead fill+aria progress; stop; sim 1.6s/turn | smooth scroll → `auto` | click `#voiceSimulate` → ≈2s later `#leadNombre` ≠ "—"; no TTS branch: note text swap + play disabled |
| MarketingBots | 10-message replay 800ms; lead card opacity .4→1 + filled list | CSS-only | click `#chatPlay` → `#chatBox` children grow; `#leadText` contains "Fecha asesoría" |

All hooks exist already in old markup (`data-*`, ids) — the only additive contract is `data-demo="{slug}"` per root.

## Testing Strategy

| Layer | What | Where |
|---|---|---|
| vitest (new `tests/demo-port.test.ts`) | per component: exactly 1 `is:inline`, `matchMedia` guard + try/catch present, zero `fetch(`/`http` in script body, zero ported raw hexes outside `--demo-*/--pd-*` var lines, zero `[data-theme=` selectors, "Datos de muestra" note present ×7, docs NIT/phone/email/address strings verbatim; `[slug].astro`: 7 imports, no `notif-mock`/`isNotif`/`data-filter` residue; `tokens.css` contains no `--demo-` (no-edit guarantee) | vitest run |
| e2e (modify `service-details.spec.ts`) | role="img": 1 on agendamiento, 0 on the 7 (conditional instead of fixed 1); `main` script count 1/0; figcaption unchanged; interaction smokes table above; RM emulation (context `reducedMotion: reduce`): dashboards static badge, tabs still filter on notif; request watcher: zero non-same-origin requests on the 7 pages; no-KPI scan **re-scoped**: `%` sees `main` text with `[data-demo]` roots' contents excluded (spec carve-out) | playwright |
| Build | `astro build` green; `dist/servicios/*.html` ×8; per-page `example-` CSS leak check (dashboards styles absent on notif page and vice versa) | manual/CI script |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary changes. This change adds static content components and extends existing test files; no build/runtime process integration is introduced (matrix rows recorded not applicable, no RED tests invented).

## Migration / Rollout

No data migration, no feature flags. Rollback (filesystem, zero commits): `rm src/components/demos/Demo*.astro`; `git restore src/pages/servicios/[slug].astro tests/e2e/service-details.spec.ts tests/demo-port.test.ts` (old mocking blocks + previous tests live in HEAD). Half-port states never ship: conditionals and components commit together as one work unit.

## Open Questions

- [ ] None blocking. Flagged for user confirmation (non-blocking): figcaption keeps "Mock ilustrativo — sin datos reales" per spec although demos are live ports; old demo-local CTAs dropped as specced.
- [ ] Container-query support (D5) assumes evergreen browsers — consistent with existing v2 contract; no IE/Safari<16 fallback planned.
