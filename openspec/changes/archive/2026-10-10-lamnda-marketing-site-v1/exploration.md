# Exploration: lamnda-marketing-site-v1 — Lamnda SAS Marketing Site

> Change: `lamnda-marketing-site-v1` | Project: `new webpage` | Date: 2026-10-10
> Sources read: `openspec/config.yaml`, `foto lamnda web/Soluciones elegantes para sistemas complejos.png` (lobby),
> `foto lamnda web/Lamnda_ Soluciones tecnológicas del futuro.png` (services grid), `openspec/changes/`, `.atl/skill-registry.md`
> State: greenfield — no `package.json`, no git repo, no tests, `strict_tdd: false`.

## Exploration: Lamnda SAS marketing site v1

### Current State

Greenfield static marketing site. No code, no repo, no test runner (per `openspec/config.yaml`).
Two reference PNGs define the visual contract:

- **Lobby (KEEP phrase):** dark navy hero, left headline `Complex problems. Elegant solutions.` (EN, must keep),
  sub-copy about data science + cybersecurity + automation, primary CTA `Explore our solutions`,
  right large Hopf Fibration torus visualization with side annotation (`A mapping from S3 to S2 ...`),
  bottom 3 pillars (Data Science / Cybersecurity / Automations), top nav
  (Home, Solutions, Data Science, Cybersecurity, Automations, About + `Get in touch`),
  footer tag `SCIENCE x TECHNOLOGY x IMPACT`.
- **Services grid (ES):** header `Soluciones tecnológicas para un futuro más eficiente`,
  3 pillar cards (Análisis de datos, Automatización, Ciberseguridad) + 5-card row
  (Notificaciones Inteligentes, Documentación Automatizada, Bots CRM, Tele-Agentes IA, Marketing Bots)
  + wide `Dashboards Dinámicos` card + closing CTA `Tu aliado en la transformación digital / Solicita una demo`.

Product intent: awareness + scientific-professional look + portfolio-first CTA (contact secondary)
+ vision/mission section. Audience: prospects + investors. Language: Spanish-first TBD —
lobby EN headline stays, services grid is ES. Official vision/mission/service texts are **pending user input**.
Interface: light/dark themes, corporate blue primary, gray/white per theme,
hero Hopf interactive with mouse on desktop, animated-only on mobile.
Inspiration: Antigravity-style hero lobby + scroll to services + mouse animation.

### Affected Areas

- `openspec/changes/lamnda-marketing-site-v1/` — NEW: this exploration; future proposal/specs/design/tasks live here.
- `openspec/specs/` — currently only `.gitkeep`; v1 will need new domains
  (e.g. `site-structure`, `hero-hopf`, `theme-i18n`, `services-content`). No files touched in this phase.
- Future app code (does NOT exist yet): `src/pages|content|components|styles`, `src/components/HopfHero.*`,
  `src/content/services|vision|mission/*`, theme tokens, `playwright|vitest` config — all to be created in apply.
- Repo bootstrap (does NOT exist yet): `.git/`, `.gitignore`, README — `git init` required before propose/spec baseline.
- `foto lamnda web/*.png` — read-only design inputs; do NOT commit bulky binaries blindly (decide on compress/move to docs).

### Approaches

#### (1) Stack for static marketing + heavy canvas hero

1. **Astro + vanilla Three.js island (RECOMMENDED)**
   - Pros: zero-JS-by-default + islands = best LCP for marketing; Content Collections map 1:1 to
     pending vision/mission/service texts; built-in i18n routing (`es` default, `en` lobby override);
     static output deploys anywhere (Cloudflare Pages / Vercel / Netlify); Vitest + Playwright fit naturally;
     scoped styles + CSS vars for theming without framework weight.
   - Cons: new mental model if team only knows Next/Vite; R3F ecosystem not usable (intentional — avoids overhead).
   - Effort: Low/Medium (scaffold + 4 priority service entries + theme + hero island).

2. **Vite + vanilla TS + Three.js (no framework)**
   - Pros: smallest bundle, full control, no hydration cost, simplest build.
   - Cons: hand-rolled routing/i18n/content loading; no collections/schema validation; growth to blog/cases/EN version
     becomes custom work; SEO meta/a11y scaffolding manual.
   - Effort: Low now, Medium later (tech debt on content growth).

3. **Next.js App Router + react-three-fiber**
   - Pros: best if site grows into an app (auth demos, dashboards); large ecosystem; `next-intl` for i18n.
   - Cons: overkill for static marketing; server or `output: export` static complexity; React reconciler + R3F
     overhead hurts LCP with 3D hero; larger JS, more test surface; deploy needs Node or export discipline.
   - Effort: Medium/High for same marketing outcome.

Testing note (all options): Vitest for pure utils (theme, i18n helpers, fiber math) + Playwright for
theme toggle, nav, hero fallback, reduced-motion, mobile viewport. `strict_tdd: false` per config — verify, not TDD.

#### (2) Hopf Fibration rendering

Math: Hopf map S3 -> S2, fibers are linked circles forming a torus. Matches lobby annotation story.

1. **Precomputed fibers as Three.js LineSegments/Points (RECOMMENDED for v1)**
   - Description: compute N fibers x M segments once on CPU into `BufferGeometry`,
     `LineBasicMaterial` additive blending on dark, `PointsMaterial` for dust; slow idle rotation +
     damped mouse-parallax target quaternion; `IntersectionObserver` pause offscreen; DPR clamp.
   - Pros: authentic math narrative; cheap GPU (<30 draw calls); easy DPR/resize handling;
     easy `prefers-reduced-motion` static frame; deterministic perf budget.
   - Cons: less "glow" than bloom postprocessing without extra pass.
   - Effort: Medium.

2. **Custom GLSL shader + bloom postprocessing (UnrealBloomPass)**
   - Description: fiber curves in shader, additive glow to match reference render closely.
   - Pros: closest visual fidelity to reference PNG glow.
   - Cons: high complexity, mobile perf risk, harder maintenance, shader expertise needed, bigger test matrix.
   - Effort: High.

3. **Pre-rendered poster/video + canvas progressive enhancement**
   - Description: export first frame as LCP poster (`hero-poster.webp` <100KB); lazy-hydrate canvas via
     `requestIdleCallback`/`IntersectionObserver`; mobile gets looping WebM or static + CSS drift.
   - Pros: safest LCP/CLS; works with either option 1 or 2; guarantees mobile fallback.
   - Cons: not a standalone approach — must pair with 1 or 2; extra asset pipeline.
   - Effort: Low (do anyway as complement).

Recommended v1 combo: **(1) + (3)**. Interaction model: normalized mouse -> lerped target rotation
(not direct orbit controls — avoids motion sickness, keeps headline readable); touch/mouse absent on
mobile -> slow auto-rotate only, reduced fiber count via `matchMedia('(max-width: 768px)')`.
Perf budget: hero JS <200KB gzip, Three.js tree-shaken import, DPR max 1.5–2, 60fps desktop / 30fps mobile,
pause when hidden, honor `prefers-reduced-motion` (freeze to poster frame).

#### (3) Theme + content architecture

1. **Theme tokens via CSS custom properties (RECOMMENDED)**
   - `data-theme="dark|light"` on `<html>`, tokens `--bg/--surface/--text/--primary/--muted`;
     corporate blue primary (from refs, e.g. `#2E8CFF`-family — lock exact hex in design phase),
     dark default (refs are dark), light = white/gray-50; `localStorage` + `prefers-color-scheme`,
     inline `<head>` script to avoid FOUC; contrast MUST meet WCAG AA for body text in both themes.
   - Alternative (Tailwind): viable if team prefers, but adds weight for a 5-section marketing site;
     decide in design; either way tokens are the contract, not the utility layer.

2. **Content via Astro Content Collections (RECOMMENDED)**
   - `src/content/services/*.md` (schema: title, pillar, priority, summary, bullets, `lang: es|en`),
     `src/content/vision.md`, `src/content/mission.md`, `src/content/pillars/*`.
     User-supplied official texts swap md files — no code change.
   - v1 priority: Notificaciones Inteligentes (1), Documentación Automatizada (2),
     Lead Scoring (5), Dashboards Dinámicos (7) as full cards; Bots CRM, Tele-Agentes IA,
     Marketing Bots as summary cards (per brief).
   - i18n: default locale `es`; lobby headline `Complex problems. Elegant solutions.` kept as EN constant
     (explicit exception with code comment); full EN page translation deferred post-v1 unless user confirms otherwise.

#### (4) Git init + OpenSpec baseline

- **Git init: YES, required before propose/spec.** No repo today (`fatal: not a git repository` confirmed).
  Steps for propose phase: `git init`, `.gitignore` (node/dist/astro), initial commit with
  `openspec/` + this exploration. Decide PNG handling (compress to `<500KB` or move to shared docs —
  do NOT bloat repo). No remote yet — ask user for GitHub target.
- **OpenSpec baseline: YES.** `openspec/specs/` has only `.gitkeep`. This change will create delta specs
  under `openspec/changes/lamnda-marketing-site-v1/specs/{site-structure,hero-hopf,theme-i18n,services-content}/spec.md`
  and merge on archive. No baseline edit in explore phase (read-only).

### Recommendation

- **Stack:** Astro + vanilla Three.js hero island (no React/R3F). Static export, Content Collections, Vitest + Playwright.
- **Hopf:** precomputed fiber lines/points + poster-first lazy hydration; damped mouse parallax on desktop,
  auto-rotate only on mobile; strict perf budget + reduced-motion freeze.
- **Theme/content:** CSS-var tokens (`data-theme`, dark default) + collections-backed services/vision/mission;
  `es` default locale with EN lobby exception pinned.
- **Repo:** `git init` + OpenSpec deltas in propose/spec; request vision/mission texts + deploy target + EN scope
  confirmation before spec sign-off (does NOT block proposal).

### Risks

- **Content blocker:** official vision/mission/service texts pending — specs MUST mark them as TBD placeholders
  or proposal stalls at spec phase.
- **Bilingual ambiguity:** ES-first vs full EN route undecided; lobby EN exception needs explicit rule or translators
  will "fix" the KEEP phrase.
- **Hopf perf:** reference glow tempts bloom shaders; unconstrained DPR/particles WILL break mobile LCP — budget
  and poster fallback are load-bearing.
- **Theme contrast:** corporate blue on white AND navy MUST pass AA; glow text effects from dark mock WILL fail on light theme if copied literally.
- **Repo hygiene:** OneDrive path contains spaces (`new webpage`) — scripts MUST quote paths; committing raw PNGs bloats clone.
- **Scope creep:** dashboards/CTA imagery in refs implies product screenshots that do not exist — v1 MUST use
  CSS/SVG mock dashboards, not real product data.

### Ready for Proposal

Yes — proceed to `sdd-propose`. Orchestrator SHOULD ask user for (non-blocking, default-assumed):
1. Vision/mission/service official texts (or accept TBD placeholders in spec).
2. Confirm `es` default + EN lobby exception (vs full EN version in v1).
3. Confirm dark-default + corporate-blue hex lock.
4. Confirm static deploy target (Cloudflare Pages / Vercel / Netlify) and GitHub remote name.
