# Proposal: Lambda Hero Drift Layout v5

## Intent

Hero idle looks frozen: slow spin + weak drift + centered ring hides behind copy. Restore visible-but-calm motion and move ring into open right space.

## Scope

### In Scope
- Motion: `SPIN_DT 0.015`, `SPIN_FREQS [0.33,0.21,0.28]`, `RATE 0.6` / `AMP 0.65`, `GROUP_X 0.62` desktop / `0.50` mobile via `stroke()` x-origin.
- Keep: `CUR_LERP 0.06`, `PITCH_LERP 0.045`, RM single-frame zero-rAF, `driftBase()` formula.
- Layout: `.wrap 1280px/0.9rem`, `.hero-copy 32rem`, equations/tag `right` sync, glow at `75% 38%`.
- Tests + verification: update pins, screenshot matrix, RM re-verify, conditional poster regen.

### Out of Scope
- Palette, fiber count/geometry, strips/eyebrow/pillars, RM semantics, pointer-mapping changes.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `hero-hopf`: motion constants, `GROUP_X` offset, drift pace, wrap/glow/equations alignment, poster condition.
- `site-structure`: hero-tag `right` offset sync to 1280px wrap (position only).

## Approach

Apply exploration Approach 3 verbatim. Constants-only change in `hopf-2d.ts` plus token-only layout shift; `driftBase()` and `ph`-wrap untouched. `ph` drift stays visually inert under equal-fibers (future hook). Posters regen only if review shows composition shift.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/hopf-2d.ts` | Modified | 6 constants + `stroke()` x `W·GROUP_X` |
| `src/pages/index.astro` | Modified | `.wrap`, `.hero-copy` widths |
| `src/styles/tokens.css` | Modified | equations/tag `right`, glow 75% |
| `tests/hopf-2d.test.ts` | Modified | New pins for `SPIN_DT`/`FREQS` |
| `scripts/generate-poster.mjs` | Conditional | Same `GROUP_X` regen if visibly shifted |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Ring clip at 1024px / equations collision | Med | Keep `S=min(W,H)·0.17`; verify 390/768/1024/1440 |
| Poster/canvas mismatch | Low | Regen both with same `GROUP_X` or defer if no shift |
| `AMP 0.65` extremes cause skips | Low | Verify no excess `hypot>7` skipping |
| Copy legibility after shift | Low | Re-check scrim + light/dark matrix |

## Rollback Plan

Revert single constants commit (`hopf-2d.ts` + `index.astro` + `tokens.css` + pins). No migration; posters revert with commit.

## Dependencies

- `exploration.md` exact constants (this change only); none external.

## Success Criteria

- [ ] Idle motion visible each second; pointer expand/contract stays slow.
- [ ] Ring sits in open right space desktop, centered at 390px; no overflow.
- [ ] Pins updated; 390/768/1024/1440 x light/dark pass; RM zero-rAF re-verified.
- [ ] Posters match canvas or deferral documented.
