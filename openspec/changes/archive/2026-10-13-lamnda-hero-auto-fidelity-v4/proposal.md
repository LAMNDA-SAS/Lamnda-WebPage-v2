# Proposal: lamnda-hero-auto-fidelity-v4

## Intent

Desktop hero looks frozen without mouse (drift runs only on coarse pointers); one fg highlight fiber breaks the reference's equal-fiber field; hero/header miss reference strips (eyebrow, equations, pillars echo, tag, active Home, outline CTA).

## Scope

### In Scope
- Always-on additive idle drift: `driftBase(t)` every non-RM frame, pointer offset on top; RM single-frame zero-rAF untouched.
- Delete fg highlight strokes (`lw6`+`lw3`); all 36 fibers equal; regen both posters atomically.
- Static themed equations `aside` top-right (mono, hidden ≤900px, no-JS safe).
- Reference fidelity hero-local: eyebrow, two-tone H1, Explore pill + arrow, header Home underline + outline Get-in-touch + arrow, pillars echo strip + hero tag.
- Keep `#pillars` section in place; strip reuses ES collection data.

### Out of Scope
- Bloom/post-processing, WebGL, backend, analytics.
- Full-EN translation (EN only: pinned H1 + equations/mapping note).
- Moving `#pillars` into hero; new sections/pages.
- Changing slowed motion constants or AA locked pairs.

## Capabilities

### New Capabilities
- None — all behavior fits existing domains.

### Modified Capabilities
- `hero-hopf`: idle drift interaction model; equal-fiber budget (fg double-stroke REMOVED).
- `site-structure`: header active Home + outline CTA; hero-local strips (eyebrow, equations, pillars echo, tag).

## Approach

- Drift: `driftT += dt` all non-RM frames; `tg = driftBase(t) + (aim(nx,ny) − aim(0.5,0.5))`; pure `driftBase()` helper; coarse path bit-identical; `[-PI,PI]` wrap on `ph` delta.
- Equal fibers: delete `paint()` fg strokes + `foregroundColor`/`FG_*` + poster `fgRing`; keep 36-loop; regen dark+light posters same PR.
- Equations `aside`: "Hopf Fibration — S3→S2 mapping" note + `(z1,z2) = (cos(θ/2)·e^(it), sin(θ/2)·e^(i(t+φ)))` + `d = 1 − b·sin(t+φ)`; `position:absolute`, tokens only, `display:none` ≤900px.
- Fidelity: eyebrow mono `DATA / SECURITY / AUTOMATION`; H1 split two spans (pinned EN kept); header CTA outline pill (transparent bg, blue border, `→`); pillars echo from `orderedPillars` + dividers; static HTML, no CLS.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/hopf-2d.ts` | Modified | Additive drift + delete fg strokes/helpers |
| `scripts/generate-poster.mjs` | Modified | Delete `fgRing` highlight |
| `public/hero-poster-*.webp` | Modified | Regen both (<100KB, dense floor >15KB) |
| `src/components/Header.astro` | Modified | Home underline + outline CTA + arrow |
| `src/pages/index.astro` | Modified | Eyebrow, H1, CTA arrow, equations, strips, tag |
| `src/styles/tokens.css` | Modified | Token-only hero styles, no new navy |
| `openspec/specs/hero-hopf,s-site-structure` | Modified | Deltas per Capabilities |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Blue H1 line over fibers dips under AA | Med | Scrims + shadow; measure computed pairs both themes |
| Poster/canvas mismatch window | Med | Paint change → regen → `poster.test.ts` atomically |
| Poster dense-floor fail after fg removal | Low | Tune `generate-poster` ring counts, not canvas |
| Mobile overflow from absolute strips | Low | Hide equations/tag ≤900px; 390px no-overflow test |

## Rollback Plan

`PUBLIC_HOPF_ENABLED=false` swaps canvas to regenerated equal-fiber posters instantly (poster-only, no redeploy of logic). Full revert: restore `hopf-2d.ts` + posters + header/hero markup from this single PR (one commit, no migrations).

## Dependencies

- None. Zero-cost static only: local build, Vitest, Playwright, Sharp regen. Single PR, size:exception pre-approved.

## Success Criteria

- [ ] Desktop hero drifts with no mouse; pointer adds offset without stopping base; RM stays single-frame zero-rAF.
- [ ] All 36 fibers equal, blue-only; no fg stroke; posters match canvas (<100KB each).
- [ ] Equations `aside` visible desktop, hidden ≤900px, themed, no-JS safe.
- [ ] Eyebrow, two-tone H1 (pinned EN), Explore pill + arrow, header states, pillars echo, hero tag render; `#pillars` stays; AA holds both themes.
