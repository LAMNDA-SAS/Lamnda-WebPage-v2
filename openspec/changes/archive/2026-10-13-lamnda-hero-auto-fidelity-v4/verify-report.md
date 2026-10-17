```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:aae0cdf2e0bf64e4ff9315e1284c8b28863675f1a3ee0e78d879ed75de243eca
verdict: pass
blockers: 0
critical_findings: 0
requirements: 9/9
scenarios: 26/26
test_command: npx vitest run
test_exit_code: 0
test_output_hash: sha256:d17938f4be65dc955d806d69c835e37357bc38d6196d3c40f232ae906555cb9d
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:632742e1f38fcb68a17808a23ad2e4d34847936eebd92071fbcb0eb6b1e0b480
```

## Verification Report

**Change**: lamnda-hero-auto-fidelity-v4
**Version**: N/A (delta specs, no version field)
**Mode**: Standard (strict_tdd false; TDD sections not applicable)

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 17 |
| Tasks complete | 17 |
| Tasks incomplete | 0 |

All boxes checked in `tasks.md`; `apply-progress.md` records 17/17 with per-task evidence. No pending task blocks verification. Nothing deferred (e2e executed live via temp chrome-channel config, removed after the run).

### Build & Tests Execution

**Build**: ✅ Passed (exit 0)
```text
npm run build → 1 page, Complete in 1.60s
dist/_astro/HopfHero.astro_astro_type_script_index_0_lang.DDG0bKir.js 6.62 kB │ gzip: 2.89 kB (< 15 kB budget)
```

**Unit tests**: ✅ 29/29 passed (exit 0) — `npx vitest run`
```text
tests/theme.test.ts    8 tests passed
tests/hopf-2d.test.ts 17 tests passed (driftBase t=0/fixed-t, coarse bit-identical, ph wrap, no-fg gates)
tests/poster.test.ts   4 tests passed (both posters <100KB and >15KB)
```

**E2E**: ✅ 44/44 passed (exit 0) — `npx playwright test -c pw-chrome-tmp.config.ts` (desktop + mobile)
```text
hero-fidelity-v4.spec.ts  6 × 2 projects (idle drift, pointer offset, aside, strips/header, AA, 390px)
hero.spec.ts              4 × 2 (preload+CLS, RM zero-rAF, coarse drift, IO pause)
site.spec.ts             12 × 2 (order, headline pin, CTA scroll, no-JS, cards, AA, SEO, RM, overflow…)
e2e output sha256:2617e817fe94bb856ca5b1d6b1da9f7424a9ebd50b82cc2cd5e9fc80a9828ea4
```
Chrome-channel note: bundled `chromium_headless_shell` fails to spawn on this Windows host (`spawn UNKNOWN`, same as apply phase); e2e ran against system Chrome via a temp `channel: "chrome"` config with `reuseExistingServer` against one-shot `preview :4321` (HTTP 200 verified before the run). Temp config deleted after the run; preview job stopped. Zero-cost static only; nothing blocked, nothing deferred.

**Static gate**: ⚠️ `node scripts/check-html.mjs` exit 1 — 24/25 PASS, single FAIL on `hero EN headline` (stale gate, see WARNING W1).
```text
check-html output sha256:4f695492354828fb495fff548a791f3a68183294df611015237de460ff18366c
```

**Coverage**: ➖ Not available (no coverage threshold configured; vitest run without `--coverage`).

### Validator Pointers (asserted explicitly)

1. **RM single-frame zero-rAF still green (hero-motion exception untouched)** — ✅ `createHopf2D` reduced-motion path unchanged: single `paint()`, zero rAF at rest (`src/lib/hopf-2d.ts` init branch); `driftT` advance lives only in `step()`, which RM reaches solely via `renderOnce`/pointermove. Runtime proof: `hero.spec.ts` "reduced-motion: zero rAF at rest, one frame per move" + `site.spec.ts` "reduced-motion: single frame, zero rAF at rest, no banner" pass on both projects.
2. **Poster preload location (Base vs island) + fetchpriority high + no-CLS swap** — ✅ Dual preload lives in `src/layouts/Base.astro` (dark unconditional + light gated by `media="(prefers-color-scheme: light)"`, both `fetchpriority="high"`); the island (`HopfHero.astro`) carries the LCP `<img width="1600" height="1000" fetchpriority="high">` plus `hidden` canvas swapped in place via opacity (no layout shift). Runtime proof: `hero.spec.ts` "poster preloads high with fixed dims (zero CLS)" passes both projects. (Note: `tasks.md` 2.4 names `HopfHero.astro`; the split Base-preload + island-img is the correct as-built and matches `apply-progress.md` 2.4 — not a deviation.)
3. **Idle drift with NO mouse (auto-rotate), pointer offset on top** — ✅ `driftBase(t)` pure export (`AUTO_DRIFT_RATE=0.25/AMP=0.5`); `driftT += dt` every non-RM frame on all pointers; `tg = driftBase(driftT) + pointerOffset` with coarse zeroed bit-identical; `ph` delta wrapped via `atan2(sin,cos)` to `[-PI,PI]`. Runtime proof: fidelity "desktop idle drift runs with no mouse" (two screenshots differ, zero input) + "pointer adds offset without stopping drift" (offset applies, frames keep changing after settle), both projects.
4. **36 equal fibers, no highlight** — ✅ `FIBER_COUNT=36`, single paint loop `lw1.6/alpha0.7` via blue-only `fiberColor`; `foregroundColor`/`FG_*`/`lw6`/`lw3` absent from `src/lib/hopf-2d.ts`, `fgRing` absent from `scripts/generate-poster.mjs` (grep clean outside tests/docs); `hopf-2d.test.ts` no-fg gates pass.
5. **Equations aside desktop visible / hidden ≤900px** — ✅ `aside.hero-equations` in `index.astro` (title "Hopf Fibration", S3→S2 line, `(z1,z2)` fiber line, `d = 1 − b·sin(t+φ)` line; absolute top-right, tokens only, `pointer-events:none`); `tokens.css` hides `.hero-equations` + `.hero-tag` at `@media (max-width: 900px)`. Runtime proof: fidelity aside test (visible desktop branch, hidden at 800px + mobile project) passes both projects.
6. **Header Home underline + outline pill AA both themes; eyebrow/H1 pin/Explore arrow/pillars echo/tag** — ✅ `Header.astro`: Home `aria-current="page"` + blue underline (`--primary-text`, 2px, 4px offset); `Get in touch` outline pill (transparent bg, 1px `--primary-text` border, `→` `aria-hidden`). AA runtime proof: fidelity "header CTA meets AA in both themes" (dark `rgb(122, 179, 255)`, light `rgb(10, 84, 194)`) + `site.spec.ts` CTA pairs + `theme.test.ts` 8/8, both themes. Strips runtime proof: fidelity "reference strips + header states render" (eyebrow text, H1 `toHaveText`, CTA text, tag text, exactly 3 `[data-hero-pillar]`, `#pillars` intact) passes both projects; Explore `→` arrow span present in `index.astro`; pillars echo reuses `orderedPillars` with inline SVGs + `border-left` dividers.
7. **Dual posters <100KB/>15KB, AA both themes, 390px no-overflow** — ✅ `hero-poster-dark.webp` 46,932 B (45.8 KB), `hero-poster-light.webp` 19,660 B (19.2 KB); both 1600×1000 WebP; each < 102,400 B and > 15,360 B; regenerated atomically in the same change (`npm run generate:poster`). Runtime proof: `poster.test.ts` 4/4 + fidelity "390px hero has no horizontal overflow" + `site.spec.ts` 390px overflow, all passing; themed swap via `readTheme()` + `MutationObserver` in the island.

### Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Equations Aside (ADDED) | Desktop equations panel | `hero-fidelity-v4.spec.ts` > equations aside (desktop branch) | ✅ COMPLIANT |
| Equations Aside (ADDED) | Hidden on narrow viewports | `hero-fidelity-v4.spec.ts` > equations aside (800px + mobile) | ✅ COMPLIANT |
| Interaction Model (MOD) | Always-on idle drift | `hero-fidelity-v4.spec.ts` > idle drift no-mouse + `hopf-2d.test.ts` > driftBase | ✅ COMPLIANT |
| Interaction Model (MOD) | Pointer offset on top | `hero-fidelity-v4.spec.ts` > pointer offset + `hopf-2d.test.ts` > coarse/ph-wrap | ✅ COMPLIANT |
| Interaction Model (MOD) | Desktop 2D parallax | `hero-fidelity-v4.spec.ts` > pointer offset (post-settle drift) + slowed-constants unit | ✅ COMPLIANT |
| Interaction Model (MOD) | Mobile auto-drift | `hero.spec.ts` > coarse auto-drift, mouse ignored | ✅ COMPLIANT |
| Interaction Model (MOD) | Single frame, no banner | `hero.spec.ts` > RM zero-rAF + `site.spec.ts` > RM single frame | ✅ COMPLIANT |
| Interaction Model (MOD) | Pointer single frames | `hero.spec.ts` > RM one frame per move | ✅ COMPLIANT |
| Perf/Motion-Safety (MOD) | 2D fiber budget | `npm run build` island 6.62 kB / gzip 2.89 kB + `poster.test.ts` | ✅ COMPLIANT |
| Perf/Motion-Safety (MOD) | Sync-only gzip ruling | build audit: single sync chunk, no async WebGL chunk | ✅ COMPLIANT |
| Perf/Motion-Safety (MOD) | Offscreen pause | `hero.spec.ts` > offscreen IO pauses the loop | ✅ COMPLIANT |
| Dense Fiber (MOD) | Blue-only without hue | `hopf-2d.test.ts` + `theme.test.ts` (fiberColor/theme pairs) | ✅ COMPLIANT |
| Dense Fiber (MOD) | Slowed corporate motion | `hopf-2d.test.ts` > slowed constants | ✅ COMPLIANT |
| Dense Fiber (MOD) | Equal fibers | `hopf-2d.test.ts` > no-fg gates + paint source (36×lw1.6/alpha0.7) | ✅ COMPLIANT |
| Beauty Poster (MOD) | Poster looks like 2D scene | `poster.test.ts` + `hero.spec.ts` > preload+CLS + no-JS poster | ✅ COMPLIANT |
| Beauty Poster (MOD) | Themed resemblance | island `swapPoster` + `hero.spec.ts` > themed src variant | ✅ COMPLIANT |
| Beauty Poster (MOD) | Atomic poster regen | regen same change + `poster.test.ts` 4/4 green | ✅ COMPLIANT |
| Foreground double-stroke (REMOVED) | removal | grep clean in `src/`+`scripts/` + unit no-fg gates | ✅ COMPLIANT |
| Hero Strips (ADDED) | Mono eyebrow | `hero-fidelity-v4.spec.ts` > strips (`DATA / SECURITY / AUTOMATION`) | ✅ COMPLIANT |
| Hero Strips (ADDED) | Two-tone pinned headline | strips `toHaveText` + `site.spec.ts` > headline pinned + `theme.test.ts` EN pin | ✅ COMPLIANT |
| Hero Strips (ADDED) | Pillars echo strip | strips (`[data-hero-pillar]` count 3, `#pillars` intact) | ✅ COMPLIANT |
| Hero Strips (ADDED) | Hero tag | strips (tag text desktop, hidden 800px) | ✅ COMPLIANT |
| Single-Page Structure (MOD) | Section order and anchors | `site.spec.ts` > sections in order with anchors | ✅ COMPLIANT |
| Single-Page Structure (MOD) | Header navigation | strips (aria-current Home, outline CTA) + AA test | ✅ COMPLIANT |
| Hero CTA (MOD) | CTA scroll | `site.spec.ts` > headline pinned + CTA scrolls to services | ✅ COMPLIANT |
| Hero CTA (MOD) | No-JS CTA fallback | `site.spec.ts` > no-JS fallback lands on #services | ✅ COMPLIANT |
| Hero CTA (MOD) | Filled pill with arrow | strips (CTA text) + source arrow span + `site.spec.ts` CTA AA | ✅ COMPLIANT |

**Compliance summary**: 26/26 scenarios compliant (9/9 requirements incl. the verified REMOVED item).

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Additive drift math | ✅ Implemented | `driftBase`, `driftT += dt`, offset composition, `ph` wrap — matches design pseudo-code |
| Equal fibers | ✅ Implemented | 36-loop only; no fg strokes/helpers/poster ring anywhere in `src/` or `scripts/` |
| Posters | ✅ Implemented | 1600×1000 WebP, 45.8 KB / 19.2 KB, dual preload + themed swap |
| Header states | ✅ Implemented | `aria-current` underline + transparent outline pill, token-only, AA-commented |
| Hero strips | ✅ Implemented | Eyebrow, two-span H1 with EN-exception comments, Explore pill + arrow, aside, pillars echo, tag |
| RM exception | ✅ Implemented | Untouched: single frame, zero rAF, sr-only only |
| Budgets | ✅ Implemented | 2.89 kB gzip < 15 kB; DPR clamp; IO pause; `HOPF_ENABLED` escape |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Pure `driftBase` helper + additive offset | ✅ Yes | Source matches design data-flow verbatim |
| Shortest-path `ph` wrap | ✅ Yes | `atan2(sin,cos)` before `CUR_LERP` |
| Static `aside`, no canvas text | ✅ Yes | No-JS safe, tokens only, ≤900px hide |
| Pillars echo reuses collection | ✅ Yes | `orderedPillars`; `#pillars` section stays |
| Token-only styles, no new navy | ✅ Yes | `--text/--muted/--primary-text/--border` only |
| Atomic poster regen same PR | ✅ Yes | Paint Δ + regen + `poster.test.ts` together |

### Issues Found

**CRITICAL**: None
**WARNING**:
- W1 — `scripts/check-html.mjs` `hero EN headline` gate is stale: it requires the contiguous string `Complex problems. Elegant solutions.` in `dist/index.html`, but the approved two-tone design renders two spans (`<span class="h1-line1">Complex problems.</span> <span class="h1-line2">Elegant solutions.</span>`), so the gate FAILs while the requirement itself is runtime-verified (e2e `toHaveText` both projects + `site.spec.ts` headline pin + `theme.test.ts` EN pin, all green). Non-blocking; script should assert both halves separately. Exit 1 from this supplementary gate does not reflect a spec failure.
**SUGGESTION**:
- S1 — Update the stale `check-html` headline assertion (match `HERO_LINE1`/`HERO_LINE2` halves) so the static gate returns to exit 0 and stays a useful tripwire.
- S2 — `tasks.md` 2.4 names `HopfHero.astro` for the preload; as-built correctly splits dual preload (`Base.astro`) + island `<img>` — consider a one-line task-text touch-up for future readers (no code impact).

### Verdict

PASS WITH WARNINGS — 17/17 tasks complete, 26/26 scenarios runtime-verified (build exit 0, vitest 29/29 exit 0, Playwright 44/44 exit 0); single non-blocking WARNING is a stale static-gate assertion, not a spec failure.
