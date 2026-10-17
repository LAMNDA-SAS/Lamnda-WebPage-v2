# Proposal: lamnda-service-details-v8

## Intent

Fix dead `Ver ejemplo en vivo →` hints (all self-anchor to `#services`) and flat/cramped `#services` cards by adding 8 collections-driven detail routes plus a token-bound card redesign. Zero-cost static only.

## Scope

### In Scope
- NEW `src/pages/servicios/[slug].astro`: `getStaticPaths` from `services` collection, breadcrumb, compact hero, value bullets, CSS/SVG `ejemplo` demo, dual CTA, per-page SEO via `Base.astro`.
- Static demo per page for all 8 slugs; max 1 tiny vanilla `<script is:inline>` island on full pages only, static-first.
- Card redesign in `src/pages/index.astro` `<style>`+markup: icon-box, padding 1.6–1.75rem, hierarchy pill→icon→title→summary→bullets→outcome→CTA, hover lift, arrow-chip CTA, RM guard, token-only.
- Hint `href` → `/servicios/{slug}` on all 8 cards; summary cards gain CTA; thin-summary fallback rows (no invented features/KPIs).
- `services-content` + `site-structure` delta specs.

### Out of Scope
- Backend, forms handling, analytics, new content tokens, Hopf/motion/reveal changes, numeric KPIs, per-page bespoke layouts.

## Capabilities

### New Capabilities
- `service-details`: detail route template, breadcrumb, demo block, dual CTA, per-page SEO.

### Modified Capabilities
- `services-content`: hint target `#services` → `/servicios/{slug}`; card visual requirements (icon-box, lift, arrow-chip).
- `site-structure`: single-page → single-page + 8 static detail routes with SEO/breadcrumb.

## Approach

Collections-driven `[slug].astro` + `getStaticPaths` (8 static HTML, `output:"static"` intact). One template, 2 branches max (full vs summary; DRAFT badge conditional). Full pages: bullets(3)+body-derived row; summaries: bullet(1)+body+2 generic practice rows. Demos reuse showcase CSS/SVG idiom, `role="img"`, caption `Mock ilustrativo — sin datos reales`. Islands deferred if they threaten static export.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/servicios/[slug].astro` | New | Detail template + `getStaticPaths` |
| `src/pages/index.astro` | Modified | Card redesign + hint hrefs (styles scoped `#services`) |
| `src/layouts/Base.astro` | Reuse | Per-page title/description/canonical |
| `src/styles/tokens.css` | Reuse only | No new tokens |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Thin summary bodies look empty | Med | Shared generic practice fallback rows |
| Template conditional bloat | Low | Max 2 branches; DRAFT already conditional |
| Hover/AA regression | Low | Transform/shadow/border only + `prefers-reduced-motion` |
| Island creep | Low | Cap: ≤1 inline script full-only, zero on summaries |

## Rollback Plan

Single-PR change: `git revert <commit>` restores `#services` hints and single-page build; no migrations, no redirects (slugs unchanged), no data loss.

## Dependencies

- None. Static build only; no adapters, backends, or paid services.

## Success Criteria

- [ ] 8 `/servicios/{slug}` pages build static with breadcrumb, demo, dual CTA, SEO/canonical.
- [ ] Zero hints point to `#services`; no numeric KPI patterns in DOM or md.
- [ ] Cards meet comfort/AA/light-dark spec with RM guard; Hopf untouched.
