# Verify Report: lamnda-hero-drift-layout-v5

- Change: `lamnda-hero-drift-layout-v5`
- Mode: standard (strict_tdd false; no TDD runner gates apply)
- Date (UTC): 2026-10-16
- Artifacts read: proposal, exploration, design, specs (hero-hopf, site-structure), tasks (8/8 checked)
- Verdict: **PASS WITH WARNINGS** (0 CRITICAL, 2 WARNINGS, 1 SUGGESTION)

## 1. Completeness (tasks 8/8)

| Task | Status | Evidence |
|------|--------|----------|
| 1.1 `hopf-2d.ts` constants `SPIN_DT 0.015`, `FREQS [0.33,0.21,0.28]`, `RATE 0.6`, `AMP 0.65`, `GROUP_X_*` exports | ✅ done | Source `src/lib/hopf-2d.ts:26-38` + vitest pins |
| 1.2 `stroke()` x-origin `W*(mobile?0.50:0.62)`; `S`, gates, `driftBase()` unchanged | ✅ done | Source `src/lib/hopf-2d.ts:262-271` |
| 1.3 Test pins updated; `CUR 0.06`/`PITCH 0.045` asserts kept | ✅ done | `tests/hopf-2d.test.ts:36-43` |
| 2.1 `.wrap 1280px/0 0.9rem`, `.hero-copy 32rem` | ✅ done | `src/pages/index.astro:233-237,274-275` |
| 2.2 equations/tag `right` 1280-sync, glow `at 75% 38%` | ✅ done | `src/styles/tokens.css:82-85,138-142,196-199` |
| 3.1 RM single-frame + zero-rAF-at-rest, `hypot>7` no excess skips | ✅ done | vitest 19/19 hopf-2d + e2e RM tests (both projects) |
| 3.2 Matrix 390/768/1024/1440 x light/dark | ✅ done here | `verify-evidence/matrix.json` (8/8) + PNGs |
| 3.3 Conditional poster regen (same `GROUP_X`) or documented deferral | ✅ done here | **Regen executed** (visible mismatch found) — see §5 |

No task pending; full verification (not task-only) was run.

## 2. Build / tests / coverage evidence

| Gate | Command | Exit | Result |
|------|---------|------|--------|
| Build | `npm run build` | 0 | ✅ Complete, 1 page, hero island 6.64 kB (gzip 2.91 kB, <15 kB budget) |
| Unit | `npx vitest run` | 0 | ✅ 31/31 (hopf-2d 19, poster 4, theme 8) |
| Static HTML | `node scripts/check-html.mjs` | 1 | ⚠️ 24/25 — single FAIL `hero EN headline` = known stale gate (W1) |
| E2E | `npx playwright test` (desktop + mobile, vs `preview :4321`, reused server) | 0 | ✅ 44/44 |
| Coverage | n/a | — | No coverage script configured; skipped (not a spec gate) |

E2E note: first attempt failed 44/44 with `ERR_CONNECTION_REFUSED` because no preview
server was up (config `webServer` did not come up in that shell); re-ran via one-shot
`preview :4321` job + `reuseExistingServer` → 44/44 green. No `chrome` channel override
needed (headless shell worked).

## 3. Spec compliance matrix (5 requirements, 16 scenarios)

### hero-hopf (3 MODIFIED requirements, 10 scenarios)

| Scenario | Covering test (runtime) | Status |
|----------|-------------------------|--------|
| 2D reference composition (copy left, fibers at `W·0.62`) | e2e `hero is full-bleed with copy overlaid on the canvas` (both projects) + visual `hero-1024/1440-*.png` | ✅ COMPLIANT |
| Zero CLS hydration (poster → canvas, no shift) | e2e `poster preloads high with fixed dims` (bbox Δ ≤2px) + `check-html` no-CLS/no-shift gates | ✅ COMPLIANT |
| Mobile centered (390px, `W·0.50`, no overflow) | e2e `390px hero has no horizontal overflow` x2 + matrix overflow 0 | ✅ COMPLIANT |
| Blue-only without hue | vitest `fiberColor stays blue-only` (72 samples) + `ships no hue() rainbow path` | ✅ COMPLIANT |
| Visible calm pins | vitest `pins visible-calm constants` + drift formula tests | ✅ COMPLIANT |
| Equal fibers (`lw1.6`/`alpha0.7`, no highlight) | vitest `ships no foreground highlight` + e2e drift screenshots | ✅ COMPLIANT |
| Idle visible (1s shift, `th ≤0.39 rad/s`, spin ~1.1–1.35 rad/s) | e2e `desktop idle drift runs with no mouse` + `pointer adds offset` (both projects) | ✅ COMPLIANT |
| Poster looks like 2D scene (`1600x1000`, WebP `<100KB`, zero CLS) | vitest `poster.test.ts` 4/4 + regen budgets (45.0/19.0 KB) | ✅ COMPLIANT |
| Themed resemblance (bg matches theme, each `<100KB`) | themed swap e2e + regen verified visually (dark navy / light white) | ✅ COMPLIANT |
| Conditional regen (same `GROUP_X` if shifted) | **mismatch found → regen executed here** with `cx = W*0.62`, q70, budgets hold | ✅ COMPLIANT |

### site-structure (1 MODIFIED + 1 ADDED requirement, 6 scenarios)

| Scenario | Covering test (runtime) | Status |
|----------|-------------------------|--------|
| Mono eyebrow | e2e `reference strips + header states render` (text pin, both projects) | ✅ COMPLIANT |
| Two-tone headline | e2e headline `toHaveText` (both projects) + visual shots | ✅ COMPLIANT |
| Pillars echo strip (3 items, `#pillars` intact) | e2e count 3 + `#pillars` visible | ✅ COMPLIANT |
| Hero tag synced (wrap `right`, hidden ≤900px, no 390 overflow) | e2e aside/tag test (800px hidden, overflow ≤1) + matrix tag flags | ✅ COMPLIANT |
| Layout tokens (wrap/copy/glow/right) | source inspection (exact token match) + 8/8 matrix shots | ✅ COMPLIANT |
| Screenshot matrix (ring right unclipped, copy legible, RM zero-rAF, no overflow) | 8/8 matrix + RM e2e + overflow 0 everywhere | ✅ COMPLIANT (note W2) |

16/16 scenarios have passing runtime coverage. 0 UNTESTED, 0 FAILING.

## 4. Correctness asserts (change-specific)

| Assert | Result |
|--------|--------|
| Idle drift visible, `spin` near-verbatim (`T` 0.90/s, `a` ~1.1–1.35 rad/s) | ✅ e2e idle frames differ with zero mouse input; pins `0.015`/`[0.33,0.21,0.28]` |
| Mouse still slow (`CUR 0.06` / `PITCH 0.045`) | ✅ pinned + unchanged smoothing path |
| RM zero-rAF (single frame, one frame per move, no banner) | ✅ e2e `__rafCount === 0` at rest, both projects |
| Equal fibers (36, no highlight/`hue`) | ✅ `1.6/0.7` single loop; `fgRing`/`foregroundColor` absent incl. poster script |
| Equations aside (desktop visible, hidden ≤900px) | ✅ visible 1024/1440, hidden 390/768/800 |
| Strips intact (eyebrow, H1, pillars echo, header states) | ✅ e2e pins all green |
| AA both themes | ✅ unit contrast + e2e computed-style CTA pairs + matrix CTA colors (`rgb(10,22,40)` on `rgb(122,179,255)`; white on `rgb(10,84,194)`) |
| No overflow (all matrix viewports) | ✅ `scrollWidth-clientWidth = 0` in 8/8 matrix + e2e 390px tests |
| `driftBase()` formula, `S`, null-gate `0.07`, `hypot>7`, palette untouched | ✅ source + `AMP 0.65` extremes no-nulls test |

## 5. Poster mismatch decision (apply-deferred, executed here)

- Compared live canvas (`verify-evidence/canvas-1440-dark.png`, ring mass right, center ~0.62)
  vs committed posters (ring nest centered ~0.50; light centroid 0.500).
- **Visible mismatch: YES** — desktop pre-hydration poster showed a centered ring while the
  canvas paints it in open right space (see `hero-1440-dark.png` vs old poster).
- Action per delegation: regenerated **both** posters with `cx = W * 0.62`
  (`scripts/generate-poster.mjs`, mirrors `GROUP_X_DESKTOP`; glow `cx 63%` already synced):
  dark 45.0 KB, light 19.0 KB — each `<100KB` and `>15KB`, q70, 1600x1000 WebP.
- Post-regen: `poster.test.ts` 4/4 green; new light poster visually confirmed right-shifted;
  `dist/` rebuilt so preview bundle carries new posters. Deferral does **not** stand —
  superseded by this regen in the same change.

## 6. Design coherence

| Design decision | Code | Status |
|-----------------|------|--------|
| Approach 3 constants verbatim | `hopf-2d.ts` exact values | ✅ coherent |
| `GROUP_X` via `stroke()` x-origin only (`S`/gates/palette untouched) | one-line ternary | ✅ coherent |
| Token-only layout shift (wrap/copy/right/glow) | exact token match, guards unchanged | ✅ coherent |
| Posters mirror `GROUP_X` | script now `W*0.62` + regen | ✅ coherent (fixed here) |
| Single PR, zero-cost static, revert = constants commit | no loop/lib changes | ✅ coherent |

## 7. Issues

- WARNING W1 — `scripts/check-html.mjs` `hero EN headline` FAILs (24/25): stale gate requiring
  contiguous `Complex problems. Elegant solutions.` while the approved two-tone design renders
  two spans. Runtime-verified (e2e `toHaveText` both projects). Non-blocking; pre-existing since v4.
- WARNING W2 — outer fiber arcs exit the right viewport edge at 1024/1440 (full-bleed by design;
  torus body intact, copy clear, overflow 0). Aesthetic judgment: reads intentional, not broken.
  Flagged for orchestrator awareness, not a spec failure.
- SUGGESTION S1 — fix the stale `check-html` headline gate (assert both H1 halves separately)
  and consider a `GROUP_X` pin test for the poster script (e.g. assert `0.62` literal) so
  script/poster drift is caught by vitest next time.

## 8. Deferred remainder

- Apply-deferred (1) visual matrix → **done here**: 8/8 shots + `matrix.json`, all green.
- Apply-deferred (2) poster decision → **done here**: mismatch found, regen executed, budgets verified.
- Deferred remainder: **empty**. Nothing further deferred; W1/S1 are non-blocking follow-ups.

## 9. Files changed by verify (to fold into the change PR)

- `scripts/generate-poster.mjs` (poster `cx` 0.5 → 0.62 + truth comment)
- `public/hero-poster-dark.webp`, `public/hero-poster-light.webp` (regenerated)
- `openspec/changes/lamnda-hero-drift-layout-v5/verify-report.md` (this file)
- `verify-evidence/` (new: 8 hero shots + canvas shot + `matrix.json`; untracked, keep-or-drop per orchestrator)

## Section D envelope

```yaml
change: lamnda-hero-drift-layout-v5
verdict: PASS_WITH_WARNINGS
tasks_complete: 8/8
requirements: 5
scenarios: 16
scenarios_compliant: 16
scenarios_untested: 0
build_exit_code: 0
test_exit_code: 0
playwright_exit_code: 0
check_html: 24/25 (1 stale gate, WARNING W1)
critical: 0
warnings: 2
suggestions: 1
poster_decision: regenerated (mismatch found, GROUP_X 0.62, 45.0/19.0KB)
deferred_remainder: []
```
