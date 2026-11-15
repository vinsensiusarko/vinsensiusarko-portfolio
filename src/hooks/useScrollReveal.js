import { useEffect } from 'react';

/**
 * Custom React hook to observe elements matching a CSS selector and
 * add the 'revealed' class when they enter the viewport.
 * Automatically respects prefers-reduced-motion and unobserves after revealing.
 *
 * @param {string} selector - CSS selector to observe (default: '.reveal-on-scroll')
 * @param {Array} deps - Dependency list to re-run observation when content changes
 */
export function useScrollReveal(selector = '.reveal-on-scroll', deps = []) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const elements = document.querySelectorAll(`${selector}:not(.revealed)`);
    if (!elements.length) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        const self = obs || observer;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            self?.unobserve?.(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, ...deps]);
}
