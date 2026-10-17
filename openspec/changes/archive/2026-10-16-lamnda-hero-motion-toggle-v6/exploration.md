# Exploration: lamnda-hero-motion-toggle-v6 — per-site hero motion opt-in toggle

## Diagnosis (confirmed, not re-diagnosed)

User symptom "solo gira cuando muevo el mouse" is fully explained by OS
`prefers-reduced-motion: reduce` being ON (screenshot proof: "Animación en
pausa (movimiento reducido)"). Code path `src/lib/hopf-2d.ts:388,411,425,437,453-458`
+ `src/components/HopfHero.astro:101,119,137`: RM mode starts zero rAF at rest
and paints exactly one `renderOnce()` frame per pointermove. Drift constants are
v5-correct and verified visible with RM off — motion works; the OS asks for no
autoplay. Do NOT touch drift constants, fibers, or equations for this change.

## Current State

- `createHopf2D(canvas, { reducedMotion })` (`src/lib/hopf-2d.ts:292-307`):
  `reducedMotion` defaults to `prefersReducedMotion()`. When true: single
  `paint()` at startup, zero rAF (`frame()` early-returns, line 388), each
  fine-pointer move snaps `cur/tg/pitch` and paints one frame (411-416),
  resize/theme-change repaint single frame (425, 437), `setPaused(true→false)`
  never restarts rAF under RM (466). `renderOnce`/`dispose`/`setPaused` handle
  already exists; `HOPF_ENABLED=false` skips canvas entirely.
- `HopfHero.astro:101,117-137`: `reduced = prefersReducedMotion()` read once at
  island load, threaded into `createHopf2D`; hydrate is lazy (idle + visible)
  with poster-first LCP; status `<p role="status">` is sr-only only (no visible
  banner); `HOPF_ENABLED` poster-only escape preserved.
- `index.astro` hero chrome: `.hero-bg` absolute full-bleed (z-0), copy layer
  z-1, equations `aside` top-right (hidden ≤900px), `.hero-tag` mono bottom-right.
  Bottom-left of the hero is free — toggle home.
- `tokens.css`: locked AA pairs (`#7AB3FF` on `#0A1628` dark ~7:1, `#0A54C2` on
  white light ~7.5:1), global `:focus-visible` outline, RM CSS kills
  reveal/magnetic/parallax under OS RM (untouched by this change).

## Affected Areas

- `src/components/HopfHero.astro` — toggle pill-button markup + island logic
  (mode resolve, persist, dispose/recreate, sr-only announce). Main edit.
- `src/lib/hopf-2d.ts` — no math change; optionally widen `Hopf2DOptions` with an
  explicit comment (e.g. `motionMode?: "auto"|"on"|"off"`) OR keep the boolean
  `reducedMotion` and resolve effective value in the island (preferred: lib stays
  pure). `renderOnce`, `dispose`, `HOPF_ENABLED` paths reused as-is.
- `src/pages/index.astro` — no structural change expected (hero chrome already
  reserves bottom-left); only if positioning context is needed.
- `src/styles/tokens.css` — reuse tokens only; toggle styles live in the island
  `<style>` (themed via `var(--surface)/--text/--border/--primary-text`).
- `openspec/specs/hero-hopf/spec.md`, `openspec/specs/hero-motion/spec.md` —
  delta specs for the toggle (new requirement; existing RM scenarios stay).

## Approaches

1. **Island-resolved effective flag + dispose/recreate (RECOMMENDED)** — Island
   reads `localStorage["lamnda-hero-motion"]` (`on|off|auto`, absent = `auto`),
   resolves `effectiveRM = mode==="on" ? false : mode==="off" ? true :
   prefersReducedMotion()`, passes it as today's `reducedMotion` boolean into
   `createHopf2D`; toggle click persists the new mode, `dispose()`s the handle,
   re-creates with the new flag (synchronous repaint, no flicker beyond one
   frame). `matchMedia("(prefers-reduced-motion: reduce)")` change listener
   re-resolves only when mode is `auto`.
   - Pros: smallest lib diff (possibly zero — island-only); drift/fibers/equations/
     posters/strips untouched; first-visit RM behavior byte-identical (default
     `auto`); explicit consent path is a plain user gesture; easy static review.
   - Cons: recreate instead of live-flip (one synchronous repaint; negligible —
     renderer is a <15KB sync import, no async chunk).
   - Effort: Low.

2. **Live-switch inside renderer (`handle.setReducedMotion(bool)`)** — lib gains a
   method that stops/starts the rAF loop in place, preserving `driftT/cur/pitch`.
   - Pros: no dispose/recreate; preserves exact phase across toggles.
   - Cons: new rAF lifecycle surgery (`raf`/`paused`/`disposed`/`last` interplay,
     IO-pause vs RM-pause disambiguation); larger blast radius for zero user-visible
     gain over approach 1; more to verify statically.
   - Effort: Medium.

3. **CSS/DOM-only toggle (REJECTED)** — toggle a class or hide the canvas.
   - Pros: none meaningful.
   - Cons: cannot start/stop the rAF loop or single-frame path; hides output
     instead of controlling motion; breaks poster/canvas contract.
   - Effort: Low, wrong layer.

## Recommendation

**Approach 1.** Thread a `motionMode: "auto" | "on" | "off"` (default `"auto"`)
from the island into the existing `reducedMotion` parameter of `createHopf2D`
(island computes `reducedMotion` from the mode; lib signature may stay unchanged
or accept the mode with a one-line comment — either way no math/loop changes).
Details:

- **Storage key:** `lamnda-hero-motion` = `on | off | auto`; absent/corrupt →
  `auto`. All `localStorage` access in `try/catch` (private-mode safe).
- **Semantics:** `auto` = follow OS (RM→still single frame + pointer frames,
  no-RM→full drift; identical to today). Explicit `on` = full rAF drift loop
  even under OS RM (user consent overrides; only ever set by direct button
  click, never automatically). Explicit `off` = still poster-equivalent frame
  even without OS RM (dispose loop, keep last/single frame painted).
- **Button:** small pill `<button type="button">` absolute bottom-left of
  `.hopf-hero` (`left:0.9rem; bottom:1.2rem; z-index:2`), mirroring `.hero-tag`
  (bottom-right). Native button (keyboard free: Tab/Enter/Space), `aria-pressed`
  = effective-animating, visible focus via global `:focus-visible` token style,
  themed surface/text/border tokens (AA locked pairs), min 44px touch target,
  label `Animar`/`Pausar` (+ `aria-label` clarifying state, e.g. "Animar
  visualización del hero" / "Pausar visualización del hero"). `hidden` when
  poster-only (`HOPF_ENABLED=false`). Never overlaps copy (copy is z-1 left but
  flows above; button sits at canvas corner below copy block) or `.hero-tag`.
- **Honesty:** RM sr-only `role="status"` stays sr-only; toggle announces via it
  (e.g. "Animación activada por el usuario" / "Animación pausada"), never implying
  the OS setting changed. First-time RM visitors still get the still default —
  no autoplay change without consent.
- **Keeps:** 36 equal fibers, v5 drift constants, `driftBase(t)`, equations aside,
  strips, dual posters, RM default, `HOPF_ENABLED` escape, lazy idle+visible
  hydrate, IO pause.

## Test Plan (ZERO-cost static only; no runner in repo)

1. `grep` constants unchanged: `SPIN_DT 0.015`, `0.33/0.21/0.28`, `CUR 0.06`,
   `PITCH 0.045`, `RATE 0.6`/`AMP 0.65`, `FIBER_COUNT=36`, `lw1.6/alpha0.7`,
   strokes only via `fiberColor`, no `hue`.
2. `astro build` clean; island sync import still <15KB gzip, no new async chunk.
3. Manual matrix (screenshots): OS RM on/off × mode auto/on/off × light/dark →
   auto+RM still, on+RM drifts, off+no-RM still, auto+no-RM drifts; reload
   persists mode; corrupt/absent storage → auto.
4. Keyboard: Tab reaches pill, Enter/Space toggles, `aria-pressed` flips, focus
   ring visible both themes; `role="status"` announcement fires (sr-only, no
   visible banner).
5. Contrast: button colors sampled against locked AA pairs (≥4.5:1).
6. Mobile 390px: pill reachable, no overflow, no overlap with pillars/CTAs.

## Risks

- Explicit `on` under OS RM deliberately overrides an accessibility signal —
  mitigated by requiring a direct user gesture, labeling it as a per-site choice,
  and keeping `auto` (respect-OS) the default; never auto-enable.
- `localStorage` unavailable/corrupt (private mode) — `try/catch` falls back to
  `auto` without throwing; island must not break hydration.
- Button legibility over fibers — themed surface + border + scrim-adjacent
  placement; verify contrast on both themes.
- Dispose/recreate phase reset (`driftT` restarts) — visually negligible (one
  frame); accepted over rAF-lifecycle surgery.

## Ready for Proposal

Yes — scope is tight (one island + optional one-line lib comment + delta specs),
static-only verification, no drift/math changes. Propose deltas to `hero-hopf`
(toggle requirement) and `hero-motion` (RM + explicit-consent scenarios).
