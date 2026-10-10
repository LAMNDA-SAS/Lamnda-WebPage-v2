/**
 * Hopf-fibration fiber field — pure math + Three.js scene wiring.
 *
 * Budget contract: 1x LineSegments + 1x Points = 2 draw calls (<30),
 * ~48 desktop / ~24 mobile fibers x 128 segments, DPR clamped 1.5–2.
 */

export const DESKTOP_FIBER_COUNT = 48;
export const MOBILE_FIBER_COUNT = 24;
export const FIBER_SEGMENTS = 128;
export const DRAW_CALLS = 2;
export const MAX_DRAW_CALLS = 30;
export const DPR_MOBILE_MAX = 1.5;
export const DPR_DESKTOP_MAX = 2;
export const MOBILE_BREAKPOINT = "(max-width: 768px)";

/** Poster-only escape hatch: `PUBLIC_HOPF_ENABLED=false` skips WebGL. */
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

export function getFiberCount(isMobile: boolean): number {
  return isMobile ? MOBILE_FIBER_COUNT : DESKTOP_FIBER_COUNT;
}

export function clampDpr(devicePixelRatio: number, isMobile: boolean): number {
  const cap = isMobile ? DPR_MOBILE_MAX : DPR_DESKTOP_MAX;
  return Math.min(Math.max(1, devicePixelRatio || 1), cap);
}

/**
 * One point on the Hopf fiber over base-sphere direction (theta, phi),
 * at fiber angle t. Stereographic projection S^3 -> R^3 from (1,0,0,0).
 */
export function hopfFiberPoint(
  theta: number,
  phi: number,
  t: number,
  scale = 0.42,
): [number, number, number] {
  const cosHalf = Math.cos(theta / 2);
  const sinHalf = Math.sin(theta / 2);
  // Base lift: z1_0 = cos(theta/2), z2_0 = sin(theta/2) * e^{i phi}
  const z1r = cosHalf * Math.cos(t);
  const z1i = cosHalf * Math.sin(t);
  const z2r = sinHalf * Math.cos(phi + t);
  const z2i = sinHalf * Math.sin(phi + t);
  const denom = 1 - z1r;
  const safe = Math.abs(denom) < 1e-4 ? (denom >= 0 ? 1e-4 : -1e-4) : denom;
  return [(z1i / safe) * scale, (z2r / safe) * scale, (z2i / safe) * scale];
}

/** Evenly distributed base directions via Fibonacci sphere. */
export function fiberBaseDirections(count: number): Array<[number, number]> {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dirs: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = golden * i;
    const theta = Math.acos(Math.min(1, Math.max(-1, y)));
    // Distribute base longitude by golden angle for visual variety.
    void radius;
    dirs.push([theta, phi]);
  }
  return dirs;
}

/**
 * Precomputed line-strip positions for all fibers.
 * Returns Float32Array sized for LineSegments pairs:
 * fibers * segments * 2 vertices * 3 components.
 */
export function buildFiberLinePositions(
  fiberCount: number,
  segments: number = FIBER_SEGMENTS,
  scale = 0.42,
): Float32Array {
  const dirs = fiberBaseDirections(fiberCount);
  const out = new Float32Array(fiberCount * segments * 2 * 3);
  let o = 0;
  for (const [theta, phi] of dirs) {
    let prev = hopfFiberPoint(theta, phi, 0, scale);
    for (let s = 1; s <= segments; s++) {
      const t = (s / segments) * Math.PI * 2;
      const cur = hopfFiberPoint(theta, phi, t, scale);
      out[o++] = prev[0];
      out[o++] = prev[1];
      out[o++] = prev[2];
      out[o++] = cur[0];
      out[o++] = cur[1];
      out[o++] = cur[2];
      prev = cur;
    }
  }
  return out;
}

/** Dust points sampled along the same fibers (one per N segments). */
export function buildDustPositions(
  fiberCount: number,
  segments: number = FIBER_SEGMENTS,
  stride = 8,
  scale = 0.42,
): Float32Array {
  const dirs = fiberBaseDirections(fiberCount);
  const perFiber = Math.ceil(segments / stride);
  const out = new Float32Array(fiberCount * perFiber * 3);
  let o = 0;
  for (const [theta, phi] of dirs) {
    for (let s = 0; s < segments; s += stride) {
      const t = (s / segments) * Math.PI * 2;
      const p = hopfFiberPoint(theta, phi, t, scale);
      out[o++] = p[0];
      out[o++] = p[1];
      out[o++] = p[2];
    }
  }
  return out;
}

export interface HopfSceneHandle {
  dispose: () => void;
  setPaused: (paused: boolean) => void;
}

export interface HopfSceneOptions {
  fiberCount?: number;
  autoRotate?: boolean;
  posterSrc?: string;
}

/**
 * Build and run the Three.js fiber scene inside `canvas`.
 * Caller MUST have already checked HOPF_ENABLED + reduced-motion.
 * Uses dynamic `three` import so the caller can lazy-hydrate on idle.
 */
export async function createHopfScene(
  canvas: HTMLCanvasElement,
  opts: HopfSceneOptions = {},
): Promise<HopfSceneHandle> {
  const THREE = await import("three");
  const isMobile =
    opts.autoRotate ?? isMobileViewport() ?? isCoarsePointer() ?? false;
  const fiberCount = opts.fiberCount ?? getFiberCount(isMobile);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(clampDpr(window.devicePixelRatio || 1, isMobile));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.35, 4.2);

  const group = new THREE.Group();
  scene.add(group);

  const linePositions = buildFiberLinePositions(fiberCount, FIBER_SEGMENTS);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: new THREE.Color("#2E8CFF"),
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  const dustPositions = buildDustPositions(fiberCount, FIBER_SEGMENTS);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: new THREE.Color("#7AB3FF"),
    size: 0.02,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  group.add(dust);

  // Draw-call budget: exactly 2 objects (lines + points).
  // console.assert(group.children.length + 1 <= MAX_DRAW_CALLS);

  function resize() {
    const parent = canvas.parentElement;
    const w = parent ? parent.clientWidth : canvas.clientWidth || 640;
    const h = parent ? parent.clientHeight : canvas.clientHeight || 480;
    const dpr = clampDpr(window.devicePixelRatio || 1, isMobileViewport());
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  // Damped mouse parallax (desktop fine-pointer only).
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  const finePointer =
    window.matchMedia?.("(pointer: fine)")?.matches ?? !isMobile;

  function onPointerMove(ev: PointerEvent) {
    if (!finePointer || isMobileViewport()) return;
    const rect = canvas.getBoundingClientRect();
    const nx = ((ev.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = ((ev.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    targetX = nx * 0.35;
    targetY = ny * 0.25;
  }
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  let raf = 0;
  let paused = false;
  let disposed = false;
  const clock = new THREE.Clock();

  function frame() {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (paused) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    // Mobile/coarse: auto-rotate only. Desktop: gentle base spin + parallax.
    const spin = isMobileViewport() ? 0.12 : 0.06;
    group.rotation.y += dt * spin;
    // Damped ease toward pointer target (desktop only).
    currentX += (targetX - currentX) * Math.min(1, dt * 3.2);
    currentY += (targetY - currentY) * Math.min(1, dt * 3.2);
    group.rotation.x = currentY;
    group.rotation.z = currentX * 0.35;
    renderer.render(scene, camera);
  }
  frame();

  const observer =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              paused = !entry.isIntersecting;
            }
          },
          { threshold: 0.05 },
        )
      : null;
  observer?.observe(canvas);

  return {
    setPaused(p: boolean) {
      paused = p;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      lineGeo.dispose();
      dustGeo.dispose();
      lineMat.dispose();
      dustMat.dispose();
      renderer.dispose();
    },
  };
}
