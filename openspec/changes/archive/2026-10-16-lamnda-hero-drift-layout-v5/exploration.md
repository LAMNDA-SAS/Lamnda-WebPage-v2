## Exploration: lamnda-hero-drift-layout-v5

### Current State

Verbatim reference `Fibración de Hopf (2).html` (58 lines) idle motion = `spin()`-only
(no drift; `tg` static unless pointer moves):

- `T += 0.016` per frame (~0.96/s at 60 fps).
- `w = [0.9·sin(T·0.37)+0.45, 0.8·sin(T·0.23+1)+0.4, 0.7·sin(T·0.31+2)+0.35]`.
- Rodrigues angle `a = n·0.016` where `n = hypot(w)` (~1.2–1.5 typical
  → `a ≈ 0.019–0.024 rad/frame` → ~1.15–1.46 rad/s global rotation).
- Pointer smoothing `cur 0.12`, `pitch 0.08`.

Current `src/lib/hopf-2d.ts`:

- `SPIN_DT = 0.01` (62.5% of verbatim), used TWICE per frame
  (`T += SPIN_DT` and `a = n·SPIN_DT` → quadratic slowdown).
- `SPIN_FREQS = [0.24, 0.15, 0.20]` (65% of verbatim 0.37/0.23/0.31).
- `CUR_LERP = 0.06` (50%), `PITCH_LERP = 0.045` (56%).
- `AUTO_DRIFT_RATE = 0.25`, `AUTO_DRIFT_AMP = 0.5`;
  `driftBase(t) = { th: π/2 + 0.5·sin(0.25t), ph: 0.25t + 0.5·sin(0.175t) }`.
- `paint()` renders 36 equal fibers `fiber(cur.th, ph=k/n·2π)` —
  `cur.ph` has NO consumer since the fg highlight was deleted.
  Only `cur.th` drift + `spin(M)` are visible.

Diagnosis — why idle looks frozen:

1. Spin ~40%+ slower: `a` drops to ~0.012–0.015 rad/frame (~0.72–0.91 rad/s),
   and `T` advances 0.60/s vs 0.96/s, so the `w`-vector modulation period is
   ~1.54× longer. Combined perceptual slowdown is more than the "35%" comment.
2. Drift too small: `th` max slope = `AMP·RATE = 0.125 rad/s`
   (period 25.1 s); per-frame target delta at 60 fps ≈ 0.002 rad.
3. `ph` drift is dead code visually: `0.25 rad/s` ramp moves `tg.ph`/`cur.ph`
   but no stroke reads `cur.ph` (equal-fibers loop uses the loop index).
4. Heavy lag on an already-slow target: `CUR_LERP 0.06` settles in ~16 frames
   (~268 ms) vs ~8 frames (~130 ms) at 0.12 — adds ~130 ms extra lag, so the
   first 1–2 s after load look static.
5. Layout compounds it: `.wrap` max-width 1120 px + 1.2 rem gutters centers
   copy; canvas `stroke()` centers the ring at `W/2` (no `GROUP_X` offset), so
   the slow ring sits behind the copy/scrim instead of in open right space.

Layout today:

- `src/pages/index.astro`: `.wrap { max-width: 1120px; padding: 0 1.2rem; }`,
  `.hero-copy { max-width: 36rem; }`, no ring offset (canvas centered).
- `src/styles/tokens.css`: `.hero-equations` / `.hero-tag` right
  `max(1.2rem, calc((100% - 1120px)/2 + 1.2rem))`; hero glow
  `radial-gradient(90% 90% at 72% 38%, …)`.
- `src/components/HopfHero.astro`: absolute full-bleed island, no offset;
  poster `object-fit: cover` matches centered canvas.
- 390 px guard exists (`overflow-x: clip`, equations/tag hidden ≤ 900 px).

### Affected Areas

- `src/lib/hopf-2d.ts` — `SPIN_DT`, `SPIN_FREQS`, `AUTO_DRIFT_RATE`,
  `AUTO_DRIFT_AMP`; add `GROUP_X` ring offset into `stroke()`; keep
  `CUR_LERP = 0.06`, `PITCH_LERP = 0.045`, RM path, gates, palette untouched.
- `src/pages/index.astro` — `.wrap` max-width/padding, `.hero-copy` max-width.
- `src/styles/tokens.css` — equations/tag `right` to match new wrap width,
  hero glow position, mobile guard.
- `src/components/HopfHero.astro` — no code change; poster regen only if ring
  shift visibly changes composition.
- `tests/hopf-2d.test.ts` — pins `SPIN_DT 0.01` + freqs `[0.24, 0.15, 0.2]`;
  MUST be updated to the new pinned values in propose/spec.
- `scripts/generate-poster.mjs` — poster regen params (same `GROUP_X`) if needed.

### Approaches

1. **Full verbatim restore** — `SPIN_DT 0.016`, freqs `0.37/0.23/0.31`,
   `CUR_LERP 0.12 / pitch 0.08`, drop drift.
   - Pros: pixel-identical idle pace to user HTML.
   - Cons: violates Keep (mouse expand/contract goes fast again); loses
     corporate-calm requirement; reintroduces unthrottled pointer feel.
   - Effort: Low.

2. **Drift-only boost (keep slow spin)** — raise `RATE/AMP`, leave
   `SPIN_DT 0.01` + freqs.
   - Pros: smallest diff; spin stays extra calm.
   - Cons: global rotation still ~40% slow; breathing-only motion reads as
     "pulsing", not the reference's continuous swirl; `ph` boost still invisible.
   - Effort: Low.

3. **Recommended: near-verbatim spin + boosted th-drift, pointer smoothing locked**
   — `SPIN_DT 0.015`, freqs `[0.33, 0.21, 0.28]`, `RATE 0.60 / AMP 0.65`,
   keep `CUR_LERP 0.06 / PITCH_LERP 0.045`, add desktop-only `GROUP_X`.
   - Pros: visible idle each second; mouse expand/contract stays slow;
     RM zero-rAF path untouched; calm but alive.
   - Cons: touches 4 constants + 1 new offset; test pins + posters need sync.
   - Effort: Low (single PR, zero-cost static only).

### Recommendation

Adopt Approach 3 with these EXACT constants (proposal/spec MUST pin them):

```ts
// src/lib/hopf-2d.ts
export const SPIN_DT = 0.015;                    // was 0.01 (verbatim 0.016)
export const SPIN_FREQS = [0.33, 0.21, 0.28] as const; // was [0.24, 0.15, 0.20]
export const CUR_LERP = 0.06;                    // UNCHANGED (slow pointer)
export const PITCH_LERP = 0.045;                 // UNCHANGED (slow pointer)
export const AUTO_DRIFT_RATE = 0.6;              // was 0.25
export const AUTO_DRIFT_AMP = 0.65;              // was 0.5
export const GROUP_X_DESKTOP = 0.62;             // NEW (was implicit 0.50)
export const GROUP_X_MOBILE = 0.5;               // NEW (390 px safe center)
```

Math check: `th` max slope `0.65·0.60 = 0.39 rad/s` (~3.1× current 0.125);
`ph` ramp `0.60 rad/s` → 2π in ~10.5 s (vs 25.1 s); `T` advances 0.90/s
(94% verbatim); `a ≈ 0.018–0.022 rad/frame` (~1.1–1.35 rad/s, 93% verbatim).
`stroke()` x-origin: `W / 2` → `W · (isMobileViewport() ? GROUP_X_MOBILE : GROUP_X_DESKTOP)`;
`generate-poster.mjs` uses the same `GROUP_X_DESKTOP` so canvas + posters agree.
`driftBase()` formula UNCHANGED (only the two constants change); `ph`-wrap
`atan2` + `CUR_LERP` path UNCHANGED. Note for spec: `ph` drift stays visually
inert under equal-fibers (document as future hook, do not re-add highlight).

Layout token changes (exact):

```css
/* src/pages/index.astro <style> */
.wrap { max-width: 1280px; padding: 0 0.9rem; }  /* was 1120px / 1.2rem */
.hero-copy { max-width: 32rem; }                  /* was 36rem */

/* src/styles/tokens.css */
.hero-equations, .hero-tag {
  right: max(0.9rem, calc((100% - 1280px) / 2 + 0.9rem)); /* was 1.2rem / 1120px */
}
.hero-overlay {
  background:
    radial-gradient(90% 90% at 75% 38%, rgb(46 140 255 / 0.16) 0%, transparent 60%),
    var(--bg); /* was at 72% 38% */
}
/* ≤900px guard UNCHANGED (equations/tag display:none) + GROUP_X_MOBILE 0.50 keeps
   390px centered; body overflow-x: clip + hero overflow: clip retained. */
```

Do NOT change: `FIBER_COUNT 36`, `FIBER_SEGMENTS 150`, null-gate `d<0.07`,
skip `hypot>7`, `S=min(W,H)·0.17`, perspective `1/(1−r[2]·0.06)`, blue-only
palette (`#EAF1FB→#2E8CFF`, hi `#7AB3FF` dark / `#0A54C2` light), AA pairs,
equations-aside position, reference strips, dual posters (regen ONLY if the
0.50→0.62 ring shift is visibly different in review), RM single-frame +
zero-rAF-at-rest, `HOPF_ENABLED` escape.

Tests to update in proposal: `tests/hopf-2d.test.ts` "pins slowed corporate
constants" block → new `SPIN_DT`/`SPIN_FREQS` values; drift tests keep formulas.

### Risks

- Ring at 0.62 may clip on narrow-desktop (~1024 px) or fight the equations
  aside at top-right — mitigate with `S=min(W,H)·0.17` unchanged + review
  screenshots at 390/768/1024/1440 px.
- Poster/canvas mismatch if poster is not regened after the ring shift —
  mitigate by regenning both posters with identical `GROUP_X` or deferring
  posters if review shows no visible composition change.
- Raising `AMP` to 0.65 pushes `th` to π/2±0.65 — still clear of the polar
  null-gate cluster (`fiber(Math.PI)` nulls), but verify no excess
  `hypot>7` runaway skipping at extremes.
- Light-theme AA unaffected (no color change), but scrim-over-ring legibility
  must be re-checked after copy moves 10 px closer to the edge.

### Ready for Proposal

Yes — constants and token diffs above are exact and scoped; propose with
updated test pins, screenshot matrix (390/768/1024/1440 × light/dark), RM
zero-rAF re-verification, and poster regen conditional on visible composition
change. Single-PR, zero-cost static only; defer anything needing a render loop
or JS animation library per preflight defer-if-blocked.
