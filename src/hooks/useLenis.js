import { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/utils';

/** One smooth-scroll instance for the whole app. Lazy-loaded and skipped for reduced-motion users. */
export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let lenis; let raf; let cancelled = false;
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)) });
      const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    });
    return () => { cancelled = true; cancelAnimationFrame(raf); lenis?.destroy(); };
  }, []);
}
