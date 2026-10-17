# Exploration: lamnda-hero-auto-fidelity-v4 — idle auto-motion + equal fibers + equations panel + reference fidelity

## Current State

**Renderer (`src/lib/hopf-2d.ts`, 468 lines, v3-verified green):**

- `paint()` calls `spin()` every frame (line 341), so the rotation matrix `M` always
  evolves in non-reduced-motion mode. But on desktop the *viewpoint* (`tg.th/ph`)
  is static without pointer input: `step()` only advances the sine drift when
  `coarse` is true (lines 352-359); desktop `tg` is written solely by
  `onPointerMove`/`onPointerDown` (lines 384-403, early-return when coarse).
  Result: with no mouse the fibers rotate in place but the camera never drifts —
  the "does NOT auto-rotate" complaint. Slowed pace is pinned and unit-asserted
  (`SPIN_DT=0.01`, freqs `0.24/0.15/0.20`, `CUR_LERP=0.06`, `PITCH_LERP=0.045`,
  `AUTO_DRIFT_RATE=0.25` / `AUTO_DRIFT_AMP=0.5`).
- Foreground highlight ships in `paint()` lines 348-349: `lw6` themed-fg
  (`foregroundColor()`, `FG_DARK=#EAF1FB` / `FG_LIGHT=#101A2B`) plus `lw3`
  `fiberColor(cur.ph)`. The base loop (lines 344-347) draws all 36 fibers equal
  (`lw1.6`, `alpha0.7`, blue-only `fiberColor`). The `hero-hopf` spec *requires*
  the double-stroke today ("Foreground double-stroke" scenario) and
  `generate-poster.mjs` lines 79-84 bake the same `fgRing` highlight into both
  posters — all three must change together or poster/canvas/spec drift apart.
- Reduced-motion path is correct and MUST be preserved: single `paint()` at rest,
  zero rAF (lines 435-441), `renderOnce` per pointermove, sr-only status only.
  The v4 idle drift MUST NOT touch this path (approved exception).
- Island (`HopfHero.astro`) is poster-first, idle+visible hydrate, themed
  poster swap via `readTheme()`; hero styles in `index.astro` + `tokens.css`
  are token-driven (no navy bleed, AA pairs locked: dark `#0A1628` on `#7AB3FF`
  8.39:1, light white on `#0A54C2` 6.86:1).

**Page/chrome vs reference (`foto lamnda web/Soluciones elegantes…png`):**

- `Header.astro`: nav has no active state; `.cta-small` is a *filled* pill
  (`--primary-text` bg), reference is an *outline* pill (transparent bg, blue
  border, arrow `→`).
- `index.astro` hero: no eyebrow; `HERO_HEADLINE` renders single-color `h1`;
  `.cta-primary` filled without arrow; no equations annotation; no hero-bottom
  pillars strip; no hero bottom-right tag. Pillars live only in `#pillars`
  cards below the fold (must stay — `site-structure` order requirement).
  Pillar copy is ES (`src/content/pillars/*.md`, e.g. data-science tagline
  "Modelos que convierten datos dispersos en decisiones diarias.") while the
  reference strip/tag are EN — propose must decide strip language (recommend:
  reuse collection data, keep ES default; headline keeps its EN exception).
- `Footer.astro` already renders the `SCIENCE x TECHNOLOGY x IMPACT` tag
  (left, with shield). The reference bottom-right tag is a *hero-local*
  element — footer needs no change.

## Affected Areas

- `src/lib/hopf-2d.ts` — always-on drift: advance `driftT` in every non-RM
  `step()`; store pointer targets from `onPointerMove`; per-frame
  `tg = driftBase(t) + pointerOffset`; extract pure `driftBase(t)` helper for
  tests; keep all slowed constants; RM path untouched.
- `src/lib/hopf-2d.ts` `paint()` + `foregroundColor`/`FG_*` exports — delete
  the two fg strokes; remove (or orphan-guard) the fg helpers; all 36 fibers
  equal via the existing loop.
- `scripts/generate-poster.mjs` (lines 79-84 `fgRing`, exported from
  `buildLayers`) — delete highlight ring so procedural posters match the new
  equal-fiber canvas; `capture-poster.mjs` needs no logic change (screenshots
  live canvas) but both posters must be regenerated after the paint change.
- `public/hero-poster-dark.webp` + `public/hero-poster-light.webp` — regenerate
  (each <100KB, dense floor >15KB per `poster.test.ts`).
- `src/components/Header.astro` — Home `aria-current="page"` + blue underline;
  `.cta-small` → outline pill (transparent bg, `1px solid --primary-text`,
  text `--primary-text`, arrow `→` with `aria-hidden`).
- `src/pages/index.astro` — hero markup + `<style>`: mono eyebrow
  (`DATA / SECURITY / AUTOMATION`, `--primary-text`); two-tone `h1`
  (line 1 `var(--text)`, line 2 `var(--primary-text)`, keep exact pinned EN
  string + `EN exception` comment); filled `.cta-primary` + arrow; static
  equations `aside` (top-right, mono, theme tokens, `display:none` ≤900px);
  hero-bottom pillars strip (3 items, inline SVG icons, vertical dividers via
  `border-left: 1px solid var(--border)`); hero bottom-right mono tag.
  All static HTML (no-JS safe), absolute/flex-positioned (no CLS).
- `src/styles/tokens.css` — no new navy; new hero elements use
  `--text/--muted/--primary-text/--border` only; keep light `h1` soft shadow.
- `openspec/specs/hero-hopf/spec.md` — MODIFIED Interaction Model (desktop
  idle drift + pointer-offset), MODIFIED fiber budget (equal fibers),
  REMOVED foreground double-stroke scenario.
- `openspec/specs/site-structure/spec.md` — MODIFIED header nav (active Home)
  + header CTA (outline), ADDED hero-local strips (eyebrow, equations,
  hero-bottom pillars echo; `#pillars` section stays source of truth).
- `openspec/specs/hero-motion/spec.md` — unchanged (RM single-frame zero-rAF
  exception reaffirmed; idle drift is non-RM only).
- Tests: `tests/hopf-2d.test.ts` (drift helper + no-fg gates),
  `tests/e2e/hero.spec.ts` (desktop idle-motion, equal-fiber blue-only,
  equations/pillars/tag visibility + mobile hiding), `tests/e2e/site.spec.ts`
  (header active + outline CTA AA both themes, pinned headline text intact).

## Approaches

1. **Additive drift + pointer offset (RECOMMENDED)** — `driftT += dt` runs every
   non-RM frame on all pointers; `driftBase(t)` reproduces today's coarse sine
   (`th = PI/2 + AMP·sin(t·RATE)`, `ph = t·RATE + AMP·sin(t·RATE·0.7)`,
   `tp = 0.45`); `onPointerMove` stores last normalized pointer; each frame
   `tg.th = base.th + (aim(nx,ny).th − aim(0.5,0.5).th)`,
   `tg.ph = base.ph + (aim(nx,ny).ph − PI)`, `tp = 0.45 + (aimTp − 0.5)`.
   Coarse behavior is unchanged (pointer ignored → pure drift); desktop gets
   continuous base motion with pointer adding offset on top, never stopping it.
   `spin()` keeps running as today, so rotation is visible even with no mouse.
   - Pros: satisfies "always running, mouse adds on top" literally; coarse path
     bit-identical; pure `driftBase()` is unit-testable; tiny diff (~20 lines).
   - Cons: `ph` offset needs wrap care on large pointer jumps (existing lerp
     already tolerates this; document, don't gold-plate).
   - Effort: Low

2. **Velocity-bias drift** — pointer sets `tg` directly as today; drift adds a
   small per-frame increment to `tg` instead of recomputing a base.
   - Pros: smaller conceptual change.
   - Cons: pointer and drift fight (last-writer-wins, drift stalls after each
     mousemove — violates "never stops base motion"); `tg` drifts unbounded
     from `aim` range; harder to test. REJECTED.
   - Effort: Low (wrong semantics)

3. **Idle-timeout drift** — drift only kicks in after N seconds without pointer.
   - Pros: none over option 1.
   - Cons: violates "always running"; needs timers (RM-adjacent risk, extra
     state, flaky e2e). REJECTED.
   - Effort: Medium (timers + tests, worse outcome)

4. **Equal fibers: delete fg strokes (RECOMMENDED, only sane option)** —
   remove `paint()` lines 348-349 + `foregroundColor`/`FG_*` + poster `fgRing`;
   keep the 36-loop untouched. Update the spec scenario to "Equal fibers" and
   regen both posters.
   - Pros: 6-line canvas diff; blue-only palette function untouched; posters
     re-converge by construction.
   - Cons: posters must be regenerated in the same PR (or poster/canvas
     mismatch); `poster.test.ts` dense-floor (>15KB) should still pass since
     36 fibers + dust remain — verify, don't assume.
   - Effort: Low

5. **Equations panel: static themed `aside` (RECOMMENDED)** — hardcoded
   mono block (title "Hopf Fibration", reference sentence, fiber equation
   `(z1,z2) = (cos(θ/2)·e^(it), sin(θ/2)·e^(i(t+φ)))`, stereographic note
   `d = 1 − b·sin(t+φ)`, `S = min(W,H)·0.17`); `position:absolute; top/right`
   in hero, `pointer-events:none`, `color:var(--muted)` + title
   `var(--text)`; `display:none` ≤900px. Static HTML = no-JS safe, zero CLS.
   - Pros: no canvas text (stays crisp on DPR, theme-aware, AA-checkable);
     no layout shift; mobile hides gracefully per requirement.
   - Cons: length must be capped (~4 lines) to avoid covering fibers on
     narrow-desktop; propose must fix exact copy.
   - Effort: Low
   - Rejected alternative: canvas-drawn equations (blurry on DPR, theme
     branching inside render loop, untestable by DOM e2e).

6. **Fidelity: hero-local static strips, sections untouched (RECOMMENDED)** —
   eyebrow, two-tone headline (split pinned string into two spans — `toHaveText`
   still matches), CTA arrow, hero-bottom pillars echo reusing
   `orderedPillars` data + inline stroke icons, hero tag; header active
   underline + outline CTA. Light theme via existing tokens only.
   AA note (documented deviation): reference uses white-on-brand-blue, which
   fails AA (`#fff` on `#2E8CFF` ≈ 3:1); keep locked pairs (dark `#0A1628` on
   `#7AB3FF`, light `#fff` on `#0A54C2`) and match reference *hue family*,
   not literal hex. Blue headline line 2 over fibers relies on existing scrims;
   verify must measure computed pairs in both themes.
   - Pros: `site-structure` section order preserved; no-JS safe; single-PR
     sized (markup + CSS, no new deps, zero cost).
   - Cons: hero strip duplicates pillar data (presentational echo — spec must
     say `#pillars` stays source of truth); new absolute elements risk mobile
     overflow (mitigate: hide equations + tag ≤900px, stack strip 1-col).
   - Effort: Medium
   - Rejected alternative: moving `#pillars` into the hero (breaks section
     order spec + anchor nav + e2e order test).

## Recommendation

Option 1 (additive drift) + option 4 (delete fg) + option 5 (static `aside`) +
option 6 (hero-local strips). Keep every slowed constant, keep RM single-frame
zero-rAF exactly as-is, keep AA locked pairs with a documented hue-vs-AA
deviation, regen both posters in the same PR, and write delta specs for
`hero-hopf` (idle drift; equal fibers; fg scenario removed) + `site-structure`
(header active/outline; hero strips) before design/tasks. Forecast: single PR,
size:exception already approved; static-only zero-cost holds (local
`npm run build`, vitest, Playwright, Sharp poster regen — no paid services).

## Risks

- **Blue headline line over fibers**: `--primary-text` on bright fiber pixels
  may dip under 4.5:1 locally despite passing on solid bg; scrims + soft shadow
  mitigate. Verify MUST measure computed pairs over the live canvas in both
  themes; fallback is a stronger left scrim (tokens only).
- **Pointer-offset phase jump**: large `ph` jumps lerp the long way for a few
  frames (pre-existing behavior, now reachable while drift runs). Cosmetic;
  propose may add `[-PI,PI]` wrap on the `ph` delta — one-line, testable.
- **Poster/canvas mismatch window**: any PR that changes `paint()` without
  regenerating posters ships a lying LCP image. Tasks MUST sequence
  paint-change → regen → `poster.test.ts` atomically in one PR.
- **Poster dense-floor after fg removal**: `poster.test.ts` requires >15KB;
  deleting the wide fg ring shrinks files. Likely still dense (36 fibers +
  dust), but if a variant drops under floor, tune `generate-poster` ring
  counts, not the canvas.
- **Mobile overflow**: equations `aside` + hero tag are absolute; strip adds
  row width. Mitigations are in the recommendation (hide ≤900px, stack 1-col);
  `site.spec.ts` 390px no-overflow test must cover the new markup.
- **Strip language**: reference strip/tag are EN, page default is ES with only
  the headline as EN exception. Propose MUST pick: reuse ES collection data
  (recommended) vs hardcode EN reference strings (needs i18n-exception
  amendment). Flagged, not decided here.
- **Spec surgery on fg scenario**: `hero-hopf` "Foreground double-stroke" is a
  shipped contract — removal needs a REMOVED delta with reason; archive must
  warn per config (destructive delta).

## Ready for Proposal

Yes. All four feedback items are traced to exact lines, each with one
recommended approach, file list, spec deltas, test plan, and risks. No user
clarification needed except the strip-language pick, which propose can resolve
by defaulting to ES collection data. Next: `sdd-propose` for
`lamnda-hero-auto-fidelity-v4`, then delta specs (`hero-hopf`,
`site-structure`), design (drift math + header/hero CSS contracts), tasks
(lib → posters → chrome → tests), apply, verify (both themes + RM + posters
+ AA), archive.
