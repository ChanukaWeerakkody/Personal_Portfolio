import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-spy that dynamically highlights the section currently in view.
 *
 * Design decisions:
 * - Uses a single scroll listener (via rAF) as the primary detection method.
 *   IntersectionObserver was removed because it cached stale entries and
 *   conflicted with the scroll handler, causing the active state to stick
 *   on early sections like "About".
 * - Re-queries DOM elements on every tick instead of caching them at mount
 *   time, because some sections are React.lazy and may not exist in the DOM
 *   when the effect first runs.
 * - Uses a "marker line" approach: the last section whose top edge has
 *   scrolled past a configurable point (32% of viewport or 220px, whichever
 *   is smaller) is considered active.
 * - Special-cases the bottom of the page to activate the last section.
 */
export function useActiveSection(ids) {
  const stableIds = useRef(ids);
  stableIds.current = ids;

  const [active, setActive] = useState(() => {
    const filtered = ids.filter(Boolean);
    return filtered[0] || '';
  });

  useEffect(() => {
    const filteredIds = stableIds.current.filter(Boolean);
    if (!filteredIds.length) return undefined;

    let frame = 0;

    const choose = () => {
      frame = 0;

      // Re-query every tick so lazy-loaded sections are picked up
      const elements = filteredIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      if (!elements.length) return;

      const marker = Math.min(window.innerHeight * 0.32, 220);

      // If the user has scrolled to the very bottom, activate the last section
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;

      if (atBottom) {
        setActive(elements[elements.length - 1].id);
        return;
      }

      // Walk sections in DOM order; pick the last one whose top is above the marker
      let candidate = elements[0];
      for (const el of elements) {
        const top = el.getBoundingClientRect().top;
        if (top <= marker) {
          candidate = el;
        } else {
          break;
        }
      }

      if (candidate?.id) setActive(candidate.id);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(choose);
    };

    // Run once immediately to set the correct initial state
    // (e.g. if the page was loaded with a hash or scrolled position)
    choose();

    window.addEventListener('scroll', onScroll, { passive: true });

    // Also re-check when the DOM mutates (lazy sections mounting)
    const mutationObserver = new MutationObserver(() => {
      // Debounce via the same rAF mechanism
      if (!frame) frame = requestAnimationFrame(choose);
    });

    mutationObserver.observe(document.getElementById('main') || document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      mutationObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []); // Stable effect — stableIds is a ref

  return active;
}
