# Tasks: Lambda Hero Drift Layout v5

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~40-60 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Motion + layout + pins + verify, poster conditional | PR 1 | `npx vitest run tests/hopf-2d.test.ts` | `npm run dev` + 390/768/1024/1440 x light/dark screenshots | Revert constants commit (`hopf-2d.ts` + `index.astro` + `tokens.css` + pins + posters) |

## Phase 1: Motion Core

- [x] 1.1 Update `src/lib/hopf-2d.ts` constants to `SPIN_DT 0.015`, `SPIN_FREQS [0.33,0.21,0.28]`, `RATE 0.6`, `AMP 0.65`; add `GROUP_X_DESKTOP 0.62` / `GROUP_X_MOBILE 0.5` exports
- [x] 1.2 Update `stroke()` x-origin in `src/lib/hopf-2d.ts` to `W*(mobile?0.50:0.62)`; keep `S`, gates, `driftBase()` unchanged
- [x] 1.3 Update `tests/hopf-2d.test.ts` pins to `0.015`/`[0.33,0.21,0.28]`/`0.6`/`0.65`; keep `CUR 0.06`/`PITCH 0.045` asserts

## Phase 2: Layout Tokens

- [x] 2.1 Update `src/pages/index.astro` to `.wrap 1280px/0 0.9rem` and `.hero-copy 32rem`
- [x] 2.2 Update `src/styles/tokens.css` equations/tag `right max(0.9rem,calc((100%-1280px)/2+0.9rem))` and glow `at 75% 38%`

## Phase 3: Verification

- [x] 3.1 Re-verify RM single-frame + zero-rAF-at-rest and `hypot>7` no excess skips in `tests/hopf-2d.test.ts`
- [x] 3.2 Capture matrix `390/768/1024/1440px` x light/dark: ring right unclipped, copy legible, AA intact, no overflow
- [x] 3.3 Conditional poster regen via `scripts/generate-poster.mjs` with same `GROUP_X 0.62` (`1600x1000` WebP `<100KB`) only if canvas-vs-poster mismatch, else document deferral
