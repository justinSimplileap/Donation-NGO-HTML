import { qsa, prefersReducedMotion } from '../core/dom.js';

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const render = (el, value) => {
  const { prefix = '', suffix = '' } = el.dataset;
  el.textContent = `${prefix}${Math.round(value).toLocaleString('en-US')}${suffix}`;
};

function animate(el) {
  const target = Number(el.dataset.target) || 0;
  const duration = Number(el.dataset.duration) || 2000;

  if (prefersReducedMotion()) {
    render(el, target);
    return;
  }

  const start = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    render(el, target * easeOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Animated number counters: <span data-counter data-target="56" data-prefix="" data-suffix="+">
 * Each counter runs once, the first time it scrolls into view.
 */
export function initCounters(scope = document) {
  const counters = qsa('[data-counter]', scope);
  if (counters.length === 0) return;

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    counters.forEach((el) => render(el, Number(el.dataset.target) || 0));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animate(entry.target);
      });
    },
    { threshold: 0.6 },
  );

  counters.forEach((el) => {
    el.setAttribute('aria-label', `${el.dataset.prefix ?? ''}${el.dataset.target}${el.dataset.suffix ?? ''}`);
    render(el, 0);
    observer.observe(el);
  });
}
