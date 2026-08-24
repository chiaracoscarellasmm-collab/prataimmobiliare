'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const REVEAL_SELECTOR = '[data-reveal]:not([data-in]), [data-reveal-media]:not([data-in])';

/**
 * One IntersectionObserver for the whole site.
 *
 * Sections stay server-rendered and simply declare `data-reveal` /
 * `data-reveal-media`; this engine arms them as they enter the viewport and
 * then stops watching. Cheaper than an observer per component, and it keeps
 * animation concerns out of the content components entirely.
 *
 * A MutationObserver backs the initial scan: content added later without a
 * route change (load-more buttons, filtered results, anything client-side)
 * still declares `data-reveal` but mounts after the one-time scan — without
 * this, those elements are permanently armed-but-never-observed and stay at
 * `opacity: 0` forever.
 *
 * It marks state with `data-in` / `data-instant` — attributes React never
 * renders — so mutating them can never trip a hydration mismatch against the
 * `data-reveal` attribute that React does own.
 */
export default function RevealEngine() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const arm = (el: HTMLElement, instant: boolean) => {
      if (instant) el.setAttribute('data-instant', '');
      el.setAttribute('data-in', '');
    };

    let intersectionObserver: IntersectionObserver | null = null;

    if (!reduced) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            arm(entry.target as HTMLElement, false);
            intersectionObserver!.unobserve(entry.target);
          }
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
      );
    }

    /* Anything already on screen when discovered is content the visitor
       asked for (by loading the page, or by an action that just rendered
       it) — show it at once. Only what's below the fold animates in. */
    const armOrObserve = (el: HTMLElement) => {
      if (reduced) {
        arm(el, true);
        return;
      }
      const fold = window.innerHeight * 0.95;
      if (el.getBoundingClientRect().top < fold) {
        arm(el, true);
      } else {
        intersectionObserver?.observe(el);
      }
    };

    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach(armOrObserve);
    };

    const raf = requestAnimationFrame(() => scan(document));

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(REVEAL_SELECTOR)) armOrObserve(node);
          scan(node);
        });
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      intersectionObserver?.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
