# Exploration: Port old service demos into v2 service detail pages (lamnda-old-demos-port-v9)

Change: faithful ("tal cual") port of the old site's 7 service demos into v2's `[slug].astro` Ejemplo section, design re-mapped to v2 tokens. Source: read-only clone `C:\RTemp\opencode\Lamnda-WebPage-survey` (static site, `lang="es"`). No git commands in this change; user commits explicitly.

## Current State (v2 integration point)

- `src/pages/servicios/[slug].astro` (602 lines): one collections-driven template → 8 static pages from `services` collection (`getCollection("services")`). All 8 demo mocks live as per-slug conditionals inside `section.detail-demo` (`<h2>Ejemplo</h2>` + `figure.demo-figure > div.demo-mock` + `figcaption "Mock ilustrativo — sin datos reales"`).
- Exactly 1 inline script today: notif tabs filter (`<script is:inline>`, `prefers-reduced-motion` early-return, rendered only for `isFull && isNotif`). This is the v8 "≤1 inline script per full detail page" island contract ("static-first").
- Scoped styles by CSS vars from `src/styles/tokens.css`: `--bg --surface --card --text --muted --primary-text --border --radius --font-display --font-sans`. Locked AA pairs: dark `#7AB3FF` on `#0A1628` (~7.0:1), light `#0A54C2` on white (~7.5:1). `--primary #2e8cff` = decoration only. Wrap width 860px.
- v8 spec (`openspec/changes/archive/2026-10-16-lamnda-service-details-v8/design.md`): demo mocks are static CSS/SVG, zero numeric KPI claims in page copy (E2E regex ban on `%`), token-only CSS, one template. All 8 slugs confirmed on disk (`src/content/services/*.md`), `agendamiento-automatico` is the DRAFT service.

## Old Asset Inventory (survey clone)

| File | Size | Role in demos |
|---|---|---|
| `demos.css` | 67 KB / 1748 lines | All demo styles, every selector scoped `.live-example .example-*` (+ index-gallery and legacy sections unused by the 7 pages). Old palette: navy `#0e2a5c`, pink `#f542b3`, blue `#2e5a9a`, bg `#f3f5f9`; per-demo accents: CRM purple `#6d28d9/#8b5cf6/#ede9fe`, Excel green `#217346`, success/warning `#22c55e/#f59e0b`, slate text `#0f172a/#64748b/#94a3b8`. Includes a `[data-theme="dark"]` override block (~230 lines) and `prefers-reduced-motion` guards. |
| `script.js` | 131 lines | Site-wide only (mobile menu, theme toggle + localStorage, smooth scroll, reveal observer). **Contains zero demo logic** — no demo depends on it. |
| `portfolio.css` | 503 lines | **Missing from task list but required**: the dashboards demo's base `.pd-*` stylesheet (~80 selectors) scoped `.portfolio-dashboard`. |
| Page-local `<style>` + inline `<script>` | per page | Each page carries its own demo CSS (dashboards: ~90 lines) and its own single vanilla-JS IIFE (~10–200 lines). |

So every demo = self-contained markup + demo-scoped CSS + one tiny inline script (dashboards also pulls `portfolio.css` + head styles).

## Old-Demo Inventory per Page

Slug mapping: notifications→`notificaciones-inteligentes`, crm-bots→`bots-crm`, voice-agents→`tele-agentes-ia`, dynamic-dashboards→`dashboards-dinamicos`, docs→`documentacion-automatizada`, lead-scoring→`lead-scoring`, marketing-bots→`marketing-bots`. `agendamiento-automatico` (DRAFT): **no old counterpart — keep current static mock untouched**.

### 1. notifications → notificaciones-inteligentes (160 lines)
- Demo anatomy: `example-inner` (960px) · badge "Ejemplo en vivo" · outcome "Cada evento crítico llega al instante, sin perseguirlo" · sub · **KPI chips** `-35% tickets repetidos`, `+98% entrega a tiempo`, accent `Respuesta en minutos` · sample note · `example-frame` (mac-dots bar "Centro de notificaciones") · featured alert (navy→blue gradient card, 🔔 emoji + ✓ badge, meta grid `evento/cliente`, `Pedido #4821 por $1.240.000 · Email/WhatsApp/Slack <1 min`, "En vivo" pill, CSS tooltip 3 lines) · tabs Todas/Ventas/Soporte · 4 alert rows (emoji icons 💰⚠️🧾📊, meta `evento/cliente/bodega/detalle`, channel+time pills, tooltips) · CTA box "Conectamos tus notificaciones a múltiples canales" with **8 vendor SVG logos** (WhatsApp/Gmail/LinkedIn/Telegram/Slack/Outlook/Instagram/SMS) + slogan + 2 CTA buttons.
- Interactivity: 1 tiny IIFE — tab filter (`display:none` by `data-cat`).
- KPI/`%` audit: `-35%`, `+98%` chips; narrative numbers #4821, $1.240.000, `<20 unidades`, #1093, "hace 2 min", "3 días", "12 pedidos · 3 devoluciones" (all sample-labeled).

### 2. docs → documentacion-automatizada (237 lines)
- Demo anatomy: outcome "Del Excel al correo en segundos" · sub instructs flow (PED-301) · sample note ("Datos de muestra.") · `example-frame` "Generador documental" · search input (filters by text) · `example-excel` orders table (8 rows PED-301..308; Excel-green header `#217346`; `style="color:#64748b"` not present here but equivalent inline styles in lead-scoring) · row select → "Generar factura" bar un-hides (numbered `::before` badges 1/2 from CSS) · JS renders full `COTIZACIÓN` (brand shield SVG λ + **real Lamnda contact data: NIT 902015091-8, +57 320 890 9792, operaciones@lamnda.com, Cra. 90 Bis #75-78 Bogotá**) · IVA 19% + due date computed (`ORDERS` data map, 8 orders with NITs, line items, prices) · Gmail mock card (Borrador → ✔ Enviado, 📎 attachment) · no CTA-y KPI chips (none) · plain CTA row.
- Interactivity: 1 stateful IIFE (~90 lines with ORDERS data; innerHTML re-render, hover tooltips none, `example-row-pulse` first-row hint).
- KPI/`%` audit: order totals/prices ($1.654.100 …), IVA 19% — all inside the generated sample document.

### 3. dynamic-dashboards → dashboards-dinamicos (820 lines — LARGEST, 62KB)
- Demo anatomy: badge/outcome "Tus datos, explicados de un vistazo" · sub ("4 vistas animadas", labels in English by original design) · **KPI chips** `2.000 clientes`, `Tiempo real`, accent `Listo para decidir` · sample note incl. English-labels disclaimer · **`#auroraDashboard` (`.portfolio-dashboard`, NOT in an `example-frame`)**: topbar (title + pulsing "EN VIVO" badge, 4 progress dots, Replay + Reset buttons) · navy sidebar "AURORA BANK" with 4 `"tablist"` views: Demographics / Financial Health / Transactions / Card Details · 4 tabpanels with KPI count-up cards (`data-count/data-prefix/data-decimals`), CSS bar pairs + donuts (conic-gradients), `Top 5 Transactions` table, credit-card visual, limit-usage ring.
- CSS sources: `portfolio.css` `.pd-*` base (~500 lines) + page-local `<style>` (~90 lines: live badge, progress dots, view fade, entrance/breathe/shimmer animations, tables, credit card, dark tweaks, RM block).
- Interactivity: 1 IIFE (**~200 lines**): tab/dot activation, autoplay cycle 4s, "live drift" render every 3s (`drift()` ± random on BASE dataset, tween count-up `requestAnimationFrame`), entrance animations (`.pd-anim`), pause on hover/focus + `document.hidden`, `prefers-reduced-motion` → fully static, replay/reset buttons, per-view render functions updating bars/donuts/KPIs/tooltip titles.
- KPI/`%` audit: 2,000 clients; $45,715.9; age 45; $23,141.9; splits 70.25/27.15/2.60% and 16.70/24.60/32/26.70%; $128,450; score 712; 32%; $86,200; 1,284 tx; $142; 1,842 cards; $8,500; 2.1%; 64% used — all rendered as sample banking data inside the mocked dashboard.
- Size note: sidesteps `example-frame`; own inline `max-width:1280px`; needs both `portfolio.css` and page-local CSS ported into the demo component.

### 4. lead-scoring → lead-scoring (154 lines)
- Demo anatomy: outcome "Tu equipo llama primero a quien sí va a comprar" · sub · **KPI chips** `+31% cierres`, `-50% leads fríos`, accent `Alerta instantánea` · sample note · frame "Lead scoring" · sort row (Puntaje/Nombre/Empresa/Estado/Fecha + toggling `↓ Desc`/`↑ Asc` button) · sortable table (5 leads with `data-score/nombre/empresa/estado/fecha`; per-row `<span style="color:#64748b;font-size:.75rem">` signal text — hardcoded old gray), score bars (gradient blue→pink), pills `SQL`/`MQL`/`Frío` · sub-block "Rendimiento de asesores comerciales" + its own sample note · 5 seller cards (⭐ Top performer badge, meta `48 leads · 38% conversión · Ticket $6.4M`, score + compare bars) · CTA row.
- Interactivity: 1 IIFE — column sort + direction toggle (appends sorted `<tr>`).
- KPI/`%` audit: `+31%`, `-50%` chips; seller stats (38%…, $6.4M…) and lead scores 92/78/64/41/18 — sample-labeled.

### 5. crm-bots → bots-crm (179 lines)
- Demo anatomy: `example-inner-wide` (**1400px**) · outcome "Ningún lead se queda sin atender" · sub "Arrastra oportunidades entre etapas…" · sample note · frame "Pipeline · HubSpot / Salesforce" · **`example-crm-shell`**: purple header "Creatio-style · Pipeline de ventas" (`#6d28d9/#8b5cf6` gradient — third-party brand styling), stage strip Qualification→Closed won (`aria-hidden`), toolbar (owner filter input + "11 oportunidades" counter) · **5-column kanban, 11 `draggable` cards** (`data-owner/data-value`, Hot/Warm tags, tooltips with contacto/email/teléfono/actividad/próxima tarea/valor/probabilidad per card) · footer "Total pipeline $636,3M COP · 11 oportunidades" (live recount) · hint "🤖 Auto-asignación round-robin + recordatorio si una tarjeta lleva >24 h quieta." · CTA box "Trabajamos con los CRM más populares" with **7 vendor SVG logos** (HubSpot/Salesforce/Zoho/Pipedrive/Freshsales/Monday CRM) + slogan + 2 buttons.
- Interactivity: 1 IIFE — HTML5 drag & drop between columns + owner-text filter + grand-total/count recompute (`fmt → '$32,5M COP'`).
- KPI/`%` audit: deal values ($32,5M…$96,4M COP), close dates, probabilities 25–100% — all sample data; no `%` result-claim chips on this page (no `example-kpis` block).

### 6. voice-agents → tele-agentes-ia (220 lines)
- Demo anatomy: outcome "100 llamadas calificadas antes del desayuno" · sub · **KPI chips** `3:24 duración media`, `92% sentimiento +`, accent `68% resolución` · sample note · frame "Llamada #231 · Calificación outbound" · top row (speaker chip En espera/Cliente/Agente IA, progress bar `0/10`, counter) · grid: transcript (11 turns; each `data-say` speech text + `data-fill` JSON payload filling the lead panel + `data-field` keys) + lead panel "Registro del lead en vivo" (7 fields, ✓ pop animation) · voice KPI tiles (3:24 / 92% / Agendada) · TTS row: `▶ Escuchar` / `⏹ Detener` / `Simular sin audio` · note with no-TTS fallback text.
- Interactivity: 1 IIFE (**~55 lines**): **Web Speech API** (`speechSynthesis`) — Spanish voice ranking (Google/Microsoft Natural/Neural, `es-US`/`es-ES`), phrase-split pacing, per-turn highlight + scroll, lead-panel fill, progress; graceful degradation: missing TTS → note text swap + play disabled; `Simular sin audio` = timer-driven dry run.
- KPI/`%` audit: `3:24`, `92%`, `68%` chips; fabricated phone/email in dialogue (sample).
- A11y carry-over: `role="progressbar"` with `aria-valuenow`, `aria-live` panels.

### 7. marketing-bots → marketing-bots (134 lines)
- Demo anatomy: outcome "Tu Instagram y tu email venden mientras duermes" · sub "El bot responde el DM, califica y agenda. Pulsa reproducir…" · **KPI chips** `+23% conversión`, `24/7 respuesta`, accent `Lead capturado` · sample note · frame "Marketing bot · Instagram + Email" · two-col: `▶ Reproducir` button + chat box (10 messages stepped at 800ms from an inline array; bot/user avatars = inline SVGs with hardcoded old colors `#0e2a5c`/`#f542b3`) + lead card (starts at `opacity:.4`, fills final fields incl. "Fecha asesoría: Martes 10:00 a. m." and "Email drip día 1, 3 y 7 programado") · replay label switches to `↺ Reproducir`.
- Interactivity: 1 IIFE — chat replay + lead fill (no TTS).
- KPI/`%` audit: `+23%` chip; same fabricated contact narrative as voice demo.

## Integration Analysis

| Option | Pros | Cons | Effort |
|---|---|---|---|
| (a) Inline all demo markup + scoped CSS in `[slug].astro` | One file matches v8 "one template" culture; no new components | File grows ~600 → ~3,000+ lines; diffs against 7 old sources are interleaved and review-hostile; all demo CSS compiles into one shared `<style>` block | Medium |
| (b) Per-demo Astro components `src/components/demos/Demo*.astro` (markup + scoped CSS + own inline script), imported by the existing slug conditionals | Each demo is reviewable 1:1 against its old page; Astro scopes CSS per component (zero leakage between the 7 demos; CSS ships only to pages importing the component); each old page's single-script structure maps to one component; `[slug].astro` touch stays minimal (8 imports, conditionals) | +7 files; inline scripts must remain `is:inline` inside components; one more indirection layer | Medium |
| (c) Iframes of old pages | Truly isolated | REJECT: broken theming/AA/token contract, duplicated page shells (nav/hero/footer), poor integration with v2 captions/CTA, dead links to old `index.html` anchors | Low |

**Recommendation — Option (b)**, per-demo self-contained components, with these specifics:

1. Components under `src/components/demos/` (e.g. `DemoNotificaciones.astro`, `DemoDocumentos.astro`, `DemoDashboards.astro`, `DemoLeadScoring.astro`, `DemoBotsCrm.astro`, `DemoTeleAgentes.astro`, `DemoMarketingBots.astro`).
2. `[slug].astro`: keep `figure.demo-figure` + `figcaption` wrapper (v2 context caption) — or let the component own the figure and the template only drops the component in the slug conditional; choose during spec (one consistent choice, all 8 slugs; `agendamiento-automatico` keeps today's inline mock or also moves to a component for symmetry — its mock unchanged).
3. The existing notif inline script in `[slug].astro` is superseded by `DemoNotificaciones`'s own script (old tab filter, equivalent behavior) — delete the old `isNotif` block, avoiding any page ending with two scripts.
4. CTA adaptation (old demos end in demo-local CTA rows/boxes): **drop the old "Quiero algo así / Ver servicios" buttons** (duplicated by v2 `.detail-cta` directly below the section); **keep informational strips** (channels logos strip, CRM logos strip, slogans) inside the component content. Interior strips must be flagged to the user as candidate drops.
5. Island cap accounting after port: every page still has ≤1 demo script (notif/docs/dashboards/lead/crm/voice/marketing = 1 each; agendamiento = 0) — the ≤1-per-page rule holds. The delta spec must still relax v8's "static CSS/SVG only" wording to "faithful ported demo islands" and re-define "trivial" per demo (dashboards ~200-line engine, docs stateful generator, voice Web Speech API).

## Design-Adaptation Rules (old → v2)

- **Color remap (all hardcoded hexes → tokens, AA-checked pairs only)**:
  - Navy `#0e2a5c` (headings, badges, borders, dark filled surfaces: user bubble, COT bar, CRM footer, sidebar) → text/border roles → `--primary-text`/`--border`; filled role → `--primary-text` bg with `--bg` text (the locked pair), or `--card` + `--border`.
  - Blue `#2e5a9a` (chips, play buttons, gradients) → `--primary-text`.
  - Pink `#f542b3` (unread dot, accent chip bg, score-bar gradient second stop, tag-hot, speaking ring, avatars, featured border) → `--primary-text` (or `--primary` where purely decorative); gradient fills `linear-gradient(90deg,#2e5a9a,#f542b3)` → flat `--primary-text` (v2 is monochrome brand-blue).
  - Bg `#f3f5f9` → `--surface`; white cards → `--card`; borders `rgba(15,23,42,.08…)` → `--border` (1px); text `#0f172a` → `--text`; `#64748b`/`#475569` → `--muted`; `#94a3b8` → `--muted`.
  - CRM purple (`#6d28d9/#8b5cf6/#ede9fe/#f5f3ff`) → flat `--primary-text`-on-`--surface` scheme (v2 has no purple); Excel green `#217346` header → `--card` + `--muted` header or `--primary-text` bg + `--bg` text; success/warning greens/amber (`#22c55e,#15803d,#ecfdf5,#f59e0b,#92400e,#fef3c7`) → DECISION REQUIRED: v2 tokens have no status colors. Options: (i) monochrome map (pills/dots become `--primary-text`/`--muted` — simplest, AA-safe, loses status semantics); (ii) introduce scoped AA-checked pairs inside the demo CSS (not tokens.css, keeps v8 token-only, but adds per-component color constants). Lean (i) for spec simplicity; flag to user.
  - The old `[data-theme="dark"]` override block + `[data-theme]`-keyed tweaks must **NOT** be ported — v2 themes swap by variable; token mapping must be verified in BOTH themes (AA covers text; decorative gradients single-color fine).
- **Fonts**: old demos use Inter only; v2 `--font-sans` is Inter → keep internally; v2 headings keep `--font-display` from the section heading. Monospace snippets (`pago_confirmado` etc.) → existing `ui-monospace` stack as in old code.
- **Emojis** (`🔔 ✓ 💰 ⚠️ 🧾 📊 ⭐ 🤖 📎 ▶ ⏹ ● ↺`): v2's current mock language is icon-free; strip all emojis, keep reachable text: notif icons → shape/initial tiles; ⭐ → remove (text "Top performer" conveys it); 🤖 hint → plain text or small SVG bell in `--primary-text`; 📎 → "Adjunto" label; play/stop ▶/⏹ → text already carries verbs ("Escuchar", "Detener"); sort `↓/↑` → keep as aria-annotated text button; unread dot/live dot → CSS circles in `--primary-text`. Language Domain Contract → mark copy tal cual (Spanish).
- **Vendor SVG logos** (8 channels + 7 CRMs): user directive says strip if v2 bans them; v2 keeps textual `chip-row`. Recommendation: replace colored vendor logos with text chips (v2 chip pattern preserves channel/CRM names in an AA-safe way). DECISION REQUIRED for spec.
- **Spacing/containers**: keep old `.example-*` class names verbatim to ease spec diffing (renaming is pure churn). Old `example-inner` 960px/CRM 1400px/dashboards 1280px → adapt to v2 860px wrap: CRM board keeps its internal horizontal scroll (old `@media ≤1100px` did `overflow-x:auto; min-width:1240px`); dashboards grid already collapses to 1 col ≤768px. Optionally widen the wrap via a per-page class — lean keeping 860px + inner scroll (no wrap contract change).
- **Motion**: port all `prefers-reduced-motion` guards 1:1 (old demos were RM-correct; v2 contract requires RM too). Keep ≤ small-scale animations; v2 philosophy uses transform/opacity only.
- **Scoping**: keep old `example-*` prefixes intact under component-scoped `<style>` — Astro scoping makes them collision-safe; no CSS import of `demos.css` itself (68KB legacy would fight tokens and ship dead code; port only selectors used by the 7 demos: skip legacy `example-doc-card/hero-swap/kanban-3col/steps/stepper/log/typewriter/platforms/badges` sections).

## Numeric-KPI Occurrences (for the standing no-numeric-KPI ban decision)

Standing rule: ban targets NEW copy. The old demos contain them inside demo bodies, and every chip-labeled KPI page also carries its sample-data note ("Datos de muestra con fines ilustrativos"). Exact chips: notifications `-35%` `+98%`, lead-scoring `+31%` `-50%`, voice-agents `3:24` `92%` `68%`, marketing-bots `+23%`, dashboards `2.000 clientes` `Tiempo real` (no % chips). Sample documents/boards carry deal values, prices, probabilities, dates (all fictional, sample-labeled). Precedent: the old `example-sub-block-sub`/`example-sample-note` label pattern already runs on the old site (6 of 7 pages carry it; docs has "Datos de muestra."). Spec must either (i) scope the v8 `%`-regex ban to hero/values/CTA copy and exempt demo bodies marked "Datos de muestra", or (ii) strip/soften chips. Given the "tal cual" directive, lean (i) — and if the spec bans result-claim chips, the tested pattern becomes "chips with sample-note retained, result claims removed" only after user sign-off.

## Risks

1. **v8 contract deltas needed**: (i) demos move from "static CSS/SVG" to ported interactive islands (each page still ≤1 inline script — verifiable build assertion); (ii) `%`-ban scoping vs demo bodies; (iii) per-demo components vs single template; (iv) CTA-strip keep/drop; (v) status-color decisions. All specced explicitly to avoid e2e failures.
2. **Dashboards weight** (62KB source, ~500-line CSS + ~200-line JS engine + 4 tabpanels): heaviest port; needs careful asset budget; still zero-cost static (CSS/JS inline, no runtime deps). Mitigate by porting as the dedicated component with old classes intact, but not bundling `portfolio.css` wholesale — same used-selector discipline as demos.css.
3. **Web Speech API variance** (voice availability/rate): old code already degrades (note text swap + disabled play + "Simular sin audio") — port as-is; e2e covers keyboard + fallback path only (no real TTS in CI).
4. **A11y**: tooltips are hover/focus CSS (`focus-within`, `pointer-events:none`), tabulated panels, `aria-live` lead fill — port 1:1, plus v2 focus ring tokens; verify 260px tooltips don't overflow the 860px wrap on mobile (old already has ≤360px/≤768px rules).
5. **Hardcoded inline styles** (`style="color:#64748b;font-size:.75rem"` in lead-scoring cells; `opacity:.4` lead card in marketing) — retoken during port; old `drift()` JS builds inline colors (`conic-gradient(#2e5a9a…)`, `'#f542b3 0 '+use+'%'` strings) and baked hexes in JS (`BOT_AV`/`USER_AV` SVGs) — remap those string constants to token-aware CSS custom props (COT/donut ring/bars rebuild gradients at runtime — rewrite those strings to use var() where valid or CSS class pairs).
6. **Real Lamnda contact data** inside the docs demo quotation (NIT 902015091-8, phone, email, address, lamnda.com) = company's own public contact info reproduced tal cual — confirm intent with user (it is the company's site data).
7. **Third-party names** in copy: "Creatio-style · Pipeline de ventas", frame "Pipeline · HubSpot / Salesforce", CRM/channel names (informational context, old content) — keep tal cual unless user objects.
8. **CSS payload ordering**: Astro component-scoped styles ship only where imported (checks: build a page, assert no other demo's classes leak into its HTML/CSS).
9. **Notif script dedupe**: v2's current tabs-filter script must be removed when `DemoNotificaciones` takes over — otherwise a page would carry 2 scripts (cap breach).
10. **English dashboard labels** (Clients, Demographics, AURORA BANK…) travel with a disclaimer paragraph already present in the old sub ("Etiquetas del panel en inglés por diseño original") — tal cual keeps that note; flag to user since v2 is otherwise Spanish-only content (visual mock, not page copy).

## Ready for Proposal

**Yes** — the port is well-bounded: 7 demos + 1 untouched DRAFT mock, one integration pattern, token mapping table above, and ≤1 inline script per page preserved. Spec phase should decide the flagged questions (island re-definition wording, `%`-ban scoping vs sample-labeled demo bodies, vendor-logo strip vs chips, status-color monochrome vs scoped pairs, CTA-strip keep/drop) before apply.
