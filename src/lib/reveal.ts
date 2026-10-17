/**
 * Vanilla scroll/pointer motion: reveals, hero parallax, magnetic CTAs,
 * header scroll state. Zero dependencies, transform/opacity only (no CLS).
 * All animation is gated on fine-pointer and no-reduced-motion; header
 * scroll state still applies (class toggle only, no animation).
 */

export function isReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isFinePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: fine)").matches;
}

/** Fade/translate 24px -> 0 over 0.7s, once, via IntersectionObserver. */
export function initReveals(root: ParentNode = document): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (els.length === 0) return () => {};
  if (isReducedMotion() || typeof IntersectionObserver === "undefined") {
    for (const el of els) el.classList.add("is-revealed");
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  for (const el of els) observer.observe(el);
  return () => observer.disconnect();
}

/** Hero copy parallax: translate scrollY * 0.12, fade out by ~60vh. */
export function initHeroParallax(): () => void {
  const copy = document.querySelector<HTMLElement>("[data-hero-copy]");
  if (!copy || isReducedMotion()) return () => {};
  let ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY || 0;
    const vh = Math.max(1, window.innerHeight || 800);
    const progress = Math.min(1, y / (vh * 0.6));
    copy.style.transform = `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0)`;
    copy.style.opacity = String((1 - progress).toFixed(3));
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

/** Magnetic CTAs: pull <=6px toward fine-pointer cursor, rAF-throttled. */
export function initMagnetic(root: ParentNode = document): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-magnetic]"));
  if (els.length === 0 || isReducedMotion() || !isFinePointer()) return () => {};
  const cleanups: Array<() => void> = [];
  for (const el of els) {
    let raf = 0;
    let tx = 0;
    let ty = 0;
    function apply() {
      raf = 0;
      el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
    }
    function onMove(ev: PointerEvent) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = ev.clientX - cx;
      const dy = ev.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const pull = Math.min(6, dist * 0.12);
      tx = (dx / dist) * pull;
      ty = (dy / dist) * pull;
      if (!raf) raf = requestAnimationFrame(apply);
    }
    function onLeave() {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    }
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    cleanups.push(() => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    });
  }
  return () => {
    for (const fn of cleanups) fn();
  };
}

/** Header `.scrolled` past 24px scrollY (class toggle, works in all modes). */
export function initHeaderState(): () => void {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  if (!header) return () => {};
  function update() {
    header.classList.toggle("scrolled", (window.scrollY || 0) > 24);
  }
  update();
  window.addEventListener("scroll", update, { passive: true });
  return () => window.removeEventListener("scroll", update);
}

/** Convenience: init all motion; returns a single cleanup. */
export function initMotion(): () => void {
  const cleanups = [
    initReveals(),
    initHeroParallax(),
    initMagnetic(),
    initHeaderState(),
  ];
  return () => {
    for (const fn of cleanups) fn();
  };
}
