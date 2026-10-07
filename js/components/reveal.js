import { qsa, prefersReducedMotion } from '../core/dom.js';

let observer = null;

const reveal = (el) => el.classList.add('is-revealed');

const getObserver = () => {
  observer ??= new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        reveal(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  return observer;
};

/**
 * Scroll reveal: [data-reveal="fade|fade-up|fade-left"] with optional data-reveal-delay="ms".
 * Elements are only hidden while the `.js` class is present, so content never depends on JS.
 */
export function initReveal(scope = document) {
  const elements = qsa('[data-reveal]:not(.is-revealed)', scope);

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    elements.forEach(reveal);
    return;
  }

  elements.forEach((el) => {
    if (el.dataset.revealDelay) el.style.setProperty('--reveal-delay', `${el.dataset.revealDelay}ms`);
    getObserver().observe(el);
  });
}
