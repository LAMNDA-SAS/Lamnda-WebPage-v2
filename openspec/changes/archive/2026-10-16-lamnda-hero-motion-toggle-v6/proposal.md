# Proposal: lamnda-hero-motion-toggle-v6

## Intent

OS `prefers-reduced-motion` holders see a still hero ("solo gira con mouse"). Provide explicit per-site opt-in/out without changing today's default.

## Scope

### In Scope
- Tri-state mode `auto|on|off`, key `lamnda-hero-motion`, default `auto` (absent/corrupt → `auto`, `try/catch` storage).
- Resolve `effectiveRM = on→false, off→true, auto→prefersReducedMotion()`; pass as existing `reducedMotion` boolean.
- `on` forces rAF drift under OS RM via `dispose()`+recreate; `off` forces still frame; toggle re-persists + recreates synchronously.
- Pill `<button type="button">` bottom-left of `.hopf-hero`, native keyboard, `aria-pressed` = animating, 44px target, AA both themes, visible `:focus-visible`.
- `role="status"` sr-only announcements; `matchMedia` re-resolves only in `auto`; `hidden` when poster-only / `HOPF_ENABLED=false`.

### Out of Scope
- Drift/math constants, fibers, `driftBase`, palette, layout, posters, reveal/parallax/magnetic CSS RM rules.
- No `setReducedMotion` lib surgery, no async chunks, no autoplay default change.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `hero-hopf`: add hero motion-toggle requirement (mode, button, recreate).
- `hero-motion`: add explicit-consent override scenarios (on-under-RM, off-without-RM).

## Approach

Approach 1 (exploration): island-only. Resolve mode in `HopfHero.astro`, thread boolean into `createHopf2D`; lib unchanged (optional one-line comment). Zero-cost static verification only.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/HopfHero.astro` | Modified | Mode resolve/persist, pill markup+style, dispose/recreate, matchMedia auto-only |
| `src/lib/hopf-2d.ts` | Unchanged | Reuse `reducedMotion`, `renderOnce`, `dispose`; no loop/math edit |
| `src/styles/tokens.css` | Reuse | Tokens only; toggle style in island `<style>` |
| `openspec/specs/hero-hopf/spec.md`, `hero-motion/spec.md` | Context | Delta-spec targets; not edited here |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `on` overrides OS RM signal | Med | Gesture-only, labeled per-site choice, default stays `auto` |
| Storage unavailable/corrupt | Low | `try/catch` → `auto`, never break hydration |
| Low contrast over fibers | Low | Themed surface/border tokens; verify AA both themes |

## Rollback Plan

Delete pill + mode logic; always pass `prefersReducedMotion()` (i.e. permanent `auto`) — restores today's behavior in one revert.

## Dependencies

- None. Reuses `createHopf2D`, `HOPF_ENABLED` escape, lazy idle+visible hydrate.

## Success Criteria

- [ ] Default first visit byte-identical (auto = today); `on`+RM drifts, `off`+no-RM still.
- [ ] Reload persists mode; corrupt/absent → `auto`; matchMedia only affects `auto`.
- [ ] Keyboard + `aria-pressed` + sr-only announce pass; 44px, AA, 390px no overlap.
- [ ] `astro build` clean; island still sync <15KB; drift constants untouched.
