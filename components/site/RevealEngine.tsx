'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * One IntersectionObserver for the whole site.
 *
 * Sections stay server-rendered and simply declare `data-reveal` /
 * `data-reveal-media`; this engine arms them as they enter the viewport and
 * then stops watching. Cheaper than an observer per component, and it keeps
 * animation concerns out of the content components entirely.
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

    const scan = () => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-reveal]:not([data-in]), [data-reveal-media]:not([data-in])'
        )
      );

      if (reduced) {
        nodes.forEach((el) => arm(el, true));
        return () => {};
      }

      /* Anything already on screen at mount is content the visitor asked for
         by loading the page — show it at once. Only what they scroll to
         animates. */
      const fold = window.innerHeight * 0.95;
      const below: HTMLElement[] = [];

      for (const el of nodes) {
        if (el.getBoundingClientRect().top < fold) arm(el, true);
        else below.push(el);
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            arm(entry.target as HTMLElement, false);
            observer.unobserve(entry.target);
          }
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
      );

      below.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    };

    /* Wait for hydration to settle so late-mounting client subtrees
       (Suspense boundaries) are included in the first scan. */
    let dispose = () => {};
    const raf = requestAnimationFrame(() => {
      dispose = scan();
    });

    return () => {
      cancelAnimationFrame(raf);
      dispose();
    };
  }, [pathname]);

  return null;
}
