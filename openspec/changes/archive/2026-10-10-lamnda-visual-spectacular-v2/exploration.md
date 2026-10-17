## Exploration: lamnda-visual-spectacular-v2

### Current State

**Hero composition (`src/pages/index.astro:41-65`, `src/components/HopfHero.astro`).**
Two-column grid (`1fr 1.1fr`) with copy left and a small rounded card right
(`aspect-ratio 3/2`, `min-height 320px`, bordered, `overflow:hidden`). Canvas is
confined to that card, not full-bleed. Reference target
(`foto lamnda web/Soluciones elegantes para sistemas complejos.png`) is a
full-viewport dark hero with the torus filling ~50% of the screen at right,
copy overlaid left, annotation callouts at edges. Current layout cannot match
that density or presence regardless of fiber count.

**Fiber scene (`src/lib/hopf-scene.ts`).**
`48` desktop / `24` mobile fibers x `128` segments merged into 1x
`LineSegments` (`LineBasicMaterial #2E8CFF`, opacity 0.55, additive) + 1x
`Points` (`PointsMaterial #7AB3FF`, size 0.02) = 2 draw calls. Single flat
color, no vertex-color gradient, no halo layer, no sprite texture, no
starfield. Scale `0.42`, camera `z=4.2` — torus renders small and thin.
Math core (`hopfFiberPoint`, `fiberBaseDirections` Fibonacci sphere,
`buildFiberLinePositions`, `buildDustPositions`) is correct and reusable;
only density and materials need to change.

**Poster (`public/hero-poster.webp`, `scripts/generate-poster.mjs`).**
Procedural Sharp SVG: 6 flat ellipses + 8 dots on a radial gradient. Confirms
the bug report: the paused screenshot shows exactly this sparse poster with
the status line `Animación en pausa (movimiento reducido).` It is not a beauty
shot of the scene and does not resemble the reference torus.

**Motion handling (`HopfHero.astro:56-64`).**
`prefersReducedMotion()` returns early: no WebGL, poster stays, visible
`<p role="status">` banner is set. Correct for accessibility intent but wrong
UX: the banner is confusing and the fallback frame is ugly. No single-frame
WebGL render, no on-demand parallax. Offscreen pause via `IntersectionObserver`
and damped pointer parallax (`dt*3.2`, `0.35/0.25` targets) already exist and
are sound.

**Motion extras.**
Only hero parallax + one smooth-scroll CTA (`index.astro:417-428`). No scroll
reveals, no hero scroll-parallax, no magnetic CTAs, no header scroll state.
`tokens.css` already forces `scroll-behavior:auto` under reduced-motion.

**Brand (`src/components/Header.astro`, `Footer.astro`, `src/layouts/Base.astro`).**
Header uses CSS `λ` glyph in a colored box; footer is text-only. Real assets
(`Logos/Lamnda_logo.png` white-bg with wordmark, `Logos/Lamnda_logo pequeño y
transparente.png` transparent shield-only) are unused. No favicon, no
`apple-touch-icon`, no `public/logos/` copies. OG image points at the sparse
poster.

**Budgets (`openspec/specs/hero-hopf/spec.md`, `astro.config.mjs`).**
Poster `<100KB`, hero JS `<200KB` gzip, DPR clamp `1.5 mobile / 2 desktop`,
draws `<30`. Three.js is dynamically imported inside the island so it never
blocks LCP; `chunkSizeWarningLimit: 220` already set.

### Affected Areas

- `src/lib/hopf-scene.ts` — fiber counts, segments, layered materials, vertex colors, sprite dust, starfield, single-frame render API, adaptive DPR, scroll/parallax inputs.
- `src/components/HopfHero.astro` — full-bleed layout, no-banner reduced-motion path, idle+visible hydration, failure-only status text.
- `src/pages/index.astro` — hero becomes full-viewport overlay section; add reveal attributes, magnetic CTA hooks, scroll-parallax hook.
- `src/components/Header.astro` — replace CSS glyph with transparent shield `<img>` + wordmark; add scroll-state class.
- `src/components/Footer.astro` — add small shield mark.
- `src/layouts/Base.astro` — favicon/apple-touch links, preload new poster sizes, OG image update.
- `src/styles/tokens.css` — reveal/magnetic/hero-scroll keyframes + `prefers-reduced-motion` guards, full-bleed hero tokens.
- `public/hero-poster.webp` + `public/logos/*` + favicon set — regenerated poster (beauty shot), copied/converted logos.
- `scripts/generate-poster.mjs` — upgraded procedural dense-torus renderer; new `scripts/capture-poster.mjs` (Playwright WebGL screenshot, optional pixel-perfect path).
- `openspec/specs/hero-hopf/spec.md` — density, full-bleed, no-banner motion, scroll/magnetic, logo/favicon deltas.
- `tests/hopf.test.ts`, `tests/e2e/site.spec.ts` — fiber-count asserts, reduced-motion asserts (no banner), LCP/poster budget asserts need updates.

### Approaches

#### 1. Dense spectacular Hopf (200-400 fibers, glow without postprocessing)

1. **Layered additive lines + sprite points (recommended core)** — Keep the
   proven merged-geometry pattern, scale it: `~260` desktop / `~120` mobile /
   `~64` reduced-motion-single-frame fibers x `96` segments (fewer segments
   fund more fibers: `260*96*2 = 49.9k` line verts vs current `12.3k`, still
   one draw). Three layers, still `<6` draws: (a) core `LineSegments` with
   per-vertex color gradient (white `#EAF1FB` center → `#2E8CFF` edge) opacity
   `0.85`; (b) halo `LineSegments` sharing the same positions, opacity `0.18`,
   scaled `1.04x` for fake bloom; (c) fiber dust `Points` with canvas-generated
   radial sprite texture (`size ~0.035`, vertex colors); (d) static ambient
   starfield `Points` (`~600` pts on sphere shell, size `0.015`, opacity `0.5`).
   Camera `z ~3.4`, group offset `x +0.9` (torus sits right), scale `~0.62`.
   - Pros: stays in draw/js budget; no postprocessing dependency; deterministic; mobile-safe by halving counts.
   - Cons: requires tuning gradient stops and sprite to avoid muddy core; halo duplication doubles line memory (~1.2MB GPU, acceptable).
   - Effort: Medium.

2. **Custom ShaderMaterial with per-fiber brightness falloff** — One
   `LineSegments` with vertex shader doing distance-to-center glow + fresnel-ish
   fade. Maximum control, single draw for lines.
   - Pros: best glow-per-draw; animatable uniforms (pulse).
   - Cons: custom GLSL to maintain; line width still 1px (WebGL limit) so glow must come from color, not width; harder to debug; risk of breaking the pure-math test seam.
   - Effort: High.

3. **UnrealBloomPass (EffectComposer)** — Closest to reference glow in one flag.
   - Pros: instant cinematic glow; minimal shader work.
   - Cons: adds `~80-150KB` gzip (breaks `<200KB` hero budget with three), halves mobile fps, needs tone-mapping + resize handling, conflicts with `powerPreference: low-power`; rejected in v1 design (D2) for the same reason.
   - Effort: Medium, cost: budget breach.

**Poster sub-decision (must be a beauty shot of the same scene).**
- (a) Upgraded procedural Sharp poster: render `~220` projected Hopf ellipses
  with rotation/opacity variance + `feGaussianBlur` halo pass + `~400` dust dots,
  `1600x1000`, WebP `q~70` — expected `60-90KB`, deterministic in CI.
- (b) Playwright capture: launch Chromium, render the real WebGL frame at a
  fixed camera angle, screenshot canvas, Sharp-compress to `<100KB`.
  Pixel-perfect but needs GPU-capable CI and a fixed seed.
- Recommendation: ship (a) as the committed poster pipeline; add (b) as an
  optional `scripts/capture-poster.mjs` for release-time refresh. Both satisfy
  LCP (`fetchpriority=high`, fixed dimensions, zero CLS).

#### 2. Motion strategy honoring accessibility without the ugly banner

1. **Single-frame beauty + on-demand parallax, zero banner (recommended)** —
   Delete both `say(...)` freeze messages. Under `prefers-reduced-motion`:
   still build the scene, render exactly **one** frame at the hero camera angle,
   then stop the rAF loop. Keep the canvas visible (not the sparse poster) so
   paused users see the same dense torus. Pointer input re-renders **one**
   frame per `pointermove` (user-initiated, no autoplay — WCAG 2.3.3 compliant
   pattern); scroll/input never auto-advances. `<p role="status">` stays in DOM
   but empty except for genuine failures (`No se pudo iniciar el 3D`).
   Offscreen `IntersectionObserver` pause is retained for all modes.
   - Pros: paused state is stunning; no confusing copy; honors reduced-motion (no loop); keeps delight on demand.
   - Cons: builds WebGL even for reduced-motion (one-time cost ~100ms + three chunk fetch); needs `renderOnce()` API on the scene handle.
   - Effort: Low/Medium.

2. **Poster-only for reduced-motion with upgraded poster** — Keep early return,
   rely on the new dense poster. Simpler, zero WebGL for reduced-motion.
   - Pros: cheapest, least JS.
   - Cons: poster and live scene can still diverge; loses on-demand parallax delight; keeps two visual truths.
   - Effort: Low.

3. **Subtle continuous drift even under reduced-motion** — Keep a very slow
   rotation (`0.01 rad/s`) plus glow pulse.
   - Pros: prettiest at a glance.
   - Cons: violates `prefers-reduced-motion` (autoplay motion); WCAG failure; must not ship.
   - Effort: N/A (rejected).

#### 3. Scroll / mouse animation (Antigravity feel, no library)

1. **Vanilla IO + CSS, rAF-throttled (~2KB, recommended)** — `data-reveal`
   sections fade/translate `24px → 0` over `0.7s` when `IntersectionObserver`
   fires once; hero copy translates `scrollY * 0.12` and fades to `0` by
   `~60vh` (skip entirely under reduced-motion); CTAs get magnetic pull
   (`translate ≤6px` toward cursor, spring back on leave; fine-pointer only,
   disabled under reduced-motion); header gains `.scrolled` (stronger blur +
   border) past `24px`. All in one `src/lib/reveal.ts` + `tokens.css` classes.
   - Pros: zero dependency, stays in JS budget, trivially motion-gated, no CLS (transform/opacity only).
   - Cons: less choreography than GSAP timelines; author must add `data-reveal` per section.
   - Effort: Low/Medium.

2. **GSAP + ScrollTrigger via CDN** — Rich timelines, scrubbed hero.
   - Pros: fastest authoring of complex sequences.
   - Cons: `~70KB` gzip extra, CDN render-blocking risk, motion-gating boilerplate anyway; overkill for fade/rise + parallax asks.
   - Effort: Low, cost: weight.

#### 4. Logo integration + favicon + theme fit

1. **Transparent shield + styled wordmark (recommended)** — Copy
   `Lamnda_logo pequeño y transparente.png` → `public/logos/lamnda-mark.png`
   (header `32px`, footer `24px`, `alt="Lamnda"`); keep the wordmark as styled
   text (`Space Grotesk 700`) so it inherits `--text` in both themes. White-bg
   `Lamnda_logo.png` is unusable on the dark hero — do not ship it to `public`
   except as `public/logos/lamnda-logo-light.png` reference if needed. Favicon:
   Sharp-resize shield to `32/180px` → `public/favicon-32.png`,
   `public/apple-touch-icon.png`, plus `public/favicon.svg` trace fallback;
   wire `<link rel="icon">` + `theme-color` in `Base.astro`. Header logo gets
   `filter: drop-shadow(0 0 12px rgb(46 140 255 / .35))` in dark theme only.
   - Pros: theme-safe, crisp, no white box on dark bg; text stays selectable/translatable.
   - Cons: requires Sharp conversion step; wordmark is not the official letterform (acceptable — official PNG has white bg).
   - Effort: Low.

2. **Full white-bg logo in a rounded chip** — Ship `Lamnda_logo.png` as-is in a
   white rounded badge in the header.
   - Pros: official lockup exact.
   - Cons: white chip clashes with Antigravity dark glass header; looks bolted-on; fails the "spectacular" bar.
   - Effort: Low (rejected).

#### 5. Performance budget to keep LCP

- **Geometry**: cap line verts at `~55k` desktop (`260x96x2`) / `~23k` mobile
  (`120x96x2`); `Float32Array` build stays `<120ms` (pure math, no per-frame
  allocation — positions precomputed once, rotation via `group.rotation` only).
- **Draws**: 4 total (core lines, halo lines, fiber dust, starfield) — well
  under `<30`; keep asserting in unit tests.
- **DPR**: keep `min(dpr, 1.5 mobile / 2 desktop)` + adaptive step-down: if
  `navigator.deviceMemory <= 4` or 2s median fps `< 40`, drop DPR `0.25` to a
  floor of `1`. Resize handler debounced.
- **JS**: three stays a dynamic `import()` after `requestIdleCallback` +
  visible; own island code `<15KB`; total async chunk must re-verify `<200KB`
  gzip in `sdd-verify` (three `0.170` min gzip is the dominant term — if over,
  pin import to `three/build/three.core.js`-style minimal or accept async-chunk
  exemption since it never blocks LCP; decision for propose phase).
- **LCP**: poster `<100KB` WebP preloaded, fixed `width/height`, canvas `hidden`
  until first frame (no CLS); `HOPF_ENABLED=false` escape hatch retained.

### Recommendation

Ship approach **1.1 (layered additive, 260/120 fibers, vertex-color gradient +
sprite dust + starfield, right-offset full-bleed camera)** with poster pipeline
**1(a) procedural dense Sharp + 1(b) optional Playwright capture script**;
motion **2.1 (single-frame beauty render + on-demand pointer frames, banner
deleted)**; scroll **3.1 (vanilla IO reveals + hero scroll parallax + magnetic
CTAs + header state, all motion-gated)**; brand **4.1 (transparent shield +
styled wordmark + generated favicon set)**; perf guards from section 5 with a
verify-time gzip ruling on the three async chunk. This is the only combination
that fixes the reported bug (ugly paused state), matches the reference density,
stays within draws/LCP, and adds Antigravity motion without a library.

Propose-phase deltas to lock: `hero-hopf` spec scenarios for full-bleed
composition, dense-fiber counts per viewport, no-banner reduced-motion
single-frame, reveal/magnetic behaviors, logo/favicon assets, and poster
`<100KB` beauty-shot requirement; `site-structure`/`theme-i18n` untouched
except asset links.

### Risks

- **Three async-chunk gzip over 200KB**: three dominates the hero budget; verify
  must measure `dist/` chunks and either exempt async WebGL (LCP-safe) or trim
  imports. Mitigation: keep dynamic import + `chunkSizeWarningLimit`, measure first.
- **Halo overdraw on low-end mobile**: double line layers + additive can tank
  fill-rate at DPR 2. Mitigation: mobile drops halo layer entirely (3 draws),
  DPR floor 1, `powerPreference: low-power`.
- **Poster/scene divergence**: procedural poster may not match WebGL angle.
  Mitigation: share camera constants (`scale 0.62`, `z 3.4`, `x +0.9`) between
  `hopf-scene.ts` and `generate-poster.mjs`; optional capture script closes gap.
- **Reduced-motion re-render semantics**: per-pointermove single frames could be
  read as autoplay. Mitigation: only on direct pointer input, no timers/loops;
  document in spec scenario; e2e asserts zero rAF under reduced-motion at rest.
- **Logo asset quality**: transparent PNG is small (`~386px`); upscaling for
  OG/social may blur. Mitigation: header/footer at `≤32px` only; request SVG
  master from brand later; do not use white-bg PNG on dark surfaces.
- **Magnetic CTA pointer cost**: per-move transforms can jank if unthrottled.
  Mitigation: rAF-throttle, `transform` only, fine-pointer + no-reduced-motion gate.

### Ready for Proposal

Yes. Orchestrator should open `sdd-propose` for `lamnda-visual-spectacular-v2`
with the recommendation above; no user clarification needed — references, assets,
and current code were all read. Propose must rewrite the two freeze-status
scenarios (no banner), add dense/full-bleed/logo/scroll scenarios, and flag the
gzip-async ruling as an open question for design.
