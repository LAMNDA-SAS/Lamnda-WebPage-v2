# Proposal: 2D Hopf Hero Primary (lamnda-hopf-2d-v3)

## Intent

Make the user 2D Hopf canvas the full-bleed hero primary. Fix light-mode navy bleed; ship slower corporate-blue-only motion.

## Scope

### In Scope
- `src/lib/hopf-2d.ts`: verbatim `fiber`/`spin`/`rot`/`stroke`/`frame`/`aim` port (36×150, DPR, IO pause, `HOPF_ENABLED`).
- Blue-only `fiberColor(ph,theme)`: `#EAF1FB → #2E8CFF`, `#7AB3FF` dark / `#0A54C2` light; themed fg double-stroke; no `hue()`.
- Slow ~35%: `T 0.010`, freqs `0.24/0.15/0.20`, `cur 0.06`, `pitch 0.045`; keep `aim`.
- `HopfHero.astro`: 2D wiring; poster-first, idle+visible, themed CSS, no navy literals.
- Light fix in `index.astro` + `tokens.css`: themed bg/scrims/text, softer `h1` shadow.
- Reduced-motion: single frame + `renderOnce` per pointer, zero rAF, sr-only status.
- Poster from live 2D canvas, WebP <100KB, one neutral or two theme-selected.
- Remove `hopf-scene.ts` + `three` dep after importer check; repoint poster scripts; keep logo/EN/reveals/magnetic.

### Out of Scope
- Bloom, backend, full EN, new sections, logo redesign.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `hero-hopf`: 2D truth, budgets, poster resemblance.
- `theme-i18n`: light-hero bg/scrim/text contract.

## Approach

Verbatim port + thin island. Deltas only: palette, slowed constants, reduced-motion gate, theme observer, DPR clamp. Poster via `capture-poster.mjs` for 1:1 match.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/hopf-2d.ts` | New | Ported math + palette + slowdown |
| `src/components/HopfHero.astro` | Modified | 2D wiring, themed CSS |
| `src/pages/index.astro` | Modified | Themed bg + scrims |
| `src/styles/tokens.css` | Modified | Light tokens, softer shadow |
| `scripts/*poster*.mjs` | Modified | Repoint shared truth |
| `public/hero-poster.webp` | Modified | Regen <100KB |
| `src/lib/hopf-scene.ts`, `package.json` | Removed | Delete scene + `three` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Poster fits neither theme | Med | One neutral vs two posters; check both |
| Shared-truth desync | Med | Update both scripts atomically |
| Rainbow residue | Low | Route all strokes via `fiberColor` |
| Light contrast fail | Med | Screenshot both themes |

## Rollback Plan

`PUBLIC_HOPF_ENABLED=false` → poster-only. Full revert from pre-change commit: scene, island, styles, poster, `three` dep.

## Dependencies

- Playwright + Sharp for poster capture; no new runtime deps.

## Success Criteria

- [ ] 2D hero primary full-bleed; no rainbow; slowed constants verified.
- [ ] Both themes legible, no navy bleed; poster <100KB.
- [ ] Reduced-motion single frame, zero rAF, sr-only; `three` removed if unused.
