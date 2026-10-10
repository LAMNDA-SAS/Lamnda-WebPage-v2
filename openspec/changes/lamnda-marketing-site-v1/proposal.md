# Proposal: Lamnda Marketing Site v1

## Intent

Launch a static marketing site for Lamnda SAS: scientific-professional awareness, portfolio-first discovery with contact secondary, faithful to lobby + services-grid refs. Greenfield; no code or repo exists yet.

## Scope

### In Scope
- Hero lobby: headline `Complex problems. Elegant solutions.` (EN, pinned), sub-copy TBD, CTA `Explore our solutions`, Hopf canvas
- 3 pillars strip: Data Science / Cybersecurity / Automations
- 4 priority services full: Notificaciones Inteligentes (1), Documentacion Automatizada (2), Lead Scoring (5), Dashboards Dinamicos (7)
- 3 summary cards: Bots CRM, Tele-Agentes IA, Marketing Bots + CSS/SVG mock dashboard
- Vision/mission section with TBD placeholders; secondary contact CTA; dark/light themes
- Repo bootstrap: `git init`, `.gitignore` (node/dist/astro), initial `openspec/` commit

### Out of Scope
- Full EN version (only lobby EN exception); official texts deferred as TBD
- Real dashboards, product screenshots, backend/forms delivery
- Bloom-shader Hopf variant; blog/cases/auth

## Capabilities

### New Capabilities
- `site-structure`: routing, nav, sections, footer, SEO meta
- `hero-hopf`: Hopf canvas, interaction, fallback, perf budget
- `theme-i18n`: CSS-var themes, locale rules, EN lobby exception
- `services-content`: collections schema, priority/summary cards, vision/mission

### Modified Capabilities
- None (greenfield, `openspec/specs/` holds only `.gitkeep`)

## Approach

Astro + vanilla Three.js island (no React/R3F): zero-JS default, static export to Cloudflare Pages/Vercel/Netlify, Content Collections for `services/vision/mission` so official texts swap md files only.
Hopf: precomputed fibers as `BufferGeometry` LineSegments + Points dust, poster-first (`hero-poster.webp` <100KB, lazy-hydrate on Idle/IntersectionObserver); damped mouse-parallax on desktop, auto-rotate only on mobile; DPR clamp 1.5–2, <30 draw calls, hero JS <200KB gzip, pause offscreen, `prefers-reduced-motion` freezes to poster.
Theme/content: `data-theme` CSS vars (`--bg/--surface/--text/--primary/--muted`), dark default, corporate blue (hex locked in design), `localStorage` + `prefers-color-scheme` + head anti-FOUC script; locale `es` default.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/**` | New | Routes, layouts, meta |
| `src/components/HopfHero.*` | New | Fiber-lines canvas island |
| `src/content/**` | New | Services, pillars, vision/mission |
| `src/styles/tokens.css` | New | Theme tokens |
| `.gitignore`, `README` | New | Repo bootstrap |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Official texts pending | High | TBD placeholders; specs MUST NOT block |
| Bilingual drift (lobby phrase "fixed") | Med | Pin EN exception w/ code comment |
| Hopf mobile perf/LCP | Med | Poster fallback, fiber/DPR budget, no bloom |
| Theme contrast (blue on light) | Med | WCAG AA gate in specs/verify |
| OneDrive space-path, PNG bloat | Low | Quote paths; compress/move refs |

## Rollback Plan

Static export: revert to prior deploy artifact; `git revert` initial commits (code-only, no migrations). If hero regresses perf, ship poster-only build via feature flag (`HOPF_ENABLED=false`).

## Dependencies

- Vision/mission/service texts (TBD ok); deploy target + GitHub remote name; blue hex lock in design

## Success Criteria

- [ ] Lobby matches refs; KEEP headline intact; CTA scrolls to services
- [ ] 4 full + 3 summary cards render from collections; vision/mission placeholders visible
- [ ] Dark default + light pass AA; poster LCP safe; reduced-motion freezes
- [ ] `git init` + `.gitignore` committed; static build deploys clean
