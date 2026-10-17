```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:b58e507a52b8672ffe1f4dba338d0f5d130187b7a3758934f712653499534bcf
verdict: pass-with-warnings
blockers: 0
critical_findings: 0
requirements: 0/3
scenarios: 3/13
test_command: npx vitest run
test_exit_code: 0
test_output_hash: sha256:2D89DDD9BEEDEAA5B8D5BE0CD8DD50D5D1573DFDBD6D8428960A78E538125223
build_command: npx astro build
build_exit_code: 0
build_output_hash: sha256:81DCECBB057A7280B1AA73E3ACE05F0861A9DD8B39C870B4A3F1326B9D34438A
```

## Verification Report

**Change**: lamnda-hero-motion-toggle-v6
**Version**: N/A (delta specs, no version field)
**Mode**: Standard (strict_tdd false; zero-cost static-only preflight, defer-if-blocked)

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 7 |
| Tasks complete | 6 |
| Tasks incomplete | 1 (3.2 manual e2e — DEFERRED per preflight, not blocked on code) |

Task 3.2 (manual e2e matrix: aria-pressed flips, drift/still per cell, reload persist,
hidden-when-HOPF-off, AA sampling both themes, 390px no-overlap) is the only unchecked
task. Playwright was deliberately NOT run: preflight scopes this slice to ZERO-cost
static verification, and the matrix needs a live browser, OS `prefers-reduced-motion`
control, and human observation (drift vs still, overlap, focus ring). Static proxies
were verified instead (see Correctness). 3.2 stays a deferred human remainder.

### Build & Tests Execution
**Build**: ✅ Passed (exit 0)
```text
npx astro build → Complete, 1 page
dist/_astro/HopfHero.astro_astro_type_script_index_0_lang.BSBaTWlH.js  7.77 kB │ gzip: 3.30 kB
budget: raw 7773 B < 15360 B (15KB) ✅
```

**Tests**: ✅ 31 passed / 0 failed / 0 skipped
```text
npx vitest run → 3 files passed: theme 8, hopf-2d 19, poster 4 (31/31)
```

**Truth-table assert (change's own unit contract, design §Testing Strategy)**: ✅ 11/11, exit 0
```text
node -e <resolveEffective + readMode fallback snippet>
ok 1..6  six truth cells (auto+RM→still, auto+noRM→drift, on→drift×2, off→still×2)
ok 7..10 garbage/empty/null/undefined → auto
ok 11   storage throw → auto — ALL 11 ASSERTS PASS
```

**Coverage**: ➖ Not available (no coverage threshold configured; vitest run without coverage)

### Spec Compliance Matrix
| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Hero Motion Mode Resolution | Default auto follows OS | `node -e` truth snippet cells 1–2 (exit 0) | ✅ COMPLIANT |
| Hero Motion Mode Resolution | EffectiveRM truth table | `node -e` truth snippet cells 1–6 (exit 0) | ✅ COMPLIANT |
| Hero Motion Mode Resolution | Corrupt storage falls back | `node -e` truth snippet cells 7–11 (exit 0) | ✅ COMPLIANT |
| Hero Motion Mode Resolution | OS change re-resolves auto-only | (none — source-only, deferred to 3.2) | ❌ UNTESTED |
| Hero Motion Mode Resolution | Explicit consent is gesture-only | (none — source-only, deferred to 3.2) | ❌ UNTESTED |
| Hero Motion Toggle Control | Toggle flips motion | (none — needs browser, deferred to 3.2) | ❌ UNTESTED |
| Hero Motion Toggle Control | Keyboard and contrast | `tests/theme.test.ts` AA pairs (8 pass) + static 44px/`:focus-visible` | ⚠️ PARTIAL |
| Hero Motion Toggle Control | Hidden without canvas | SSR HTML `hidden` toggle + early-return source | ⚠️ PARTIAL |
| Hero Motion Toggle Control | State announcement | (none — needs live region observation, deferred to 3.2) | ❌ UNTESTED |
| Explicit Consent Motion Override | On forces drift under RM | (none — needs visual matrix, deferred to 3.2) | ❌ UNTESTED |
| Explicit Consent Motion Override | Off forces still without RM | (none — needs visual matrix, deferred to 3.2) | ❌ UNTESTED |
| Explicit Consent Motion Override | Auto preserves current behavior | `tests/hopf-2d.test.ts` (19 pass) + byte-identical default path | ⚠️ PARTIAL |
| Explicit Consent Motion Override | Non-canvas motion untouched | island CSS selector grep (no reveal/parallax/magnetic) | ⚠️ PARTIAL |

**Compliance summary**: 3/13 scenarios compliant, 4/13 partial, 6/13 untested-deferred.
All 6 UNTESTED are covered by deferred manual matrix 3.2, not by missing implementation.

### Correctness (Static Evidence)
| Requirement | Status | Notes |
|------------|--------|-------|
| Tri-state mode + storage | ✅ Implemented | `MODE_KEY lamnda-hero-motion`; `readMode`/`writeMode`/`resolveEffective` exact per design; `try/catch` both directions; absent/corrupt/throw → `auto` |
| effectiveRM wiring | ✅ Implemented | `on→false, off→true, auto→prefersReducedMotion()`; passed as existing `reducedMotion` boolean into `createHopf2D` |
| Dispose + recreate | ✅ Implemented | `swap()` disposes `root._hopfHandle`, re-creates synchronously, repaints + announces; click path persists then recreates |
| Auto-only matchMedia | ✅ Implemented | `change` listener returns early unless `readMode() === "auto"`; `addEventListener` with `addListener` fallback; pre-hydration `!started` guard |
| Pill button a11y | ✅ Implemented | Native `<button type="button" data-hopf-toggle>`, `aria-pressed = animating`, labels `Pausar/Animar motion`, 44px min target, `:focus-visible` 3px ring, themed `var(--surface)/--text/--border` |
| Hidden states | ✅ Implemented | `hidden` in SSR markup; revealed only after `hydrate()` success; `HOPF_ENABLED=false` early-return never reveals; `.hopf-toggle[hidden]{display:none}` |
| sr-only hero-only announce | ✅ Implemented | Existing `data-hopf-status role="status"` reused; text `Hero motion on/off.` — no OS implication; pre-existing Spanish failure string untouched, new strings English |
| Lib untouched | ✅ Implemented | `src/lib/hopf-2d.ts` has zero `motionMode`/`setReducedMotion`/toggle refs; drift constants pinned (`SPIN_DT 0.015`, `CUR 0.06`, `PITCH 0.045`, `RATE 0.6`/`AMP 0.65`, `FIBER_COUNT=36`, `lw1.6/alpha0.7`, strokes via `fiberColor` only, no `hue`) |
| No navy in island | ✅ Implemented | No `navy`/`#0A1628` literals in `HopfHero.astro`; tokens `var(--surface)/--text/--border/--bg` only |
| Island budget + SSR | ✅ Implemented | SSR HTML contains `data-hopf-toggle` + `data-hopf-status`; built island JS contains `lamnda-hero-motion`; 7.77 kB raw / 3.30 kB gzip < 15KB |

### Coherence (Design)
| Decision | Followed? | Notes |
|----------|-----------|-------|
| Recreate over live-flip | ✅ Yes | `dispose()` + `createHopf2D`, no rAF lifecycle surgery, lib signature unchanged |
| Island-resolved boolean | ✅ Yes | Mode resolved in island; lib stays pure |
| Native button | ✅ Yes | Free Tab/Enter/Space, `aria-pressed` built in |
| Default auto byte-identical | ✅ Yes | Absent key → `auto` → `prefersReducedMotion()`, same call as pre-change code |
| Static-only testing strategy | ✅ Yes | Truth snippet + build + vitest + greps executed; browser matrix deferred as designed |

### Issues Found
**CRITICAL**: None
**WARNING**:
- Task 3.2 manual e2e matrix still deferred — human must run OS RM × mode × theme matrix (aria-pressed flips, drift/still per cell, reload persist, hidden-when-off, AA both themes, 390px no-overlap) before archive.
- Working tree contains unrelated uncommitted changes (Header/Footer/index/tokens/tests/new assets); the v6 single-PR slice must isolate `src/components/HopfHero.astro` only — `src/lib/hopf-2d.ts` itself is untracked (created by an earlier change, not this batch) and must not be attributed to v6.
- Net island delta ~+127 lines vs 60–100 forecast (pre-hydration guards + comments); accepted per apply-progress, single-PR scope unchanged, no chain needed.
**SUGGESTION**:
- Promote the ephemeral truth-table snippet to a persisted test file (e.g. `tests/hero-motion-mode.test.ts`) so Mode Resolution scenarios stay COMPLIANT without re-running ad-hoc snippets.
- Stale `vitest-out.txt` / `build-out.txt` in repo root predate this change (23 tests / 6.52 kB); fresh evidence is `vitest-verify-v6.txt` / `build-verify-v6.txt` (31 tests / 7.77 kB).

### Verdict
PASS WITH WARNINGS — static-runnable scope fully proven (build clean, island budget met, 31/31 vitest, 11/11 truth asserts, all code checks green); 6 browser-observation scenarios plus task 3.2 deferred to the manual human matrix per zero-cost static-only preflight.
