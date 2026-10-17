# Exploration: lamnda-hopf-2d-v3 — Port user 2D Hopf canvas as hero primary

## Current State

**User renderer (`Fibración de Hopf (2).html`, 58 lines, REQUIRED source):**
- Full-window 2D canvas, DPR-aware `fit()` (`C.width = W*D`, `setTransform`).
- State: target `tg {th, ph}`, smoothed `cur`, `yaw` (unused), `pitch`/`tp`.
- `aim(e)`: `tg.th = PI*(0.1+0.8*x)`, `tg.ph = y*2PI`, `tp = 0.15+0.7*x`. Listeners: `pointermove` + `pointerdown`.
- `hue(ph)` = `hsl(ph/2PI*360, 80%, 58%)` — rainbow. MUST be replaced (corporate-blue only).
- `spin()`: `T += 0.016`; axis `w = [0.9*sin(T*0.37)+0.45, 0.8*sin(T*0.23+1)+0.4, 0.7*sin(T*0.31+2)+0.35]`; Rodrigues step `a = n*0.016`; Gram-Schmidt re-orthonormalize of `M`.
- `rot()`: applies 3x3 `M`, then pitch tilt around X.
- `fiber(th,ph,N=150)`: `(z1,z2) = (cos(th/2)e^it, sin(th/2)e^i(t+ph))`, stereographic `d = 1 - b*sin(t+ph)`, `null` gate at `d < 0.07`.
- `stroke()`: scale `S = min(W,H)*0.17`, perspective `f = 1/(1-r[2]*0.06)`, skip `hypot > 7`, `lineCap round`.
- `frame()`: `cur` lerp `0.12`, `pitch` lerp `0.08`, `spin()`, `clearRect`; `n = 36` fibers `lw 1.6 alpha 0.7` rainbow; foreground fiber double-stroke `lw 6` fg-color + `lw 3` hue. `requestAnimationFrame` loop.
- Defect in user file: `reduce` is read but never used — always animates. The port MUST wire it (req. 4).

**Current repo hero (Three.js, to be demoted):**
- `src/lib/hopf-scene.ts` (511 lines): 260/120/64 fibers x96 segs, `LineSegments` core + 1.04x halo + sprite dust + 600-pt starfield; 4 draws desktop / 3 mobile; DPR clamp 1.5/2 floor 1; dynamic `three` import; `HOPF_ENABLED` escape; damped parallax; reduced-motion single frame + per-pointer `renderOnce`; IO pause. Gradient truth `#EAF1FB -> #2E8CFF` already corporate-blue — reusable for the 2D palette.
- `src/components/HopfHero.astro`: poster-first (`/hero-poster.webp` 44.6KB, `fetchpriority=high`), `hidden` canvas swap (zero CLS), idle+visible lazy hydrate, sr-only status (no banner). Style hardcodes dark radial `background: radial-gradient(... #14304f ... #0a1628)` — light-mode bug source #1.
- `src/pages/index.astro` hero `<style>`: `.hero-overlay { background: #0a1628 }` + `::after` scrims `rgb(10 22 40 / ...)` hardcoded desktop AND mobile — bug source #2 (wins over `tokens.css` themed `.hero-overlay`). CTA light overrides already exist (`#fff` on light). `HERO_HEADLINE` EN pinned, reveals/magnetic via `reveal.ts`, logo header untouched.
- `src/styles/tokens.css`: `.hero-overlay` correctly uses `var(--bg)` + `h1 text-shadow 0 2px 24px black` (too heavy for light) — overridden by page style today.
- Poster pipeline: `scripts/generate-poster.mjs` (Sharp procedural, mirrors `HOPF_SCALE/CAM_Z/GROUP_X` from `hopf-scene.ts`) + `scripts/capture-poster.mjs` (Playwright screenshot of live canvas). Both import/mirror `hopf-scene.ts` constants — break if that file is deleted without updating.

## Affected Areas

- `src/lib/hopf-2d.ts` (NEW) — verbatim port of fiber math + `spin` + `rot` + `stroke`/`frame`; themed palette replacing `hue()`; slowed constants; theme + reduced-motion + DPR inputs.
- `src/components/HopfHero.astro` — rewrite island wiring from `createHopfScene` to 2D renderer; remove `three` dynamic import as primary path; theme-aware CSS (no hardcoded navy); keep poster-first + idle/visible + sr-only contract.
- `src/lib/hopf-scene.ts` — demote/delete: stop importing; either delete + drop `three` dep or archive. Poster scripts depend on its constants — update together.
- `src/pages/index.astro` `<style>` — replace hardcoded `#0a1628` hero bg + both scrims with theme-aware tokens; keep EN headline, overlay layout, reveals/magnetic.
- `src/styles/tokens.css` — add light hero tokens (bg/scrim/shadow); soften `h1` shadow in light.
- `scripts/generate-poster.mjs` + `scripts/capture-poster.mjs` — repoint composition truth to new 2D module; regenerate poster as beauty shot of the 2D scene.
- `public/hero-poster.webp` — regenerate (<100KB); decide one neutral vs. two theme posters (see Risks).
- `package.json` — optionally drop `three` + `@types/three` if nothing else uses them (verify: only `hopf-scene.ts` imports `three` today).
- `openspec/specs/hero-hopf/spec.md` — delta needed: fiber counts (36x150 2D vs 260x96), draw-call budget (N/A for 2D), async-chunk exemption (obsolete), poster resemblance target (2D look).

## Approaches

1. **Verbatim 2D port module + thin island (RECOMMENDED)** — new `src/lib/hopf-2d.ts` keeps `fiber`/`spin`/`rot`/`stroke`/`aim` logic line-for-line; only `hue()` becomes `fiberColor(ph, theme)` interpolating the existing `#EAF1FB -> #2E8CFF` gradient + highlight `#7AB3FF` (dark) / `#0A54C2` (light); slowed constants (`T += ~0.010`, freqs x0.65, `a = n*0.010`, `cur 0.06`, `pitch 0.045`); `prefersReducedMotion` gates to single frame + per-pointer `renderOnce`; theme read from `documentElement[data-theme]` + observer; DPR clamp reused. `HopfHero.astro` keeps poster-first/idle/visible/sr-only shell, swaps scene import. Poster regenerated via `capture-poster.mjs` against the new canvas (truest resemblance), `generate-poster.mjs` restyled or retired.
   - Pros: satisfies "port verbatim, do NOT keep Three.js primary"; smallest runtime (no WebGL, no ~600KB async chunk); palette/budget reuse; capture poster matches 1:1.
   - Cons: `hopf-scene.ts` + poster-script constant sharing must be rewired; spec budget clauses need rewrite.
   - Effort: Medium

2. **Patch Three.js scene to mimic 2D look** — keep `hopf-scene.ts`, reduce fibers to 36, flatten colors.
   - Pros: no file churn.
   - Cons: violates explicit user requirement (2D is REQUIRED renderer); keeps `three` weight; stereographic math differs (`1-z1r` vs `1-b*sin`), never visually identical; REJECTED.
   - Effort: Medium (wasted)

3. **Iframe/embed user HTML verbatim** — ship `Fibración de Hopf (2).html` as asset, iframe behind copy.
   - Pros: zero port risk.
   - Cons: no theming (rainbow + fixed bg bleed worse in light), no DPR/pause/reduced-motion integration, LCP/CLS penalty, duplicated code; REJECTED.
   - Effort: Low (wrong outcome)

## Recommendation

Approach 1. Port math verbatim into `src/lib/hopf-2d.ts` with only these deltas vs. user file: (a) `hue()` → corporate-blue `fiberColor()` (dark: `rgba(122,179,255)` family + `#EAF1FB` core; light: `#0A54C2`→`#2E8CFF` deep-blue fibers; fg double-stroke kept but themed); (b) slow-down constants (~35%: `T += 0.010`, freqs `0.24/0.15/0.20`, `cur 0.06`, `pitch 0.045`, keep `aim` mapping); (c) wire `prefersReducedMotion` (single frame + pointer-driven `renderOnce`, zero rAF at rest, sr-only status, no banner); (d) theme observer + DPR clamp + IO pause + `HOPF_ENABLED` escape preserved. Fix light mode in `HopfHero.astro` + `index.astro` + `tokens.css` (no navy literals outside dark selectors; scrims per theme; `h1` shadow softened in light). Regenerate poster from the live 2D canvas via `capture-poster.mjs` (<100KB); update both poster scripts' shared-truth import. Propose deletion of `hopf-scene.ts` + `three` dep (verify no other importer first) and rewrite the `hero-hopf` spec budget clauses (2D has no draw calls / no async chunk).

## Risks

- **Poster theme split**: one 44KB dark poster currently bleeds in light mode the same way CSS does. Single neutral poster may satisfy neither theme; two posters (`<picture>` + `data-theme`/`prefers-color-scheme` select) doubles generation but only one loads. Propose MUST decide; verify MUST check both themes <100KB each.
- **Shared-truth breakage**: `generate-poster.mjs` / `capture-poster.mjs` mirror `HOPF_SCALE/CAM_Z/GROUP_X` from `hopf-scene.ts`; deleting that file without repointing silently desyncs poster vs. scene. Task list MUST include script updates atomically.
- **Spec/budget obsolescence**: current `hero-hopf` spec locks 260/120/64x96, 4/3 draws, async-three exemption — all false after the port. If propose reuses old scenarios, verify will fail spuriously. Delta spec MUST rewrite these three scenarios.
- **Rainbow residue**: any missed `hue()` call path (fg thin stroke) reintroduces non-palette color. Port MUST route both fg strokes through the themed function; verify SHOULD pixel-sample.
- **Light-mode contrast**: deep-blue fibers on `gray-50/white` + dark copy + AA CTA need measured pairs (white-on-`#0A54C2` 6.86:1 known-good for CTA; fiber-vs-bg is decorative but copy/scrim legibility MUST be rechecked per screenshot bug).
- **Reduced-motion regression**: user file ignores its own `reduce` flag; a naive verbatim copy ships autoplay to reduced-motion users. Port MUST gate before `requestAnimationFrame`.

## Ready for Proposal

Yes. Proposal input is complete: required renderer + exact line-level deltas + bug root causes (two hardcoded-navy sites) + file list + spec deltas + poster decision. Next: `sdd-propose` for `lamnda-hopf-2d-v3`, then delta specs for `hero-hopf` (2D truth + budgets) and `theme-i18n` or page style (light hero contract), design (palette function + slowed constants + theme hook), tasks (port, island rewrite, light fix, poster regen, three removal, verify both themes + reduced-motion).
