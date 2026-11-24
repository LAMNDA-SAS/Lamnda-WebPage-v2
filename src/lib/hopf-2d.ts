/**
 * 2D Hopf-fibration hero renderer — verbatim port of the user reference
 * `Fibración de Hopf (2).html` (58 lines, REQUIRED math source).
 *
 * Verbatim kept: `fiber` / `spin` / `rot` / `stroke` / `aim` logic,
 * `FIBER_COUNT=36`, `FIBER_SEGMENTS=150`, null-gate `d<0.07`,
 * skip `hypot>7`, scale `S=min(W,H)*0.17`, perspective `1/(1-r[2]*0.06)`.
 *
 * Deltas vs user file (only these):
 * - rainbow HSL helper REMOVED; all strokes route via `fiberColor(ph,theme)`
 *   corporate-blue only (`#EAF1FB->#2E8CFF`, hi `#7AB3FF` dark / `#0A54C2` light).
 * - Near-verbatim pace (v5): `T+=0.015`, freqs `0.33/0.21/0.28`,
 *   `a=n*0.015`, `cur 0.06`, `pitch 0.045`; `aim` mapping kept verbatim.
 * - `prefersReducedMotion` wired (user file read `reduce` but never used):
 *   single frame + one `renderOnce` per pointermove, zero rAF at rest.
 * - `data-theme` observer + `readTheme()`; parent-sized DPR `fit()`;
 *   always-on additive idle drift via pure `driftBase(t)` (all pointers,
 *   non-RM frames), pointer offset added on top, coarse zeroed bit-identical;
 *   `ph` delta wrapped to `[-PI,PI]`; `HOPF_ENABLED` escape.
 * - 2026-11 perf/zoom pass (visual output unchanged): device-pixel budget
 *   (`STAGE_MAX_DEVICE_PX`, scale floor `STAGE_MIN_SCALE`) so browser zoom,
 *   4K and retina cannot blow up the bitmap — the logical stage stays equal
 *   to the CSS box, so the browser scales it poster-like and the ring holds
 *   its relative size; allocation-free fused fiber renderer (hoisted
 *   pitch/group/style constants; verbatim fiber() and stroke() kept as pure
 *   references), cached per-theme fiber palette, adaptive frame skip (60fps
 *   active / 30fps idle) and explicit `visibilitychange` pause on top of the
 *   existing IntersectionObserver pause (`setPaused` stays the single
 *   checkpoint).
 */

export const FIBER_COUNT = 36;
export const FIBER_SEGMENTS = 150;

/** Near-verbatim spin step (verbatim was 0.016; 94% restore). */
export const SPIN_DT = 0.015;
/** Near-verbatim spin frequencies (verbatim was 0.37/0.23/0.31, ~90%). */
export const SPIN_FREQS = [0.33, 0.21, 0.28] as const;
export const CUR_LERP = 0.06;
export const PITCH_LERP = 0.045;

/** Ring horizontal origin: open right space on desktop, centered on mobile. */
export const GROUP_X_DESKTOP = 0.62;
export const GROUP_X_MOBILE = 0.5;

/** Idle drift pace: `th` slope 0.39 rad/s, `ph` 2PI in ~10.5s. */
export const AUTO_DRIFT_RATE = 0.6;
export const AUTO_DRIFT_AMP = 0.65;

/** Pure additive idle-drift base: bit-identical to the legacy coarse sine. */
export function driftBase(t: number): { th: number; ph: number } {
  return {
    th: Math.PI / 2 + AUTO_DRIFT_AMP * Math.sin(t * AUTO_DRIFT_RATE),
    ph: t * AUTO_DRIFT_RATE + AUTO_DRIFT_AMP * Math.sin(t * AUTO_DRIFT_RATE * 0.7),
  };
}
export const DPR_MOBILE_MAX = 1.5;
export const DPR_DESKTOP_MAX = 2;
export const DPR_FLOOR = 1;
export const MOBILE_BREAKPOINT = "(max-width: 768px)";

/**
 * Device-pixel budget for the hero bitmap (~1920x1150 = 2.2 MPx). The
 * logical stage stays equal to the CSS box, so the bitmap keeps the box
 * aspect and the browser scales it poster-like: the ring holds its relative
 * size at any zoom level, while browser zoom-out, 4K and retina can never
 * grow the backing store past the budget.
 */
export const STAGE_MAX_DEVICE_PX = 2_200_000;

/**
 * Lower clamp for the render scale (device pixels per CSS pixel). Below 1
 * the browser upscales the bitmap: that is the deliberate cheap mode for far
 * zoom-out, and 0.75 keeps the fibers legible there.
 */
export const STAGE_MIN_SCALE = 0.75;

export const FIBER_INNER = "#EAF1FB";
export const FIBER_OUTER = "#2E8CFF";
export const FIBER_HI_DARK = "#7AB3FF";
export const FIBER_HI_LIGHT = "#0A54C2";

/** Verbatim style for every equal fiber: [lineWidth, globalAlpha] = (1.6, 0.7). */
export const FIBER_STYLE = [1.6, 0.7] as const;

/**
 * Adaptive frame skip: ~60fps while the pointer is active, ~30fps after
 * IDLE_AFTER_MS without interaction (idle/coarse/touched-out browsers).
 */
export const FRAME_MIN_INTERVAL_MS = 16;
export const FRAME_IDLE_INTERVAL_MS = 33;
export const IDLE_AFTER_MS = 3000;

/** Cached per-theme color strings (fiberColor is pure; computed once). */
function buildPalette(theme: Theme): string[] {
  const out = new Array<string>(FIBER_COUNT);
  for (let k = 0; k < FIBER_COUNT; k++)
    out[k] = fiberColor((k / FIBER_COUNT) * Math.PI * 2, theme);
  return out;
}
const PALETTE_DARK = buildPalette("dark");
const PALETTE_LIGHT = buildPalette("light");

export type Theme = "light" | "dark";

/** Poster-only escape hatch: `PUBLIC_HOPF_ENABLED=false` skips canvas. */
export const HOPF_ENABLED: boolean =
  // @ts-expect-error — import.meta.env is injected by Astro/Vite; undefined under Vitest.
  typeof import.meta !== "undefined" && import.meta.env
    ? // @ts-expect-error — same as above.
      import.meta.env.PUBLIC_HOPF_ENABLED !== "false"
    : true;

export function isMobileViewport(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(MOBILE_BREAKPOINT).matches;
}

export function isCoarsePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Theme hook: `documentElement[data-theme]` wins, else prefers-color-scheme. */
export function readTheme(): Theme {
  if (typeof document === "undefined" || typeof window === "undefined") return "dark";
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

export function clampDpr(devicePixelRatio: number, isMobile: boolean): number {
  const cap = isMobile ? DPR_MOBILE_MAX : DPR_DESKTOP_MAX;
  return Math.min(Math.max(DPR_FLOOR, devicePixelRatio || 1), cap);
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
  ];
}

function rgbToCss(r: number, g: number, b: number): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * Corporate-blue only fiber color. Dark lerps `#EAF1FB->#2E8CFF` by base
 * longitude fraction; light lerps `#2E8CFF->#0A54C2` so fibers stay
 * deep-blue on white (no white-on-white washout). No rainbow helper anywhere.
 */
export function fiberColor(ph: number, theme: Theme): string {
  const TAU = Math.PI * 2;
  const f = (((ph % TAU) + TAU) % TAU) / TAU;
  if (theme === "light") {
    const [r1, g1, b1] = hexToRgb(FIBER_OUTER);
    const [r2, g2, b2] = hexToRgb(FIBER_HI_LIGHT);
    return rgbToCss(r1 + (r2 - r1) * f, g1 + (g2 - g1) * f, b1 + (b2 - b1) * f);
  }
  const [r1, g1, b1] = hexToRgb(FIBER_INNER);
  const [r2, g2, b2] = hexToRgb(FIBER_OUTER);
  return rgbToCss(r1 + (r2 - r1) * f, g1 + (g2 - g1) * f, b1 + (b2 - b1) * f);
}

// ---------------------------------------------------------------------------
// Verbatim math (adapted to explicit params for testability; logic line-for-line)
// ---------------------------------------------------------------------------

export type Vec3 = [number, number, number];
export type FiberPoint = Vec3 | null;

/**
 * Verbatim `fiber`: `(z1,z2)=(cos(th/2)e^{it}, sin(th/2)e^{i(t+ph)})`
 * stereographic `d=1-b*sin(t+ph)`, `null` gate at `d<0.07`.
 */
export function fiber(th: number, ph: number, N: number = FIBER_SEGMENTS): FiberPoint[] {
  const a = Math.cos(th / 2);
  const b = Math.sin(th / 2);
  const p: FiberPoint[] = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * 2 * Math.PI;
    const d = 1 - b * Math.sin(t + ph);
    p.push(d < 0.07 ? null : [(a * Math.cos(t)) / d, (a * Math.sin(t)) / d, (b * Math.cos(t + ph)) / d]);
  }
  return p;
}

/** Mutable spin state (module `M` + `T` in the user file). */
export interface SpinState {
  M: number[];
  T: number;
}

export function createSpinState(): SpinState {
  return { M: [1, 0, 0, 0, 1, 0, 0, 0, 1], T: 0 };
}

/**
 * Verbatim `spin` with near-verbatim constants: `T+=0.015`,
 * `w` freqs `0.33/0.21/0.28`, Rodrigues `a=n*0.015`, Gram-Schmidt
 * re-orthonormalize of `M`.
 */
export function spin(s: SpinState): void {
  s.T += SPIN_DT;
  const T = s.T;
  const w = [
    0.9 * Math.sin(T * SPIN_FREQS[0]) + 0.45,
    0.8 * Math.sin(T * SPIN_FREQS[1] + 1) + 0.4,
    0.7 * Math.sin(T * SPIN_FREQS[2] + 2) + 0.35,
  ];
  const n = Math.hypot(w[0], w[1], w[2]);
  if (n < 1e-6) return;
  const a = n * SPIN_DT;
  const k = [w[0] / n, w[1] / n, w[2] / n];
  const c = Math.cos(a);
  const si = Math.sin(a);
  const v = 1 - c;
  const M = s.M;
  const R = [
    c + k[0] * k[0] * v, k[0] * k[1] * v - k[2] * si, k[0] * k[2] * v + k[1] * si,
    k[1] * k[0] * v + k[2] * si, c + k[1] * k[1] * v, k[1] * k[2] * v - k[0] * si,
    k[2] * k[0] * v - k[1] * si, k[2] * k[1] * v + k[0] * si, c + k[2] * k[2] * v,
  ];
  const N: number[] = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) N[i * 3 + j] = R[i * 3] * M[j] + R[i * 3 + 1] * M[3 + j] + R[i * 3 + 2] * M[6 + j];
  const nm = (u: number[]): number[] => {
    const l = Math.hypot(u[0], u[1], u[2]);
    return [u[0] / l, u[1] / l, u[2] / l];
  };
  const r0 = nm(N.slice(0, 3));
  let r1 = N.slice(3, 6);
  const d = r1[0] * r0[0] + r1[1] * r0[1] + r1[2] * r0[2];
  r1 = nm([r1[0] - d * r0[0], r1[1] - d * r0[1], r1[2] - d * r0[2]]);
  const r2 = [
    r0[1] * r1[2] - r0[2] * r1[1],
    r0[2] * r1[0] - r0[0] * r1[2],
    r0[0] * r1[1] - r0[1] * r1[0],
  ];
  M.splice(0, 9, ...r0, ...r1, ...r2);
}

/** Verbatim `rot`: applies 3x3 `M`, then pitch tilt around X. */
export function rot(x: number, y: number, z: number, M: number[], pitch: number): Vec3 {
  const m = M;
  const p = m[0] * x + m[1] * y + m[2] * z;
  const q = m[3] * x + m[4] * y + m[5] * z;
  const e = m[6] * x + m[7] * y + m[8] * z;
  x = p;
  y = q;
  z = e;
  const c = 1;
  const s = 0;
  const X = c * x + s * z;
  const Z = -s * x + c * z;
  const c2 = Math.cos(pitch);
  const s2 = Math.sin(pitch);
  return [X, c2 * y - s2 * Z, s2 * y + c2 * Z];
}

export interface AimTargets {
  th: number;
  ph: number;
  tp: number;
}

/**
 * Verbatim `aim` mapping: `tg.th=PI*(0.1+0.8*x)`, `tg.ph=y*2PI`,
 * `tp=0.15+0.7*x`. Pure helper for tests; the live loop calls it with
 * normalized pointer coords.
 */
export function aim(nx: number, ny: number): AimTargets {
  return {
    th: Math.PI * (0.1 + 0.8 * nx),
    ph: ny * 2 * Math.PI,
    tp: 0.15 + 0.7 * nx,
  };
}

/**
 * Verbatim `stroke`: scale `S=min(W,H)*0.17`, perspective
 * `f=1/(1-r[2]*0.06)`, skip `hypot>7` + null gates.
 * Ring x-origin at `W*GROUP_X` (desktop `0.62`, mobile `0.50`).
 */
export function stroke(
  ctx: CanvasRenderingContext2D,
  pts: FiberPoint[],
  col: string,
  lw: number,
  al: number,
  W: number,
  H: number,
  M: number[],
  pitch: number,
): void {
  ctx.strokeStyle = col;
  ctx.lineWidth = lw;
  ctx.globalAlpha = al;
  ctx.beginPath();
  const S = Math.min(W, H) * 0.17;
  let pen = false;
  for (const q of pts) {
    if (!q || Math.hypot(q[0], q[1], q[2]) > 7) {
      pen = false;
      continue;
    }
    const r = rot(q[0], q[1], q[2], M, pitch);
    const f = 1 / (1 - r[2] * 0.06);
    const x = W * (isMobileViewport() ? GROUP_X_MOBILE : GROUP_X_DESKTOP) + r[0] * S * f;
    const y = H / 2 - r[1] * S * f;
    if (pen) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
    pen = true;
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

export interface Hopf2DHandle {
  dispose: () => void;
  setPaused: (paused: boolean) => void;
  /** Render exactly one frame (reduced-motion path: zero rAF at rest). */
  renderOnce: () => void;
}

export interface Hopf2DOptions {
  reducedMotion?: boolean;
}

/**
 * Build and run the 2D fiber renderer inside `canvas`.
 * Caller MUST have already checked HOPF_ENABLED.
 *
 * Reduced-motion: renders exactly one frame, starts NO rAF loop
 * (zero rAF at rest); each input-driven renderOnce() paints one frame.
 * All 36 fibers equal (lw1.6/alpha0.7, blue-only); no fg highlight.
 */
export function createHopf2D(
  canvas: HTMLCanvasElement,
  opts: Hopf2DOptions = {},
): Hopf2DHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { dispose() {}, setPaused() {}, renderOnce() {} };
  }

  const reducedMotion = opts.reducedMotion ?? prefersReducedMotion();
  const coarse = isCoarsePointer() || isMobileViewport();

  let W = 0;
  let H = 0;
  let theme: Theme = readTheme();
  /** Parent box cached by the last fit; skips backing reallocs on pure-DPR resizes. */
  let fitW = -1;
  let fitH = -1;
  /** Device pixel ratio of the last fit; a monitor switch re-resolves once. */
  let fitDpr = -1;

  const spinState = createSpinState();
  let tg = { th: Math.PI / 2, ph: 0 };
  let cur = { th: Math.PI / 2, ph: 0 };
  let pitch = 0.45;
  let tp = 0.45;
  let driftT = 0;
  // Additive pointer offset: aim(nx,ny) - aim(0.5,0.5); coarse stays zeroed.
  let pointerOffset = { th: 0, ph: 0, tp: 0 };

  let raf = 0;
  let paused = false;
  let disposed = false;
  /** Tab-hidden pause: visibilitychange gating on top of the IO pause. */
  let hiddenPaused = typeof document !== "undefined" && document.hidden;
  /** Sheet-covered pause: the hero is hidden behind the rising sheet. */
  let covered = false;
  /** ms timestamp of the last rendered frame (frame-skip baseline). */
  let lastRender = 0;
  /** ms timestamp of the last pointer activity (idle interval trigger). */
  let lastInput = -IDLE_AFTER_MS;

  function fit(): void {
    if (disposed) return;
    const parent = canvas.parentElement;
    const cw = parent ? parent.clientWidth : canvas.clientWidth || window.innerWidth || 640;
    const ch = parent ? parent.clientHeight : canvas.clientHeight || window.innerHeight || 480;
    const mobile = isMobileViewport();
    const dpr = clampDpr(window.devicePixelRatio || 1, mobile);
    // Same parent box AND same DPR (pure-DPR resize wobble): keep the current
    // backing store instead of reallocating per zoom step.
    if (cw === fitW && ch === fitH && dpr === fitDpr) return;
    fitW = cw;
    fitH = ch;
    fitDpr = dpr;
    // Logical stage == CSS box: identical aspect, so the browser scales the
    // bitmap poster-like and the ring keeps its relative size at any zoom.
    W = Math.max(1, Math.round(cw));
    H = Math.max(1, Math.round(ch));
    // Bound the DEVICE pixel count: browser zoom-out, 4K and retina cannot
    // grow the bitmap past the budget. The scale floor keeps fibers legible.
    const budgetScale = Math.sqrt(STAGE_MAX_DEVICE_PX / (W * H));
    const D = Math.max(STAGE_MIN_SCALE, Math.min(dpr, budgetScale));
    canvas.width = Math.max(1, Math.round(W * D));
    canvas.height = Math.max(1, Math.round(H * D));
    ctx.setTransform(D, 0, 0, D, 0, 0);
  }

  function paint(): void {
    if (disposed) return;
    spin(spinState);
    ctx.clearRect(0, 0, W, H);
    drawFibers();
  }

  /**
   * Allocation-free fused render of all 36 fibers: the verbatim fiber/stroke
   * math inlined with per-paint hoisted constants (pitch trig, ring origin,
   * width/alpha pair, theme palette). No per-frame arrays (fiber()/rot()
   * allocate; the live loop must not). Gates identical to stroke(): null
   * `d<0.07`, runaway `m^2>49` (same set as `hypot>7` for these magnitudes),
   * perspective `1/(1-r[2]*0.06)`, scale `min(W,H)*0.17`.
   */
  function drawFibers(): void {
    const a = Math.cos(cur.th / 2);
    const b = Math.sin(cur.th / 2);
    const S = Math.min(W, H) * 0.17;
    const gx = W * (isMobileViewport() ? GROUP_X_MOBILE : GROUP_X_DESKTOP);
    const halfH = H / 2;
    const pc = Math.cos(pitch);
    const ps = Math.sin(pitch);
    const M = spinState.M;
    const [lw, al] = FIBER_STYLE;
    const pal = theme === "light" ? PALETTE_LIGHT : PALETTE_DARK;
    const TAU = Math.PI * 2;
    ctx.lineCap = "round";
    for (let k = 0; k < FIBER_COUNT; k++) {
      const ph = (k / FIBER_COUNT) * TAU;
      ctx.strokeStyle = pal[k];
      ctx.lineWidth = lw;
      ctx.globalAlpha = al;
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= FIBER_SEGMENTS; i++) {
        const t = (i / FIBER_SEGMENTS) * TAU;
        const d = 1 - b * Math.sin(t + ph);
        if (d < 0.07) {
          pen = false;
          continue;
        }
        const x0 = (a * Math.cos(t)) / d;
        const y0 = (a * Math.sin(t)) / d;
        const z0 = (b * Math.cos(t + ph)) / d;
        if (x0 * x0 + y0 * y0 + z0 * z0 > 49) {
          pen = false;
          continue;
        }
        // rot() inlined: c=1/s=0 simplify to a matrix multiply, then pitch.
        const p = M[0] * x0 + M[1] * y0 + M[2] * z0;
        const q = M[3] * x0 + M[4] * y0 + M[5] * z0;
        const e = M[6] * x0 + M[7] * y0 + M[8] * z0;
        const f = 1 / (1 - e * 0.06);
        if (pen) ctx.lineTo(gx + p * S * f, halfH - (pc * q - ps * e) * S * f);
        else ctx.moveTo(gx + p * S * f, halfH - (pc * q - ps * e) * S * f);
        pen = true;
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function step(dt: number): void {
    // Always-on additive idle drift (all pointers, non-RM frames call this via
    // rAF; RM calls it once per renderOnce). Coarse stays bit-identical
    // (zeroed offset); fine pointers add their offset on top of the base.
    driftT += dt;
    const base = driftBase(driftT);
    if (coarse) {
      tg.th = base.th;
      tg.ph = base.ph;
      tp = 0.45;
    } else {
      tg.th = base.th + pointerOffset.th;
      tg.ph = base.ph + pointerOffset.ph;
      tp = 0.45 + pointerOffset.tp;
    }
    cur.th += (tg.th - cur.th) * CUR_LERP;
    const raw = tg.ph - cur.ph;
    const d = Math.atan2(Math.sin(raw), Math.cos(raw));
    cur.ph += d * CUR_LERP;
    pitch += (tp - pitch) * PITCH_LERP;
    paint();
  }

  function renderOnce(): void {
    if (disposed) return;
    step(0.016);
  }

  function frame(now: number): void {
    if (disposed || reducedMotion) return;
    raf = requestAnimationFrame(frame);
    if (paused || hiddenPaused) {
      lastRender = now;
      return;
    }
    // Adaptive frame skip: 60fps while interactive, 30fps once idle.
    const interval = now - lastInput < IDLE_AFTER_MS ? FRAME_MIN_INTERVAL_MS : FRAME_IDLE_INTERVAL_MS;
    if (now - lastRender < interval - 1) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastRender) / 1000 || 0.016));
    lastRender = now;
    step(dt);
  }

  function onPointerMove(ev: PointerEvent): void {
    if (disposed) return;
    lastInput = typeof performance !== "undefined" ? performance.now() : 0;
    if (coarse) return; // coarse: auto-drift, mouse ignored
    const rect = canvas.getBoundingClientRect();
    const nx = (ev.clientX - rect.left) / Math.max(1, rect.width);
    const ny = (ev.clientY - rect.top) / Math.max(1, rect.height);
    const t = aim(Math.min(1, Math.max(0, nx)), Math.min(1, Math.max(0, ny)));
    const c = aim(0.5, 0.5);
    pointerOffset = { th: t.th - c.th, ph: t.ph - c.ph, tp: t.tp - c.tp };
    const base = driftBase(driftT);
    tg.th = base.th + pointerOffset.th;
    tg.ph = base.ph + pointerOffset.ph;
    tp = 0.45 + pointerOffset.tp;
    if (reducedMotion) {
      cur.th = tg.th;
      cur.ph = tg.ph;
      pitch = tp;
      paint();
    }
  }

  function onPointerDown(ev: PointerEvent): void {
    onPointerMove(ev as unknown as PointerEvent);
  }

  function onResize(): void {
    fit();
    if (reducedMotion) paint();
  }

  function onVisibilityChange(): void {
    if (typeof document === "undefined") return;
    const hidden = document.hidden;
    if (hidden === hiddenPaused) return;
    hiddenPaused = hidden;
    syncRaf();
  }

  fit();
  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibilityChange);
  }

  const themeObserver =
    typeof MutationObserver !== "undefined"
      ? new MutationObserver(() => {
          theme = readTheme();
          if (reducedMotion) paint();
        })
      : null;
  themeObserver?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const io =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) setPaused(!entry.isIntersecting);
          },
          { threshold: 0.05 },
        )
      : null;
  io?.observe(canvas);

  if (reducedMotion) {
    // Single beauty frame, zero rAF at rest.
    paint();
  } else {
    syncRaf();
  }

  function setPaused(p: boolean): void {
    paused = p;
    syncRaf();
  }

  /**
   * Covered-by-sheet pause (separate from `setPaused`): the page tells the
   * renderer when the rising sheet hides the hero, so an invisible animation
   * stops consuming CPU without fighting the offscreen/visibility pauses.
   */
  function setCovered(c: boolean): void {
    if (covered === c) return;
    covered = c;
    syncRaf();
  }

  /**
   * Single writer of the rAF cycle: idle/hidden/offscreen/covered all route
   * through it; a resume never fights an active cancel. Restarts with
   * lastRender=0 so the dt cap absorbs long pauses without a visual jump.
   */
  function syncRaf(): void {
    const wanted = !disposed && !reducedMotion && !paused && !hiddenPaused && !covered;
    if (wanted && !raf) {
      lastRender = 0;
      raf = requestAnimationFrame(frame);
    } else if (!wanted && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  return {
    setPaused,
    setCovered,
    renderOnce,
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      io?.disconnect();
      themeObserver?.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    },
  };
}
