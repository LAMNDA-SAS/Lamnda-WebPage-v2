# Tasks: Lamnda Marketing Site v1

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1600–2200 (greenfield scaffold + island + content + tests) |
| 400-line budget risk | High |
| Chained PRs recommended | No (unlimited review budget; greenfield initial commit) |
| Suggested split | Single PR acceptable; optional slices in work units below |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units (optional slices; chained-pr skill applies only if split requested)

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Scaffold + tokens + base layout | PR 1 | `npm run build` | `npm run dev` load `/` | `astro.config.mjs`, `src/layouts/`, `src/styles/` |
| 2 | Collections + sections + SEO | PR 2 | `npx vitest run` | `npm run dev` check anchors | `src/content/`, `src/components/`, `src/pages/` |
| 3 | HopfHero island + poster + budgets | PR 3 | `npx vitest run tests/hopf` | `npm run dev` desktop + 390px hero | `src/components/HopfHero.*`, `public/hero-poster.webp` |
| 4 | E2E + verify gates (AA, LCP) | PR 4 | `npx playwright test` | `npm run preview` full pass | `tests/`, docs only |

## Phase 1: Foundation

- [x] 1.1 `git init` + `.gitignore` (node/dist/astro) + initial `openspec/` commit
- [x] 1.2 Create `astro.config.mjs` (static output), `package.json` (three), `tsconfig.json`, `README.md`
- [x] 1.3 Create `src/styles/tokens.css` with locked `--bg/--surface/--text/--primary-text/--muted` pairs
- [x] 1.4 Create `src/layouts/Base.astro` with SEO shell + head anti-FOUC script
- [x] 1.5 Add Vitest + Playwright configs + `tests/` scaffolding

## Phase 2: Content and Sections

- [x] 2.1 Create `src/content/config.ts` with Zod `service/pillar/vision/mission` schemas
- [x] 2.2 Add 4 full + 3 summary service `.md`, 3 pillars `.md`, TBD `vision/mission.md`
- [x] 2.3 Build `Header.astro`, `Footer.astro` (tag `SCIENCE x TECHNOLOGY x IMPACT`), `index.astro` order hero→pillars→services→vision→contact
- [x] 2.4 Render 4 full + 3 summary cards; CSS/SVG mock for Dashboards Dinámicos; `Solicita una demo` → `#contact`
- [x] 2.5 Wire theme toggle (`data-theme`, `localStorage` + `prefers-color-scheme`); SEO title/description/og/canonical
- [x] 2.6 Pin EN headline `Complex problems. Elegant solutions.` with `/* EN exception: do not translate */`

## Phase 3: HopfHero Island

- [x] 3.1 Create `src/components/HopfHero.astro` (`client:idle`) + `public/hero-poster.webp` (<100KB, `fetchpriority=high`, fixed size, no CLS)
- [x] 3.2 Create `src/lib/hopf-scene.ts`: precomputed `LineSegments` (~48 desktop/~24 mobile x128-seg) + `Points`, <30 draws, DPR clamp
- [x] 3.3 Add damped mouse-parallax (desktop fine-pointer) + auto-rotate-only mobile fallback (`max-width:768px`)
- [x] 3.4 Add `IntersectionObserver` offscreen pause/resume + `prefers-reduced-motion` freeze + `HOPF_ENABLED=false` poster-only flag

## Phase 4: Testing and Verify Gates

- [x] 4.1 Vitest `tests/hopf.test.ts`: fiber counts; `tests/theme.test.ts`: AA pairs, EN constant
- [x] 4.2 Playwright: anchors/CTA scroll + no-JS fallback, theme persist, motion freeze, mobile 390px
- [x] 4.3 Verify gates: poster <100KB, hero JS <200KB gzip, AA ≥4.5:1 both themes, LCP poster-first
