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

export const FIBER_INNER = "#EAF1FB";
export const FIBER_OUTER = "#2E8CFF";
export const FIBER_HI_DARK = "#7AB3FF";
export const FIBER_HI_LIGHT = "#0A54C2";

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

  const spinState = createSpinState();
  let tg = { th: Math.PI / 2, ph: 0 };
  let cur = { th: Math.PI / 2, ph: 0 };
  let pitch = 0.45;
  let tp = 0.45;
  let driftT = 0;
  // Additive pointer offset: aim(nx,ny) - aim(0.5,0.5); coarse stays zeroed.
  let pointerOffset = { th: 0, ph: 0, tp: 0 };
  let last = typeof performance !== "undefined" ? performance.now() : 0;

  let raf = 0;
  let paused = false;
  let disposed = false;

  function fit(): void {
    if (disposed) return;
    const parent = canvas.parentElement;
    const cw = parent ? parent.clientWidth : canvas.clientWidth || window.innerWidth || 640;
    const ch = parent ? parent.clientHeight : canvas.clientHeight || window.innerHeight || 480;
    const mobile = isMobileViewport();
    const D = clampDpr(window.devicePixelRatio || 1, mobile);
    W = cw;
    H = ch;
    canvas.width = Math.max(1, Math.round(W * D));
    canvas.height = Math.max(1, Math.round(H * D));
    ctx.setTransform(D, 0, 0, D, 0, 0);
  }

  function paint(): void {
    if (disposed) return;
    spin(spinState);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    for (let k = 0; k < FIBER_COUNT; k++) {
      const ph = (k / FIBER_COUNT) * 2 * Math.PI;
      stroke(ctx, fiber(cur.th, ph), fiberColor(ph, theme), 1.6, 0.7, W, H, spinState.M, pitch);
    }
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
    if (paused) {
      last = now;
      return;
    }
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000 || 0.016));
    last = now;
    step(dt);
  }

  function onPointerMove(ev: PointerEvent): void {
    if (disposed || coarse) return; // coarse: auto-drift, mouse ignored
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

  fit();
  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });

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
    last = typeof performance !== "undefined" ? performance.now() : 0;
    raf = requestAnimationFrame(frame);
  }

  function setPaused(p: boolean): void {
    paused = p;
    if (p && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!p && !reducedMotion && !disposed && !raf) {
      last = typeof performance !== "undefined" ? performance.now() : 0;
      raf = requestAnimationFrame(frame);
    }
  }

  return {
    setPaused,
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
    },
  };
}
