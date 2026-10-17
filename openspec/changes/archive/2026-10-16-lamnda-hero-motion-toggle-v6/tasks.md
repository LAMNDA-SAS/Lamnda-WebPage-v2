# Tasks: lamnda-hero-motion-toggle-v6

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 60-100 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Hero motion toggle island-only | PR 1 | `astro build` | Manual OS RM x mode x theme matrix | Revert `src/components/HopfHero.astro` to `prefersReducedMotion()`-only |

## Phase 1: Mode + Recreate

- [x] 1.1 Add `readMode`/`writeMode`/`resolveEffective` with truth table in `src/components/HopfHero.astro`
- [x] 1.2 Wire `dispose()`+`createHopf2D` recreate on toggle plus auto-only `matchMedia` listener in `src/components/HopfHero.astro`

## Phase 2: Toggle UI + Announce

- [x] 2.1 Add pill `<button type="button" data-hopf-toggle>` + island `<style>` with 44px, `aria-pressed`, `:focus-visible`, hidden states in `src/components/HopfHero.astro`
- [x] 2.2 Announce state flips via existing `data-hopf-status role="status"` sr-only node in `src/components/HopfHero.astro`

## Phase 3: Testing + Build

- [x] 3.1 Static unit assert truth table 6 cells + corrupt/throw to `auto` (console snippet, no runner)
- [ ] 3.2 Manual e2e: `aria-pressed`/drift/still/reload-persist/hidden + AA both themes + 390px no-overlap — DEFERRED (see apply-progress; needs human + browser + OS RM control)
- [x] 3.3 Run `astro build` clean; `grep` drift constants unchanged; island sync import <15KB
