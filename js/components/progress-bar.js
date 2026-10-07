import { qsa, prefersReducedMotion } from '../core/dom.js';

/** Fills `[data-progress]` bars to their percentage once they scroll into view. */
export function animateProgressBars(scope = document) {
  const bars = qsa('[data-progress]', scope);
  const fill = (bar) => {
    bar.style.width = `${bar.dataset.progress}%`;
  };

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    bars.forEach(fill);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        fill(entry.target);
      });
    },
    { threshold: 0.5 },
  );
  bars.forEach((bar) => observer.observe(bar));
}
